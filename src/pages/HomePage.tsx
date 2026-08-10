import { Link } from 'react-router-dom'

const features = [
  {
    title: 'งานบุญ / ประเพณี',
    kicker: 'Knowledge Library',
    desc: 'อ่านและค้นหาข้อมูลพิธีกรรม ของใช้ และความเชื่อจากคลังความรู้',
    to: '/traditions',
  },
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
      <section className="hero-panel px-6 py-12 md:px-12 md:py-16">
        <div className="hero-content relative max-w-2xl animate-rise">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="badge-sticker badge-sticker-accent">โครงงาน ม.ปลาย</span>
            <span className="badge-sticker">ประเพณีอีสาน</span>
          </div>

          <h1 className="font-display text-4xl leading-tight text-white md:text-5xl">
            HedBoon
            <span className="mt-1 block text-2xl font-medium text-white/90 md:text-3xl">
              เฮ็ดบุญ
            </span>
          </h1>

          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 md:text-lg">
            ผู้ช่วยด้านประเพณีและพิธีกรรมอีสาน — รวบรวมความรู้ท้องถิ่น
            และช่วยวางแผนจัดงานบุญให้เป็นขั้นตอน
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/traditions" className="btn-primary !border-white/20 !bg-white !text-[var(--primary)] hover:!bg-white/95">
              ดูคลังความรู้
            </Link>
            <Link to="/plan" className="btn-secondary !border-white/30 !bg-transparent !text-white hover:!bg-white/10">
              วางแผนงานบุญ
            </Link>
            <Link to="/ask" className="btn-secondary !border-white/30 !bg-transparent !text-white hover:!bg-white/10">
              คุยกับ AI
            </Link>
          </div>
        </div>
      </section>

      <section className="animate-rise-delay">
        <div className="mb-4">
          <p className="section-kicker">ฟีเจอร์หลัก</p>
          <h2 className="font-display mt-2 text-2xl text-[var(--ink)] md:text-3xl">
            จากความรู้ท้องถิ่นสู่แผนจัดงานจริง
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Link key={feature.title} to={feature.to} className="feature-tile">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-warm)]">
                {feature.kicker}
              </p>
              <h3 className="font-display relative z-[1] mt-2 text-lg text-[var(--ink)]">
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
        <p className="section-kicker">เกี่ยวกับระบบ</p>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[var(--muted)] md:text-base">
          HedBoon เก็บความรู้แบบมีโครงสร้าง ตั้งแต่ฮีต 12 ตามั่นคำทอง
          กองบุญอัฏฐะ และเลี้ยงผีตาแฮก เพื่อให้คนรุ่นใหม่จัดงานบุญได้ถูกขั้นตอน
          โดยยังเคารพธรรมเนียมท้องถิ่น
        </p>
      </section>
    </div>
  )
}
