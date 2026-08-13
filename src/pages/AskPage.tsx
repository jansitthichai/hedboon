import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { askHedBoon, type AIProvider } from '../lib/ai'
import type { RagSource } from '../lib/rag/types'

const presets = [
  'ยายบอกให้เตรียมขันธ์ 5 คืออะไร',
  'งานขึ้นบ้านใหม่ต้องเตรียมอะไรบ้าง',
  'บุญกฐินต่างกับผ้าป่าอย่างไร',
  'ฮีต 12 มีอะไรบ้าง',
  'บายศรีใช้ทำอะไรในงานบุญอีสาน',
]

const providerLabel: Record<AIProvider, string> = {
  openai: 'HedBoon AI (ChatGPT + RAG)',
  gemini: 'HedBoon AI (Gemini + RAG)',
  offline: 'ความรู้ในเครื่อง + Retrieval (ไม่ได้ใช้ LLM)',
}

type Role = 'user' | 'assistant'

interface ChatMessage {
  id: string
  role: Role
  text: string
  provider?: AIProvider
  sources?: RagSource[]
  chunkCount?: number
}

const welcome: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'สวัสดีครับ ผม HedBoon ผู้ช่วยและผู้รู้เรื่องงานบุญ พิธีกรรม และประเพณีอีสาน\nถ้ามีในคลังความรู้จะอ้างจากนั้นก่อน ถ้ายังไม่มีก็จะช่วยอธิบายในฐานะผู้เชี่ยวชาญประเพณีอีสานให้ — คุยมาได้เลยครับ',
}

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function renderChatText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-[var(--pink-hot)]">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export function AskPage() {
  const location = useLocation()
  const presetFromNav = (location.state as { preset?: string } | null)?.preset

  const [messages, setMessages] = useState<ChatMessage[]>([welcome])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const startedFromNav = useRef(false)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, loading, error])

  useEffect(() => {
    if (!presetFromNav || startedFromNav.current) return
    startedFromNav.current = true
    void sendMessage(presetFromNav)
  }, [presetFromNav])

  async function sendMessage(raw: string) {
    const text = raw.trim()
    if (!text || loading) return

    setError('')
    setDraft('')
    setMessages((prev) => [...prev, { id: newId(), role: 'user', text }])
    setLoading(true)

    try {
      const res = await askHedBoon(text)
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: 'assistant',
          text: res.text,
          provider: res.provider,
          sources: res.sources,
          chunkCount: res.chunkCount,
        },
      ])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'คุยไม่สำเร็จ ลองใหม่อีกครั้งนะครับ')
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    void sendMessage(draft)
  }

  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void sendMessage(draft)
    }
  }

  const showPresets = messages.length <= 1 && !loading

  return (
    <div className="mx-auto flex max-w-3xl flex-col animate-rise" style={{ minHeight: 'min(70vh, 720px)' }}>
      <div className="mb-4 shrink-0">
        <p className="section-kicker">คุยกับ AI · RAG</p>
        <h1 className="font-display mt-2 text-3xl text-[var(--primary)] md:text-4xl">แชตกับ HedBoon</h1>
        <p className="mt-2 text-[var(--muted)]">
          ค้นจากฐานความรู้ประเพณีอีสานก่อน แล้วค่อยให้ AI สรุปคำตอบ พร้อมแสดงแหล่งข้อมูลที่ใช้
        </p>
      </div>

      <div className="panel-isan flex min-h-[520px] flex-1 flex-col overflow-hidden md:min-h-[580px]">
        <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3 md:px-5">
          <span className="logo-mark h-10 w-10">
            <img src="/logo-hedboon.png" alt="HedBoon" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-lg leading-none text-[var(--primary)]">HedBoon</p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {loading ? 'กำลังค้นความรู้และตอบ...' : 'RAG · พร้อมคุยเรื่องงานบุญ'}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 md:px-5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={[
                  'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm md:max-w-[78%]',
                  msg.role === 'user'
                    ? 'chat-bubble-user rounded-br-md'
                    : 'chat-bubble-ai rounded-bl-md text-[var(--ink)]',
                ].join(' ')}
              >
                {msg.role === 'assistant' && (
                  <p className="mb-1 text-[11px] font-medium text-[var(--muted)]">HedBoon</p>
                )}
                <div className="prose-answer whitespace-pre-wrap">{renderChatText(msg.text)}</div>

                {msg.role === 'assistant' && msg.provider && (
                  <div className="mt-2 space-y-1 border-t border-[var(--line)]/80 pt-2 text-[10px] text-[var(--muted)]">
                    <p>ตอบโดย: {providerLabel[msg.provider]}</p>
                    {msg.sources && msg.sources.length > 0 ? (
                      <>
                        {typeof msg.chunkCount === 'number' && msg.chunkCount > 0 && (
                          <p>แหล่งจากคลังความรู้: {msg.chunkCount} รายการ</p>
                        )}
                        <ol className="mt-1 list-decimal space-y-0.5 pl-4">
                          {msg.sources.map((s) => (
                            <li key={s.chunkId}>{s.title}</li>
                          ))}
                        </ol>
                      </>
                    ) : msg.provider !== 'offline' ? (
                      <p>โหมดผู้เชี่ยวชาญประเพณีอีสาน (ยังไม่มีในคลังโดยตรง)</p>
                    ) : null}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="chat-bubble-ai rounded-2xl rounded-bl-md bg-white px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="chat-dot" />
                  <span className="chat-dot chat-dot-delay-1" />
                  <span className="chat-dot chat-dot-delay-2" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="alert-box px-3 py-2 text-sm text-[var(--danger)]">
              {error}
            </div>
          )}

          {showPresets && (
            <div className="pt-1">
              <p className="mb-2 text-xs text-[var(--muted)]">ลองเริ่มคุยจากหัวข้อเหล่านี้</p>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => void sendMessage(p)}
                    className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 text-left text-xs font-medium text-[var(--primary)] transition hover:border-[var(--primary-light)] hover:bg-[var(--mist)]"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form
          onSubmit={onSubmit}
          className="border-t border-[var(--line)] bg-white/70 px-3 py-3 backdrop-blur-sm md:px-4"
        >
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="พิมพ์ข้อความ... (Enter เพื่อส่ง)"
              className="input-field max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl px-3.5 py-2.5 text-sm"
            />
            <button
              type="submit"
              disabled={loading || !draft.trim()}
              className="btn-primary shrink-0 rounded-2xl px-4 py-2.5 text-sm disabled:opacity-50"
            >
              ส่ง
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-[var(--muted)]">Shift+Enter ขึ้นบรรทัดใหม่</p>
        </form>
      </div>
    </div>
  )
}
