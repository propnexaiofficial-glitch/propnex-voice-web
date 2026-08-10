import { useRef, useEffect } from 'react'
import { Link } from '@/features/landing/lib/router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import InteractiveCard from '../components/InteractiveCard'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    id: 'multi-campaign',
    title: 'Multi-Campaign Management',
    desc: 'Run unlimited campaigns side by side, each with its own script and goals.',
    tag: 'Scale',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80',
    accent: 'from-cyan-500/40 to-blue-600/20',
  },
  {
    id: 'lead-reactivation',
    title: 'Lead Reactivation',
    desc: 'Re-engage cold/dormant leads with natural conversation, hand qualified leads to sales.',
    tag: 'Recovery',
    img: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1600&q=80',
    accent: 'from-violet-500/40 to-fuchsia-600/20',
  },
  {
    id: 'call-analytics',
    title: 'Real-Time Call Analytics',
    desc: 'Live transcription, scoring, sentiment, and conversion tracking on one dashboard.',
    tag: 'Insight',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80',
    accent: 'from-blue-500/40 to-cyan-500/20',
  },
  {
    id: 'orchestration',
    title: 'Multi-Level Orchestration with Sub-Agents',
    desc: 'Specialized agents hand off calls to each other based on caller intent.',
    tag: 'Agents',
    img: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80',
    accent: 'from-fuchsia-500/40 to-violet-600/20',
  },
  {
    id: 'missed-calls',
    title: 'No Call Ever Forgotten',
    desc: 'Every missed call is logged and queued for callback automatically.',
    tag: 'Reliability',
    img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=80',
    accent: 'from-cyan-400/40 to-teal-600/20',
  },
  {
    id: 'voice-cloning',
    title: 'Voice Cloning',
    desc: 'Brand-matched voice — clone a spokesperson or choose from a voice library.',
    tag: 'Voice',
    img: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=1600&q=80',
    accent: 'from-violet-400/40 to-indigo-600/20',
  },
  {
    id: 'white-labelling',
    title: 'White Labelling',
    desc: 'Agencies deploy under their own brand, domain, and logo — On Demand.',
    tag: 'Agency',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80',
    accent: 'from-sky-500/40 to-blue-700/20',
  },
  {
    id: 'privacy',
    title: '100% Data Privacy & Compliance',
    desc: 'End-to-end encryption with full control over retention and access.',
    tag: 'Trust',
    img: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=1600&q=80',
    accent: 'from-emerald-500/30 to-cyan-600/20',
  },
]

