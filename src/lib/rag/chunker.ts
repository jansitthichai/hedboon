import type { Ceremony, HeetMonth, RitualItem } from '../../types/hedboon'
import { uniqueKeywords } from './normalize'
import type { KnowledgeChunk } from './types'

function sourceLabel(parts: string[]): string {
  return parts.filter(Boolean).join(' · ')
}

const THAI_MONTH_WORDS = [
  '',
  'หนึ่ง',
  'สอง',
  'สาม',
  'สี่',
  'ห้า',
  'หก',
  'เจ็ด',
  'แปด',
  'เก้า',
  'สิบ',
  'สิบเอ็ด',
  'สิบสอง',
]

function thaiMonthWord(month: number): string {
  return THAI_MONTH_WORDS[month] ?? String(month)
}

export function chunkCeremonies(ceremonies: Ceremony[]): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = []

  for (const c of ceremonies) {
    const baseKeywords = uniqueKeywords(c.nameTh, c.nameIsan, c.id, c.summary)
    const primarySource =
      c.sources?.[0] ?? `HedBoon knowledge · ${c.nameTh}`

    chunks.push({
      id: `${c.id}__summary`,
      title: `${c.nameTh} — ความหมาย`,
      content: `${c.nameTh} (${c.nameIsan})\n${c.summary}\nโหมดพระ: ${
        c.monkMode === 'none'
          ? 'ไม่มีพระ'
          : c.monkMode === 'optional'
            ? 'มีพระหรือไม่มีพระก็ได้'
            : 'มีพระ'
      }`,
      category: 'ceremony',
      ceremonyId: c.id,
      type: 'summary',
      source: sourceLabel([primarySource, c.nameTh]),
      keywords: baseKeywords,
    })

    const stepsText = c.steps
      .map((s) => `${s.order}. ${s.title}: ${s.detail}`)
      .join('\n')
    chunks.push({
      id: `${c.id}__steps`,
      title: `${c.nameTh} — ขั้นตอนพิธี`,
      content: `ขั้นตอนของ${c.nameTh}:\n${stepsText}`,
      category: 'ceremony',
      ceremonyId: c.id,
      type: 'steps',
      source: sourceLabel([primarySource, 'ขั้นตอนพิธี']),
      keywords: uniqueKeywords(
        c.nameTh,
        c.nameIsan,
        'ขั้นตอน',
        ...c.steps.map((s) => s.title),
      ),
    })

    const checklistText = c.checklist
      .map((i) => `- ${i.name}${i.note ? ` (${i.note})` : ''}${i.required ? '' : ' (ถ้ามี)'}`)
      .join('\n')
    chunks.push({
      id: `${c.id}__checklist`,
      title: `${c.nameTh} — ของใช้ในพิธี`,
      content: `ของใช้/องค์ประกอบของ${c.nameTh}:\n${checklistText}`,
      category: 'ceremony',
      ceremonyId: c.id,
      type: 'checklist',
      source: sourceLabel([primarySource, 'ของใช้ในพิธี']),
      keywords: uniqueKeywords(
        c.nameTh,
        'ของใช้',
        'checklist',
        ...c.checklist.map((i) => i.name),
      ),
    })

    if (c.taboos.length) {
      chunks.push({
        id: `${c.id}__taboos`,
        title: `${c.nameTh} — ข้อห้ามและความเชื่อที่ควรระวัง`,
        content: `ข้อห้าม/ข้อควรระวังของ${c.nameTh}:\n${c.taboos.map((t) => `- ${t}`).join('\n')}`,
        category: 'taboo',
        ceremonyId: c.id,
        type: 'taboos',
        source: sourceLabel([primarySource, 'ข้อห้าม']),
        keywords: uniqueKeywords(c.nameTh, 'ข้อห้าม', 'ความเชื่อ'),
      })
    }

    if (c.ritualStyles?.length) {
      for (const style of c.ritualStyles) {
        const styleSteps = style.steps
          .map((s) => `${s.order}. ${s.title}: ${s.detail}`)
          .join('\n')
        const styleItems = style.checklist
          .map((i) => `- ${i.name}${i.note ? ` (${i.note})` : ''}`)
          .join('\n')
        chunks.push({
          id: `${c.id}__style__${style.id}`,
          title: `${c.nameTh} — รูปแบบ ${style.nameTh}`,
          content: [
            `รูปแบบพิธี: ${style.nameTh}`,
            style.summaryNote ?? '',
            `ต้องมีพระ: ${style.requiresMonks ? 'ใช่' : 'ไม่'}`,
            'ขั้นตอน:',
            styleSteps,
            'ของใช้:',
            styleItems,
          ]
            .filter(Boolean)
            .join('\n'),
          category: 'ceremony',
          ceremonyId: c.id,
          type: 'style',
          source: sourceLabel([primarySource, style.nameTh]),
          keywords: uniqueKeywords(
            c.nameTh,
            style.nameTh,
            style.requiresMonks ? 'พระ' : 'ไม่มีพระ ตามั่น พราหมณ์',
            ...style.steps.map((s) => s.title),
            ...style.checklist.map((i) => i.name),
          ),
        })
      }
    }
  }

  return chunks
}

