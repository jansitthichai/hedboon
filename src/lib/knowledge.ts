import housewarming from '../data/ceremonies/housewarming.json'
import ordination from '../data/ceremonies/ordination.json'
import wedding from '../data/ceremonies/wedding.json'
import riceHeap from '../data/ceremonies/riceHeap.json'
import suKwan from '../data/ceremonies/suKwan.json'
import ageMerit from '../data/ceremonies/ageMerit.json'
import puTa from '../data/ceremonies/puTa.json'
import athi from '../data/ceremonies/athi.json'
import taHaek from '../data/ceremonies/taHaek.json'
import items from '../data/items.json'
import heet12 from '../data/heet12.json'
import formulas from '../data/formulas.json'
import graph from '../data/graph.json'
import type {
  Ceremony,
  CeremonyId,
  GuestFormula,
  HeetMonth,
  RitualItem,
  GraphNodeData,
  GraphEdgeData,
} from '../types/hedboon'

export const ceremonies: Ceremony[] = [
  housewarming as Ceremony,
  ordination as Ceremony,
  wedding as Ceremony,
  riceHeap as Ceremony,
  suKwan as Ceremony,
  ageMerit as Ceremony,
  puTa as Ceremony,
  athi as Ceremony,
  taHaek as Ceremony,
]

export const ritualItems: RitualItem[] = items as RitualItem[]
export const heetMonths: HeetMonth[] = heet12 as HeetMonth[]
export const guestFormula: GuestFormula = formulas as GuestFormula
export const graphNodes: GraphNodeData[] = graph.nodes as GraphNodeData[]
export const graphEdges: GraphEdgeData[] = graph.edges as GraphEdgeData[]

export function getCeremony(id: CeremonyId): Ceremony {
  const found = ceremonies.find((c) => c.id === id)
  if (!found) throw new Error(`Ceremony not found: ${id}`)
  return found
}

export function getItem(id: string): RitualItem | undefined {
  return ritualItems.find((item) => item.id === id)
}

export function buildKnowledgeText(): string {
  const ceremonyText = ceremonies
    .map((c) => {
      const steps = c.steps.map((s) => `${s.order}. ${s.title}: ${s.detail}`).join('\n')
      const checklist = c.checklist.map((i) => `- ${i.name}${i.note ? ` (${i.note})` : ''}`).join('\n')
      const taboos = c.taboos.map((t) => `- ${t}`).join('\n')
      return `# ${c.nameTh} (${c.nameIsan})\nสรุป: ${c.summary}\nโหมดพระ: ${
        c.monkMode === 'none' ? 'ไม่มีพระ' : c.monkMode === 'optional' ? 'มีพระหรือไม่มีพระก็ได้' : 'มีพระ'
      }\n## ขั้นตอน\n${steps}\n## ของใช้\n${checklist}\n## ข้อห้าม\n${taboos}`
    })
    .join('\n\n')

  const itemText = ritualItems
    .map((i) => {
      const used = i.usedIn
        .map((id) => ceremonies.find((c) => c.id === id)?.nameTh ?? id)
        .join(', ')
      return `## ${i.name}\nความหมาย: ${i.meaning}\nประกอบด้วย: ${i.components.join(', ')}\n${
        i.uses?.length ? `การใช้:\n${i.uses.map((u) => `- ${u}`).join('\n')}\n` : ''
      }${i.tips ? `หมายเหตุ: ${i.tips}\n` : ''}ใช้ใน: ${used}`
    })
    .join('\n\n')

  const heetText = heetMonths
    .map(
      (m) =>
        `${m.nameIsan}${m.gregorianHint ? ` (${m.gregorianHint})` : ''}: ${m.nameTh} — ${m.summary}`,
    )
    .join('\n')

  return [
    'คุณคือ HedBoon AI ผู้ช่วยวางแผนประเพณีและพิธีกรรมอีสาน',
    'ตอบเป็นภาษาไทย ชัดเจน สุภาพ เหมาะกับนักเรียนและผู้ปกครอง',
    'ใช้เฉพาะข้อมูลด้านล่างเป็นหลัก ถ้าไม่มีข้อมูลให้บอกว่ายังไม่มีในระบบ HedBoon',
    'ห้ามแต่งข้อมูลวัฒนธรรมที่ไม่มีในคลังความรู้',
    '',
    '# พิธีกรรม',
    ceremonyText,
    '',
    '# ของใช้ในพิธี',
    itemText,
    '',
    '# ฮีต 12',
    heetText,
    '',
    '# เปรียบเทียบสั้นๆ',
    'กฐิน: ทอดภายในกำหนดกาลหลังออกพรรษา ถวายเฉพาะวัดที่จำพรรษาครบ',
    'ผ้าป่า: ทอดได้ทั่วไป ไม่จำกัดกาลแบบกฐิน มุ่งถวายสิ่งของแก่สงฆ์/วัด',
  ].join('\n')
}
