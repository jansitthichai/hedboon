import { cosineSimilarity, getEmbeddingMap, localEmbed } from './embeddings'
import { normalizeQuery } from './normalize'
import type { EmbeddingStore, KnowledgeChunk, RetrievedChunk } from './types'

const STOPWORDS = new Set([
  'คือ',
  'อะไร',
  'อย่างไร',
  'ยังไง',
  'ต้อง',
  'มี',
  'ใน',
  'และ',
  'หรือ',
  'ของ',
  'ที่',
  'เป็น',
  'การ',
  'ให้',
  'ได้',
  'บ้าง',
  'ไหม',
  'มั้ย',
  'จัด',
  'พิธี',
  'งาน',
  'บุญ',
  'ขั้นตอน',
  'รายละเอียด',
  'เกี่ยวกับ',
  'ใช้',
  'สิ่ง',
  'ทำ',
  'แบบ',
  'สำหรับ',
  'เมื่อ',
  'จาก',
  'นี้',
  'นั้น',
  'ครับ',
  'ค่ะ',
  'เตรียม',
  'องค์ประกอบ',
  'ความหมาย',
  'holy',
  'water',
  'item',
])

const CEREMONY_ALIASES: Record<string, string[]> = {
  housewarming: ['ขึ้นบ้าน', 'ขึ้นบ้านใหม่', 'เฮือนใหม่', 'ตามั่น', 'ตามั่นคำทอง', 'ค้ำคูณ'],
  ordination: ['บวช', 'นาค', 'อุปสมบท', 'บรรพชา'],
  wedding: ['แต่ง', 'แต่งงาน', 'ขันหมาก', 'ฮีตแต่ง'],
  riceHeap: ['กองข้าว', 'บุญกองข้าว'],
  suKwan: ['สู่ขวัญ', 'บายศรี'],
  ageMerit: ['บุญอายุ', 'ต่ออายุ', 'สะเดาะเคราะห์'],
  puTa: ['ปู่ตา', 'เลี้ยงปู่ตา', 'ดอนปู่ตา', 'เฒ่าจ้า', 'เลี้ยงบ้าน', 'ศาลหลักเมือง', 'บุญซำฮะ'],
  athi: ['อัฐิ', 'แจกข้าว', 'อัฏฐะ'],
  taHaek: ['ตาแฮก', 'ผีตาแฮก'],
}

/**
 * Best-match lexical score for Thai (unspaced) queries.
 * Uses distinctive anchors; avoids dilution from long keyword lists.
 */
function keywordScore(query: string, chunk: KnowledgeChunk): number {
  const q = normalizeQuery(query)
  const qCompact = q.replace(/\s+/g, '')

  const anchors = Array.from(
    new Set(
      [
        ...chunk.title.split(/[\s—\-·|,/]+/),
        ...chunk.keywords.filter((k) => {
          const n = normalizeQuery(k)
          return n.length >= 3 && n.length <= 28
        }),
        ...(chunk.ceremonyId ? CEREMONY_ALIASES[chunk.ceremonyId] ?? [] : []),
        chunk.category === 'heet12' ? 'ฮีต' : '',
        chunk.category === 'heet12' ? 'ฮีต12' : '',
        chunk.category === 'heet12' ? 'ฮีต 12' : '',
      ]
        .map((t) => normalizeQuery(t))
        .filter((t) => t.length >= 2 && t.length <= 28 && !STOPWORDS.has(t)),
    ),
  )

  if (!anchors.length) return 0

  let best = 0
  let hits = 0
  for (const term of anchors) {
    const compact = term.replace(/\s+/g, '')
    const matched =
      q.includes(term) || (compact.length >= 3 && qCompact.includes(compact))
    if (!matched) continue
    hits += 1
    const strength =
      compact.length >= 8 ? 1 : compact.length >= 5 ? 0.88 : compact.length >= 3 ? 0.6 : 0.35
    best = Math.max(best, strength)
  }

  if (!hits) return 0
  return Math.min(1, best + Math.min(0.12, (hits - 1) * 0.04))
}

export function retrieveChunks(options: {
  question: string
  chunks: KnowledgeChunk[]
  embeddingStore?: EmbeddingStore | null
  queryEmbedding?: number[] | null
  topK?: number
  minScore?: number
}): RetrievedChunk[] {
  const { question, chunks, embeddingStore, queryEmbedding, topK = 5, minScore = 0.2 } = options
  const embMap = getEmbeddingMap(embeddingStore)
  const hasDense = embMap.size > 0

  const qVec = queryEmbedding ?? localEmbed(question)

  const scored: RetrievedChunk[] = chunks.map((chunk) => {
    const kw = keywordScore(question, chunk)
    let sem = 0
    if (hasDense && embMap.has(chunk.id) && queryEmbedding) {
      sem = cosineSimilarity(queryEmbedding, embMap.get(chunk.id)!)
    } else if (embMap.has(chunk.id)) {
      sem = cosineSimilarity(qVec, embMap.get(chunk.id)!)
    } else {
      sem = cosineSimilarity(qVec, localEmbed(`${chunk.title}\n${chunk.content}`))
    }

    // Prefer exact lexical anchors; semantic is a light helper
    const score = kw * 0.88 + Math.max(0, sem) * 0.12

    // Prefer dedicated item / heet overview chunks when name matches strongly
    const titleBoost =
      kw >= 0.85 && (chunk.category === 'item' || chunk.id.endsWith('__summary') || chunk.id === 'heet12__overview')
        ? 0.05
        : 0

    return { chunk, score: Math.min(1, score + titleBoost), keywordScore: kw, semanticScore: sem }
  })

  return scored
    .filter((r) => r.keywordScore >= 0.35 && r.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
}
