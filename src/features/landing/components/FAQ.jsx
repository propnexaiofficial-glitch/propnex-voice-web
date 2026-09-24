import { useRef, useState } from 'react'
import InteractiveCard from './InteractiveCard'
import { useStaggerReveal, useReveal } from '../hooks/useReveal'

const faqs = [
  {
    q: 'How human does PropNex AI sound?',
    a: 'Our neural voice models are trained on top-performing sales conversations. Most prospects cannot tell they are speaking with AI — and you can clone your best rep’s tone for brand consistency.',
  },
  {
    q: 'Can it integrate with our existing CRM?',
    a: 'Yes. Native connectors for Salesforce, HubSpot, Pipedrive, and Zoho — plus webhooks and Zapier for everything else. Notes, dispositions, and next steps sync automatically.',
  },
  {
    q: 'Is call recording and compliance included?',
    a: 'Every plan includes consent flows, encrypted recording, searchable transcripts, and audit logs. Enterprise adds regional data residency and custom retention policies.',
  },
  {
    q: 'How long does onboarding take?',
    a: 'Most teams go live in under a week. Upload your scripts, connect CRM, train on a few sample calls — our success team guides you through every step.',
  },
  {
    q: 'What languages are supported?',
    a: '40+ languages out of the box, with accent adaptation and automatic language detection mid-call for global inbound lines.',
  },
]

export default function FAQ() {
  const ref = useRef(null)
  const [open, setOpen] = useState(0)

  useReveal(ref, '.faq-side')
  useStaggerReveal(ref, '.gsap-card', { stagger: 0.08 })

  return (
    <section ref={ref} className="section-edge relative py-16 md:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-[0.9fr_1.1fr] md:gap-16 md:px-8">
        <div className="faq-side">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Common Questions
          </h2>
          <p className="mt-4 text-slate-400">
            Everything you need to know before launching PropNex AI across your
            revenue org.
          </p>
          <div className="relative mt-10 min-h-[220px] overflow-hidden rounded-2xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <img
              src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=800&q=80"
              alt="Abstract AI orb"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-violet-950/80 to-transparent" />
          </div>
        </div>

        <div className="faq-list space-y-3">
          {faqs.map((item, i) => {
            const isOpen = open === i
            return (
              <InteractiveCard
                key={item.q}
                className="faq-item !overflow-hidden !rounded-xl p-0"
                tilt={false}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold text-white md:text-[15px]">
                    {item.q}
                  </span>
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition duration-300 ${
                      isOpen ? 'rotate-45 bg-cyan-500/20 text-cyan-300' : ''
                    }`}
                  >
                    +
                  </span>
                </button>
                <div className={`faq-answer ${isOpen ? 'open' : ''}`}>
                  <div>
                    <p className="px-5 pb-5 text-sm leading-relaxed text-slate-400">
                      {item.a}
                    </p>
                  </div>
                </div>
              </InteractiveCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
