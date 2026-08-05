import { useEffect, useRef, useState } from 'react'
import { Link } from '@/features/landing/lib/router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import HeroScene from './3d/HeroScene'
import { useSimulatedSpeaking } from './3d/Visualizers'

const typedLines = [
  'agent.connect({ realtime: true })',
  'session.start({ voice: "cove" })',
  'await agent.speak("Hello…")',
]

function TypingLine() {
  const [lineIdx, setLineIdx] = useState(0)
  const [text, setText] = useState('')
  const [phase, setPhase] = useState('type')

  useEffect(() => {
    const full = typedLines[lineIdx]
    let timer

    if (phase === 'type') {
      if (text.length < full.length) {
        timer = setTimeout(
          () => setText(full.slice(0, text.length + 1)),
          28 + Math.random() * 30,
        )
      } else {
        timer = setTimeout(() => setPhase('hold'), 1600)
      }
    } else if (phase === 'hold') {
      timer = setTimeout(() => setPhase('erase'), 400)
    } else if (phase === 'erase') {
      if (text.length > 0) {
        timer = setTimeout(() => setText(text.slice(0, -1)), 16)
      } else {
        setLineIdx((i) => (i + 1) % typedLines.length)
        setPhase('type')
      }
    }

    return () => clearTimeout(timer)
  }, [text, phase, lineIdx])

  return (
    <p className="hero-type mt-5 flex items-center gap-2 font-mono text-[12px] text-cyan-300/70 md:text-[13px]">
      <span className="text-white/25">›</span>
      <span>
        {text}
        <span className="ml-0.5 inline-block h-[1em] w-[7px] animate-pulse bg-cyan-300/80 align-middle" />
      </span>
    </p>
  )
}

function MiniBars({ active }) {
  return (
    <div className="flex h-5 items-end justify-center gap-[3px]">
      {Array.from({ length: 18 }).map((_, i) => (
        <span
          key={i}
          className="w-[2.5px] origin-bottom rounded-full bg-gradient-to-t from-cyan-400/80 to-violet-400/80"
          style={{
            height: active ? `${30 + ((i * 37) % 70)}%` : '22%',
            animation: active
              ? `heroBar ${0.55 + (i % 5) * 0.12}s ease-in-out ${i * 0.04}s infinite alternate`
              : 'none',
            opacity: 0.55 + (i % 4) * 0.1,
          }}
        />
      ))}
    </div>
  )
}

export default function Hero() {
  const ref = useRef(null)
  const speaking = useSimulatedSpeaking(3800)

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
      tl.from('.hero-title', { y: 36, opacity: 0, duration: 0.9 })
        .from('.hero-sub', { y: 20, opacity: 0, duration: 0.65 }, '-=0.5')
        .from('.hero-cta', { y: 14, opacity: 0, duration: 0.5, stagger: 0.08 }, '-=0.35')
        .from('.hero-type', { opacity: 0, duration: 0.45 }, '-=0.25')
        .from('.hero-visual', { x: 40, opacity: 0, duration: 1.05 }, '-=0.85')
        .from('.hero-status', { y: 12, opacity: 0, duration: 0.45 }, '-=0.4')
        .from('.hero-badge', { y: 10, opacity: 0, duration: 0.4 }, '-=0.2')
    },
    { scope: ref },
  )

  return (
    <section
      id="home"
      ref={ref}
      className="relative overflow-hidden pt-24 pb-12 md:pt-28 md:pb-16"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[-5%] top-[35%] h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.16),transparent_68%)] blur-2xl md:right-[8%]" />
        <div className="absolute right-[5%] top-[48%] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.12),transparent_70%)] blur-3xl md:right-[14%]" />
        <div className="absolute left-[-10%] top-[40%] h-[360px] w-[360px] rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.08),transparent_70%)] blur-3xl" />
      </div>

      <div className="relative mx-auto grid max-w-6xl items-center gap-8 px-5 md:grid-cols-2 md:gap-6 md:px-8 lg:gap-10">
        {/* Left — copy */}
        <div className="relative z-10 text-center md:text-left">
          <h1 className="hero-title text-[34px] font-semibold leading-[1.08] tracking-[-0.035em] text-white sm:text-5xl md:text-[52px] lg:text-[56px]">
            Automate your calls.
            <br />
            <span className="gradient-text">Close more deals.</span>
          </h1>

          <p className="hero-sub mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-white/45 md:mx-0 md:text-base">
            PropNex AI gives your team always-on AI voice agents that qualify
            leads, book appointments, and follow up on every call - so your
            people can focus on closing.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <Link
              to="/live-demo"
              className="hero-cta btn-primary rounded-full px-7 py-3 text-sm md:text-[15px]"
            >
              Start building
            </Link>
            <Link
              to="/live-demo"
              className="hero-cta btn-ghost rounded-full px-7 py-3 text-sm md:text-[15px]"
            >
              Live Demo
            </Link>
          </div>

          <div className="flex justify-center md:justify-start">
            <TypingLine />
          </div>
        </div>

        {/* Right — 3D visual */}
        <div className="hero-visual relative flex flex-col items-center">
          <div className="relative h-[280px] w-full max-w-[400px] sm:h-[320px] md:h-[380px] md:max-w-none lg:h-[420px]">
            <HeroScene className="h-full w-full" active={speaking} />
          </div>

          <div className="hero-status -mt-10 flex flex-col items-center gap-2 md:-mt-12">
            <MiniBars active={speaking} />
            <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-3.5 py-1.5">
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  speaking
                    ? 'animate-pulse bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                    : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                }`}
              />
              <span className="text-[11px] font-medium tracking-wide text-white/55">
                {speaking ? 'Agent speaking' : 'Listening'}
              </span>
            </div>
          </div>

          <div className="hero-badge mt-3 inline-flex items-center gap-2 rounded-full border border-white/8 px-3.5 py-1.5 text-white/50">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-500/90 text-[9px] font-bold text-white">
              PH
            </span>
            <span className="text-[11px] font-medium">
              Product of the Day — #1 on Product Hunt
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
