import { useRef } from 'react'
import AuraOrb from './3d/AuraOrb'
import InteractiveCard from './InteractiveCard'
import { useHeadReveal, useStaggerReveal } from '../hooks/useReveal'

const smallCards = [
  {
    label: 'Outbound SDR',
    sub: 'Cold calls that warm up',
    color: 'from-cyan-400 to-blue-500',
  },
  {
    label: 'Inbound Concierge',
    sub: 'Answer & qualify instantly',
    color: 'from-violet-400 to-fuchsia-500',
  },
  {
    label: 'Renewal Guard',
    sub: 'Save churn before it starts',
    color: 'from-blue-400 to-violet-500',
  },
]

export default function Solutions() {
  const ref = useRef(null)
  useHeadReveal(ref)
  useStaggerReveal(ref, '.sol-card', { stagger: 0.1 })


  return (
    <section id="solutions" ref={ref} className="section-edge relative py-16 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="reveal-head mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Specialized AI Solutions
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-400">
            Deploy purpose-built agents across every revenue motion — trained on
            your playbooks, voice, and brand.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <InteractiveCard className="sol-card p-8 md:p-10">
            <p className="mb-3 text-sm font-semibold text-cyan-400">Enterprise ready</p>
            <h3 className="mb-4 text-2xl font-bold text-white md:text-3xl">
              One brain. Infinite sales conversations.
            </h3>
            <p className="mb-6 text-slate-400 leading-relaxed">
              PropNex AI learns your product, pricing, and persona — then runs
              thousands of concurrent dialogues with the consistency of your best
              closer. Integrate once, scale everywhere.
            </p>
            <ul className="space-y-3 text-sm text-white/75">
              {[
                'Custom voice cloning & brand tone',
                'Multi-language support (40+)',
                'SOC2-ready infrastructure',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                  {item}
                </li>
              ))}
            </ul>
          </InteractiveCard>

          <InteractiveCard
            className="sol-card relative min-h-[320px] !bg-[#08080c] p-0"
            tilt={false}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.35),transparent_65%)]" />
            <div className="globe-float absolute inset-0" style={{ animation: 'cta-float 4s ease-in-out infinite' }}>
              <AuraOrb className="h-full w-full" intensity={1.15} />
            </div>
            <p className="absolute bottom-6 left-6 right-6 z-10 text-lg font-semibold text-white">
              Global connectivity layer
            </p>
          </InteractiveCard>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {smallCards.map((c) => (
            <InteractiveCard key={c.label} className="sol-card flex flex-col items-start p-6">
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${c.color} text-white shadow-lg ring-1 ring-white/15`}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="8" stroke="white" strokeWidth="1.8" />
                  <path d="M12 8v4l3 2" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <h4 className="text-base font-semibold text-white">{c.label}</h4>
              <p className="mt-1 text-sm text-slate-400">{c.sub}</p>
            </InteractiveCard>
          ))}
        </div>
      </div>
    </section>
  )
}
