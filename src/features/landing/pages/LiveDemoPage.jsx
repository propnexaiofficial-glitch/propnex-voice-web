import { Suspense, lazy, useState } from 'react'
import { Link } from '@/features/landing/lib/router'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import PageShell, { SectionCard } from '../components/PageShell'

const AuraOrb = lazy(() => import('../components/3d/AuraOrb'))

const API_BASE = import.meta.env.VITE_API_URL ?? ''
const DEMO_NUMBER = '+919889479110'
const DEMO_TEL = 'tel:+919889479110'

const emptyForm = {
  name: '',
  email: '',
  phone: '',
  company: '',
  industry: 'Real Estate',
  otherIndustry: '',
}

export default function LiveDemoPage() {
  const [step, setStep] = useState('form') // form | calling | done
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [leadId, setLeadId] = useState(null)

  const validateField = (name, value) => {
    let err = ''
    if (!value || !String(value).trim()) {
      if (name === 'name') err = 'Name is required'
      if (name === 'email') err = 'Email is required'
      if (name === 'phone') err = 'Phone is required'
      if (name === 'company') err = 'Company is required'
      if (name === 'otherIndustry' && form.industry === 'Other') err = 'Industry is required'
    } else if (name === 'phone' && !isValidPhoneNumber(String(value))) {
      err = 'Invalid phone number'
    }
    return err
  }

  const onChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
    const fieldErr = validateField(name, value)
    setErrors((prev) => ({ ...prev, [name]: fieldErr }))
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    
    // Validate all
    const newErrors = {
      name: validateField('name', form.name),
      email: validateField('email', form.email),
      phone: validateField('phone', form.phone),
      company: validateField('company', form.company),
      otherIndustry: validateField('otherIndustry', form.otherIndustry),
    }

    setErrors(newErrors)

    if (Object.values(newErrors).some(err => err)) {
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        formType: 'DEMO_CALL',
        name: form.name,
        email: form.email,
        phone: form.phone,
        company: form.company,
        industry: form.industry === 'Other' ? form.otherIndustry : form.industry
      }

      const res = await fetch(`/api/marketing/forms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'Could not save your request.')
      }
      setLeadId(data.id || null)
      setStep('calling')
      window.setTimeout(() => setStep('done'), 4500)
    } catch (err) {
      setErrors({ global: err.message || 'Server unavailable. Try again later.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <PageShell>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c] via-black to-[#050508]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(34,211,238,0.08),transparent_55%)]" />

        <div className="relative mx-auto max-w-3xl px-5 py-14 text-center md:px-8 md:py-20">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
            Live demo
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            Talk to a{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              PropNex AI Agent
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/55 md:text-base">
            Fill the form — we connect you to a live voice agent demo in under
            30 seconds.
          </p>
        </div>
      </section>

      <section className="relative mx-auto max-w-5xl px-5 pb-16 md:px-8 md:pb-20">
        {step === 'form' && (
          <div className="grid items-stretch gap-5 md:grid-cols-2">
            <SectionCard className="flex h-full flex-col overflow-hidden p-0">
              <div className="relative h-44 shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80"
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-black/40 to-black/20" />
                <p className="absolute bottom-3 left-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/90">
                  Instant Demo Connect
                </p>
              </div>
              <div className="flex flex-1 flex-col p-5 md:p-6">
                <h2 className="text-xl font-semibold text-white">Call us now</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  Directly talk with PropNex team and hear a live AI demo.
                </p>
                <div className="mt-auto pt-10">
                  <a
                    href={DEMO_TEL}
                    className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-black transition hover:brightness-110"
                  >
                    Call {DEMO_NUMBER}
                  </a>
                </div>
              </div>
            </SectionCard>

            <SectionCard className="flex h-full flex-col overflow-hidden p-0">
              <div className="relative h-44 shrink-0">
                <img
                  src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80"
                  alt=""
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#130f1b] via-black/45 to-black/20" />
                <p className="absolute bottom-3 left-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-fuchsia-200/90">
                  Book Callback
                </p>
              </div>
              <div className="flex flex-1 flex-col p-5 md:p-6">
                <h2 className="text-lg font-semibold text-white">
                  Fill form for demo call
                </h2>
                <p className="mt-1.5 text-sm text-white/50">
                  Submit details and we&apos;ll connect you quickly.
                </p>

                <form onSubmit={onSubmit} className="mt-5 flex flex-1 flex-col space-y-3.5">
                  {[
                    {
                      name: 'name',
                      label: 'Full name',
                      type: 'text',
                      placeholder: 'Rahul Sharma',
                    },
                    {
                      name: 'email',
                      label: 'Work email',
                      type: 'email',
                      placeholder: 'you@company.com',
                    },
                    {
                      name: 'phone',
                      label: 'Phone number',
                      type: 'tel',
                      placeholder: '+91 98XXX XXXXX',
                    },
                    {
                      name: 'company',
                      label: 'Company',
                      type: 'text',
                      placeholder: 'Your company',
                    },
                  ].map((field) => (
                    <label key={field.name} className="block">
                      <span className="mb-1.5 block text-xs font-medium text-white/45">
                        {field.label}
                      </span>
                      {field.name === 'phone' ? (
                        <PhoneInput
                          defaultCountry="IN"
                          value={form.phone}
                          onChange={(val) => {
                            setForm((f) => ({ ...f, phone: val || '' }))
                            setErrors((prev) => ({ ...prev, phone: validateField('phone', val || '') }))
                          }}
                          placeholder={field.placeholder}
                          className={`flex items-center w-full rounded-xl border bg-black/50 px-4 py-2.5 text-sm text-white outline-none transition focus-within:border-cyan-400/50 ${errors.phone ? 'border-rose-500/50' : 'border-white/15'}`}
                          numberInputProps={{ className: "bg-transparent outline-none w-full ml-2 text-white placeholder:text-white/30" }}
                        />
                      ) : (
                        <input
                          name={field.name}
                          type={field.type}
                          value={form[field.name]}
                          onChange={onChange}
                          placeholder={field.placeholder}
                          className={`w-full rounded-xl border bg-black/50 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50 ${errors[field.name] ? 'border-rose-500/50' : 'border-white/15'}`}
                        />
                      )}
                      {errors[field.name] && <span className="mt-1 block text-xs text-rose-400">{errors[field.name]}</span>}
                    </label>
                  ))}

                  <label className="block">
                    <span className="mb-1.5 block text-xs font-medium text-white/45">
                      Industry
                    </span>
                    <select
                      name="industry"
                      value={form.industry}
                      onChange={onChange}
                      className="w-full rounded-xl border border-white/15 bg-black/50 px-4 py-2.5 text-sm text-white outline-none focus:border-cyan-400/50"
                    >
                      {[
                        'Real Estate',
                        'Insurance',
                        'EdTech',
                        'FinTech',
                        'HealthTech',
                        'Other',
                      ].map((opt) => (
                        <option key={opt} value={opt} className="bg-black">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </label>

                  {form.industry === 'Other' && (
                    <label className="block">
                      <span className="mb-1.5 block text-xs font-medium text-white/45">
                        Write your own industry
                      </span>
                      <input
                        name="otherIndustry"
                        type="text"
                        value={form.otherIndustry}
                        onChange={onChange}
                        placeholder="Your industry"
                        className={`w-full rounded-xl border bg-black/50 px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-400/50 ${errors.otherIndustry ? 'border-rose-500/50' : 'border-white/15'}`}
                      />
                      {errors.otherIndustry && <span className="mt-1 block text-xs text-rose-400">{errors.otherIndustry}</span>}
                    </label>
                  )}

                  {errors.global ? (
                    <p className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-200">
                      {errors.global}
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="mt-auto w-full rounded-full bg-gradient-to-r from-violet-400 to-fuchsia-400 px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-60"
                  >
                    {submitting ? 'Submitting…' : 'Continue to call'}
                  </button>
                </form>
              </div>
            </SectionCard>
          </div>
        )}

        {step === 'calling' && (
          <SectionCard className="overflow-hidden p-0">
            <div className="relative flex min-h-[420px] flex-col items-center justify-center bg-gradient-to-b from-[#0c1418] to-black px-6 py-12 text-center">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,0.18),transparent_55%)]" />
              <div className="relative h-28 w-28 md:h-32 md:w-32">
                <Suspense fallback={null}>
                  <AuraOrb className="h-full w-full" intensity={1.3} />
                </Suspense>
              </div>
              <p className="relative mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">
                Connecting
              </p>
              <h2 className="relative mt-3 text-2xl font-bold text-white">
                Calling {form.name.split(' ')[0]}…
              </h2>
              <p className="relative mt-2 max-w-sm text-sm text-white/55">
                A PropNex AI agent is dialing{' '}
                <span className="font-semibold text-white/80">{form.phone}</span>
                . Please keep your phone ready.
              </p>
            <a
              href={DEMO_TEL}
              className="relative mt-5 inline-flex items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-400/10 px-4 py-2 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-300/20"
            >
              Or call directly: {DEMO_NUMBER}
            </a>
              <div className="relative mt-8 flex items-end justify-center gap-1.5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <span
                    key={i}
                    className="w-1.5 rounded-full bg-cyan-400/80"
                    style={{
                      height: `${12 + (i % 5) * 8}px`,
                      animation: `heroBar ${0.5 + (i % 4) * 0.1}s ease-in-out ${i * 0.05}s infinite alternate`,
                    }}
                  />
                ))}
              </div>
            </div>
          </SectionCard>
        )}

        {step === 'done' && (
          <SectionCard className="p-6 text-center md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Demo queued
            </p>
            <h2 className="mt-3 text-2xl font-bold text-white">
              You&apos;re all set
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/55">
              We saved your details and will call{' '}
              <span className="font-semibold text-white/80">{form.phone}</span>{' '}
              shortly.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setForm(emptyForm)
                  setLeadId(null)
                  setStep('form')
                }}
                className="rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/40"
              >
                Submit another
              </button>
              <Link
                to="/pricing"
                className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-300"
              >
                View pricing
              </Link>
            </div>
          </SectionCard>
        )}
      </section>
    </PageShell>
  )
}
