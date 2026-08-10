import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { runRagPipeline } from './src/lib/rag/pipeline'
import type { EmbeddingStore, KnowledgeChunk } from './src/lib/rag/types'
import chunks from './src/data/knowledge_chunks.json'
import embeddings from './src/data/knowledge_embeddings.json'

function hedboonRagApiPlugin(): Plugin {
  return {
    name: 'hedboon-rag-api',
    configureServer(server) {
      server.middlewares.use('/api/chat', (req, res, next) => {
        if (req.method === 'OPTIONS') {
          res.statusCode = 204
          res.end()
          return
        }
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Method not allowed' }))
          return
        }

        const chunksBuf: Buffer[] = []
        req.on('data', (c) => chunksBuf.push(c as Buffer))
        req.on('end', () => {
          void (async () => {
            try {
              const raw = Buffer.concat(chunksBuf).toString('utf8')
              const body = raw ? JSON.parse(raw) : {}
              const question = String(body.question ?? '').trim()
              if (!question) {
                res.statusCode = 400
                res.setHeader('Content-Type', 'application/json')
                res.end(JSON.stringify({ error: 'question is required' }))
                return
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

              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(result))
            } catch (err) {
              console.error('vite /api/chat error', err)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(
                JSON.stringify({
                  error: 'RAG chat failed',
                  detail: err instanceof Error ? err.message : 'unknown',
                }),
              )
            }
          })()
        })
        req.on('error', () => next())
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  process.env.OPENAI_API_KEY ??= env.OPENAI_API_KEY
  process.env.GEMINI_API_KEY ??= env.GEMINI_API_KEY
  process.env.OPENAI_MODEL ??= env.OPENAI_MODEL
  process.env.GEMINI_MODEL ??= env.GEMINI_MODEL
  process.env.EMBEDDING_MODEL ??= env.EMBEDDING_MODEL
  process.env.RAG_TOP_K ??= env.RAG_TOP_K

  return {
    plugins: [react(), tailwindcss(), hedboonRagApiPlugin()],
  }
})
