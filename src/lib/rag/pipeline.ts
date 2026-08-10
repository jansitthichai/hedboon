import {
  buildContext,
  buildUserPrompt,
  EXPERT_SYSTEM_PROMPT,
  RAG_SYSTEM_PROMPT,
  toSources,
} from './context'
import { embedTextsOpenAI, getEmbeddingMap, localEmbed } from './embeddings'
import { retrieveChunks } from './retriever'
import type {
  EmbeddingStore,
  KnowledgeChunk,
  RagProvider,
  RagResponse,
  RetrievedChunk,
} from './types'

async function callOpenAIChat(
  system: string,
  user: string,
  apiKey: string,
  model: string,
  temperature = 0.3,
): Promise<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`openai_error:${res.status}:${err.slice(0, 200)}`)
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const text = data.choices?.[0]?.message?.content?.trim()
  if (!text) throw new Error('openai_empty')
  return text
}

async function callGeminiChat(
  system: string,
  user: string,
  apiKey: string,
  model: string,
  temperature = 0.3,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${system}\n\n${user}` }] }],
      generationConfig: { temperature },
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`gemini_error:${res.status}:${err.slice(0, 200)}`)
  }
  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim()
  if (!text) throw new Error('gemini_empty')
  return text
}

function noApiFallback(question: string): string {
  return [
    'ตอนนี้ยังเชื่อมต่อโมเดล AI ไม่ได้ และยังไม่พบชิ้นข้อมูลที่ตรงพอในคลัง HedBoon ครับ',
    '',
    `คำถามของคุณ: ${question}`,
    '',
    'ลองถามเรื่องงานบุญอีสาน เช่น ขึ้นบ้านใหม่ งานบวช ขันธ์ 5 บายศรี ฮีต 12 หรือตั้งค่า API key แล้วถามใหม่ได้เลย',
    'รายละเอียดจริงควรสอบทานกับผู้รู้ท้องถิ่น หมอขวัญ หรือวัดในพื้นที่ด้วยนะครับ',
  ].join('\n')
}

export function buildOfflineRagAnswer(
  question: string,
  retrieved: RetrievedChunk[],
): string {
  if (!retrieved.length) return noApiFallback(question)

  const lines = [
    'จากฐานความรู้ HedBoon (โหมดความรู้ในเครื่อง — ยังไม่ได้ใช้โมเดล AI) พบข้อมูลที่เกี่ยวข้องดังนี้:',
    '',
  ]

  for (const r of retrieved.slice(0, 4)) {
    lines.push(`### ${r.chunk.title}`)
    lines.push(r.chunk.content)
    lines.push('')
  }

  lines.push('หมายเหตุ: ประเพณีอาจแตกต่างกันตามท้องถิ่น ควรสอบทานกับผู้รู้ในชุมชน')
  void question
  return lines.join('\n').trim()
}

async function answerWithModels(options: {
  question: string
  context: string
  hasContext: boolean
  openaiApiKey?: string
  geminiApiKey?: string
  openaiModel?: string
  geminiModel?: string
}): Promise<{ answer: string; provider: RagProvider } | null> {
  const system = options.hasContext ? RAG_SYSTEM_PROMPT : EXPERT_SYSTEM_PROMPT
  const userPrompt = buildUserPrompt(options.question, options.context)
  const temperature = options.hasContext ? 0.25 : 0.4

  if (options.openaiApiKey) {
    try {
      const answer = await callOpenAIChat(
        system,
        userPrompt,
        options.openaiApiKey,
        options.openaiModel || 'gpt-4o-mini',
        temperature,
      )
      return { answer, provider: 'openai' }
    } catch (err) {
      console.warn('RAG OpenAI failed', err)
    }
  }

  if (options.geminiApiKey) {
    try {
      const answer = await callGeminiChat(
        system,
        userPrompt,
        options.geminiApiKey,
        options.geminiModel || 'gemini-2.0-flash',
        temperature,
      )
      return { answer, provider: 'gemini' }
    } catch (err) {
      console.warn('RAG Gemini failed', err)
    }
  }

  return null
}

export async function runRagPipeline(options: {
  question: string
  chunks: KnowledgeChunk[]
  embeddingStore?: EmbeddingStore | null
  openaiApiKey?: string
  geminiApiKey?: string
  openaiModel?: string
  geminiModel?: string
  embeddingModel?: string
  topK?: number
}): Promise<RagResponse> {
  const question = options.question.trim()
  if (!question) {
    return {
      answer: 'โปรดพิมพ์คำถามก่อนนะครับ',
      sources: [],
      provider: 'offline',
      chunkCount: 0,
      usedRetrieval: false,
    }
  }

  const embMap = getEmbeddingMap(options.embeddingStore)
  let queryEmbedding: number[] | null = null

  if (options.openaiApiKey && embMap.size > 0 && options.embeddingStore?.model?.includes('text-embedding')) {
    try {
      const [vec] = await embedTextsOpenAI(
        [question],
        options.openaiApiKey,
        options.embeddingModel || options.embeddingStore.model || 'text-embedding-3-small',
      )
      queryEmbedding = vec
    } catch {
      queryEmbedding = localEmbed(question)
    }
  } else {
    queryEmbedding = localEmbed(question)
  }

  const retrieved = retrieveChunks({
    question,
    chunks: options.chunks,
    embeddingStore: options.embeddingStore,
    queryEmbedding,
    topK: options.topK ?? 5,
  })

  const sources = toSources(retrieved)
  const context = buildContext(retrieved)
  const hasContext = retrieved.length > 0

  const modelAnswer = await answerWithModels({
    question,
    context,
    hasContext,
    openaiApiKey: options.openaiApiKey,
    geminiApiKey: options.geminiApiKey,
    openaiModel: options.openaiModel,
    geminiModel: options.geminiModel,
  })

  if (modelAnswer) {
    return {
      answer: modelAnswer.answer,
      sources,
      provider: modelAnswer.provider,
      chunkCount: retrieved.length,
      usedRetrieval: true,
    }
  }

  return {
    answer: buildOfflineRagAnswer(question, retrieved),
    sources,
    provider: 'offline',
    chunkCount: retrieved.length,
    usedRetrieval: true,
  }
}
