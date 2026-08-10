import chunksData from '../data/knowledge_chunks.json'
import embeddingsData from '../data/knowledge_embeddings.json'
import { runRagPipeline } from './rag/pipeline'
import type { EmbeddingStore, KnowledgeChunk, RagProvider, RagResponse, RagSource } from './rag/types'

export type AIProvider = RagProvider

export interface AIResponse {
  text: string
  provider: AIProvider
  sources: RagSource[]
  chunkCount: number
  usedRetrieval: boolean
}

function mapResponse(result: RagResponse): AIResponse {
  return {
    text: result.answer,
    provider: result.provider,
    sources: result.sources,
    chunkCount: result.chunkCount,
    usedRetrieval: result.usedRetrieval,
  }
}

/**
 * Prefer server RAG (/api/chat) so API keys stay off the browser.
 * Fallback: local hybrid retrieval + offline grounded answer (not claimed as LLM).
 */
export async function askHedBoon(question: string): Promise<AIResponse> {
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    })

    if (res.ok) {
      const data = (await res.json()) as RagResponse
      return mapResponse(data)
    }

    console.warn('api/chat failed', res.status, await res.text())
  } catch (err) {
    console.warn('api/chat unreachable, using local offline RAG', err)
  }

  const result = await runRagPipeline({
    question,
    chunks: chunksData as KnowledgeChunk[],
    embeddingStore: embeddingsData as EmbeddingStore,
    // Browser must not use secret keys — offline retrieval only
    topK: 5,
  })

  return mapResponse(result)
}
