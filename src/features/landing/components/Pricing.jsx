import { useRef } from 'react'
import { Link } from '@/features/landing/lib/router'
import { useHeadReveal, useStaggerReveal } from '../hooks/useReveal'
import PricingPlansGrid from './pricing/PricingPlansGrid'

export default function Pricing() {
  const ref = useRef(null)
  useHeadReveal(ref)
  useStaggerReveal(ref, '.price-card', { stagger: 0.12 })

  return (
    <section id="pricing" ref={ref} className="section-edge relative py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <div className="reveal-head mb-12 text-center md:mb-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-fuchsia-300/90">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            Only pay for what you use.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm text-white/55 md:text-base">
            Simple, transparent, usage-based pricing for calls and flexible
            enterprise plans.
          </p>
        </div>

        <div className="price-card">
          <PricingPlansGrid linkCtaToSignUp />
        </div>

        <p className="mt-8 text-center text-sm text-white/40">
          Pay-as-you-go: ₹4/min Prepaid · Volume: ₹3.5/min · Setup: ₹24,999
          one-time · White Labelling: On Demand
        </p>
        <div className="mt-4 text-center">
          <Link
            to="/pricing"
            className="text-sm font-medium text-violet-300/90 transition hover:text-violet-200"
          >
            View full pricing & calculator →
          </Link>
        </div>
      </div>
    </section>
  )
}
