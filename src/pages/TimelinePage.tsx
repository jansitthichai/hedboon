import { useState } from 'react'
import { Link } from 'react-router-dom'
import { heetMonths } from '../lib/knowledge'

export function TimelinePage() {
  const [month, setMonth] = useState(4)
  const selected = heetMonths.find((m) => m.month === month) ?? heetMonths[0]

  return (
    <div className="space-y-8 animate-rise">
      <div>
        <p className="section-kicker">Heet 12</p>
        <h1 className="font-display mt-2 text-3xl text-[var(--primary)] md:text-4xl">ฮีต 12 Timeline</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          กดเดือนตามปฏิทินอีสานเพื่อเรียนรู้บุญประเพณีรายเดือน — จุดเริ่มต้นสู่การวางแผนงานบุญ
        </p>
      </div>

      <div className="relative overflow-x-auto pb-2">
        <div className="flex min-w-max items-stretch gap-3 px-1">
          {heetMonths.map((m, index) => (
            <button
              key={m.month}
              type="button"
              onClick={() => setMonth(m.month)}
              className={[
                'relative w-40 rounded-xl border p-4 text-left transition',
                m.month === month
                  ? 'border-[var(--primary)] bg-[var(--primary)] text-white shadow-md'
                  : 'border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--primary-light)] hover:shadow-sm',
              ].join(' ')}
            >
              <p className={`text-xs font-medium ${m.month === month ? 'text-[var(--gold-soft)]' : 'text-[var(--muted)]'}`}>
                {m.nameIsan}
                {m.gregorianHint ? ` · ${m.gregorianHint}` : ''}
              </p>
              <p className="mt-1 font-display text-base leading-snug">{m.nameTh}</p>
              {index < heetMonths.length - 1 && (
                <span
                  className={`pointer-events-none absolute -right-2 top-1/2 hidden h-0.5 w-3 -translate-y-1/2 md:block ${
                    m.month === month ? 'bg-[var(--gold)]' : 'bg-[var(--line)]'
                  }`}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <section className="panel-isan p-6">
        <p className="text-sm font-medium text-[var(--accent-warm)]">
          {selected.nameIsan}
          {selected.gregorianHint ? ` (${selected.gregorianHint})` : ''}
        </p>
        <h2 className="mt-1 font-display text-3xl text-[var(--primary)]">{selected.nameTh}</h2>
        <p className="mt-4 text-[var(--ink)]">{selected.summary}</p>

        <div className="mt-5 flex flex-wrap gap-2">
          {selected.highlights.map((h) => (
            <span key={h} className="badge-sticker">
              {h}
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {selected.planCeremonyId ? (
            <>
              <Link to={`/traditions/${selected.planCeremonyId}`} className="btn-primary">
                อ่านข้อมูลในคลังความรู้
              </Link>
              <Link to={`/plan?ceremony=${selected.planCeremonyId}`} className="btn-secondary">
                วางแผนจัดงานที่เกี่ยวข้อง
              </Link>
            </>
          ) : (
            <Link to="/ask" className="btn-secondary">
              คุยกับ AI เพิ่มเติมเกี่ยวกับบุญนี้
            </Link>
          )}
          {selected.nameTh.includes('กฐิน') && (
            <Link
              to="/ask"
              state={{ preset: 'บุญกฐินต่างกับผ้าป่าอย่างไร' }}
              className="btn-secondary"
            >
              เปรียบเทียบกฐินต่างกับผ้าป่า
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
