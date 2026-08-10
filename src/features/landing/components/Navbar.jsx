import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from '@/features/landing/lib/router'
import Logo from './Logo'

const primaryLinks = [
  { label: 'Home', to: '/' },
  { label: 'Features', to: '/features' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'Partners', to: '/partners' },
  { label: 'Docs', to: '/docs' },
]

const companyLinks = [
  { label: 'About Us', to: '/about' },
  { label: 'Customers', to: '/customers' },
  { label: 'Careers', to: '/careers' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [companyOpen, setCompanyOpen] = useState(false)
  const companyRef = useRef(null)
  const { pathname } = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
    setCompanyOpen(false)
  }, [pathname])

  useEffect(() => {
    const onDoc = (e) => {
      if (!companyRef.current?.contains(e.target)) setCompanyOpen(false)
    }
    document.addEventListener('pointerdown', onDoc)
    return () => document.removeEventListener('pointerdown', onDoc)
  }, [])

  const companyActive = companyLinks.some((l) => pathname === l.to)

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-white/10 bg-black/80 backdrop-blur-xl'
          : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5 md:h-16 md:px-8">
        <Logo />

        <ul className="hidden items-center gap-6 lg:flex">
          {primaryLinks.map((l) => {
            const active =
              l.to === '/'
                ? pathname === '/'
                : pathname === l.to || pathname.startsWith(`${l.to}/`)
            return (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={`relative text-[13px] font-medium transition after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:bg-cyan-400 after:transition after:duration-300 hover:text-white hover:after:scale-x-100 ${
                    active
                      ? 'text-white after:scale-x-100'
                      : 'text-white/70 after:scale-x-0'
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            )
          })}
          <li className="relative" ref={companyRef}>
            <button
              type="button"
              onClick={() => setCompanyOpen((v) => !v)}
              className={`relative text-[13px] font-medium transition after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:bg-cyan-400 after:transition ${
                companyActive
                  ? 'text-white after:scale-x-100'
                  : 'text-white/70 after:scale-x-0 hover:text-white'
              }`}
            >
              Company
            </button>
            {companyOpen && (
              <div className="absolute left-1/2 top-full z-50 mt-3 w-48 -translate-x-1/2 rounded-xl border border-white/10 bg-black/95 p-2 shadow-2xl backdrop-blur-xl">
                {companyLinks.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    className={`block rounded-lg px-3 py-2 text-[13px] transition hover:bg-white/5 ${
                      pathname === l.to ? 'text-cyan-300' : 'text-white/70'
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </li>
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/live-demo"
            className="rounded-full border border-white/15 px-3.5 py-2 text-[12px] font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
          >
            Live demo
          </Link>
          <Link
            to="/auth/sign-up"
            className="rounded-full bg-cyan-400 px-4 py-2 text-[13px] font-semibold text-black shadow-[0_0_24px_rgba(34,211,238,0.25)] transition hover:bg-cyan-300 active:scale-[0.97]"
          >
            Get Started
          </Link>
        </div>

        <button
          type="button"
          aria-label="Toggle menu"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 lg:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Menu</span>
          <div className="flex w-4 flex-col gap-1">
            <span className="h-0.5 w-full bg-white" />
            <span className="h-0.5 w-full bg-white" />
            <span className="h-0.5 w-full bg-white" />
          </div>
        </button>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-black/95 px-5 py-4 lg:hidden">
          <ul className="flex flex-col gap-1">
            {[...primaryLinks, ...companyLinks, { label: 'Live demo', to: '/live-demo' }].map(
              (l) => (
                <li key={l.to + l.label}>
                  <Link
                    to={l.to}
                    className="block py-2 text-sm text-white/70"
                    onClick={() => setOpen(false)}
                  >
                    {l.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
          <Link
            to="/auth/sign-up"
            className="btn-primary mt-4 block rounded-full px-5 py-3 text-center text-sm"
            onClick={() => setOpen(false)}
          >
            Get Started
          </Link>
        </div>
      )}
    </header>
  )
}
