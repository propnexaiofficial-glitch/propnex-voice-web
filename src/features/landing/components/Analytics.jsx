import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Chart3D from './3d/Chart3D'

gsap.registerPlugin(ScrollTrigger)

const points = [
  'Detect buying intent mid-conversation',
  'Auto-score leads against your ICP',
  'Push hot opportunities to Slack & CRM',
  'Surface coaching insights after every call',
]

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function Analytics() {
  const ref = useRef(null)
  const card = useRef(null)

  useGSAP(
    () => {
      gsap.fromTo(
        '.analytics-copy > *',
        { opacity: 0, x: -24 },
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start: 'top 75%' },
        },
      )

      gsap.fromTo(
        '.chart-wrap',
        { opacity: 0, y: 30, rotateX: 8 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.chart-wrap', start: 'top 82%' },
        },
      )

      // Live counter pulse
      gsap.to('.live-dot', {
        scale: 1.4,
        opacity: 0.4,
        duration: 0.9,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      })

      gsap.to('.stat-glow', {
        opacity: 0.9,
        duration: 1.6,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
      })
    },
    { scope: ref },
  )

  // Mouse tilt on the card
  const onMove = (e) => {
    const el = card.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    gsap.to(el, {
      rotateY: x * 10,
      rotateX: -y * 8,
      transformPerspective: 900,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  const onLeave = () => {
    gsap.to(card.current, {
      rotateY: 0,
      rotateX: 0,
      duration: 0.6,
      ease: 'power2.out',
    })
  }

  return (
    <section ref={ref} className="relative py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 md:grid-cols-2 md:gap-14 md:px-8">
        <div className="analytics-copy">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet-400">
            Responsive Intelligence
          </p>
          <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-white md:text-[36px]">
            Decisions that move as fast as your pipeline
          </h2>
          <p className="mt-4 text-[14px] leading-relaxed text-white/50">
            Live dashboards turn every conversation into actionable revenue
            signals — so managers coach smarter and reps close sooner.
          </p>
          <ul className="mt-8 space-y-3.5">
            {points.map((p) => (
              <li
                key={p}
                className="flex items-start gap-3 text-[13px] text-white/75 md:text-[14px]"
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12l5 5L20 7"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="chart-wrap relative"
          style={{ perspective: '1000px' }}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
        >
          {/* Crazy outer glow bloom */}
          <div className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.45),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(244,114,182,0.25),transparent_50%)]" />
          <div className="pointer-events-none absolute -inset-2 animate-pulse rounded-3xl bg-gradient-to-r from-violet-500/20 via-fuchsia-500/10 to-cyan-400/10" />

          <div
            ref={card}
            className="relative overflow-hidden rounded-2xl border border-white/15 bg-[#0a0a10]/95 shadow-[0_0_60px_rgba(168,85,247,0.25)] backdrop-blur-md will-change-transform"
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Scanning line */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px overflow-hidden">
              <div className="stat-glow h-full w-full bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent opacity-60" />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100%_28px] opacity-40" />

            <div className="relative z-10 flex items-center justify-between px-5 pt-5 md:px-6 md:pt-6">
              <div>
                <p className="text-[11px] text-white/40">Weekly conversions</p>
                <p className="stat-glow bg-gradient-to-r from-white via-fuchsia-200 to-violet-300 bg-clip-text text-[28px] font-bold text-transparent md:text-[32px]">
                  +184%
                </p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full border border-violet-400/30 bg-violet-500/15 px-3 py-1 text-[11px] font-semibold text-violet-200">
                <span className="live-dot h-1.5 w-1.5 rounded-full bg-violet-300 shadow-[0_0_8px_#c4b5fd]" />
                Live
              </span>
            </div>

            {/* 3D chart canvas */}
            <div className="relative h-[240px] w-full md:h-[280px]">
              <Chart3D className="h-full w-full" />
              {/* Corner accents */}
              <span className="absolute left-3 top-2 h-3 w-3 border-l border-t border-fuchsia-400/50" />
              <span className="absolute right-3 top-2 h-3 w-3 border-r border-t border-cyan-400/40" />
              <span className="absolute bottom-8 left-3 h-3 w-3 border-b border-l border-violet-400/40" />
              <span className="absolute bottom-8 right-3 h-3 w-3 border-b border-r border-fuchsia-400/40" />
            </div>

            <div className="relative z-10 flex justify-between px-5 pb-4 md:px-8">
              {days.map((d) => (
                <span
                  key={d}
                  className="text-[9px] font-medium uppercase tracking-wider text-white/35"
                >
                  {d}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
