# HedBoon AI (เฮ็ดบุญ)

ผู้ช่วยอัจฉริยะด้านประเพณีและพิธีกรรมอีสาน — **Cultural Knowledge Base + Retrieval + Generative AI**

ไม่ใช่แค่ Chatbot ที่ส่งข้อมูลทั้งหมดให้ LLM แต่ค้น Knowledge Chunks ที่เกี่ยวข้องก่อน แล้วค่อยให้ AI สรุปคำตอบ พร้อมแหล่งที่มา

## ฟีเจอร์หลัก (ยังครบเหมือนเดิม)

1. **Ceremony Planner** — วางแผนงานบุญ + checklist + คำนวณของใช้
2. **Knowledge Graph** — แผนภาพความเชื่อมโยง
3. **ฮีต 12 Timeline** — บุญรายเดือน
4. **คุยกับ AI (RAG)** — Retrieve → Generate → อ้างอิงแหล่งข้อมูล

## เริ่มใช้งาน

```bash
npm install
cp .env.example .env
npm run rag:build
npm run dev
```

เปิด http://localhost:5173

### Environment Variables (ฝั่งเซิร์ฟเวอร์เท่านั้น)

ใส่ใน `.env` หรือ Vercel Project Settings:

```env
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
OPENAI_MODEL=gpt-4o-mini
GEMINI_MODEL=gemini-2.0-flash
EMBEDDING_MODEL=text-embedding-3-small
RAG_TOP_K=5
```

**ห้ามใช้ `VITE_OPENAI_API_KEY` สำหรับ secret** — คีย์ต้องไม่ถูกฝังในเบราว์เซอร์

ถ้าไม่มีคีย์ ระบบยังค้นจากฐานความรู้แล้วตอบแบบ offline (ระบุชัดว่าไม่ได้ใช้ LLM)

### สร้าง Embeddings (แนะนำก่อนแข่ง/ขึ้น production)

```bash
# local hash embeddings (ค่าเริ่มต้น)
npm run rag:build

# OpenAI embeddings (เมื่อมี OPENAI_API_KEY)
npm run rag:embed
```

### ทดสอบ Retrieval

```bash
npm run rag:eval
```

รายงานอยู่ที่ `tests/rag-eval-report.json`

## RAG Architecture

```text
Browser (/ask)
   ↓ POST /api/chat
Vercel Serverless / Vite middleware
   ↓
Query normalize
   ↓
Hybrid Retriever (keyword + embedding)
   ↓ Top-K chunks
Build context + grounded prompt
   ↓
OpenAI → (fallback) Gemini → (fallback) Offline retrieval answer
   ↓
{ answer, sources, provider, chunkCount }
```

## Deploy บน Vercel

1. Push โปรเจกต์ขึ้น GitHub
2. Import บน Vercel (Framework: Vite, Output: `dist`)
3. ตั้งค่า Environment Variables ตามด้านบน
4. Deploy
5. เส้นทาง `/api/chat` ทำงานเป็น Serverless Function อัตโนมัติ

## โครงสร้างสำคัญ

```text
src/lib/rag/           # chunker, retriever, embeddings, pipeline
src/data/knowledge_chunks.json
src/data/knowledge_embeddings.json
api/chat.ts            # Vercel serverless
vite.rag-api.ts        # local /api/chat ใน npm run dev
scripts/build-rag.ts
scripts/eval-rag.ts
tests/rag-cases.json
```

## สแต็ก

- Vite 5 + React 19 + TypeScript
- Tailwind CSS v4
- React Router 7
- React Flow 11
- Vercel Serverless API
