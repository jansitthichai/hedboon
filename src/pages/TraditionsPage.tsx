import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ceremonies, getCeremony, getItem, heetMonths, ritualItems } from '../lib/knowledge'
import type { Ceremony, CeremonyId, RitualItem } from '../types/hedboon'

const ceremonyEmoji: Record<CeremonyId, string> = {
  housewarming: '🏠',
  ordination: '🙏',
  wedding: '💒',
  riceHeap: '🍚',
  suKwan: '🎋',
  ageMerit: '🎂',
  puTa: '🌳',
  athi: '🪔',
  taHaek: '🌾',
}

const ceremonyTags: Record<CeremonyId, string[]> = {
  housewarming: ['มงคล', 'ครอบครัว'],
  ordination: ['พระพุทธศาสนา', 'ครอบครัว'],
  wedding: ['มงคล', 'ครอบครัว'],
  riceHeap: ['ถวายพระ', 'อุทิศส่วนกุศล', 'บรรพบุรุษ', 'เดือนเก้า'],
  suKwan: ['สู่ขวัญ', 'ครอบครัว'],
  ageMerit: ['สู่ขวัญ', 'ชุมชน'],
  puTa: ['ความเชื่อ', 'ชุมชน', 'บรรพบุรุษ'],
  athi: ['ถวายพระ', 'ครอบครัว'],
  taHaek: ['ความเชื่อ', 'การเกษตร'],
}

function monkModeLabel(mode: Ceremony['monkMode']) {
  if (mode === 'none') return 'ไม่มีพระ'
  if (mode === 'optional') return 'มีพระหรือไม่มีพระก็ได้'
  return 'มีพระ'
}

function monkModeBadgeClass(mode: Ceremony['monkMode']) {
  if (mode === 'none') return 'bg-[var(--orange)]/20 text-[var(--orange)]'
  if (mode === 'optional') return 'bg-[var(--mist)] text-[var(--primary)]'
  return 'bg-[var(--field)]/20 text-[#007a33]'
}

function isCeremonyId(id: string): id is CeremonyId {
  return ceremonies.some((c) => c.id === id)
}

