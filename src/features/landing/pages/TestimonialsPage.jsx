import PageShell, { PageHero } from '../components/PageShell'

const testimonials = [
  {
    company: 'Grab Your Car',
    location: 'Insurance Renewal — Gurugram, India',
    service: 'AI Voice Agent — Insurance Renewal Calling',
    rating: '5.0 / 5.0',
    quote:
      'Propnex AI completely transformed how we handle insurance renewal follow-ups. Their AI Voice Agent called our entire customer base in Gurugram within hours — something our human team would have taken weeks to do. The conversations were natural, professional, and incredibly effective. Our renewal conversion rate shot up dramatically. Tanishq and his team deliver real, measurable results. We could not be more impressed.',
    result:
      'Grab Your Car achieved significantly higher insurance renewal rates in Gurugram — 50,000+ outbound renewal calls managed automatically, zero additional staff, near-instant lead response time.',
    img: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=800&q=80',
    accent: 'from-cyan-500/50',
  },
  {
    company: 'PINPRO',
    location: 'Real Estate & Business Solutions — Bangalore, India',
    service: 'CRM Software, AI Voice Agent, ProprReel AI, WhatsApp Automation',
    rating: '5.0 / 5.0',
    quote:
      'Working with Propnex AI has been a game-changer for Pinpro. Their comprehensive platform — from the AI Voice Agent to CRM and WhatsApp automation — gave us a complete sales ecosystem we never had before. Our team is now closing deals faster, leads are better qualified, and our brand presence has grown significantly. ProprReel AI multiplied our social media reach with inquiries we never expected. Tanishq Gupta truly understands what businesses need to grow. Highly recommended!',
    result: null,
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    accent: 'from-violet-500/50',
  },
  {
    company: 'Dubai Real Estate Client',
    location: 'Luxury Property Development & Brokerage — Dubai, UAE',
    service: 'AI Voice Agent, Memory Agent, CRM Software, WhatsApp AI Automation',
    rating: '5.0 / 5.0',
    quote:
      'We were struggling to manage the volume of international leads coming in for our Dubai properties. Propnex AI\'s Voice Agent changed everything — it qualifies leads in real time, understands buyer intent, and books appointments with serious investors automatically. The Memory Agent feature is exceptional — it remembers every previous conversation so every follow-up feels completely personalised. Our sales team now only speaks with pre-qualified, genuinely interested buyers. Deal closure rates have improved significantly since we deployed Propnex AI across our entire lead pipeline. This is the future of real estate sales.',
    result:
      'International property buyers and investors qualified automatically across time zones — with the Memory Agent ensuring every conversation is personalised and every follow-up lands at the right moment.',
    img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=800&q=80',
    accent: 'from-blue-500/50',
  },
]

function TestimonialCard({ t }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f14]">
      <div className="relative h-44 overflow-hidden sm:h-52">
        <img
          src={t.img}
          alt={t.company}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div
          className={`absolute inset-0 bg-gradient-to-t ${t.accent} via-black/50 to-black/80`}
        />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <p className="text-lg font-semibold text-white">{t.company}</p>
          <p className="mt-1 text-xs text-white/65">{t.location}</p>
        </div>
      </div>

      <div className="flex flex-col p-5 md:p-6">
        <p className="text-xs font-semibold tracking-wide text-cyan-300/90">
          ★★★★★ {t.rating}
        </p>
        <blockquote className="mt-3 text-[14px] leading-relaxed text-white/75 md:text-[15px]">
          &ldquo;{t.quote}&rdquo;
        </blockquote>
        <p className="mt-4 text-[11px] uppercase tracking-[0.12em] text-white/40">
          Service Used: {t.service}
        </p>
        {t.result ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300/70">
              Result
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/60">{t.result}</p>
          </div>
        ) : null}
      </div>
    </article>
  )
}

export default function TestimonialsPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Client Testimonials"
        title="What Our Clients Are Saying"
        subtitle="Trusted by leading companies across Real Estate, Insurance & EdTech in India and Dubai."
        image="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=2000&q=80"
      />

      <section className="relative mx-auto max-w-4xl px-5 pb-16 md:px-8 md:pb-20">
        <div className="grid gap-6">
          {testimonials.map((t) => (
            <TestimonialCard key={t.company} t={t} />
          ))}
        </div>
      </section>
    </PageShell>
  )
}
