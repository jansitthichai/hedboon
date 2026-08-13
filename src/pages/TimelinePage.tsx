import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { getCeremony, heetMonths } from '../lib/knowledge'
import type { HeetMonth } from '../types/hedboon'

const monthTones = [
  '#075b45',
  '#d9a52e',
  '#e98b23',
  '#9c3f68',
  '#0a7a5c',
  '#033c2e',
  '#a37a16',
  '#075b45',
  '#d9a52e',
  '#e98b23',
  '#9c3f68',
  '#0a7a5c',
]

function monthTone(month: number) {
  return monthTones[(month - 1) % monthTones.length]
}

function parseSource(raw: string): { label: string; href?: string } {
  const match = raw.match(/https?:\/\/\S+/)
  if (!match) return { label: raw }
  const href = match[0]
  const label = raw.replace(href, '').replace(/\s+[—–-]\s*$/, '').trim() || href
  return { label, href }
}

function MonthDetail({ selected }: { selected: HeetMonth }) {
  const linkedCeremony = selected.planCeremonyId
    ? getCeremony(selected.planCeremonyId)
    : null

  return (
    <section
      id="heet-detail"
      className="space-y-5 animate-rise"
      aria-live="polite"
    >
      <header className="panel-isan overflow-hidden p-0">
        <div className="border-b border-[var(--line)] bg-[linear-gradient(135deg,rgba(232,146,42,0.12),rgba(31,122,77,0.08),rgba(61,142,201,0.1))] px-6 py-5 md:px-8 md:py-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--accent-warm)]">
                เดือนที่ {selected.month} · {selected.nameIsan}
                {selected.gregorianHint ? ` (${selected.gregorianHint})` : ''}
              </p>
              <h2 className="mt-1 font-display text-3xl text-[var(--primary)] md:text-4xl">
                {selected.nameTh}
              </h2>
            </div>
            <span
              className="rounded-full px-3 py-1 text-xs font-semibold text-white shadow-sm"
              style={{
                background: `linear-gradient(135deg, ${monthTone(selected.month)}, color-mix(in srgb, ${monthTone(selected.month)} 70%, #033c2e))`,
              }}
            >
              ฮีตเดือน {selected.month}
            </span>
          </div>
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-[var(--ink)]">
            {selected.summary}
          </p>
        </div>

        <div className="grid gap-0 md:grid-cols-2">
          {selected.timing && (
            <div className="border-b border-[var(--line)] p-5 md:border-r md:border-b-0">
              <h3 className="font-display text-lg text-[var(--primary)]">ช่วงเวลา</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{selected.timing}</p>
            </div>
          )}
          {selected.belief && (
            <div className="p-5">
              <h3 className="font-display text-lg text-[var(--primary)]">ความเชื่อ / ความหมาย</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{selected.belief}</p>
            </div>
          )}
        </div>
      </header>

      {selected.practices && selected.practices.length > 0 && (
        <section className="panel-isan p-5 md:p-6">
          <h3 className="font-display text-2xl text-[var(--ink)]">ลำดับการปฏิบัติที่พบทั่วไป</h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            แต่ละหมู่บ้านอาจต่างกัน — ควรสอบทานกับวัดหรือผู้ใหญ่ในชุมชน
          </p>
          <ol className="mt-5 space-y-4">
            {selected.practices.map((step, index) => (
              <li key={step} className="flex gap-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <p className="pt-1.5 text-sm leading-relaxed text-[var(--ink)] md:text-base">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="panel-isan p-5 md:p-6">
        <h3 className="font-display text-xl text-[var(--ink)]">จุดเด่นของบุญนี้</h3>
        <div className="mt-4 flex flex-wrap gap-2">
          {selected.highlights.map((h) => (
            <span key={h} className="badge-sticker">
              {h}
            </span>
          ))}
        </div>
      </section>

      {linkedCeremony && (
        <section className="panel-isan p-5 md:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="font-display text-2xl text-[var(--ink)]">
                รายละเอียดจากคลังความรู้
              </h3>
              <p className="mt-1 text-sm text-[var(--accent-warm)]">
                {linkedCeremony.nameTh} · {linkedCeremony.nameIsan}
              </p>
            </div>
            <Link
              to={`/traditions/${linkedCeremony.id}`}
              className="text-sm font-medium text-[var(--primary-light)] hover:text-[var(--primary)]"
            >
              เปิดหน้าเต็ม →
            </Link>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
            {linkedCeremony.summary}
          </p>
          <ol className="mt-5 space-y-3">
            {linkedCeremony.steps.slice(0, 5).map((step) => (
              <li key={step.order} className="flex gap-3 text-sm">
                <span className="font-bold text-[var(--primary)]">{step.order}.</span>
                <span>
                  <span className="font-medium text-[var(--ink)]">{step.title}</span>
                  <span className="text-[var(--muted)]"> — {step.detail}</span>
                </span>
              </li>
            ))}
            {linkedCeremony.steps.length > 5 && (
              <li className="pl-5 text-xs text-[var(--muted)]">
                และอีก {linkedCeremony.steps.length - 5} ขั้นตอนในหน้าคลังความรู้
              </li>
            )}
          </ol>
        </section>
      )}

      {selected.sources && selected.sources.length > 0 && (
        <section className="panel-isan p-5 md:p-6">
          <h3 className="font-display text-xl text-[var(--ink)]">แหล่งอ้างอิง</h3>
          <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            {selected.sources.map((raw) => {
              const { label, href } = parseSource(raw)
              return (
                <li key={raw} className="flex gap-2">
                  <span className="text-[var(--accent)]">◆</span>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--primary-light)] hover:text-[var(--primary)] hover:underline"
                    >
                      {label}
                    </a>
                  ) : (
                    <span>{label}</span>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        {selected.planCeremonyId ? (
          <>
            <Link to={`/traditions/${selected.planCeremonyId}`} className="btn-primary">
              อ่านข้อมูลในคลังความรู้
            </Link>
            <Link to={`/plan?ceremony=${selected.planCeremonyId}`} className="btn-secondary">
              วางแผนจัดงานที่เกี่ยวข้อง
            </Link>
          </>
        ) : null}
        <Link
          to="/ask"
          state={{ preset: `${selected.nameTh} คืออะไร มีขั้นตอนอย่างไร` }}
          className="btn-secondary"
        >
          คุยกับ AI เกี่ยวกับบุญนี้
        </Link>
        {selected.nameTh.includes('กฐิน') && (
          <Link
            to="/ask"
            state={{ preset: 'บุญกฐินต่างกับผ้าป่าอย่างไร' }}
            className="btn-secondary"
          >
            เปรียบเทียบกฐินกับผ้าป่า
          </Link>
        )}
        {(selected.month === 9 || selected.month === 10) && (
          <Link
            to="/ask"
            state={{ preset: 'บุญข้าวประดับดินต่างกับบุญข้าวสากอย่างไร' }}
            className="btn-secondary"
          >
            เปรียบเทียบข้าวประดับดินกับข้าวสาก
          </Link>
        )}
      </div>
    </section>
  )
}

export function TimelinePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const detailRef = useRef<HTMLDivElement>(null)
  const paramMonth = Number(searchParams.get('month'))
  const initial =
    Number.isFinite(paramMonth) && paramMonth >= 1 && paramMonth <= 12 ? paramMonth : 4
  const [month, setMonth] = useState(initial)
  const selected = heetMonths.find((m) => m.month === month) ?? heetMonths[0]

  useEffect(() => {
    const next = Number(searchParams.get('month'))
    if (Number.isFinite(next) && next >= 1 && next <= 12 && next !== month) {
      setMonth(next)
    }
  }, [searchParams, month])

  function selectMonth(next: number) {
    setMonth(next)
    setSearchParams(next === 4 ? {} : { month: String(next) }, { replace: true })
    requestAnimationFrame(() => {
      detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  return (
    <div className="space-y-8 animate-rise">
      <div>
        <p className="section-kicker">Heet 12</p>
        <h1 className="font-display mt-2 text-3xl text-[var(--primary)] md:text-4xl">
          ฮีต 12 Timeline
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          กดเดือนตามปฏิทินอีสานเพื่อดูรายละเอียดบุญประเพณี — ความหมาย ช่วงเวลา ลำดับปฏิบัติ
          และแหล่งอ้างอิง
        </p>
      </div>

      <div className="relative overflow-x-auto pb-2">
        <div className="flex min-w-max items-stretch gap-3 px-1" role="tablist" aria-label="เดือนฮีต 12">
          {heetMonths.map((m, index) => {
            const active = m.month === month
            const tone = monthTone(m.month)
            return (
              <button
                key={m.month}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectMonth(m.month)}
                style={{ ['--month-tone' as string]: tone }}
                className={[
                  'month-chip relative w-40 rounded-xl border p-4 text-left transition',
                  active
                    ? 'month-chip-active text-white'
                    : 'border-[var(--line)] bg-white text-[var(--ink)] hover:shadow-sm',
                ].join(' ')}
              >
                <p
                  className={`text-xs font-medium ${
                    active ? 'text-white/85' : 'text-[var(--muted)]'
                  }`}
                >
                  เดือน {m.month}
                  {m.gregorianHint ? ` · ${m.gregorianHint}` : ''}
                </p>
                <p className="mt-1 font-display text-base leading-snug">{m.nameTh}</p>
                <p className={`mt-1 text-[11px] ${active ? 'text-white/75' : 'text-[var(--muted)]'}`}>
                  {m.nameIsan}
                </p>
                {index < heetMonths.length - 1 && (
                  <span
                    className="pointer-events-none absolute -right-2 top-1/2 hidden h-0.5 w-3 -translate-y-1/2 md:block"
                    style={{ background: active ? tone : 'var(--line)' }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div ref={detailRef}>
        <MonthDetail key={selected.month} selected={selected} />
      </div>
    </div>
  )
}