export function chunkItems(items: RitualItem[], ceremonies: Ceremony[]): KnowledgeChunk[] {
  return items.map((item) => {
    const usedNames = item.usedIn
      .map((id) => ceremonies.find((c) => c.id === id)?.nameTh ?? id)
      .join(', ')
    const content = [
      `${item.name}${item.nameIsan ? ` (${item.nameIsan})` : ''}`,
      `ความหมาย: ${item.meaning}`,
      `ประกอบด้วย: ${item.components.join(', ')}`,
      item.uses?.length ? `การใช้:\n${item.uses.map((u) => `- ${u}`).join('\n')}` : '',
      item.tips ? `เคล็ดลับ: ${item.tips}` : '',
      `ใช้ในพิธี: ${usedNames}`,
    ]
      .filter(Boolean)
      .join('\n')

    return {
      id: `item__${item.id}`,
      title: `${item.name} — ความหมายและองค์ประกอบ`,
      content,
      category: 'item' as const,
      type: 'meaning' as const,
      source: `HedBoon items.json · ${item.name}`,
      keywords: uniqueKeywords(
        item.name,
        item.nameIsan,
        item.id,
        ...item.components,
        usedNames,
        // Short distinctive anchors for item Q&A
        item.name.replace(/\s+/g, ''),
      ),
    }
  })
}

export function chunkHeet12(months: HeetMonth[]): KnowledgeChunk[] {
  const overview: KnowledgeChunk = {
    id: 'heet12__overview',
    title: 'ฮีต 12 — ภาพรวม',
    content: [
      'ฮีต 12 คือประเพณีบุญรายเดือนตามปฏิทินอีสาน',
      ...months.map(
        (m) =>
          `${m.nameIsan}${m.gregorianHint ? ` (${m.gregorianHint})` : ''}: ${m.nameTh} — ${m.summary}`,
      ),
    ].join('\n'),
    category: 'heet12',
    type: 'heet-month',
    source: 'HedBoon heet12.json · ฮีต 12',
    keywords: uniqueKeywords(
      'ฮีต',
      'ฮีต 12',
      'ฮีต12',
      'heet',
      'heet12',
      'บุญเดือน',
      ...months.map((m) => `${m.nameTh} ${m.nameIsan}`),
      ...months.map((m) => `เดือน${thaiMonthWord(m.month)}`),
      ...months.map((m) => `เดือน${m.month}`),
    ),
  }

  const perMonth = months.map((m) => {
    const monthWord = thaiMonthWord(m.month)
    return {
      id: `heet12__m${m.month}`,
      title: `${m.nameIsan} — ${m.nameTh}`,
      content: [
        `${m.nameIsan}${m.gregorianHint ? ` (ตรงกับประมาณเดือน${m.gregorianHint})` : ''}`,
        `ชื่องานบุญ: ${m.nameTh}`,
        m.summary,
        `จุดเด่น: ${m.highlights.join(', ')}`,
      ].join('\n'),
      category: 'heet12' as const,
      ceremonyId: m.planCeremonyId,
      type: 'heet-month' as const,
      source: `HedBoon heet12.json · ${m.nameTh}`,
      keywords: uniqueKeywords(
        m.nameTh,
        m.nameIsan,
        m.gregorianHint,
        ...m.highlights,
        `เดือน${m.month}`,
        `เดือน${monthWord}`,
        monthWord,
        'ฮีต',
      ),
    }
  })

  return [overview, ...perMonth]
}

export function chunkComparisons(): KnowledgeChunk[] {
  return [
    {
      id: 'compare__kathin_phapa',
      title: 'เปรียบเทียบกฐินกับผ้าป่า',
      content: [
        'กฐิน: ทอดภายในกำหนดกาลหลังออกพรรษา ถวายเฉพาะวัดที่จำพรรษาครบ ตามระเบียบกฐิน',
        'ผ้าป่า: ทอดได้ทั่วไป ไม่จำกัดกาลแบบกฐิน มุ่งถวายของใช้หรือปัจจัยแก่สงฆ์/วัด',
        'เป้าหมายร่วม: สร้างบุญและอุปถัมภ์พระพุทธศาสนา',
        'รายละเอียดเชิงลึกอาจต่างตามวัดท้องถิ่น ควรสอบถามวัดที่จัดงาน',
      ].join('\n'),
      category: 'comparison',
      type: 'comparison',
      source: 'HedBoon knowledge · เปรียบเทียบกฐิน/ผ้าป่า',
      keywords: uniqueKeywords('กฐิน', 'ผ้าป่า', 'เปรียบเทียบ', 'ทอดกฐิน', 'กำหนดกาล'),
    },
  ]
}

export function buildAllChunks(input: {
  ceremonies: Ceremony[]
  items: RitualItem[]
  heetMonths: HeetMonth[]
}): KnowledgeChunk[] {
  return [
    ...chunkCeremonies(input.ceremonies),
    ...chunkItems(input.items, input.ceremonies),
    ...chunkHeet12(input.heetMonths),
    ...chunkComparisons(),
  ]
}
