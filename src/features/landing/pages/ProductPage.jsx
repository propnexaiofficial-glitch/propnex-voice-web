"use client";

import { useRef, useEffect } from 'react'
import { Link } from '@/features/landing/lib/router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import InteractiveCard from '../components/InteractiveCard'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

gsap.registerPlugin(ScrollTrigger)

const products = [
  {
    id: 'ai-voice',
    title: 'AI Voice & Conversational AI',
    features: [
      'Inbound voice AI',
      'Outbound voice AI',
      'AI customer support',
      'AI follow Up agent',
      'Appointment booking agent',
      'AI receptionist',
      'Multi-lingual Voice AI',
      'Voice Cloning',
      'Human to AI, AI to Human Call Transfer',
      'AI Call analytics & Quality Monitoring',
      'Lead Reactivation',
      'White labelling',
      'APIs'
    ],
    tag: 'Voice',
    img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1600&q=80',
    accent: 'from-cyan-500/40 to-blue-600/20',
  },
  {
    id: 'ai-chatbot',
    title: 'AI Chatbot',
    features: [
      'Intelligent conversational agents',
      'Instant customer interactions',
      'Web and mobile integration'
    ],
    tag: 'Chat',
    img: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?auto=format&fit=crop&w=1600&q=80',
    accent: 'from-violet-500/40 to-fuchsia-600/20',
  },
  {
    id: 'ai-crm',
    title: 'AI Powered CRMs',
    features: [
      'Lead Management',
      'Automated lead assignment',
      'AI lead scoring',
      'AI follow up management',
      'Sales pipeline management',
      'Customer analytics',
      'AI sales assistant'
    ],
    tag: 'Sales',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80',
    accent: 'from-blue-500/40 to-cyan-500/20',
  },
  {
    id: 'bpa',
    title: 'Business Process Automation',
    features: [
      'Workflow automation',
      'Document processing automation',
      'Approval workflows',
      'AI powered business operations'
    ],
    tag: 'Ops',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80',
    accent: 'from-fuchsia-500/40 to-violet-600/20',
  },
  {
    id: 'custom-dev',
    title: 'Custom AI Software Development',
    features: [
      'Custom AI applications',
      'Enterprise AI platforms',
      'SaaS products',
      'AI dashboards',
      'Custom CRM development',
      'Custom ERP solutions',
      'Customer Portals',
      'Admin & operations Platform',
      'AI powered web & mobile applications'
    ],
    tag: 'Dev',
    img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1600&q=80',
    accent: 'from-cyan-400/40 to-teal-600/20',
  },
  {
    id: 'gen-ai',
    title: 'Generative AI Solutions',
    features: [
      'Custom generative models',
      'Content and code generation',
      'Tailored AI insights'
    ],
    tag: 'GenAI',
    img: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1600&q=80',
    accent: 'from-violet-400/40 to-indigo-600/20',
  },
  {
    id: 'ai-agents',
    title: 'AI Agents & Agentic Automation',
    features: [
      'AI sales, support, research, HR',
      'Finance, marketing, data, recruitment',
      'Workflows',
      'Multi-agent AI systems',
      'Autonomous AI agents'
    ],
    tag: 'Agents',
    img: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=1600&q=80',
    accent: 'from-emerald-500/30 to-cyan-600/20',
  }
]

const industries = [
  'Banking', 'Financial Services', 'Insurance', 'Healthcare', 'Retail',
  'Manufacturing', 'Automotive', 'Telecom', 'Media', 'Logistics',
  'Travel & Hospitality', 'Education', 'Public Sector'
]

