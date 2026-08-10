import { useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import InfrastructureGlobe from './3d/InfrastructureGlobe'

gsap.registerPlugin(ScrollTrigger)

const compliance = ['GDPR', 'SOC 2 TYPE 2', 'HIPAA']

const stats = [
  { value: '99.99%', label: 'Uptime' },
  { value: '100ms', label: 'Global latency' },
  { value: '300,000+', label: 'Developers' },
  { value: '3,000,000,000+', label: 'Calls annually' },
]

const regions = [
  'Australia',
  'Brazil',
  'France',
  'Germany',
  'India',
  'Israel',
  'Japan',
  'Singapore',
  'UAE',
  'UK',
  'US Central',
  'US East',
  'US West',
]

function SignalBars() {
  return (
    <div className="flex items-end gap-[3px]">
      {[4, 7, 10, 13].map((h, i) => (
        <span
          key={i}
          className="infra-bar w-[3px] rounded-sm bg-cyan-400"
          style={{ height: h }}
        />
      ))}
    </div>
  )
}

function CornerFrame({ className = '' }) {
  const c = 'absolute h-2.5 w-2.5 border-cyan-400'
  return (
    <div className={`pointer-events-none absolute inset-0 ${className}`}>
      <span className={`${c} left-0 top-0 border-l border-t`} />
      <span className={`${c} right-0 top-0 border-r border-t`} />
      <span className={`${c} bottom-0 left-0 border-b border-l`} />
      <span className={`${c} bottom-0 right-0 border-b border-r`} />
    </div>
  )
}

export default function NetworkVisual() {
  const ref = useRef(null)
  const [active, setActive] = useState(4)

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % regions.length)
    }, 1800)
    return () => clearInterval(id)
  }, [])

  useGSAP(
    () => {
      gsap.fromTo(
        '.infra-left > *',
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.08,
          duration: 0.65,
          ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start: 'top 72%' },
        },
      )
      gsap.fromTo(
        '.infra-globe',
        { opacity: 0, scale: 0.92 },
        {
          opacity: 1,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start: 'top 72%' },
        },
      )
      gsap.fromTo(
        '.infra-right > *',
        { opacity: 0, x: 20 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.06,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start: 'top 72%' },
        },
      )
      gsap.to('.infra-bar', {
        scaleY: 0.45,
        transformOrigin: 'bottom',
        duration: 0.55,
        yoyo: true,
        repeat: -1,
        stagger: 0.1,
        ease: 'sine.inOut',
      })
    },
    { scope: ref },
  )

  return (
    <section
      id="infrastructure"
      ref={ref}
      className="relative overflow-hidden py-20 md:py-28"
    >
      {/* LiveKit-style grid floor */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
          backgroundSize: '56px 56px',
          maskImage:
            'radial-gradient(ellipse at center, black 15%, transparent 72%)',
          WebkitMaskImage:
            'radial-gradient(ellipse at center, black 15%, transparent 72%)',
        }}
      />

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="mb-10 text-center md:mb-12">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
            Built for scale
          </p>
          <h2 className="mt-3 text-[28px] font-semibold tracking-[-0.03em] text-white md:text-[36px]">
            Enterprise grade{' '}
            <span className="text-cyan-400">infrastructure</span>
          </h2>
        </div>

        <div className="grid items-center gap-10 lg:grid-cols-[220px_minmax(0,1fr)_200px] lg:gap-6 xl:grid-cols-[240px_minmax(0,1fr)_220px]">
          {/* LEFT — compliance + stats */}
          <div className="infra-left space-y-8">
            <div className="space-y-3">
              {compliance.map((c) => (
                <div key={c} className="flex items-center gap-3">
                  <SignalBars />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70">
                    {c} <span className="text-cyan-400">✓</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-6 border-t border-white/10 pt-7">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-mono text-[26px] font-semibold tracking-tight text-white md:text-[30px]">
                    {s.value}
                  </p>
                  <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/40">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CENTER — 3D globe */}
          <div className="infra-globe relative mx-auto w-full max-w-[520px]">
            <div className="pointer-events-none absolute inset-[8%] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.12),transparent_65%)] blur-2xl" />
            <InfrastructureGlobe className="relative h-[320px] w-full md:h-[420px] lg:h-[460px]" />
          </div>

          {/* RIGHT — regions */}
          <div className="infra-right">
            <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">
              <span className="text-cyan-400">19+</span> Regions globally
            </p>

            <div className="relative max-h-[340px] overflow-hidden pr-1">
              <ul className="space-y-1">
                {regions.map((r, i) => {
                  const on = i === active
                  return (
                    <li key={r} className="relative px-2.5 py-1.5">
                      {on && <CornerFrame />}
                      <button
                        type="button"
                        onClick={() => setActive(i)}
                        className={`w-full text-left text-[10px] font-semibold uppercase tracking-[0.16em] transition ${
                          on ? 'text-white' : 'text-white/35 hover:text-white/60'
                        }`}
                      >
                        {r}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
