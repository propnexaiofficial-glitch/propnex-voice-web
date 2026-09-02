import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import WaveRingVisualizer from './3d/WaveRingVisualizer'
import { useSimulatedSpeaking } from './3d/Visualizers'
import InteractiveCard from './InteractiveCard'
import { useStaggerReveal } from '../hooks/useReveal'

const codeTabs = [
  {
    id: 'py',
    label: 'agent.py',
    code: `from propnexai import Agent

agent = Agent.import_("propnex-voice")
agent.connect(realtime=True)
agent.speak("Namaste, how can I help?")`,
  },
  {
    id: 'tsx',
    label: 'agent.tsx',
    code: `import { PropnexAI } from "@propnexai/agent"

export function VoiceAgent() {
  const agent = PropnexAI.import("propnex-voice")
  return <agent.Preview />
}`,
  },
]

const cards = [
  {
    title: 'Voice AI quickstart',
    desc: 'Build a simple voice agent with Python or Node.js in less than 10 minutes.',
    icon: (
      <path d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" />
    ),
  },
  {
    title: 'Voice agent starter apps',
    desc: 'Bring your agent to life through a web or mobile app.',
    icon: (
      <path d="M4 6h16v12H4zM8 18h8" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinejoin="round" />
    ),
  },
  {
    title: 'Integrate with telephony',
    desc: 'Enable your voice agent to make or take phone calls.',
    icon: (
      <path d="M6.6 10.8a15 15 0 006.6 6.6l2.2-2.2a1 1 0 011-.25c1.1.37 2.3.57 3.5.57a1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.2.2 2.4.57 3.5a1 1 0 01-.25 1L6.6 10.8z" stroke="currentColor" strokeWidth="1.6" fill="none" />
    ),
  },
  {
    title: 'Deploy to PropNex Cloud',
    desc: 'Run your agents on global realtime infrastructure.',
    icon: (
      <>
        <path d="M18 18H7a4 4 0 01-.5-8 5.5 5.5 0 0110.3-1.7A3.5 3.5 0 0118 18z" stroke="currentColor" strokeWidth="1.6" fill="none" />
        <path d="M12 11v4M10 13h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
]

function highlightLine(line) {
  return line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/(".*?")/g, "<span class='text-emerald-300'>$1</span>")
    .replace(
      /\b(from|import|export|function|return|const|Agent|PropnexAI|agent|connect|speak|Preview|realtime)\b/g,
      "<span class='text-violet-300'>$1</span>",
    )
    .replace(/(@propnexai\/agent|propnexai)/g, "<span class='text-cyan-300'>$1</span>")
}

function TypewriterCode({ code, active }) {
  const [shown, setShown] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!active) {
      setShown('')
      setDone(false)
      return
    }

    setShown('')
    setDone(false)
    let i = 0
    let timer
    let cancelled = false

    const tick = () => {
      if (cancelled) return
      // 1–3 chars for a natural typing rhythm
      const step = Math.random() > 0.7 ? 3 : Math.random() > 0.4 ? 2 : 1
      i = Math.min(i + step, code.length)
      setShown(code.slice(0, i))

      if (i >= code.length) {
        setDone(true)
        return
      }

      const ch = code[i - 1]
      const delay = ch === '\n' ? 120 : ch === ' ' ? 28 : 16 + Math.random() * 22
      timer = setTimeout(tick, delay)
    }

    timer = setTimeout(tick, 280)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [code, active])

  const lines = shown.length ? shown.split('\n') : ['']

  return (
    <pre className="overflow-hidden p-5 font-mono text-[12px] leading-6 text-white/80 [scrollbar-width:none] md:min-h-[280px] md:p-6 md:text-[12.5px] md:leading-7 [&::-webkit-scrollbar]:hidden">
      <code className="block overflow-hidden whitespace-pre-wrap break-words">
        {lines.map((line, i) => (
          <div key={i} className="flex gap-3">
            <span className="w-4 shrink-0 select-none text-right text-white/20">
              {i + 1}
            </span>
            <span
              className="min-w-0 flex-1"
              dangerouslySetInnerHTML={{
                __html:
                  (highlightLine(line) || '&nbsp;') +
                  (i === lines.length - 1 && !done
                    ? '<span class="ml-0.5 inline-block h-[1em] w-[7px] animate-pulse bg-cyan-300/90 align-middle"></span>'
                    : ''),
              }}
            />
          </div>
        ))}
      </code>
    </pre>
  )
}

export default function AgentPlayground() {
  const ref = useRef(null)
  const [tab, setTab] = useState('py')
  const inView = useInView(ref, { once: true, amount: 0.3 })
  const speaking = useSimulatedSpeaking(3200)
  const active = codeTabs.find((t) => t.id === tab) || codeTabs[0]

  useStaggerReveal(ref, '.build-reveal', { stagger: 0.1 })

  return (
    <section ref={ref} className="relative py-16 md:py-28">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="build-reveal mb-9 text-center">
          <h2 className="text-[30px] font-semibold tracking-[-0.03em] text-white md:text-[36px]">
            Quickly <span className="text-cyan-400">build</span> voice agents
          </h2>
        </div>

        <div className="build-reveal overflow-hidden rounded-2xl border border-white/10 bg-[#07070a] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          <div className="grid md:grid-cols-2">
            {/* Code panel */}
            <div className="min-w-0 overflow-hidden border-b border-white/10 md:border-b-0 md:border-r">
              <div className="flex items-center gap-1 border-b border-white/10 px-3 pt-2.5">
                {codeTabs.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTab(t.id)}
                    className={`rounded-t-md px-3 py-2 font-mono text-[11px] transition ${
                      tab === t.id
                        ? 'bg-white/[0.06] text-white'
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <TypewriterCode key={tab} code={active.code} active={inView} />
            </div>

            {/* Compact elegant 3D preview */}
            <div className="relative flex min-h-[240px] items-center justify-center overflow-hidden md:min-h-[280px]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.06),transparent_65%)]" />
              <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400/80 shadow-[0_0_8px_#22d3ee]" />
                <span className="text-[11px] font-medium tracking-wide text-white/40">
                  Preview
                </span>
              </div>
              <div className="relative h-[160px] w-[160px] md:h-[180px] md:w-[180px]">
                <WaveRingVisualizer
                  className="h-full w-full"
                  active={speaking}
                  compact
                />
              </div>
            </div>
          </div>
        </div>

        <div className="build-reveal mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <InteractiveCard
              key={c.title}
              className="p-4 !rounded-xl"
            >
              <div className="mb-3 flex h-7 w-7 items-center justify-center text-cyan-300">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  {c.icon}
                </svg>
              </div>
              <h3 className="text-[13px] font-semibold text-white">{c.title}</h3>
              <p className="mt-1.5 text-[11.5px] leading-relaxed text-white/45">
                {c.desc}
              </p>
            </InteractiveCard>
          ))}
        </div>
      </div>
    </section>
  )
}