export default function FeaturesPage() {
  const ref = useRef(null)

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash) {
      requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' })
      })
    } else {
      window.scrollTo(0, 0)
    }
  }, [])

  useGSAP(
    () => {
      gsap.fromTo(
        '.feat-hero > *',
        { opacity: 0, y: 28 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.12,
          duration: 0.85,
          ease: 'power3.out',
        },
      )

      gsap.fromTo(
        '.feat-card',
        { opacity: 0, y: 48, rotateX: 8 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.feat-grid', start: 'top 82%' },
        },
      )

      gsap.utils.toArray('.feat-detail').forEach((el) => {
        gsap.fromTo(
          el.querySelectorAll('.feat-detail-anim'),
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            stagger: 0.12,
            duration: 0.75,
            ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 78%' },
          },
        )
      })

      gsap.utils.toArray('.feat-ken').forEach((img, i) => {
        gsap.to(img, {
          scale: 1.1,
          x: i % 2 === 0 ? '2%' : '-2%',
          duration: 16 + i,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        })
      })
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className="min-h-screen bg-black text-white">
      <Navbar />

      <main>
        <section className="relative min-h-screen overflow-hidden pt-20">
          <div className="absolute inset-0 bg-black">
            <img
              src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=2000&q=80"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_45%,rgba(34,211,238,0.14),transparent_50%)]" />
          </div>

          <div className="feat-hero relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col justify-end px-5 pb-16 md:px-8 md:pb-24">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
              Platform features
            </p>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl lg:text-[68px]">
              PropNex<span className="text-cyan-400">AI</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/70 md:text-lg">
              Everything your voice agents need — campaigns, orchestration,
              analytics, and compliance — in one cinematic command surface.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#feature-grid"
                className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-black shadow-[0_0_28px_rgba(34,211,238,0.3)] transition hover:bg-cyan-300"
              >
                Explore features
              </a>
              <Link
                to="/pricing"
                className="rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/5"
              >
                View pricing
              </Link>
            </div>
          </div>
        </section>

        <section
          id="feature-grid"
          className="section-edge relative py-16 md:py-24"
        >
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(168,85,247,0.07),transparent_50%)]" />
          <div className="relative mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 max-w-2xl md:mb-14">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
                Capability stack
              </p>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Eight layers.{' '}
                <span className="gradient-text">One voice platform.</span>
              </h2>
            </div>

            <div className="feat-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-4 [perspective:1200px]">
              {features.map((f) => (
                <a key={f.id} href={`#${f.id}`} className="block">
                  <InteractiveCard className="feat-card group relative h-[320px] !overflow-hidden !rounded-2xl p-0">
                    <img
                      src={f.img}
                      alt={f.title}
                      className="feat-ken absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-40 mix-blend-screen transition group-hover:opacity-70`}
                    />

                    <div className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-black/35 backdrop-blur-md">
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <span className="mb-2 inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
                        {f.tag}
                      </span>
                      <h3 className="text-lg font-semibold leading-snug text-white">
                        {f.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm text-white/55">
                        {f.desc}
                      </p>
                    </div>

                    <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10" />
                    <div className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 skew-x-12 bg-gradient-to-r from-transparent via-white/12 to-transparent opacity-0 transition duration-700 group-hover:left-[120%] group-hover:opacity-100" />
                  </InteractiveCard>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="relative pb-8 md:pb-16">
          <div className="mx-auto max-w-7xl space-y-20 px-5 md:space-y-28 md:px-8">
            {features.map((f, i) => {
              const reverse = i % 2 === 1
              return (
                <article
                  key={f.id}
                  id={f.id}
                  className="feat-detail scroll-mt-24"
                >
                  <div
                    className={`grid items-center gap-10 md:grid-cols-2 md:gap-14 ${
                      reverse ? 'md:[&>*:first-child]:order-2' : ''
                    }`}
                  >
                    <InteractiveCard className="feat-detail-anim relative aspect-[4/3] !overflow-hidden !rounded-2xl p-0 md:aspect-[5/4]">
                      <img
                        src={f.img}
                        alt={f.title}
                        className="feat-ken absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-transparent to-black/30" />
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${f.accent} opacity-30`}
                      />
                      <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/15" />
                      <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70 backdrop-blur-md">
                        {f.tag}
                      </span>
                    </InteractiveCard>

                    <div className="feat-detail-anim">
                      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-400/80">
                        0{i + 1} — {f.tag}
                      </p>
                      <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                        {f.title}
                      </h2>
                      <p className="mt-4 text-base leading-relaxed text-slate-400 md:text-lg">
                        {f.desc}
                      </p>
                      <ul className="mt-8 space-y-3">
                        {[
                          'Production-ready orchestration',
                          'Realtime visibility for every call',
                          'Designed for agencies & sales teams',
                        ].map((point) => (
                          <li
                            key={point}
                            className="flex items-start gap-3 text-sm text-white/70"
                          >
                            <span className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-300 ring-1 ring-cyan-400/30">
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="3"
                              >
                                <path
                                  d="M5 12l5 5L20 7"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="section-edge relative overflow-hidden py-20 md:py-28">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1639322537504-6427a16b0a28?auto=format&fit=crop&w=1800&q=80"
              alt=""
              className="h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-black/70" />
          </div>
          <div className="relative mx-auto max-w-3xl px-5 text-center md:px-8">
            <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
              Ready to put every feature{' '}
              <span className="gradient-text">to work?</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-slate-400">
              Launch voice agents that never miss a call, never forget a lead,
              and always sound like your brand.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/auth/sign-up"
                className="rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-black shadow-[0_0_28px_rgba(34,211,238,0.3)] transition hover:bg-cyan-300"
              >
                Get started
              </Link>
              <Link
                to="/"
                className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/5"
              >
                Back to home
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
