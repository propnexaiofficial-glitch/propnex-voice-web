import { useRef } from 'react'
import InteractiveCard from './InteractiveCard'
import { useHeadReveal, useStaggerReveal } from '../hooks/useReveal'

const steps = [
  {
    n: '01',
    title: 'Speak naturally',
    desc: 'Users talk via web, app, or phone — PropNex AI picks up every word in realtime.',
    accent: '#22d3ee',
  },
  {
    n: '02',
    title: 'Stream instantly',
    desc: 'Audio hops to the agent with ultra-low latency — no awkward pauses, no dropped turns.',
    accent: '#818cf8',
  },
  {
    n: '03',
    title: 'Think & act',
    desc: 'Your playbooks, CRM, and tools fire mid-call — qualify, book, and resolve on the fly.',
    accent: '#c084fc',
  },
  {
    n: '04',
    title: 'Reply like a pro',
    desc: 'Human-sounding voice comes back with the right answer — interruptions handled cleanly.',
    accent: '#f472b6',
  },
]

function PipelineVisual() {
  const ref = useRef(null)

  const nodes = [
    { label: 'User', x: 12, y: 58, c: '#22d3ee' },
    { label: 'Stream', x: 34, y: 32, c: '#818cf8' },
    { label: 'Agent', x: 58, y: 48, c: '#c084fc' },
    { label: 'Reply', x: 84, y: 28, c: '#f472b6' },
  ]

  return (
    <div
      ref={ref}
      className="relative mx-auto aspect-square w-full max-w-[420px] md:max-w-none md:aspect-[5/4]"
    >
      {/* Glow wash */}
      <div className="pointer-events-none absolute inset-[10%] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.18),transparent_65%)] blur-2xl" />
      <div className="pointer-events-none absolute inset-[20%] rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.15),transparent_60%)] blur-2xl" />

      {/* Orbit rings — pure CSS spin */}
      <div className="pipe-ring absolute inset-[12%] rounded-full border border-dashed border-white/10" style={{ animation: 'spin-slow 18s linear infinite' }} />
      <div className="pipe-ring-rev absolute inset-[22%] rounded-full border border-white/[0.07]" style={{ animation: 'spin-rev 24s linear infinite' }} />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#f472b6" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <path
          id="pipe-path"
          d="M14 58 C 24 58, 28 32, 36 32 S 48 48, 58 48 S 74 28, 84 28"
          fill="none"
          stroke="url(#pipeGrad)"
          strokeWidth="0.4"
          opacity="0.55"
        />
        <path
          className="pipe-flow"
          d="M14 58 C 24 58, 28 32, 36 32 S 48 48, 58 48 S 74 28, 84 28"
          fill="none"
          stroke="#67e8f9"
          strokeWidth="0.55"
          strokeDasharray="4 16"
          strokeLinecap="round"
          opacity="0.85"
        />
        {nodes.map((n) => (
          <g key={n.label} className="pipe-node">
            <circle cx={n.x} cy={n.y} r="3.2" fill={n.c} opacity="0.2" className="pipe-orb" />
            <circle cx={n.x} cy={n.y} r="1.6" fill={n.c} />
            <circle cx={n.x} cy={n.y} r="0.6" fill="#fff" opacity="0.9" />
          </g>
        ))}
      </svg>

      {/* Floating labels */}
      {nodes.map((n) => (
        <div
          key={`lbl-${n.label}`}
          className="pipe-node absolute -translate-x-1/2 text-center"
          style={{ left: `${n.x}%`, top: `${n.y + 8}%` }}
        >
          <span
            className="rounded-full border border-white/10 bg-black/50 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white/80 backdrop-blur-sm"
            style={{ boxShadow: `0 0 20px ${n.c}33` }}
          >
            {n.label}
          </span>
        </div>
      ))}

      {/* Center badge */}
      <div className="absolute left-1/2 top-[62%] flex -translate-x-1/2 flex-col items-center">
        <div className="pipe-orb flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400/30 via-violet-500/40 to-fuchsia-500/30 shadow-[0_0_40px_rgba(168,85,247,0.35)] backdrop-blur-md md:h-20 md:w-20">
          <span className="text-[11px] font-bold tracking-tight text-white md:text-xs">
            PropNex
          </span>
        </div>
        <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-white/35">
          Live pipeline
        </p>
      </div>
    </div>
  )
}

export default function HowItWorks() {
  const ref = useRef(null)
  useHeadReveal(ref, '.how-head')
  useStaggerReveal(ref, '.how-card', { stagger: 0.1 })

  return (
    <section id="how" ref={ref} className="section-edge relative overflow-hidden py-24 md:py-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_40%,rgba(34,211,238,0.07),transparent_50%),radial-gradient(ellipse_at_80%_60%,rgba(168,85,247,0.08),transparent_50%)]" />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="how-head mb-14 max-w-xl md:mb-16">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-400/80">
            The flow
          </p>
          <h2 className="text-[34px] font-semibold tracking-[-0.03em] text-white md:text-[44px]">
            From first word to{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              closed loop
            </span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-white/50">
            A realtime pipeline that listens, thinks, and speaks — animated end
            to end.
          </p>
        </div>

        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-10">
          {/* Steps */}
          <div className="how-list relative max-w-lg pl-1 lg:max-w-md">
            <div className="absolute bottom-3 left-[24px] top-3 w-px overflow-hidden md:left-[26px]">
              <div className="how-progress h-full w-full origin-top bg-gradient-to-b from-cyan-400 via-violet-500 to-fuchsia-400" />
            </div>

            <div className="space-y-3.5">
              {steps.map((s) => (
                <InteractiveCard
                  key={s.n}
                  className="how-card group relative !rounded-xl px-4 py-3.5 md:px-5 md:py-4"
                >
                  <div
                    className="how-card-glow pointer-events-none absolute -inset-px rounded-xl opacity-0"
                    style={{
                      background: `radial-gradient(500px circle at 0% 50%, ${s.accent}22, transparent 40%)`,
                    }}
                  />
                  <div className="relative flex gap-3.5 md:gap-4">
                    <div
                      className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black text-[11px] font-bold md:h-10 md:w-10 md:text-[12px]"
                      style={{
                        boxShadow: `0 0 0 3px #000, 0 0 18px ${s.accent}44`,
                        color: s.accent,
                      }}
                    >
                      {s.n}
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <h3 className="text-[15px] font-semibold tracking-tight text-white md:text-[16px]">
                        {s.title}
                      </h3>
                      <p className="mt-1 text-[12.5px] leading-snug text-white/50 md:text-[13px]">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                </InteractiveCard>
              ))}
            </div>
          </div>

          {/* Animated pipeline visual */}
          <div className="relative">
            <PipelineVisual />
          </div>
        </div>
      </div>
    </section>
  )
}
