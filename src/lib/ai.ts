import { buildKnowledgeText, getItem, ceremonies, heetMonths } from './knowledge'

export type AIProvider = 'openai' | 'gemini' | 'offline'

export interface AIResponse {
  text: string
  provider: AIProvider
}

const SYSTEM_HINT =
  'ตอบแบบคุยกันเป็นกันเอง เหมือนเพื่อนที่รู้เรื่องประเพณีอีสาน ใช้ภาษาธรรมชาติ อ่านง่าย ไม่แข็งทื่อ ' +
  'กระชับพอดี ใช้หัวข้อเมื่อช่วยจัดระเบียบ และถ้าเป็นเรื่องของใช้ในพิธีให้อธิบายความหมาย ส่วนประกอบ และพิธีที่เกี่ยวข้อง'

function offlineAnswer(question: string): string {
  const q = question.trim().toLowerCase()

  if (!q) return 'โปรดพิมพ์คำถาม เช่น “ขันธ์ 5 คืออะไร” หรือ “ขึ้นบ้านใหม่ต้องเตรียมอะไร”'

  if (q.includes('ขัน') && (q.includes('5') || q.includes('๕') || q.includes('ห้า'))) {
    const item = getItem('khan5')
    if (item) {
      return [
        `**${item.name}** คือ ${item.meaning}`,
        '',
        `ประกอบด้วย: ${item.components.join(', ')}`,
        `ใช้ในพิธี: ${item.usedIn.map((id) => ceremonies.find((c) => c.id === id)?.nameTh).join(', ')}`,
        item.tips ? `เคล็ดลับ: ${item.tips}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    }
  }

  if (q.includes('กฐิน') && q.includes('ผ้าป่า')) {
    return [
      '**เปรียบเทียบกฐิน กับ ผ้าป่า**',
      '',
      '| หัวข้อ | กฐิน | ผ้าป่า |',
      '|---|---|---|',
      '| ช่วงเวลา | มีกำหนดกาลหลังออกพรรษา | ทอดได้ทั่วไป |',
      '| จุดเด่น | ถวายผ้าไตรตามระเบียบกฐิน | ถวายของใช้/ปัจจัยแก่สงฆ์หรือวัด |',
      '| เป้าหมายร่วม | สร้างบุญและอุปถัมภ์พระพุทธศาสนา | สร้างบุญและอุปถัมภ์พระพุทธศาสนา |',
      '',
      'รายละเอียดเชิงลึกอาจต่างตามวัดท้องถิ่น ควรสอบถามวัดที่จัดงาน',
    ].join('\n')
  }

  if (q.includes('กฐิน')) {
    const m = heetMonths.find((h) => h.nameTh.includes('กฐิน'))
    return m
      ? `**${m.nameTh}** (${m.nameIsan}${m.gregorianHint ? ` / ${m.gregorianHint}` : ''}): ${m.summary}\nจุดเด่น: ${m.highlights.join(', ')}`
      : 'บุญกฐินอยู่ในเดือนสิบสองตามฮีตอีสาน'
  }

  if (q.includes('ผ้าป่า')) {
    return '**ผ้าป่า** คือการทอดผ้าหรือถวายของใช้แก่พระสงฆ์/วัดได้โดยทั่วไป ไม่จำกัดกาลแบบกฐิน มุ่งสร้างบุญและอุปถัมภ์วัด'
  }

  if (q.includes('ขึ้นบ้าน') || q.includes('เฮือนใหม่') || q.includes('บ้านใหม่') || q.includes('ตามั่น') || q.includes('ค้ำคูณ')) {
    const c = ceremonies.find((x) => x.id === 'housewarming')!
    return [
      `**${c.nameTh}** — ${c.summary}`,
      '',
      'แบบดั้งเดิมเน้นตามั่นคำทองมาค้ำคูณเฮือน (ไม่มีพระ):',
      '1. เลือกฤกษ์ (นิยมพุธ พฤหัส ศุกร์)',
      '2. เตรียมของค้ำคูณ ใบตองกล้วย ก้อนหิน ขันน้ำมนต์',
      '3. เดินเวียนขวารอบบ้าน 3 รอบ',
      '4. ถาม-ตอบ ล้างเท้าขึ้นเรือน',
      '5. ตอกสิ่วเสาขวัญ ห้อยถุง 7 วัน',
      '6. นอนจำลอง ให้พร ผูกแขน แล้วเลี้ยงแขก',
      '',
      'บางบ้านจัดเพิ่มแบบนิมนต์พระหรือบายศรีสู่ขวัญ',
      'แนะนำ: ไปหน้า “วางแผนงานบุญ” เลือกแบบตามั่นคำทองหรือนิมนต์พระ',
    ].join('\n')
  }

  if (q.includes('บวช') || q.includes('นาค') || q.includes('ฮด')) {
    const c = ceremonies.find((x) => x.id === 'ordination')!
    return [
      `**${c.nameTh}** — ${c.summary}`,
      '',
      'ขั้นตอนหลัก:',
      ...c.steps.map((s) => `${s.order}. ${s.title}`),
      '',
      'ของใช้สำคัญ: ชุดนาค, ไตรจีวร, บาตร, ขันธ์ 5, บายศรี',
    ].join('\n')
  }

  if (q.includes('สะเดาะ') || (q.includes('บุญอายุ') && !q.includes('ฮีต'))) {
    const c = ceremonies.find((x) => x.id === 'ageMerit')!
    return [
      `**${c.nameTh}** — ${c.summary}`,
      '',
      'จัดได้ 2 แบบ:',
      '1. **สะเดาะเคราะห์ / หมอพราหมณ์** — ไม่ต้องมีพระ ใช้หมอพราหมณ์หรือหมอขวัญประกอบพิธี',
      '2. **นิมนต์พระ** — แบบร่วมสมัย มีพระสวดมนต์และประพรมน้ำมนต์',
      '',
      'ของใช้แบบหมอพราหมณ์: บายศรี, เทียนอายุ, สายสิญจน์, ดอกไม้',
      'ของใช้แบบนิมนต์พระ: ขันธ์ 5, ขันน้ำมนต์, มัดหญ้าคา, อาหารถวายพระ',
      '',
      'แนะนำ: ไปหน้า “วางแผนงานบุญ” เลือกงานบุญอายุ แล้วเลือกรูปแบบพิธี',
    ].join('\n')
  }

  if (q.includes('น้ำมนต์') || q.includes('ประพรม')) {
    const item = getItem('holy-water')
    if (item) {
      return [
        `**${item.name}** — ${item.meaning}`,
        '',
        '**การใช้ 3 อย่าง** (ตามสารานุกรมไทย ฉบับราชบัณฑิตยสถาน เล่ม 15):',
        ...(item.uses ?? []).map((u, i) => `${i + 1}. ${u}`),
        '',
        '**องค์ประกอบในภาคอีสาน:**',
        item.components.join(', '),
        '',
        item.tips ?? '',
        '',
        'หลังฟังเทศน์ ผู้คนมักนั่งพนมมือรอรับน้ำมนต์ที่พระอาวุโสประพรม ซึ่งถือเป็นมงคลแก่ตัว',
      ]
        .filter(Boolean)
        .join('\n')
    }
  }

  if (
    q.includes('งานบุญ') ||
    q.includes('ประเภท') ||
    q.includes('มีอะไรบ้าง') ||
    q.includes('ชนิดงาน')
  ) {
    return [
      `**ประเภทงานบุญใน HedBoon ขณะนี้มี ${ceremonies.length} รายการ**`,
      ...ceremonies.map((c, i) => `${i + 1}. ${c.nameTh} (${c.nameIsan})`),
      '',
      'ไปที่หน้า “วางแผนงานบุญ” เพื่อสร้าง checklist และกำหนดการ',
    ].join('\n')
  }

  const ceremonyHit = ceremonies.find(
    (c) =>
      q.includes(c.nameTh.toLowerCase()) ||
      q.includes(c.nameIsan.toLowerCase()) ||
      (c.id === 'wedding' && (q.includes('แต่ง') || q.includes('งานแต่ง'))) ||
      (c.id === 'riceHeap' && q.includes('กองข้าว')) ||
      (c.id === 'suKwan' && (q.includes('สู่ขวัญ') || q.includes('ทำขวัญ'))) ||
      (c.id === 'ageMerit' && (q.includes('บุญอายุ') || q.includes('สะเดาะ'))) ||
      (c.id === 'puTa' && q.includes('ปู่ตา')) ||
      (c.id === 'athi' &&
        (q.includes('อัฐิ') ||
          q.includes('อัฏฐะ') ||
          q.includes('แจกข้าว') ||
          q.includes('บุญอัฐิ') ||
          q.includes('กองบุญ') ||
          q.includes('กองบุญหา'))) ||
      (c.id === 'taHaek' &&
        (q.includes('ตาแฮก') ||
          q.includes('ผีตาแฮก') ||
          q.includes('เลี้ยงผีตาแฮก') ||
          q.includes('เซ่นตาแฮก'))),
  )

  if (ceremonyHit) {
    return [
      `**${ceremonyHit.nameTh}** — ${ceremonyHit.summary}`,
      '',
      'ขั้นตอนหลัก:',
      ...ceremonyHit.steps.map((s) => `${s.order}. ${s.title}`),
      '',
      'แนะนำ: ไปหน้า “วางแผนงานบุญ” เพื่อสร้าง checklist ตามจำนวนแขก',
    ].join('\n')
  }

  if (q.includes('ฮีต') || q.includes('heet') || q.includes('บุญเดือน') || q.includes('12')) {
    return [
      '**ฮีต 12** คือประเพณีบุญรายเดือนตามปฏิทินอีสาน',
      ...heetMonths.map(
        (m) =>
          `${m.nameIsan}${m.gregorianHint ? ` (${m.gregorianHint})` : ''}: ${m.nameTh}`,
      ),
      '',
      'ดูรายละเอียดได้ที่หน้า Timeline ฮีต 12',
    ].join('\n')
  }

  for (const item of [
    getItem('sai-sin'),
    getItem('baisi'),
    getItem('holy-water'),
    getItem('khan-nam-mon'),
    getItem('ya-kha'),
    getItem('khao-tok'),
    getItem('flowers'),
  ]) {
    if (!item) continue
    if (
      q.includes(item.name.toLowerCase()) ||
      (item.nameIsan && q.includes(item.nameIsan.toLowerCase()))
    ) {
      return [
        `**${item.name}**: ${item.meaning}`,
        `ประกอบด้วย: ${item.components.join(', ')}`,
        item.uses?.length ? `\nการใช้:\n${item.uses.map((u) => `- ${u}`).join('\n')}` : '',
        item.tips ? `\n${item.tips}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    }
  }

  return [
    'ตอนนี้อยู่ในโหมดความรู้ในเครื่อง (ยังไม่เชื่อม API)',
    'ลองถามเช่น:',
    '• ขันธ์ 5 คืออะไร',
    '• งานขึ้นบ้านใหม่ต้องเตรียมอะไร',
    '• บุญกฐินต่างกับผ้าป่าอย่างไร',
    '• น้ำมนต์ใช้ทำอะไรได้บ้าง',
    '',
    'หรือใส่ API key ในไฟล์ .env เพื่อใช้ ChatGPT / Gemini',
  ].join('\n')
}

async function callOpenAI(question: string, knowledge: string): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY as string | undefined
  if (!apiKey) throw new Error('missing_openai_key')

  const model = (import.meta.env.VITE_OPENAI_MODEL as string) || 'gpt-4o-mini'

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      messages: [
        { role: 'system', content: `${knowledge}\n\n${SYSTEM_HINT}` },
        { role: 'user', content: question },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`openai_error:${res.status}:${err.slice(0, 200)}`)
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const text = data.choices?.[0]?.message?.content?.trim()
  if (!text) throw new Error('openai_empty')
  return text
}

async function callGemini(question: string, knowledge: string): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
  if (!apiKey) throw new Error('missing_gemini_key')

  const model = (import.meta.env.VITE_GEMINI_MODEL as string) || 'gemini-2.0-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${knowledge}\n\n${SYSTEM_HINT}\n\nคำถามผู้ใช้: ${question}` }],
        },
      ],
      generationConfig: { temperature: 0.3 },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`gemini_error:${res.status}:${err.slice(0, 200)}`)
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('').trim()
  if (!text) throw new Error('gemini_empty')
  return text
}

export async function askHedBoon(question: string): Promise<AIResponse> {
  const knowledge = buildKnowledgeText()

  try {
    const text = await callOpenAI(question, knowledge)
    return { text, provider: 'openai' }
  } catch (openaiError) {
    console.warn('OpenAI failed, trying Gemini...', openaiError)
    try {
      const text = await callGemini(question, knowledge)
      return { text, provider: 'gemini' }
    } catch (geminiError) {
      console.warn('Gemini failed, using offline knowledge...', geminiError)
      return { text: offlineAnswer(question), provider: 'offline' }
    }
  }
}
