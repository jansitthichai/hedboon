/** Normalize Thai/English query for matching */
export function normalizeQuery(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[“”"']/g, '')
}

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
  'นะ',
  'เลย',
  'ช่วย',
  'บอก',
  'อธิบาย',
  'the',
  'and',
  'for',
  'with',
  'what',
  'how',
  'ความหมาย',
  'องค์ประกอบ',
  'เตรียม',
])

/** Split on whitespace / punctuation only (no character n-grams). */
export function wordTokens(text: string): string[] {
  return normalizeQuery(text)
    .split(/[\s,./\\|()[\]{}:;!?+_*=<>~`@#$%^&—\-·|]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t))
}

/** Character n-grams for local embedding only */
export function charNgrams(text: string): string[] {
  const compact = normalizeQuery(text).replace(/\s+/g, '')
  const grams: string[] = []
  for (let i = 0; i < compact.length - 1; i += 1) {
    grams.push(compact.slice(i, i + 2))
    if (i + 3 <= compact.length) grams.push(compact.slice(i, i + 3))
  }
  return grams
}

export function tokenize(text: string): string[] {
  return Array.from(new Set([...wordTokens(text), ...charNgrams(text)]))
}

/** Content tokens for embedding / bag-of-words */
export function contentTokens(text: string): string[] {
  return tokenize(text).filter((t) => t.length >= 2 && !STOPWORDS.has(t))
}

/**
 * Lexical keywords for retrieval (no noisy character n-grams).
 * Keeps whole phrases + space-split tokens.
 */
export function uniqueKeywords(...groups: Array<string | undefined | null>): string[] {
  const out = new Set<string>()
  for (const group of groups) {
    if (!group) continue
    const normalized = normalizeQuery(group)
    if (normalized.length >= 2 && normalized.length <= 48 && !STOPWORDS.has(normalized)) {
      out.add(normalized)
      // Also store compact form (no spaces) for Thai phrases like "ขันธ์ 5"
      const compact = normalized.replace(/\s+/g, '')
      if (compact.length >= 2 && compact !== normalized) out.add(compact)
    }
    for (const token of wordTokens(group)) {
      if (token.length <= 48) out.add(token)
    }
  }
  return Array.from(out)
}
