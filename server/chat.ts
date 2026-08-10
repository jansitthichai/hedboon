import type { VercelRequest, VercelResponse } from '@vercel/node'
import { runRagPipeline } from '../src/lib/rag/pipeline'
import type { EmbeddingStore, KnowledgeChunk } from '../src/lib/rag/types'
import chunks from '../src/data/knowledge_chunks.json'
import embeddings from '../src/data/knowledge_embeddings.json'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const question = String(body?.question ?? '').trim()
    if (!question) {
      return res.status(400).json({ error: 'question is required' })
    }

    const result = await runRagPipeline({
      question,
      chunks: chunks as KnowledgeChunk[],
      embeddingStore: embeddings as EmbeddingStore,
      openaiApiKey: process.env.OPENAI_API_KEY,
      geminiApiKey: process.env.GEMINI_API_KEY,
      openaiModel: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      geminiModel: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
      embeddingModel: process.env.EMBEDDING_MODEL || 'text-embedding-3-small',
      topK: Number(process.env.RAG_TOP_K || 5),
    })

    return res.status(200).json(result)
  } catch (err) {
    console.error('api/chat error', err)
    return res.status(500).json({
      error: 'RAG chat failed',
      detail: err instanceof Error ? err.message : 'unknown',
    })
  }
}
