import { Link } from '@/features/landing/lib/router'
import PageShell, { PageHero, SectionCard } from '../components/PageShell'

const clients = [
  {
    name: 'Urban Money',
    industry: 'FinTech',
    location: 'India',
    logo: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=400&q=60',
  },
  {
    name: 'Grab Your Car',
    industry: 'Insurance',
    location: 'Gurugram, India',
    logo: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=400&q=60',
  },
  {
    name: 'ApexVue Consulting',
    industry: 'Consulting',
    location: 'India',
    logo: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=400&q=60',
  },
  {
    name: 'SchoolKnot',
    industry: 'EdTech',
    location: 'India',
    logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=400&q=60',
  },
  {
    name: 'Orbitel',
    industry: 'Telecom',
    location: 'India',
    logo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=60',
  },
  {
    name: 'Aeropack Software IT',
    industry: 'Software IT',
    location: 'India',
    logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=60',
  },
  {
    name: 'Incrivel',
    industry: 'US Client',
    location: 'United States',
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=60',
  },
]

const testimonials = [
  {
    name: 'Rohit Sharma',
    company: 'Grab Your Car',
    detail: 'Insurance Renewal — Gurugram, India',
    service: 'AI Voice Agent — Insurance Renewal Calling',
    rating: '5.0 / 5.0',
    quote:
      'Propnex AI completely transformed how we handle insurance renewal follow-ups. Their AI Voice Agent called our entire customer base in Gurugram within hours — something our human team would have taken weeks to do. The conversations were natural, professional, and incredibly effective. Our renewal conversion rate shot up dramatically. Tanishq and his team deliver real, measurable results. We could not be more impressed.',
    result:
      'Grab Your Car achieved significantly higher insurance renewal rates in Gurugram — 50,000+ outbound renewal calls managed automatically, zero additional staff, near-instant lead response time.',
  },
  {
    name: 'Ananya Reddy',
    company: 'PINPRO',
    detail: 'Real Estate & Business Solutions — Bangalore, India',
    service: 'CRM Software, AI Voice Agent, ProprReel AI, WhatsApp Automation',
    rating: '5.0 / 5.0',
    quote:
      'Working with Propnex AI has been a game-changer for Pinpro. Their comprehensive platform — from the AI Voice Agent to CRM and WhatsApp automation — gave us a complete sales ecosystem we never had before. Our team is now closing deals faster, leads are better qualified, and our brand presence has grown significantly. ProprReel AI multiplied our social media reach with inquiries we never expected. Tanishq Gupta truly understands what businesses need to grow. Highly recommended!',
    result: null,
  },
  {
    name: 'Vikram Mehta',
    company: 'Dubai Real Estate Client',
    detail: 'Luxury Property Development & Brokerage — Dubai, UAE',
    service: 'AI Voice Agent, Memory Agent, CRM Software, WhatsApp AI Automation',
    rating: '5.0 / 5.0',
    quote:
      'We were struggling to manage the volume of international leads coming in for our Dubai properties. Propnex AI\'s Voice Agent changed everything — it qualifies leads in real time, understands buyer intent, and books appointments with serious investors automatically. The Memory Agent feature is exceptional — it remembers every previous conversation so every follow-up feels completely personalised. Our sales team now only speaks with pre-qualified, genuinely interested buyers. Deal closure rates have improved significantly since we deployed Propnex AI across our entire lead pipeline. This is the future of real estate sales.',
    result:
      'International property buyers and investors qualified automatically across time zones — with the Memory Agent ensuring every conversation is personalised and every follow-up lands at the right moment.',
  },
]

export default function CustomersPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Company"
        title="Customers & Testimonials"
        subtitle="Trusted by leading companies across Real Estate, Insurance & EdTech in India and Dubai."
        image="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2000&q=80"
      />

      <section className="relative mx-auto max-w-6xl px-5 pb-10 md:px-8">
        <h2 className="text-xl font-bold text-white md:text-2xl">Our clients</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((c) => (
            <SectionCard key={c.name} className="overflow-hidden">
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={c.logo}
                  alt={c.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-4">
                <p className="font-semibold text-white">{c.name}</p>
                <p className="mt-0.5 text-xs uppercase tracking-[0.14em] text-white/40">
                  {c.industry} · {c.location}
                </p>
              </div>
            </SectionCard>
          ))}
        </div>
      </section>

      <section className="relative mx-auto max-w-4xl px-5 pb-16 md:px-8 md:pb-20">
        <h2 className="text-xl font-bold text-white md:text-2xl">
          What our clients are saying
        </h2>
        <div className="mt-6 grid gap-6">
          {testimonials.map((t) => (
            <SectionCard key={t.company} className="p-5 md:p-6">
              <p className="text-xs font-semibold tracking-wide text-cyan-300/90">
                ★★★★★ {t.rating}
              </p>
              <blockquote className="mt-3 text-[14px] leading-relaxed text-white/75 md:text-[15px]">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="mt-4">
                <p className="text-sm font-semibold text-white">{t.name}</p>
                <p className="mt-0.5 text-xs text-white/45">
                  {t.company} · {t.detail}
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-white/35">
                  Service Used: {t.service}
                </p>
              </div>
              {t.result ? (
                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300/70">
                    Result
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    {t.result}
                  </p>
                </div>
              ) : null}
            </SectionCard>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-white/40">
          Want to become a client?{' '}
          <Link to="/live-demo" className="text-cyan-300 hover:underline">
            Book a free demo
          </Link>
        </p>
      </section>
    </PageShell>
  )
}
