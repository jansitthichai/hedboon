/**
 * Evaluate retrieval relevance / refusal without calling paid LLMs.
 * Usage: npx tsx scripts/eval-rag.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { retrieveChunks } from '../src/lib/rag/retriever.ts'
import { localEmbed } from '../src/lib/rag/embeddings.ts'
import type { EmbeddingStore, KnowledgeChunk } from '../src/lib/rag/types.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

interface TestCase {
  id: string
  question: string
  expectCeremonyId?: string
  expectKeywords?: string[]
  mustRefuse?: boolean
}

function main() {
  const chunks = JSON.parse(
    readFileSync(join(root, 'src/data/knowledge_chunks.json'), 'utf8'),
  ) as KnowledgeChunk[]
  const embeddings = JSON.parse(
    readFileSync(join(root, 'src/data/knowledge_embeddings.json'), 'utf8'),
  ) as EmbeddingStore
  const cases = JSON.parse(
    readFileSync(join(root, 'tests/rag-cases.json'), 'utf8'),
  ) as TestCase[]

  const rows = cases.map((c) => {
    const retrieved = retrieveChunks({
      question: c.question,
      chunks,
      embeddingStore: embeddings,
      queryEmbedding: localEmbed(c.question),
      topK: 5,
      minScore: 0.08,
    })

    const top = retrieved[0]
    const joined = retrieved.map((r) => `${r.chunk.title} ${r.chunk.content}`).join('\n').toLowerCase()
    const keywordHit =
      !c.expectKeywords?.length ||
      c.expectKeywords.some((k) => joined.includes(k.toLowerCase()))
    const ceremonyHit =
      !c.expectCeremonyId ||
      retrieved.some(
        (r) =>
          r.chunk.ceremonyId === c.expectCeremonyId ||
          r.chunk.id.includes(c.expectCeremonyId!),
      )

    const refused = retrieved.length === 0
    const refuseOk = c.mustRefuse ? refused : true
    const relevanceOk = c.mustRefuse ? refuseOk : keywordHit && ceremonyHit && retrieved.length > 0

    return {
      id: c.id,
      question: c.question,
      mustRefuse: !!c.mustRefuse,
      retrievedCount: retrieved.length,
      topScore: Number((top?.score ?? 0).toFixed(4)),
      topKeywordScore: Number((top?.keywordScore ?? 0).toFixed(4)),
      topTitle: top?.chunk.title ?? null,
      sources: retrieved.map((r) => r.chunk.title),
      relevanceOk,
      refuseOk,
      pass: c.mustRefuse ? refuseOk : relevanceOk,
    }
  })

  const passed = rows.filter((r) => r.pass).length
  const report = {
    evaluatedAt: new Date().toISOString(),
    total: rows.length,
    passed,
    failed: rows.length - passed,
    passRate: `${((passed / rows.length) * 100).toFixed(1)}%`,
    notes: [
      'Retrieval Relevance: expectKeywords / expectCeremonyId ตรงกับ Top-K',
      'Refuse when unknown: mustRefuse ควรได้คะแนนต่ำหรือไม่เจอ chunk',
      'Answer Groundedness / LLM quality ต้องตรวจด้วยมือหรือผ่าน /api/chat เพิ่ม',
    ],
    results: rows,
  }

  const out = join(root, 'tests/rag-eval-report.json')
  writeFileSync(out, `${JSON.stringify(report, null, 2)}\n`, 'utf8')
  console.log(`RAG eval: ${passed}/${rows.length} passed (${report.passRate})`)
  console.log(`Report → ${out}`)
  for (const r of rows.filter((x) => !x.pass)) {
    console.log(`  FAIL ${r.id}: ${r.question} (top=${r.topTitle}, score=${r.topScore})`)
  }
}

main()