export default function ProductPage() {
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
        '.prod-hero > *',
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
        '.prod-card',
        { opacity: 0, y: 48, rotateX: 8 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          stagger: 0.1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.prod-grid', start: 'top 82%' },
        },
      )

      gsap.utils.toArray('.prod-detail').forEach((el) => {
        gsap.fromTo(
          el.querySelectorAll('.prod-detail-anim'),
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
      
      gsap.fromTo(
        '.ind-badge',
        { opacity: 0, scale: 0.8 },
        {
          opacity: 1,
          scale: 1,
          stagger: 0.05,
          duration: 0.5,
          ease: 'back.out(1.5)',
          scrollTrigger: { trigger: '.ind-grid', start: 'top 85%' },
        },
      )

      gsap.utils.toArray('.prod-ken').forEach((img, i) => {
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
              src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80"
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-50 mix-blend-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-[#010915]/50 to-black" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/30 to-transparent" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_45%,rgba(34,211,238,0.25),transparent_70%)]" />
          </div>

          <div className="prod-hero relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-7xl flex-col justify-end px-5 pb-16 md:px-8 md:pb-24">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
              Technology Products & Services
            </p>
            <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl lg:text-[68px]">
              The Full <span className="text-cyan-400">Spectrum</span> of AI Automation
            </h1>
            <p className="mt-4 max-w-2xl text-base text-white/70 md:text-lg">
              From ultra-responsive voice agents and intelligent chatbots to fully custom AI-powered CRMs and agentic workflows. We build the future of business operations.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#products-grid"
                className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-black shadow-[0_0_28px_rgba(34,211,238,0.3)] transition hover:bg-cyan-300"
              >
                Explore products
              </a>
              <Link
                to="/live-demo"
                className="rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/5"
              >
                Book a demo
              </Link>
            </div>
          </div>
        </section>

        <section id="products-grid" className="section-edge relative py-16 md:py-24">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(34,211,238,0.07),transparent_50%)]" />
          <div className="relative mx-auto max-w-7xl px-5 md:px-8">
            <div className="mb-10 max-w-2xl md:mb-14">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
                Core Offerings
              </p>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                PropNex AI <span className="gradient-text">Products & Services</span>
              </h2>
            </div>

            <div className="prod-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3 [perspective:1200px]">
              {products.map((p, index) => (
                <a key={p.id} href={`#${p.id}`} className={`block ${index === 6 ? 'lg:col-span-3 sm:col-span-2' : ''}`}>
                  <InteractiveCard className="prod-card group relative min-h-[480px] h-full !overflow-hidden !rounded-2xl p-0">
                    <img
                      src={p.img}
                      alt={p.title}
                      className="prod-ken absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/30" />
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${p.accent} opacity-40 mix-blend-screen transition group-hover:opacity-70`}
                    />

                    <div className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-black/35 backdrop-blur-md">
                      <span className="h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-6">
                      <span className="mb-2 inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
                        0{index + 1} — {p.tag}
                      </span>
                      <h3 className="text-xl font-semibold leading-snug text-white">
                        {p.title}
                      </h3>
                      <ul className="mt-4 space-y-1.5">
                        {p.features.map(f => (
                          <li key={f} className="flex items-start text-[13px] text-white/70">
                            <span className="mr-2 mt-[3px] text-cyan-400 text-[10px]">▹</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10" />
                    <div className="pointer-events-none absolute -left-1/2 top-0 h-full w-1/2 skew-x-12 bg-gradient-to-r from-transparent via-white/12 to-transparent opacity-0 transition duration-700 group-hover:left-[120%] group-hover:opacity-100" />
                  </InteractiveCard>
                </a>
              ))}
            </div>
          </div>
        </section>
        
        <section className="section-edge relative overflow-hidden py-16 md:py-24 border-y border-white/10">
            <div className="absolute inset-0 bg-white/[0.02]" />
            <div className="relative mx-auto max-w-7xl px-5 md:px-8">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="prod-detail-anim">
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300/70">
                            Specialized Automation
                        </p>
                        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl mb-6">
                            Finance & Accounting
                        </h2>
                        <ul className="space-y-4">
                        {[
                          'Accounts Payable Automation',
                          'Accounts Receivable Automation',
                          'Financial Operations',
                          'Accounting Processes',
                        ].map((point) => (
                          <li
                            key={point}
                            className="flex items-center gap-4 text-base text-white/80"
                          >
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300 ring-1 ring-cyan-400/20">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <path d="M5 12l5 5L20 7" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </span>
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="prod-detail-anim relative aspect-[4/3] rounded-2xl overflow-hidden ring-1 ring-white/10">
                        <img src="https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1200&q=80" alt="Finance" className="object-cover w-full h-full opacity-60" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                    </div>
                </div>
            </div>
        </section>

        <section className="relative py-20 md:py-32">
          <div className="mx-auto max-w-7xl px-5 md:px-8 text-center">
             <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
                Global Reach
              </p>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl mb-12">
                Industries We <span className="gradient-text">Empower</span>
              </h2>
              
              <div className="ind-grid flex flex-wrap justify-center gap-3 max-w-5xl mx-auto">
                  {industries.map(ind => (
                      <div key={ind} className="ind-badge px-5 py-3 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm text-sm text-white/80 transition-colors hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-300">
                          {ind}
                      </div>
                  ))}
              </div>
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
              Transform your enterprise{' '}
              <span className="gradient-text">with PropNex AI.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-slate-400">
              Deploy intelligent voice agents, build custom CRM software, and automate your entire financial operations today.
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
