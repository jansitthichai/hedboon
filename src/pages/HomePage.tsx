import { Link } from 'react-router-dom'

const features = [
  {
    title: 'งานบุญ / ประเพณี',
    kicker: 'Knowledge Library',
    emoji: '📚',
    desc: 'อ่านและค้นหาข้อมูลพิธีกรรม ของใช้ และความเชื่อจากคลังความรู้',
    to: '/traditions',
  },
  {
    title: 'วางแผนงานบุญ',
    kicker: 'Planner',
    emoji: '📋',
    desc: 'เลือกพิธีและจำนวนแขก ได้ checklist ของใช้ ปริมาณ และกำหนดการ',
    to: '/plan',
  },
  {
    title: 'แผนภาพความรู้',
    kicker: 'Knowledge Graph',
    emoji: '🕸️',
    desc: 'เห็นความเชื่อมโยงของของใช้ พิธี ความเชื่อ และข้อห้ามเป็นแผนภาพ',
    to: '/graph',
  },
  {
    title: 'ฮีต 12',
    kicker: 'Timeline',
    emoji: '📅',
    desc: 'เรียนรู้บุญรายเดือนของชาวอีสานแบบกดแล้วเข้าใจทันที',
    to: '/timeline',
  },
]

export function HomePage() {
  return (
    <div className="space-y-10">
      <section className="hero-panel rounded-[1.75rem] px-6 py-14 md:rounded-[2rem] md:px-12 md:py-20">
        <div className="hero-content relative max-w-2xl animate-rise">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="badge-sticker">โครงงาน ม.ปลาย ✨</span>
            <span className="badge-sticker" style={{ background: 'var(--cyan)', transform: 'rotate(2deg)' }}>
              ประเพณีอีสาน
            </span>
          </div>

          <h1 className="font-display text-4xl leading-[1.1] text-white md:text-6xl">
            HedBoon
            <span className="mt-2 block text-[1.75rem] text-[var(--yellow)] md:text-4xl">
              เฮ็ดบุญ 🪔
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base font-medium leading-relaxed text-white md:text-lg">
            ผู้ช่วยอัจฉริยะด้านประเพณีและพิธีกรรมอีสาน — ไม่ใช่แค่ค้นข้อมูล
            แต่ช่วยวางแผนจัดงานบุญให้เป็นขั้นตอน!
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/plan" className="btn-primary">
              🎊 เริ่มวางแผนงานบุญ
            </Link>
            <Link to="/traditions" className="btn-secondary">
              📚 ดูคลังความรู้
            </Link>
            <Link to="/ask" className="btn-secondary">
              💬 คุยกับ AI
            </Link>
          </div>
        </div>
      </section>

      <section className="animate-rise-delay">
        <div className="mb-4">
          <p className="section-kicker">ฟีเจอร์หลัก</p>
          <h2 className="font-display mt-3 text-2xl text-[var(--ink)] md:text-3xl">
            จากความรู้ท้องถิ่นสู่แผนจัดงานจริง 🔥
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Link key={feature.title} to={feature.to} className="feature-tile">
              <p className="text-2xl">{feature.emoji}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-[var(--purple)]">
                {feature.kicker}
              </p>
              <h3 className="font-display relative z-[1] mt-1 text-xl text-[var(--ink)]">
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
          <p className="mt-3 max-w-3xl text-sm font-medium leading-relaxed text-[var(--muted)] md:text-base">
            HedBoon เก็บความรู้แบบมีโครงสร้าง ตั้งแต่ฮีต 12 ตามั่นคำทอง
            กองบุญอัฏฐะ และเลี้ยงผีตาแฮก เพื่อให้คนรุ่นใหม่จัดงานบุญได้ถูกขั้นตอน
            โดยยังเคารพธรรมเนียมท้องถิ่น 💯
          </p>
        </div>
      </section>
    </div>
  )
}
