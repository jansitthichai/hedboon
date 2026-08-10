export type KnowledgeCategory =
  | 'ceremony'
  | 'item'
  | 'heet12'
  | 'belief'
  | 'taboo'
  | 'vocabulary'
  | 'comparison'

export type ChunkType =
  | 'summary'
  | 'steps'
  | 'checklist'
  | 'taboos'
  | 'meaning'
  | 'components'
  | 'uses'
  | 'heet-month'
  | 'belief'
  | 'comparison'
  | 'style'

export interface KnowledgeChunk {
  id: string
  title: string
  content: string
  category: KnowledgeCategory
  ceremonyId?: string
  type: ChunkType
  source: string
  keywords: string[]
}

export interface EmbeddedChunk {
  id: string
  embedding: number[]
}

export interface EmbeddingStore {
  model: string
  dimensions: number
  updatedAt: string
  items: EmbeddedChunk[]
}

export interface RetrievedChunk {
  chunk: KnowledgeChunk
  score: number
  keywordScore: number
  semanticScore: number
}

export interface RagSource {
  title: string
  category: string
  ceremonyId?: string
  chunkId: string
  type: string
}

export type RagProvider = 'openai' | 'gemini' | 'offline'

export interface RagResponse {
  answer: string
  sources: RagSource[]
  provider: RagProvider
  chunkCount: number
  usedRetrieval: boolean
}