function TraditionIndex() {
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'monk' | 'folk' | 'community'>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return ceremonies.filter((c) => {
      const text = `${c.nameTh} ${c.nameIsan} ${c.summary}`.toLowerCase()
      if (q && !text.includes(q)) return false
      if (filter === 'monk') return c.monkMode === 'required' || c.monkMode === 'optional'
      if (filter === 'folk') return c.monkMode === 'none'
      if (filter === 'community') return ceremonyTags[c.id].includes('ชุมชน')
      return true
    })
  }, [query, filter])

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return ritualItems
    return ritualItems.filter((i) =>
      `${i.name} ${i.nameIsan ?? ''} ${i.meaning}`.toLowerCase().includes(q),
    )
  }, [query])

  return (
    <div className="space-y-10 animate-rise">
      <header>
        <p className="section-kicker">คลังความรู้</p>
        <h1 className="font-display mt-2 text-3xl text-[var(--primary)] md:text-4xl">
          งานบุญ / ประเพณี
        </h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          อ่านและค้นหาข้อมูลพิธีกรรม ของใช้ และความเชื่อจากคลังความรู้ HedBoon
          — เน้นเรียนรู้และทำความเข้าใจ ไม่ใช่การคำนวณแผนจัดงาน
        </p>
      </header>

      <div className="panel-isan flex flex-col gap-3 p-4 md:flex-row md:items-center md:p-5">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาชื่องานบุญ ประเพณี หรือของใช้..."
          className="input-field flex-1"
        />
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['all', 'ทั้งหมด'],
              ['monk', 'มีพระ'],
              ['folk', 'ไม่มีพระ'],
              ['community', 'ชุมชน'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setFilter(id)}
              className={[
                'rounded-full border px-3 py-1 text-xs font-medium transition',
                filter === id
                  ? 'border-[var(--primary)] bg-[var(--primary)] text-white'
                  : 'border-[var(--line)] bg-white text-[var(--muted)] hover:border-[var(--primary-light)]',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl text-[var(--ink)]">พิธีกรรม / งานบุญ</h2>
            <p className="text-sm text-[var(--muted)]">{filtered.length} รายการในคลัง</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((c) => (
            <Link
              key={c.id}
              to={`/traditions/${c.id}`}
              className="feature-tile group text-left"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-3xl">{ceremonyEmoji[c.id]}</span>
                <span
                  className={[
                    'rounded-full px-2 py-0.5 text-[10px] font-bold',
                    monkModeBadgeClass(c.monkMode),
                  ].join(' ')}
                >
                  {monkModeLabel(c.monkMode)}
                </span>
              </div>
              <h3 className="font-display relative z-[1] mt-3 text-xl text-[var(--ink)] group-hover:text-[var(--primary)]">
                {c.nameTh}
              </h3>
              <p className="relative z-[1] text-xs text-[var(--accent-warm)]">{c.nameIsan}</p>
              <p className="relative z-[1] mt-2 line-clamp-3 text-sm leading-relaxed text-[var(--muted)]">
                {c.summary}
              </p>
              <div className="relative z-[1] mt-3 flex flex-wrap gap-1.5">
                {ceremonyTags[c.id].map((tag) => (
                  <span key={tag} className="badge-sticker py-0.5 text-[10px]">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-2xl text-[var(--ink)]">ของใช้ในพิธี</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          ความหมายและบริบทการใช้ — กดเพื่อดูรายละเอียด
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      <section className="panel-isan p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-display text-2xl text-[var(--primary)]">ฮีต 12</h2>
            <p className="mt-1 max-w-xl text-sm text-[var(--muted)]">
              บุญประจำเดือนของชาวอีสาน — ดู timeline แบบโต้ตอบได้ที่เมนู ฮีต 12
            </p>
          </div>
          <Link to="/timeline" className="btn-secondary shrink-0">
            เปิด Timeline ฮีต 12
          </Link>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {heetMonths.slice(0, 4).map((m) => (
            <div key={m.month} className="stat-box text-sm">
              <p className="text-xs font-bold text-[var(--orange)]">
                {m.nameIsan}
                {m.gregorianHint ? ` · ${m.gregorianHint}` : ''}
              </p>
              <p className="font-display text-[var(--purple)]">{m.nameTh}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function ItemCard({ item }: { item: RitualItem }) {
  const usedNames = item.usedIn
    .map((id) => ceremonies.find((c) => c.id === id)?.nameTh ?? id)
    .slice(0, 3)

  return (
    <details className="panel-isan group p-4">
      <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
        <p className="font-display text-lg text-[var(--ink)] group-open:text-[var(--pink-hot)]">
          {item.name}
        </p>
        {item.nameIsan && <p className="text-xs text-[var(--purple)]">{item.nameIsan}</p>}
        <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">{item.meaning}</p>
      </summary>
      <div className="mt-3 space-y-2 border-t border-[var(--line)] pt-3 text-sm text-[var(--muted)]">
        <p>
          <span className="font-semibold text-[var(--ink)]">ประกอบด้วย: </span>
          {item.components.join(', ')}
        </p>
        {item.uses?.length ? (
          <ul className="list-disc space-y-1 pl-4">
            {item.uses.map((u) => (
              <li key={u}>{u}</li>
            ))}
          </ul>
        ) : null}
        {item.tips && <p className="text-xs italic">{item.tips}</p>}
        <p className="text-xs">
          <span className="font-semibold text-[var(--purple)]">ใช้ใน: </span>
          {usedNames.join(', ')}
          {item.usedIn.length > 3 ? ` +${item.usedIn.length - 3}` : ''}
        </p>
      </div>
    </details>
  )
}

function CeremonyDetail({ ceremonyId }: { ceremonyId: CeremonyId }) {
  const ceremony = getCeremony(ceremonyId)
  const relatedItems = ceremony.relatedItemIds
    .map((id) => getItem(id))
    .filter((i): i is RitualItem => Boolean(i))

  const linkedHeet = heetMonths.filter((m) => m.planCeremonyId === ceremonyId)

  return (
    <article className="space-y-8 animate-rise">
      <nav className="text-sm">
        <Link to="/traditions" className="text-[var(--primary-light)] hover:text-[var(--primary)]">
          ← กลับคลังความรู้
        </Link>
      </nav>

      <header className="panel-isan p-6 md:p-8">
        <div className="flex flex-wrap items-start gap-4">
          <span className="text-5xl">{ceremonyEmoji[ceremonyId]}</span>
          <div className="min-w-0 flex-1">
            <p className="section-kicker">เรื่องเล่าประเพณี</p>
            <h1 className="font-display mt-1 text-3xl text-[var(--primary)] md:text-4xl">
              {ceremony.nameTh}
            </h1>
            <p className="mt-1 text-base text-[var(--accent-warm)]">{ceremony.nameIsan}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span
                className={[
                  'rounded-full px-3 py-1 text-xs font-bold',
                  monkModeBadgeClass(ceremony.monkMode),
                ].join(' ')}
              >
                {monkModeLabel(ceremony.monkMode)}
              </span>
              {ceremonyTags[ceremonyId].map((tag) => (
                <span key={tag} className="badge-sticker py-0.5 text-[10px]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="mt-5 text-base leading-relaxed text-[var(--ink)]">{ceremony.summary}</p>
      </header>

      {ceremony.ritualStyles?.length ? (
        <section className="space-y-4">
          <h2 className="font-display text-2xl text-[var(--ink)]">รูปแบบพิธีในท้องถิ่น</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            {ceremony.ritualStyles.map((style) => (
              <div key={style.id} className="panel-isan p-5">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-xl text-[var(--purple)]">{style.nameTh}</h3>
                  <span className="text-xs font-bold text-[var(--muted)]">
                    {style.requiresMonks ? 'มีพระ' : 'ไม่มีพระ'}
                  </span>
                </div>
                {style.summaryNote && (
                  <p className="mt-2 text-sm text-[var(--muted)]">{style.summaryNote}</p>
                )}
                <ol className="mt-4 space-y-2 text-sm">
                  {style.steps.slice(0, 4).map((s) => (
                    <li key={s.order} className="flex gap-2">
                      <span className="font-bold text-[var(--pink-hot)]">{s.order}.</span>
                      <span>
                        <span className="font-medium text-[var(--ink)]">{s.title}</span>
                        {' — '}
                        <span className="text-[var(--muted)]">{s.detail}</span>
                      </span>
                    </li>
                  ))}
                  {style.steps.length > 4 && (
                    <li className="text-xs text-[var(--muted)]">
                      และอีก {style.steps.length - 4} ขั้นตอน...
                    </li>
                  )}
                </ol>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="panel-isan p-5 md:p-6">
        <h2 className="font-display text-2xl text-[var(--ink)]">ขั้นตอนและพิธีกรรม</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          ลำดับโดยทั่วไป — แต่ละหมู่บ้านอาจต่างกัน
        </p>
        <ol className="mt-5 space-y-4">
          {ceremony.steps.map((step) => (
            <li key={step.order} className="flex gap-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-sm font-semibold text-white">
                {step.order}
              </span>
              <div>
                <p className="font-display text-lg text-[var(--ink)]">{step.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="panel-isan p-5">
          <h2 className="font-display text-xl text-[var(--ink)]">ของใช้ / เครื่องพิธี</h2>
          <ul className="mt-4 space-y-3">
            {ceremony.checklist.map((item) => (
              <li key={item.id} className="flex gap-2 text-sm">
                <span className="text-[var(--lime)]">◆</span>
                <span>
                  <span className="font-medium text-[var(--ink)]">{item.name}</span>
                  {item.note && <span className="text-[var(--muted)]"> ({item.note})</span>}
                  {!item.required && (
                    <span className="ml-1 text-xs text-[var(--muted)]">· ถ้ามี</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {relatedItems.length > 0 && (
          <section className="panel-isan p-5">
            <h2 className="font-display text-xl text-[var(--ink)]">ของใช้ที่เกี่ยวข้องในคลัง</h2>
            <ul className="mt-4 space-y-3">
              {relatedItems.map((item) => (
                <li key={item.id} className="stat-box text-sm">
                  <p className="font-display text-[var(--purple)]">{item.name}</p>
                  <p className="mt-1 text-[var(--muted)]">{item.meaning}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      {linkedHeet.length > 0 && (
        <section className="panel-isan p-5">
          <h2 className="font-display text-xl text-[var(--pink-hot)]">เชื่อมกับฮีต 12</h2>
          <ul className="mt-3 space-y-2">
            {linkedHeet.map((m) => (
              <li key={m.month}>
                <Link
                  to="/timeline"
                  className="text-sm font-medium text-[var(--purple)] hover:text-[var(--pink-hot)]"
                >
                  {m.nameIsan} — {m.nameTh}
                  {m.gregorianHint ? ` (${m.gregorianHint})` : ''}
                </Link>
                <p className="text-sm text-[var(--muted)]">{m.summary}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="alert-box">
        <h2 className="font-display text-xl text-[var(--danger)]">ข้อห้าม / ข้อควรระวัง</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
          {ceremony.taboos.map((t) => (
            <li key={t}>• {t}</li>
          ))}
        </ul>
      </section>

      {ceremony.sources.length > 0 && (
        <section className="panel-isan p-5">
          <h2 className="font-display text-xl text-[var(--ink)]">แหล่งอ้างอิง</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-[var(--muted)]">
            {ceremony.sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-wrap gap-3 border-t border-[var(--line)] pt-6">
        <Link to={`/plan?ceremony=${ceremonyId}`} className="btn-secondary">
          📋 ไปวางแผนจัดงานนี้
        </Link>
        <Link
          to="/ask"
          state={{ preset: `${ceremony.nameTh} มีอะไรที่ควรรู้บ้าง` }}
          className="btn-primary"
        >
          💬 ถาม AI เพิ่มเติม
        </Link>
      </div>
    </article>
  )
}

export function TraditionsPage() {
  const { ceremonyId } = useParams()
  const navigate = useNavigate()

  if (ceremonyId && !isCeremonyId(ceremonyId)) {
    return (
      <div className="panel-isan p-8 text-center animate-rise">
        <p className="font-display text-2xl text-[var(--primary)]">ไม่พบข้อมูลพิธีนี้</p>
        <button type="button" onClick={() => navigate('/traditions')} className="btn-primary mt-4">
          กลับคลังความรู้
        </button>
      </div>
    )
  }

  if (ceremonyId && isCeremonyId(ceremonyId)) {
    return <CeremonyDetail ceremonyId={ceremonyId} />
  }

  return <TraditionIndex />
}
