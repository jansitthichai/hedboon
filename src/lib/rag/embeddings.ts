import type { EmbeddingStore, KnowledgeChunk } from './types'
import { tokenize } from './normalize'

/** Cosine similarity for dense vectors */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a.length || !b.length || a.length !== b.length) return 0
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i]
    na += a[i] * a[i]
    nb += b[i] * b[i]
  }
  if (na === 0 || nb === 0) return 0
  return dot / (Math.sqrt(na) * Math.sqrt(nb))
}

/**
 * Lightweight local "semantic" vector from tokens (hash bag-of-words).
 * Used when OpenAI embeddings are unavailable — still real vector retrieval.
 */
export function localEmbed(text: string, dimensions = 256): number[] {
  const vec = new Array<number>(dimensions).fill(0)
  const tokens = tokenize(text)
  if (!tokens.length) return vec

  for (const token of tokens) {
    let hash = 2166136261
    for (let i = 0; i < token.length; i += 1) {
      hash ^= token.charCodeAt(i)
      hash = Math.imul(hash, 16777619)
    }
    const idx = Math.abs(hash) % dimensions
    const sign = hash & 1 ? 1 : -1
    vec[idx] += sign
  }

  // L2 normalize
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1
  return vec.map((v) => v / norm)
}

export async function embedTextsOpenAI(
  texts: string[],
  apiKey: string,
  model = 'text-embedding-3-small',
): Promise<number[][]> {
  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      input: texts,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`embedding_error:${res.status}:${err.slice(0, 200)}`)
  }

  const data = (await res.json()) as {
    data?: Array<{ embedding?: number[]; index?: number }>
  }
  const rows = data.data ?? []
  rows.sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
  return rows.map((r) => r.embedding ?? [])
}

export function buildLocalEmbeddingStore(chunks: KnowledgeChunk[]): EmbeddingStore {
  return {
    model: 'local-hash-bow-v1',
    dimensions: 256,
    updatedAt: new Date().toISOString(),
    items: chunks.map((chunk) => ({
      id: chunk.id,
      embedding: localEmbed(`${chunk.title}\n${chunk.content}\n${chunk.keywords.join(' ')}`),
    })),
  }
}

export function getEmbeddingMap(store: EmbeddingStore | null | undefined): Map<string, number[]> {
  const map = new Map<string, number[]>()
  for (const item of store?.items ?? []) {
    if (item.embedding?.length) map.set(item.id, item.embedding)
  }
  return map
}
