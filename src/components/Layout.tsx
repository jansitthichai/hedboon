import { NavLink, Outlet } from 'react-router-dom'

const links = [
  { to: '/', label: 'หน้าแรก', end: true },
  { to: '/traditions', label: 'งานบุญ/ประเพณี', hideOnMobile: true },
  { to: '/plan', label: 'วางแผนงานบุญ' },
  { to: '/graph', label: 'Knowledge Graph' },
  { to: '/timeline', label: 'ฮีต 12' },
  { to: '/ask', label: 'คุยกับ AI', hideOnMobile: true },
]

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="site-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <NavLink to="/" className="flex items-center gap-3">
            <span className="logo-mark">
              <img src="/logo-hedboon.png" alt="HedBoon" />
            </span>
            <span>
              <span className="font-display block text-lg leading-none text-[var(--gold-soft)]">
                HedBoon
              </span>
              <span className="mt-0.5 block text-xs font-medium tracking-wide text-[var(--gold)]">
                เฮ็ดบุญ · ผู้ช่วยประเพณีอีสาน
              </span>
            </span>
          </NavLink>

          <nav className="hidden items-center gap-0.5 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  ['nav-pill', isActive ? 'nav-pill-active' : 'text-[rgba(255,249,232,0.78)] hover:text-[var(--gold-soft)]'].join(
                    ' ',
                  )
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="flex gap-1.5 overflow-x-auto px-4 pb-3 md:hidden">
          {links
            .filter((link) => !link.hideOnMobile)
            .map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  [
                    'shrink-0 rounded-lg px-3 py-1.5 text-xs transition',
                    isActive
                      ? 'nav-pill-active'
                      : 'border border-[rgba(244,215,122,0.35)] bg-[var(--header)] text-[var(--gold-soft)]',
                  ].join(' ')
                }
              >
                {link.label}
              </NavLink>
            ))}
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:py-10">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-[var(--muted)]">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <p>
              <span className="font-display text-[var(--primary)]">HedBoon AI</span>
              <span className="mx-1.5 text-[var(--saffron)]">✦</span>
              ผู้ช่วยวางแผนประเพณีและพิธีกรรมอีสาน
            </p>
            <p className="text-[var(--accent)]">ข้อมูลเพื่อการเรียนรู้ ควรสอบทานกับผู้รู้ท้องถิ่นก่อนจัดงานจริง</p>
          </div>
          <p className="text-xs leading-relaxed md:text-sm">
            โดย เด็กชายไตรภูมิ สุวรรณยุทธที, เด็กชายธนกฤต ประสิทธิ์นอก, เด็กชายสุกฤษฎิ์ ยอดคำมี
            {' · '}
            ครูที่ปรึกษา : นางสาวกฤติยา พลหาญ, นายสิทธิชัย ทิพย์สิงห์
          </p>
        </div>
      </footer>
    </div>
  )
}
