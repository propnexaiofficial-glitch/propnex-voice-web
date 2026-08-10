import { Suspense, lazy } from 'react'
import { Link } from '@/features/landing/lib/router'

const AuraOrb = lazy(() => import('./3d/AuraOrb'))

const steps = [
  {
    title: 'Upload job description',
    desc: 'Drop in the JD — PropNex extracts role requirements, skills, and must-haves.',
  },
  {
    title: 'Script + rubric generated',
    desc: 'AI builds a screening script and scoring rubric tailored to the role.',
  },
  {
    title: 'AI agent conducts screen',
    desc: 'Candidates talk to a natural voice agent — anytime, at scale, in parallel.',
  },
  {
    title: 'Recruiter gets results',
    desc: 'Transcript, recording, and fit score land in one dashboard for review.',
  },
]

const benefits = [
  'Parallel screening at scale',
  'Consistent / unbiased scoring',
  'Candidate flexibility (async voice)',
  'Full compliance records',
]

const useCases = [
  'High-volume hiring',
  'First-round technical screens',
  'Multilingual screening via voice cloning',
]

export default function AIInterview() {
  return (
    <section
      id="ai-interview"
      className="relative overflow-hidden py-20 md:py-28"
    >
      <div className="pointer-events-none absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=2000&q=80"
          alt=""
          className="h-full w-full object-cover opacity-[0.18]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_40%,rgba(168,85,247,0.2),transparent_50%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 md:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-300/90">
              AI Interview Services
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Screen candidates with{' '}
              <span className="gradient-text">voice AI</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/55 md:text-base">
              Upload a job description → PropNex generates script + rubric → AI
              agent conducts the screen → recruiter gets transcript, recording,
              and fit score.
            </p>

            <div className="mt-8 space-y-4">
              {steps.map((s, i) => (
                <div key={s.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/10 text-xs font-bold text-cyan-300">
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{s.title}</h3>
                    <p className="mt-1 text-sm text-white/50">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-300/80">
                  Benefits
                </p>
                <ul className="mt-3 space-y-2">
                  {benefits.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-2 text-sm text-white/70"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-fuchsia-300/80">
                  Use cases
                </p>
                <ul className="mt-3 space-y-2">
                  {useCases.map((u) => (
                    <li
                      key={u}
                      className="flex items-start gap-2 text-sm text-white/70"
                    >
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-fuchsia-400" />
                      {u}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <Link
              to="/features"
              className="btn-primary mt-8 inline-flex rounded-full px-6 py-3 text-sm"
            >
              Explore platform features
            </Link>
          </div>

          <div className="relative mx-auto h-[320px] w-full max-w-md md:h-[400px]">
            <div className="absolute inset-0 rounded-3xl border border-white/10 bg-gradient-to-b from-violet-500/10 to-cyan-500/5" />
            <Suspense fallback={null}>
              <AuraOrb className="h-full w-full" intensity={1.2} />
            </Suspense>
            <div className="pointer-events-none absolute inset-x-6 bottom-6 rounded-xl border border-white/10 bg-black/60 p-4 backdrop-blur-md">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/40">
                Fit score
              </p>
              <p className="mt-1 text-2xl font-bold text-cyan-300">92 / 100</p>
              <p className="mt-1 text-xs text-white/50">
                Transcript + recording ready for recruiter review
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
