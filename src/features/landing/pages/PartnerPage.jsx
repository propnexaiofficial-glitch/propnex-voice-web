import { useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import PageShell from '../components/PageShell'

gsap.registerPlugin(ScrollTrigger)

const sequenceCards = [
  {
    tag: 'Who',
    title: 'Who this is for',
    img: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=900&q=80',
    accent: 'from-cyan-500/40',
    points: [
      'Agencies offering voice AI under their brand',
      'Consultants expanding into AI outbound & support',
      'Telecom / software resellers adding voice agents',
    ],
  },
  {
    tag: 'White label',
    title: 'Full rebrand',
    img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=900&q=80',
    accent: 'from-violet-500/40',
    points: [
      'Custom domain',
      'Your logo & brand colors',
      'Agent names you control',
      'Client-facing dashboards',
      'Zero PropNex branding for end clients',
    ],
  },
  {
    tag: 'Reselling',
    title: 'Your pricing & margin',
    img: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80',
    accent: 'from-fuchsia-500/40',
    points: [
      'Multiple clients under one partner dashboard',
      'Set your own client-facing pricing',
      'Earn margin on every account',
    ],
  },
]

const partnerGets = [
  {
    title: 'Partner dashboard',
    desc: 'Dedicated hub for all client accounts',
    icon: 'grid',
  },
  {
    title: 'Tiered margins',
    desc: 'Commission structure that scales with you',
    icon: 'chart',
  },
  {
    title: 'White-labelled UX',
    desc: 'Fully branded client experience',
    icon: 'brand',
  },
  {
    title: 'Dedicated support',
    desc: 'Onboarding & support manager',
    icon: 'support',
  },
  {
    title: 'Sales collateral',
    desc: 'Marketing kits ready to resell with',
    icon: 'docs',
  },
]

const timeline = [
  {
    title: 'Apply',
    desc: 'Share your company details and goals.',
    icon: 'apply',
  },
  {
    title: 'Onboarding call',
    desc: 'Scope white-label and reselling needs together.',
    icon: 'call',
  },
  {
    title: 'Setup',
    desc: 'Account, branding, and domain go live.',
    icon: 'setup',
  },
  {
    title: 'Onboard clients',
    desc: 'Start selling under your own brand.',
    icon: 'launch',
  },
]

const emptyForm = {
  name: '',
  company: '',
  email: '',
  phone: '',
  clients: '',
  volume: '',
}

function StepIcon({ type }) {
  const c = 'h-4 w-4'
  if (type === 'apply') {
    return (
      <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-6-6z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path d="M14 3v6h6M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    )
  }
  if (type === 'call') {
    return (
      <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1.1-.2 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
      </svg>
    )
  }
  if (type === 'setup') {
    return (
      <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 15a3 3 0 100-6 3 3 0 000 6z"
          stroke="currentColor"
          strokeWidth="1.7"
        />
        <path
          d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9c0 .7.4 1.3 1 1.5H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
    )
  }
  if (type === 'launch') {
    return (
      <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M5 15c1.5 0 3.5-1 4.5-2L14 8l2 2-5 4.5C10 15.5 9 17.5 9 19l-2-1-1-2 1-1z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path
          d="M14.5 4.5L16 6l2.5 1.5L20 5l-1.5-2.5L16 4l-1.5.5z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    )
  }
  if (type === 'grid') {
    return (
      <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    )
  }
  if (type === 'chart') {
    return (
      <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-3"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  if (type === 'brand') {
    return (
      <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
      </svg>
    )
  }
  if (type === 'support') {
    return (
      <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M12 3a7 7 0 00-7 7v2a3 3 0 003 3h1v-5H7a5 5 0 0110 0h-2v5h1a3 3 0 003-3v-2a7 7 0 00-7-7z"
          stroke="currentColor"
          strokeWidth="1.6"
        />
        <path d="M9 18h6v1a2 2 0 01-2 2h-2a2 2 0 01-2-2v-1z" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    )
  }
  return (
    <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 4h8l2 3v13H6V7l2-3z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M9 11h6M9 15h4" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

export default function PartnerPage() {
  const ref = useRef(null)
  const [form, setForm] = useState(emptyForm)
  const [sent, setSent] = useState(false)

  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [globalError, setGlobalError] = useState('')

  useGSAP(
    () => {
      gsap.fromTo(
        '.partner-hero-anim',
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, stagger: 0.1, duration: 0.7, ease: 'power3.out' },
      )

      gsap.fromTo(
        '.seq-card',
        { opacity: 0, y: 40, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.14,
          duration: 0.65,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.seq-row', start: 'top 78%' },
        },
      )

      gsap.fromTo(
        '.get-card',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          duration: 0.55,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.gets-row', start: 'top 80%' },
        },
      )

      gsap.fromTo(
        '.tl-item',
        { opacity: 0, x: -24 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.15,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.tl-track', start: 'top 78%' },
        },
      )

      gsap.fromTo(
        '.tl-line',
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 1.1,
          ease: 'power2.out',
          transformOrigin: 'top',
          scrollTrigger: { trigger: '.tl-track', start: 'top 78%' },
        },
      )

      gsap.fromTo(
        '.partner-form',
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.partner-form', start: 'top 85%' },
        },
      )
    },
    { scope: ref },
  )

  const validateField = (name, value) => {
    if (!value.trim()) {
      return `${name.charAt(0).toUpperCase() + name.slice(1)} is required`
    }
    return ''
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()

    const newErrors = {
      name: validateField('name', form.name),
      company: validateField('company', form.company),
      email: validateField('email', form.email),
      phone: validateField('phone', form.phone),
      clients: validateField('clients', form.clients),
      volume: validateField('volume', form.volume),
    }

    setErrors(newErrors)

    if (Object.values(newErrors).some(err => err)) {
      return
    }

    setSubmitting(true)
    setGlobalError('')

    try {
      const res = await fetch(`/api/marketing/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formType: 'PARTNER_APP',
          ...form
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Could not submit your application.')
      }
      setSent(true)
    } catch (err) {
      setGlobalError(err.message || 'Server error. Please try again later.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell>
      <div ref={ref}>
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=2000&q=80"
              alt=""
              className="h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/80 to-black" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_30%,rgba(34,211,238,0.2),transparent_55%)]" />
          </div>
          <div className="relative mx-auto max-w-5xl px-5 py-14 md:px-8 md:py-20">
            <p className="partner-hero-anim text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300/90">
              Partners
            </p>
            <h1 className="partner-hero-anim mt-3 max-w-2xl text-3xl font-bold tracking-tight md:text-5xl">
              Become a Business Partner
              <span className="mt-1 block bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">
                Reselling & White Labelling
              </span>
            </h1>
            <p className="partner-hero-anim mt-4 max-w-xl text-sm leading-relaxed text-white/60 md:text-base">
              Resell PropNex under your own brand and earn recurring revenue —
              no need to build your own voice AI infrastructure.
            </p>
          </div>
        </section>

        {/* Image sequence cards */}
        <section className="relative mx-auto max-w-5xl px-5 pb-12 md:px-8 md:pb-16">
          <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
            Partner path
          </p>
          <div className="seq-row grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sequenceCards.map((card, i) => (
              <article
                key={card.title}
                className="seq-card group overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f14] transition duration-300 hover:-translate-y-1 hover:border-cyan-400/35 hover:shadow-[0_0_28px_rgba(34,211,238,0.12)]"
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={card.img}
                    alt=""
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${card.accent} via-black/40 to-black/80`}
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-black/50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-cyan-200 backdrop-blur-sm">
                    {String(i + 1).padStart(2, '0')} · {card.tag}
                  </span>
                </div>
                <div className="p-4">
                  <h2 className="text-[15px] font-semibold text-white">
                    {card.title}
                  </h2>
                  <ul className="mt-2.5 space-y-1.5">
                    {card.points.map((p) => (
                      <li
                        key={p}
                        className="flex gap-2 text-[12px] leading-snug text-white/60"
                      >
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-400" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* What partners get — compact icon cards */}
        <section className="relative mx-auto max-w-5xl px-5 pb-12 md:px-8 md:pb-16">
          <h2 className="text-xl font-bold text-white md:text-2xl">
            What partners get
          </h2>
          <div className="gets-row mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {partnerGets.map((g) => (
              <div
                key={g.title}
                className="get-card flex items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3.5 transition hover:border-violet-400/40 hover:bg-violet-500/10"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-400/30 bg-violet-500/15 text-violet-200">
                  <StepIcon type={g.icon} />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">{g.title}</p>
                  <p className="mt-0.5 text-[12px] text-white/50">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section className="relative mx-auto max-w-5xl px-5 pb-12 md:px-8 md:pb-16">
          <h2 className="text-xl font-bold text-white md:text-2xl">
            How it works
          </h2>
          <div className="tl-track relative mt-8 max-w-xl pl-2">
            <div className="tl-line absolute bottom-2 left-[19px] top-2 w-px origin-top bg-gradient-to-b from-cyan-400 via-violet-400 to-fuchsia-400/40" />

            <ol className="space-y-0">
              {timeline.map((step, i) => (
                <li key={step.title} className="tl-item relative flex gap-4 pb-8 last:pb-0">
                  <span className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cyan-400/40 bg-black text-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.25)]">
                    <StepIcon type={step.icon} />
                  </span>
                  <div className="pt-1.5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
                      Step {i + 1}
                    </p>
                    <h3 className="mt-0.5 text-[15px] font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm text-white/55">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Application form */}
        <section className="relative mx-auto max-w-5xl px-5 pb-16 md:px-8 md:pb-20">
          <div className="partner-form overflow-hidden rounded-2xl border border-white/10 bg-[#111116]">
            <div className="relative h-28 overflow-hidden md:h-32">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80"
                alt=""
                className="h-full w-full object-cover opacity-50"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#111116] via-black/50 to-transparent" />
              <div className="absolute bottom-4 left-5 md:left-6">
                <h2 className="text-lg font-semibold text-white md:text-xl">
                  Partner application
                </h2>
                <p className="text-xs text-white/50">
                  Tell us about your practice — we&apos;ll follow up shortly.
                </p>
              </div>
            </div>

            <div className="p-5 md:p-6">
              {sent ? (
                <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-4 text-sm text-emerald-200">
                  Thanks — we received your application. Our partner team will
                  reach out shortly.
                </p>
              ) : (
                <form
                  onSubmit={onSubmit}
                  className="grid gap-3 sm:grid-cols-2"
                >
                  {[
                    { name: 'name', label: 'Name', type: 'text' },
                    { name: 'company', label: 'Company', type: 'text' },
                    { name: 'email', label: 'Email', type: 'email' },
                    { name: 'phone', label: 'Phone', type: 'tel' },
                    {
                      name: 'clients',
                      label: 'Estimated clients to onboard',
                      type: 'text',
                    },
                    {
                      name: 'volume',
                      label: 'Monthly call volume estimate',
                      type: 'text',
                    },
                  ].map((field) => (
                    <label key={field.name} className="block">
                      <span className="mb-1 block text-[11px] text-white/45">
                        {field.label}
                      </span>
                      <input
                        name={field.name}
                        type={field.type}
                        required
                        value={form[field.name]}
                        onChange={onChange}
                        className={`w-full rounded-lg border bg-black/40 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400/50 ${errors[field.name] ? 'border-rose-500/50' : 'border-white/15'}`}
                      />
                      {errors[field.name] && <span className="mt-1 block text-[10px] text-rose-400">{errors[field.name]}</span>}
                    </label>
                  ))}

                  {globalError && (
                    <div className="sm:col-span-2">
                      <p className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">
                        {globalError}
                      </p>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="mt-1 w-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60 sm:w-auto sm:px-8"
                    >
                      {submitting ? 'Submitting...' : 'Submit application'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  )
}
