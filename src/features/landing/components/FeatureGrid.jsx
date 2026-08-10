import { useRef } from 'react'
import { Link } from '@/features/landing/lib/router'
import { useHeadReveal, useStaggerReveal } from '../hooks/useReveal'
import InteractiveCard from './InteractiveCard'

const features = [
  {
    title: 'Voice that converts',
    desc: 'Natural speech that mirrors your top closers — tone, pacing, and persuasion built in.',
    icon: (
      <path
        d="M12 3a4 4 0 00-4 4v5a4 4 0 008 0V7a4 4 0 00-4-4zm0 14c-3.3 0-6 1.3-6 3v1h12v-1c0-1.7-2.7-3-6-3z"
        fill="currentColor"
      />
    ),
  },
  {
    title: 'CRM-native sync',
    desc: 'Every lead, note, and next step syncs to your CRM in real time — zero manual entry.',
    icon: (
      <path
        d="M4 6h16v2H4V6zm0 5h10v2H4v-2zm0 5h16v2H4v-2z"
        fill="currentColor"
      />
    ),
  },
  {
    title: '24/7 qualification',
    desc: 'Never miss an inbound call. Qualify, score, and route hot leads while your team sleeps.',
    icon: (
      <path
        d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 10.4l3.5 2.1-.9 1.5L11 13V7h2v5.4z"
        fill="currentColor"
      />
    ),
  },
  {
    title: 'Objection playbooks',
    desc: 'Train custom rebuttals from your best calls so every conversation stays on script.',
    icon: (
      <path
        d="M5 4h14v2H5V4zm0 4h14v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8zm4 3h6v2H9v-2z"
        fill="currentColor"
      />
    ),
  },
]

export default function FeatureGrid() {
  const ref = useRef(null)
  useHeadReveal(ref)
  useStaggerReveal(ref, '.feature-card', { stagger: 0.12 })

  return (
    <section id="features" ref={ref} className="section-edge relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="reveal-head mx-auto mb-12 max-w-2xl text-center md:mb-16">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-400/80">
            Unmatched Capability
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-[42px]">
            Built for sales teams that{' '}
            <span className="gradient-text">refuse to lose deals</span>
          </h2>
          <Link
            to="/features"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition hover:text-cyan-200"
          >
            View all features
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <InteractiveCard
              key={f.title}
              className="feature-card p-6"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 text-cyan-300 ring-1 ring-white/10">
                <svg width="22" height="22" viewBox="0 0 24 24">
                  {f.icon}
                </svg>
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{f.desc}</p>
            </InteractiveCard>
          ))}
        </div>
      </div>
    </section>
  )
}
