import { useState } from 'react'
import { Link } from '@/features/landing/lib/router'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PricingPlansGrid from '../components/pricing/PricingPlansGrid'
import { TANISHQ_SALES_TEL, TANISHQ_SALES_DISPLAY } from '../data/pricingPlans'

const trusted = [
  { label: 'REAL ESTATE', icon: 'skyline' },
  { label: 'EDTECH', icon: 'people' },
  { label: 'FINTECH', icon: 'home' },
  { label: 'HEALTHTECH', icon: 'link' },
]

const faqs = [
  {
    q: 'How is per-minute pricing calculated?',
    a: 'Pay-as-you-go is ₹4 per minute (Prepaid). Volume Plan is ₹3.5 per minute. Enterprise pricing is custom — talk to sales on ' +
      TANISHQ_SALES_DISPLAY +
      '.',
  },
  {
    q: 'Is there a setup fee?',
    a: 'Yes. Every plan includes a one-time setup fee of ₹24,999.',
  },
  {
    q: 'Is white labelling available?',
    a: 'White Labelling is available On Demand across all plans. Talk to sales for agency and partner branding.',
  },
  {
    q: 'How does pay-as-you-go / prepaid work?',
    a: 'You preload credits and are charged ₹4 per minute. Top up anytime — no monthly commitment.',
  },
  {
    q: 'How do I get Enterprise pricing?',
    a: 'Call or WhatsApp sales at ' +
      TANISHQ_SALES_DISPLAY +
      ' and we will tailor a plan for your volume.',
  },
]

function TrustIcon({ type }) {
  const c = 'h-6 w-6 text-violet-300/90'
  if (type === 'skyline') {
    return (
      <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 20h18M5 20V10h4v10M9 20V6h5v14M14 20v-7h5v7"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  if (type === 'people') {
    return (
      <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M9 11a3 3 0 100-6 3 3 0 000 6zM16.5 12a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM3.5 19c.8-2.4 2.8-3.5 5.5-3.5s4.7 1.1 5.5 3.5M14 15.5c1.6 0 3 .5 3.8 1.8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  if (type === 'home') {
    return (
      <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 11l8-7 8 7v9H4v-9z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path d="M10 20v-6h4v6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  }
  return (
    <svg className={c} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState(0)
  const [selectedPlan, setSelectedPlan] = useState('volume')

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white">
      <Navbar />

      <main className="relative overflow-hidden pt-24 md:pt-28">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.16),transparent_70%)] blur-2xl" />
          <div className="absolute -right-20 top-40 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(232,121,249,0.16),transparent_70%)] blur-3xl" />
        </div>

        <section className="relative mx-auto max-w-5xl px-5 pb-16 md:px-8 md:pb-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-fuchsia-300/90">
              Pricing
            </p>
            <h1 className="mt-4 text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-[56px] lg:leading-[1.08]">
              Only pay for what you use.
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-white/55 md:text-base">
              Transparent prepaid pricing for Real Estate, EdTech, FinTech,
              HealthTech & more — plus On Demand white labelling.
            </p>
          </div>

          <div className="mt-10 md:mt-12">
            <PricingPlansGrid
              interactive
              selectedPlan={selectedPlan}
              onSelectPlan={setSelectedPlan}
            />
          </div>
        </section>

        <section className="relative mx-auto max-w-6xl px-5 pb-16 md:px-8 md:pb-20">
          <div className="rounded-[28px] border border-white/10 bg-[#111116] px-6 py-10 md:px-12 md:py-12">
            <p className="mx-auto max-w-3xl text-center text-[15px] leading-relaxed text-white/60 md:text-base">
              Trusted across Real Estate, EdTech, FinTech, and HealthTech teams
              in India and Dubai to power AI voice agents for lead
              qualification, follow-ups, and appointment booking.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {trusted.map((t) => (
                <div
                  key={t.label}
                  className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-6"
                >
                  <TrustIcon type={t.icon} />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70">
                    {t.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-6xl px-5 pb-12 md:px-8 md:pb-16">
          <div className="rounded-[28px] border border-white/10 bg-[#111116] px-5 py-10 md:px-10 md:py-12">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-violet-300/90">
                FAQ
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl">
                Frequently asked questions
              </h2>
            </div>

            <div className="mx-auto mt-10 max-w-3xl divide-y divide-white/10 border-t border-white/10">
              {faqs.map((item, i) => {
                const open = openFaq === i
                return (
                  <div key={item.q} className="py-1">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 py-5 text-left"
                      onClick={() => setOpenFaq(open ? -1 : i)}
                      aria-expanded={open}
                    >
                      <span className="text-[15px] font-semibold text-white md:text-base">
                        {item.q}
                      </span>
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-lg leading-none text-white/70 transition ${
                          open
                            ? 'rotate-45 border-violet-400/40 bg-violet-500/15 text-violet-200'
                            : ''
                        }`}
                      >
                        +
                      </span>
                    </button>
                    <div
                      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="pb-5 pr-12 text-sm leading-relaxed text-white/50">
                          {item.a}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-6xl px-5 pb-10 md:px-8 md:pb-12">
          <div className="rounded-[28px] border border-white/10 bg-[#111116] px-6 py-12 text-center md:px-10 md:py-14">
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              Still have questions?
            </h2>
            <a
              href={TANISHQ_SALES_TEL}
              className="mt-8 inline-flex rounded-full bg-violet-300 px-7 py-3 text-sm font-semibold text-black transition hover:bg-violet-200 active:scale-[0.98]"
            >
              Talk to sales · {TANISHQ_SALES_DISPLAY}
            </a>
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-center text-sm leading-relaxed text-white/40">
            Pay-as-you-go: ₹4/min Prepaid · Volume: ₹3.5/min · Setup: ₹24,999
            one-time · White Labelling: On Demand
          </p>
          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-sm font-medium text-violet-300/90 transition hover:text-violet-200"
            >
              Back to home
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
