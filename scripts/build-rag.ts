/**
 * Build knowledge_chunks.json + knowledge_embeddings.json
 * Usage:
 *   npx tsx scripts/build-rag.ts
 *   OPENAI_API_KEY=... npx tsx scripts/build-rag.ts --openai
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

async function loadJson<T>(rel: string): Promise<T> {
  const mod = await import(pathToFileURL(join(root, rel)).href, {
    with: { type: 'json' },
  })
  return (mod.default ?? mod) as T
}

async function main() {
  const useOpenAI = process.argv.includes('--openai')
  const { buildAllChunks } = await import('../src/lib/rag/chunker.ts')
  const { buildLocalEmbeddingStore, embedTextsOpenAI } = await import(
    '../src/lib/rag/embeddings.ts'
  )

  const ceremonies = await Promise.all(
    [
      'housewarming',
      'ordination',
      'wedding',
      'riceHeap',
      'suKwan',
      'ageMerit',
      'puTa',
      'athi',
      'taHaek',
    ].map((id) => loadJson(`src/data/ceremonies/${id}.json`)),
  )

  const items = await loadJson<unknown[]>('src/data/items.json')
  const heet12 = await loadJson<unknown[]>('src/data/heet12.json')

  const chunks = buildAllChunks({
    ceremonies: ceremonies as never,
    items: items as never,
    heetMonths: heet12 as never,
  })

  const outDir = join(root, 'src/data')
  mkdirSync(outDir, { recursive: true })
  const chunksPath = join(outDir, 'knowledge_chunks.json')
  writeFileSync(chunksPath, `${JSON.stringify(chunks, null, 2)}\n`, 'utf8')
  console.log(`Wrote ${chunks.length} chunks → ${chunksPath}`)

  let store = buildLocalEmbeddingStore(chunks)
  const apiKey = process.env.OPENAI_API_KEY
  const model = process.env.EMBEDDING_MODEL || 'text-embedding-3-small'

  if (useOpenAI && apiKey) {
    console.log(`Creating OpenAI embeddings with ${model}...`)
    const batchSize = 64
    const itemsEmb: Array<{ id: string; embedding: number[] }> = []
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize)
      const vectors = await embedTextsOpenAI(
        batch.map((c) => `${c.title}\n${c.content}`),
        apiKey,
        model,
      )
      batch.forEach((c, idx) => {
        itemsEmb.push({ id: c.id, embedding: vectors[idx] ?? [] })
      })
      console.log(`  embedded ${Math.min(i + batchSize, chunks.length)}/${chunks.length}`)
    }
    store = {
      model,
      dimensions: itemsEmb[0]?.embedding.length ?? 0,
      updatedAt: new Date().toISOString(),
      items: itemsEmb,
    }
  } else if (useOpenAI && !apiKey) {
    console.warn('OPENAI_API_KEY missing — using local hash embeddings instead')
  } else {
    console.log('Using local hash embeddings (run with --openai + OPENAI_API_KEY for OpenAI vectors)')
  }

  const embPath = join(outDir, 'knowledge_embeddings.json')
  writeFileSync(embPath, `${JSON.stringify(store)}\n`, 'utf8')
  console.log(`Wrote embeddings (${store.model}, dim=${store.dimensions}) → ${embPath}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
