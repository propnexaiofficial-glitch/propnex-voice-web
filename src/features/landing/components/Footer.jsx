import { Link } from '@/features/landing/lib/router'
import Logo from './Logo'

const cols = [
  {
    title: 'Product',
    links: [
      { label: 'Features', to: '/features' },
      { label: 'AI Interview', to: '/#ai-interview' },
      { label: 'Live Demo', to: '/live-demo' },
      { label: 'Pricing', to: '/pricing' },
      { label: 'Partners', to: '/partners' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Customers', to: '/customers' },
      { label: 'Careers', to: '/careers' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { label: 'Docs Hub', to: '/docs' },
      { label: 'APIs', to: '/docs' },
      { label: 'Voice Cloning', to: '/docs' },
      { label: 'Telephony', to: '/docs' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', to: '/features#privacy' },
      { label: 'Terms', to: '/' },
      { label: 'Security', to: '/features#privacy' },
    ],
  },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/10 pb-10 pt-16">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid gap-10 md:grid-cols-[1.3fr_repeat(4,1fr)]">
          <div>
            <Logo size="footer" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              AI voice agents that qualify leads, book appointments, and follow
              up — for Real Estate, EdTech, FinTech, HealthTech & more.
            </p>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="mb-4 text-sm font-semibold text-white">{c.title}</h4>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-slate-500 transition hover:text-white"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} PropNex AI. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            {['Twitter', 'LinkedIn', 'GitHub'].map((s) => (
              <a
                key={s}
                href="#"
                className="text-xs font-medium text-slate-500 transition hover:text-white"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
