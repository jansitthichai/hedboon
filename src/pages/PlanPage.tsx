import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { buildPlan } from '../lib/planner'
import type { CeremonyId, PlanResult, RitualStyleId } from '../types/hedboon'
import { ceremonies } from '../lib/knowledge'

function parseCeremonyId(value: string | null): CeremonyId {
  const allowed: CeremonyId[] = [
    'housewarming',
    'ordination',
    'wedding',
    'riceHeap',
    'suKwan',
    'ageMerit',
    'puTa',
    'athi',
    'taHaek',
  ]
  if (value && (allowed as string[]).includes(value)) return value as CeremonyId
  return 'housewarming'
}

export function PlanPage() {
  const [searchParams] = useSearchParams()
  const [ceremonyId, setCeremonyId] = useState<CeremonyId>(() =>
    parseCeremonyId(searchParams.get('ceremony')),
  )
  const [guests, setGuests] = useState(80)
  const [budget, setBudget] = useState<number | ''>('')
  const [monks, setMonks] = useState(9)
  const [ritualStyleId, setRitualStyleId] = useState<RitualStyleId>('buddhist')
  const [result, setResult] = useState<PlanResult | null>(null)

  const selected = useMemo(
    () => ceremonies.find((c) => c.id === ceremonyId),
    [ceremonyId],
  )

  const styles = selected?.ritualStyles ?? []
  const showStylePicker = (selected?.monkMode === 'optional' && styles.length > 0) || styles.length > 1

  const activeStyle = useMemo(() => {
    if (!selected) return null
    if (styles.length) {
      return styles.find((s) => s.id === ritualStyleId) ?? styles[0]
    }
    return {
      id: selected.monkMode === 'none' ? ('folk' as const) : ('buddhist' as const),
      nameTh: selected.monkMode === 'none' ? 'ไม่มีพระ' : 'นิมนต์พระ',
      requiresMonks: selected.monkMode !== 'none',
      steps: selected.steps,
      checklist: selected.checklist,
      scheduleTemplate: selected.scheduleTemplate,
    }
  }, [selected, styles, ritualStyleId])

  const needsMonks = activeStyle?.requiresMonks ?? selected?.monkMode !== 'none'

  useEffect(() => {
    if (!selected) return
    if (selected.monkMode === 'none') {
      setRitualStyleId('folk')
      return
    }
    if (selected.ritualStyles?.length) {
      const preferred =
        selected.ritualStyles.find((s) => !s.requiresMonks) ??
        selected.ritualStyles.find((s) => s.id === 'buddhist') ??
        selected.ritualStyles[0]
      setRitualStyleId(preferred.id)
      return
    }
    setRitualStyleId('buddhist')
  }, [ceremonyId, selected])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    setResult(
      buildPlan({
        ceremonyId,
        guests,
        monks: needsMonks ? monks : 0,
        ritualStyleId: showStylePicker || selected?.monkMode === 'optional' ? ritualStyleId : undefined,
        budget: budget === '' ? undefined : Number(budget),
      }),
    )
  }

  return (
    <div className="space-y-8 animate-rise">
      <div>
        <p className="section-kicker">Ceremony Planner</p>
        <h1 className="font-display mt-2 text-3xl text-[var(--indigo)] md:text-4xl">วางแผนงานบุญ</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          เลือกพิธีและจำนวนแขก ระบบจะสร้างขั้นตอน Checklist ปริมาณของใช้ และกำหนดการให้อัตโนมัติ
          บางพิธีไม่มีพระ เช่น เลี้ยงผีตาแฮก หรือขึ้นบ้านใหม่แบบตามั่นคำทอง
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="panel-isan grid gap-4 p-5 md:grid-cols-2 md:p-6"
      >
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#1e2a4a]">ประเภทงานบุญ</span>
          <select
            value={ceremonyId}
            onChange={(e) => setCeremonyId(e.target.value as CeremonyId)}
            className="w-full rounded-xl border border-[#d5dbe6] bg-white px-3 py-2.5 outline-none focus:border-[#d4a84b]"
          >
            {ceremonies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameTh} ({c.nameIsan})
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#1e2a4a]">จำนวนแขก</span>
          <input
            type="number"
            min={1}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="w-full rounded-xl border border-[#d5dbe6] bg-white px-3 py-2.5 outline-none focus:border-[#d4a84b]"
          />
        </label>

        {showStylePicker && (
          <label className="block space-y-1.5 md:col-span-2">
            <span className="text-sm font-medium text-[#1e2a4a]">รูปแบบพิธี</span>
            <select
              value={ritualStyleId}
              onChange={(e) => setRitualStyleId(e.target.value as RitualStyleId)}
              className="w-full rounded-xl border border-[#d5dbe6] bg-white px-3 py-2.5 outline-none focus:border-[#d4a84b]"
            >
              {styles.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nameTh}
                  {!s.requiresMonks ? ' — ไม่มีพระ' : ''}
                </option>
              ))}
            </select>
            {activeStyle?.summaryNote && (
              <span className="mt-1 block text-xs text-[#5c677a]">{activeStyle.summaryNote}</span>
            )}
          </label>
        )}

        {needsMonks ? (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-[#1e2a4a]">จำนวนพระ (รูป)</span>
            <input
              type="number"
              min={1}
              value={monks}
              onChange={(e) => setMonks(Number(e.target.value))}
              className="w-full rounded-xl border border-[#d5dbe6] bg-white px-3 py-2.5 outline-none focus:border-[#d4a84b]"
            />
          </label>
        ) : (
          <div className="rounded-xl border border-[#d5dbe6] bg-[#eef1f5] px-3 py-2.5 text-sm text-[#5c677a]">
            พิธีนี้ไม่ต้องมีพระ
            {activeStyle?.nameTh ? ` (${activeStyle.nameTh})` : ''}
          </div>
        )}

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[#1e2a4a]">งบประมาณโดยประมาณ (บาท)</span>
          <input
            type="number"
            min={0}
            placeholder="ไม่บังคับ"
            value={budget}
            onChange={(e) => setBudget(e.target.value === '' ? '' : Number(e.target.value))}
            className="w-full rounded-xl border border-[#d5dbe6] bg-white px-3 py-2.5 outline-none focus:border-[#d4a84b]"
          />
        </label>

        <div className="md:col-span-2">
          {selected && <p className="mb-4 text-sm text-[#5c677a]">{selected.summary}</p>}
          <button
            type="submit"
            className="rounded-xl bg-[#1e2a4a] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#2a3d66]"
          >
            สร้างแผนจัดงาน
          </button>
        </div>
      </form>

      {result && (
        <div className="space-y-6">
          <section className="panel-isan p-5 md:p-6">
            <h2 className="font-display text-2xl text-[#1e2a4a]">
              ขั้นตอนพิธี — {result.ceremony.nameTh}
              {result.ritualStyleName ? ` (${result.ritualStyleName})` : ''}
            </h2>
            <ol className="mt-4 space-y-3">
              {result.steps.map((step) => (
                <li key={step.order} className="flex gap-3">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#1e2a4a] text-sm text-[#d4a84b]">
                    {step.order}
                  </span>
                  <div>
                    <p className="font-medium text-[#1e2a4a]">{step.title}</p>
                    <p className="text-sm text-[#5c677a]">{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="grid gap-4 md:grid-cols-2">
            <div className="panel-isan p-5">
              <h3 className="font-display text-xl text-[#1e2a4a]">Checklist ของใช้</h3>
              <ul className="mt-3 space-y-2">
                {result.checklist.map((item) => (
                  <li key={item.id} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 text-[#2f6b4f]">✓</span>
                    <span>
                      <span className="text-[#1e2a4a]">{item.name}</span>
                      {item.note && <span className="text-[#5c677a]"> — {item.note}</span>}
                      {!item.required && <span className="text-[#5c677a]"> (ถ้ามี)</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel-isan p-5">
              <h3 className="font-display text-xl text-[#1e2a4a]">คำนวณสำหรับแขก {guests} คน</h3>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl bg-[#eef1f5] p-3">
                  <dt className="text-[#5c677a]">ข้าว</dt>
                  <dd className="text-lg font-semibold text-[#1e2a4a]">{result.quantities.riceKg} กก.</dd>
                </div>
                <div className="rounded-xl bg-[#eef1f5] p-3">
                  <dt className="text-[#5c677a]">น้ำดื่ม</dt>
                  <dd className="text-lg font-semibold text-[#1e2a4a]">{result.quantities.waterBottles} ขวด</dd>
                </div>
                <div className="rounded-xl bg-[#eef1f5] p-3">
                  <dt className="text-[#5c677a]">โต๊ะ</dt>
                  <dd className="text-lg font-semibold text-[#1e2a4a]">{result.quantities.tables} ตัว</dd>
                </div>
                <div className="rounded-xl bg-[#eef1f5] p-3">
                  <dt className="text-[#5c677a]">เก้าอี้</dt>
                  <dd className="text-lg font-semibold text-[#1e2a4a]">{result.quantities.chairs} ตัว</dd>
                </div>
                <div className="rounded-xl bg-[#eef1f5] p-3">
                  <dt className="text-[#5c677a]">ของหวาน/ชุดว่าง</dt>
                  <dd className="text-lg font-semibold text-[#1e2a4a]">{result.quantities.dessertSets} ชุด</dd>
                </div>
                {result.requiresMonks ? (
                  <div className="rounded-xl bg-[#eef1f5] p-3">
                    <dt className="text-[#5c677a]">สำรับพระ</dt>
                    <dd className="text-lg font-semibold text-[#1e2a4a]">{result.quantities.monkMeals} ชุด</dd>
                  </div>
                ) : (
                  <div className="rounded-xl bg-[#eef1f5] p-3">
                    <dt className="text-[#5c677a]">พระสงฆ์</dt>
                    <dd className="text-lg font-semibold text-[#1e2a4a]">ไม่ต้องมี</dd>
                  </div>
                )}
              </dl>

              {result.estimatedBudget && (
                <div className="mt-4 rounded-xl border border-[#d4a84b]/40 bg-[#d4a84b]/10 p-3 text-sm">
                  <p className="font-medium text-[#1e2a4a]">
                    ประมาณการงบ ~ {result.estimatedBudget.total.toLocaleString('th-TH')} บาท
                  </p>
                  <p className="mt-1 text-[#5c677a]">{result.estimatedBudget.note}</p>
                </div>
              )}
            </div>
          </section>

          <section className="panel-isan p-5 md:p-6">
            <h3 className="font-display text-xl text-[#1e2a4a]">กำหนดการวันงาน</h3>
            <div className="mt-4 space-y-3">
              {result.schedule.map((slot) => (
                <div key={`${slot.time}-${slot.title}`} className="grid gap-1 border-l-2 border-[#d4a84b] pl-4 md:grid-cols-[88px_1fr]">
                  <p className="font-semibold text-[#1e2a4a]">{slot.time}</p>
                  <div>
                    <p className="font-medium text-[#1e2a4a]">{slot.title}</p>
                    {slot.detail && <p className="text-sm text-[#5c677a]">{slot.detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-[#a33b2f]/20 bg-[#a33b2f]/5 p-5">
            <h3 className="font-display text-xl text-[#a33b2f]">ข้อควรระวัง / ข้อห้าม</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#5c677a]">
              {result.taboos.map((t) => (
                <li key={t}>• {t}</li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  )
}
