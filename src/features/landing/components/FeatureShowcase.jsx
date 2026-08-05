import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { RadialVisualizer3D, useSimulatedSpeaking } from './3d/Visualizers'
import InteractiveCard from './InteractiveCard'

gsap.registerPlugin(ScrollTrigger)

const features = [
  { title: 'Smart dialer', desc: 'Parallel dialing with AI screening' },
  { title: 'Live coaching', desc: 'Prompts appear as objections arise' },
  { title: 'Deal memory', desc: 'Context carries across every touch' },
  { title: 'Compliance layer', desc: 'Recording, consent & audit trails' },
]

export default function FeatureShowcase() {
  const ref = useRef(null)
  const speaking = useSimulatedSpeaking(3600)

  useGSAP(
    () => {
      gsap.fromTo(
        '.show-item',
        { opacity: 0, x: -24 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.12,
          duration: 0.65,
          ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start: 'top 75%' },
        },
      )
    },
    { scope: ref },
  )

  return (
    <section ref={ref} className="section-edge relative py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 md:grid-cols-2 md:px-8">
        <div>
          <h2 className="show-item text-3xl font-bold tracking-tight text-white md:text-4xl">
            Infrastructure for{' '}
            <span className="gradient-text">everyone on the team</span>
          </h2>
          <p className="show-item mt-4 text-slate-400">
            Aura visualizers, radial energy fields, and realtime agent state —
            the same visual language as modern voice AI platforms.
          </p>
          <ul className="mt-10 space-y-5">
            {features.map((f) => (
              <li key={f.title} className="show-item">
                <InteractiveCard className="flex gap-4 !rounded-xl p-3" tilt={false}>
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-cyan-300">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="5" />
                    </svg>
                  </span>
                  <div>
                    <h4 className="font-semibold text-white">{f.title}</h4>
                    <p className="text-sm text-slate-400">{f.desc}</p>
                  </div>
                </InteractiveCard>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto aspect-square w-full max-w-md">
          <div className="pointer-events-none absolute inset-[18%] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.16),rgba(139,92,246,0.1)_50%,transparent_70%)] blur-2xl" />
          <RadialVisualizer3D
            className="absolute inset-0"
            active={speaking}
          />
        </div>
      </div>
    </section>
  )
}
