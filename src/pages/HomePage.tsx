import { Link } from 'react-router-dom'

const features = [
  {
    title: 'วางแผนงานบุญ',
    kicker: 'Planner',
    desc: 'เลือกพิธีและจำนวนแขก ได้ checklist ของใช้ ปริมาณ และกำหนดการ',
    to: '/plan',
  },
  {
    title: 'แผนภาพความรู้',
    kicker: 'Knowledge Graph',
    desc: 'เห็นความเชื่อมโยงของของใช้ พิธี ความเชื่อ และข้อห้ามเป็นแผนภาพ',
    to: '/graph',
  },
  {
    title: 'ฮีต 12',
    kicker: 'Timeline',
    desc: 'เรียนรู้บุญรายเดือนของชาวอีสานแบบกดแล้วเข้าใจทันที',
    to: '/timeline',
  },
]

export function HomePage() {
  return (
    <div className="space-y-10">
      <section className="hero-panel rounded-[1.75rem] px-6 py-14 md:rounded-[2rem] md:px-12 md:py-20">
        <div className="pointer-events-none absolute -right-10 top-6 h-52 w-52 rounded-full bg-[#d2a83d]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 left-1/4 h-44 w-44 rounded-full bg-[#2f6a48]/35 blur-3xl" />

        <div className="hero-content relative max-w-2xl animate-rise">
          <div className="mb-5 flex items-center gap-3">
            <span className="ornament-diamond" />
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#e8c86a]">
              Isan Cultural Assistant
            </p>
          </div>

          <h1 className="font-display text-4xl leading-[1.15] text-white md:text-6xl">
            HedBoon
            <span className="mt-2 block text-[1.65rem] text-[#e8c86a] md:text-3xl">
              เฮ็ดบุญ
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#e7eef8] md:text-lg">
            ผู้ช่วยอัจฉริยะด้านประเพณีและพิธีกรรมอีสาน — ไม่ใช่แค่ค้นข้อมูล
            แต่ช่วยวางแผนจัดงานบุญให้เป็นขั้นตอน
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/plan"
              className="rounded-xl bg-[var(--gold)] px-5 py-3 text-sm font-semibold text-[var(--indigo-deep)] transition hover:bg-[var(--gold-soft)]"
            >
              เริ่มวางแผนงานบุญ
            </Link>
            <Link
              to="/ask"
              className="rounded-xl border border-[#e8c86a]/55 bg-[#162744]/55 px-5 py-3 text-sm font-medium text-white transition hover:border-[#e8c86a] hover:bg-[#243a5e]"
            >
              คุยกับ AI
            </Link>
          </div>
        </div>
      </section>

      <section className="animate-rise-delay">
        <div className="mb-4">
          <p className="section-kicker">สามแกนหลัก</p>
          <h2 className="font-display mt-2 text-2xl text-[var(--indigo)] md:text-3xl">
            จากความรู้ท้องถิ่นสู่แผนจัดงานจริง
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature) => (
            <Link key={feature.title} to={feature.to} className="feature-tile">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold-deep)]">
                {feature.kicker}
              </p>
              <h3 className="font-display relative z-[1] mt-2 text-xl text-[var(--indigo)]">
                {feature.title}
              </h3>
              <p className="relative z-[1] mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {feature.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="panel-isan animate-rise-late px-5 py-5 md:px-7 md:py-6">
        <div className="pl-3">
          <p className="section-kicker">กลิ่นอีสานในระบบ</p>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-[var(--muted)] md:text-base">
            HedBoon เก็บความรู้แบบมีโครงสร้าง ตั้งแต่ฮีต 12 ตามั่นคำทอง
            กองบุญอัฏฐะ และเลี้ยงผีตาแฮก เพื่อให้คนรุ่นใหม่จัดงานบุญได้ถูกขั้นตอน
            โดยยังเคารพธรรมเนียมท้องถิ่น
          </p>
        </div>
      </section>
    </div>
  )
}
