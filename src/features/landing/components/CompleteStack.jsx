import { useRef } from 'react'
import { useStaggerReveal } from '../hooks/useReveal'
import IsometricStackDiagram from './IsometricStackDiagram'

const features = [
  {
    title: 'Inference gateway to access TTS, LLM, and STT models',
    icon: (
      <>
        <path d="M12 3l7 4v10l-7 4-7-4V7l7-4z" />
        <circle cx="12" cy="12" r="2" />
      </>
    ),
  },
  {
    title: 'Cloud platform for deploying and scaling agents',
    icon: <path d="M18 18H7a4 4 0 01-.5-8 5.5 5.5 0 0110.3-1.7A3.5 3.5 0 0118 18z" />,
  },
  {
    title: 'Phone numbers and SIP integrations for telephony',
    icon: (
      <path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.25c1.12.37 2.33.57 3.57.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1L6.6 10.8z" />
    ),
  },
  {
    title: 'Full-stack observability for every agent session',
    icon: (
      <>
        <path d="M4 19V10" />
        <path d="M10 19V5" />
        <path d="M16 19v-7" />
        <path d="M22 19V8" />
      </>
    ),
  },
]

export default function CompleteStack() {
  const ref = useRef(null)

  useStaggerReveal(ref, '.stack-copy-item', { stagger: 0.07 })

  return (
    <section id="stack" ref={ref} className="relative py-16 md:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 md:px-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] lg:gap-10 xl:gap-14">
        {/* Left — LiveKit-style clean column */}
        <div className="stack-copy relative z-10 max-w-md lg:max-w-none">
          <p className="stack-copy-item text-[11px] font-medium uppercase tracking-[0.2em] text-white/45">
            Developer platform
          </p>

          <h2 className="stack-copy-item mt-4 text-[34px] font-semibold leading-[1.15] tracking-[-0.02em] text-white md:text-[40px] lg:text-[44px]">
            The{' '}
            <span className="bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">
              complete
            </span>{' '}
            stack for Voice AI
          </h2>

          <ul className="stack-copy-item mt-10 space-y-5">
            {features.map((f) => (
              <li key={f.title} className="flex items-center gap-3.5">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center text-white/70">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {f.icon}
                  </svg>
                </span>
                <span className="text-[14px] leading-snug text-white/80 md:text-[15px]">
                  {f.title}
                </span>
              </li>
            ))}
          </ul>

          <a
            href="#pricing"
            className="stack-copy-item mt-10 inline-flex items-center rounded-md border border-white/20 bg-transparent px-4 py-2.5 text-[13px] font-medium text-white transition hover:border-white/40 hover:bg-white/[0.03]"
          >
            Explore the PropNex Cloud platform
          </a>
        </div>

        {/* Right — open diagram, always visible (no opacity trap) */}
        <div className="stack-visual relative min-w-0 lg:-mr-4 xl:-mr-8">
          <IsometricStackDiagram />
        </div>
      </div>
    </section>
  )
}
