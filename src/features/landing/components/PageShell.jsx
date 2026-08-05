import { Link } from '@/features/landing/lib/router'
import Navbar from './Navbar'
import Footer from './Footer'

export default function PageShell({ children, className = '' }) {
  return (
    <div className={`min-h-screen bg-black text-white ${className}`}>
      <Navbar />
      <main className="relative pt-20 md:pt-24">{children}</main>
      <Footer />
    </div>
  )
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  image,
  children,
}) {
  return (
    <section className="relative overflow-hidden">
      {image && (
        <div className="absolute inset-0">
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/80 to-black" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_30%,rgba(34,211,238,0.18),transparent_55%)]" />
        </div>
      )}
      <div className="relative mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        {eyebrow && (
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300/80">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl lg:text-[56px] lg:leading-[1.08]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 max-w-2xl text-base text-white/60 md:text-lg">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </section>
  )
}

export function SectionCard({ className = '', children }) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  )
}

export function BackLink({ to = '/', label = 'Back to home' }) {
  return (
    <Link
      to={to}
      className="text-sm font-medium text-cyan-300/90 transition hover:text-cyan-200"
    >
      {label}
    </Link>
  )
}
