import type { RetrievedChunk, RagSource } from './types'

export function buildContext(retrieved: RetrievedChunk[]): string {
  if (!retrieved.length) return ''

  return retrieved
    .map((r, i) => {
      const c = r.chunk
      return [
        `[แหล่งที่ ${i + 1}] ${c.title}`,
        `หมวด: ${c.category} | ประเภทชิ้นข้อมูล: ${c.type}`,
        c.ceremonyId ? `รหัสพิธี: ${c.ceremonyId}` : '',
        `อ้างอิง: ${c.source}`,
        c.content,
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n\n---\n\n')
}

export function toSources(retrieved: RetrievedChunk[]): RagSource[] {
  const seen = new Set<string>()
  const sources: RagSource[] = []
  for (const r of retrieved) {
    if (seen.has(r.chunk.id)) continue
    seen.add(r.chunk.id)
    sources.push({
      title: r.chunk.title,
      category: r.chunk.category,
      ceremonyId: r.chunk.ceremonyId,
      chunkId: r.chunk.id,
      type: r.chunk.type,
    })
  }
  return sources
}

export const RAG_SYSTEM_PROMPT = `คุณคือ HedBoon AI ผู้ช่วยด้านประเพณีและพิธีกรรมอีสาน

กฎสำคัญ:
1. ตอบเป็นภาษาไทย อ่านง่าย เป็นกันเอง แต่สุภาพ
2. ใช้เฉพาะข้อมูลใน "Retrieved Context" ที่ให้มาเป็นหลัก
3. ห้ามแต่งข้อมูลทางวัฒนธรรม ขั้นตอนพิธี ของใช้ หรือความเชื่อที่ไม่มีใน Context
4. หาก Context ไม่เพียงพอ ให้บอกตรง ๆ ว่าไม่พบข้อมูลที่เพียงพอในฐานความรู้ HedBoon และแนะนำให้ถามเรื่องที่มีในระบบ หรือสอบทานกับผู้รู้ท้องถิ่น
5. ห้ามสร้างขั้นตอนพิธีขึ้นเอง
6. หากข้อมูลอาจต่างตามพื้นที่ ให้บอกว่าประเพณีอาจแตกต่างกันตามท้องถิ่น
7. แยกข้อเท็จจริงจากคำแนะนำให้ชัด
8. อย่าอ้างว่าคุณรู้จากอินเทอร์เน็ตทั่วไป — ยึดเฉพาะ Context

รูปแบบคำตอบ:
- ตอบตรงคำถามก่อน
- ใช้หัวข้อสั้นเมื่อช่วยอ่าน
- ท้ายคำตอบไม่ต้องใส่รายการ sources ซ้ำ (ระบบจะแสดงแยก)`

export function buildUserPrompt(question: string, context: string): string {
  if (!context.trim()) {
    return [
      'Retrieved Context: (ไม่พบชิ้นข้อมูลที่เกี่ยวข้องเพียงพอ)',
      '',
      `คำถามผู้ใช้: ${question}`,
      '',
      'โปรดแจ้งว่าไม่พบข้อมูลที่เพียงพอในฐานความรู้ HedBoon',
    ].join('\n')
  }

  return [
    'Retrieved Context:',
    context,
    '',
    `คำถามผู้ใช้: ${question}`,
    '',
    'จงตอบโดยอิง Context ด้านบนเท่านั้น',
  ].join('\n')
}
