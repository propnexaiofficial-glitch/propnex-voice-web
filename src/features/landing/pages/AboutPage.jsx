import { Suspense, lazy } from 'react'
import PageShell, { PageHero, SectionCard } from '../components/PageShell'

const HeroScene = lazy(() => import('../components/3d/HeroScene'))

const values = [
  {
    title: 'Built for real conversations, not scripts',
    desc: 'Voice that adapts mid-call — natural turns, interruptions, and intent — not rigid IVR trees.',
  },
  {
    title: 'Privacy and trust are non-negotiable',
    desc: 'Encryption, retention controls, and compliance-ready records on every conversation.',
  },
  {
    title: 'We move at the speed of your sales team',
    desc: 'Ship campaigns fast, iterate on playbooks daily, and scale without adding headcount.',
  },
]

const team = [
  {
    name: 'Tanishq Gupta',
    title: 'Founder / CEO',
    img: '/team/tanishq-gupta.png',
  },
  {
    name: 'Prakhar Shukla',
    title: 'CTO',
    img: '/team/prakhar-shukla.png',
  },
  {
    name: 'Kanak Keer',
    title: 'Senior AI Engineer',
    img: '/team/kanak-keer.png',
  },
]

const presence = [
  {
    title: 'Gurgaon, India',
    desc: 'Established clientage across the top real estate channel partners and brokerages in Gurgaon — India\'s most competitive property market. AI agents are actively qualifying leads, booking site visits, and closing deals daily.',
  },
  {
    title: 'Dubai, UAE',
    desc: 'Propnex AI has expanded into the Dubai real estate market — one of the world\'s highest-value property markets. International developers and brokers trust our platform to handle high-value lead qualification across multiple time zones.',
  },
]

export default function AboutPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Company"
        title="About PropNex AI"
        subtitle="India's Most Powerful AI Voice & Automation Platform — trusted by leading companies across Real Estate, Insurance & EdTech in India and Dubai."
        image="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80"
      />

      <section className="relative mx-auto max-w-6xl px-5 pb-16 md:px-8 md:pb-20">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <SectionCard className="overflow-hidden p-0">
            <div className="relative h-[280px] md:h-[340px]">
              <Suspense fallback={null}>
                <HeroScene className="h-full w-full" active />
              </Suspense>
            </div>
          </SectionCard>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
              Our presence
            </p>
            <h2 className="mt-3 text-2xl font-bold text-white md:text-3xl">
              Propnex AI — Where Artificial Intelligence Meets Real Business Results
            </h2>
            <div className="mt-6 space-y-4">
              {presence.map((p) => (
                <div key={p.title}>
                  <h3 className="text-sm font-semibold text-white">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/55">
                    {p.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14">
          <h2 className="text-center text-2xl font-bold text-white md:text-3xl">
            Values
          </h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {values.map((v) => (
              <SectionCard key={v.title} className="p-6">
                <h3 className="text-base font-semibold text-white">{v.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  {v.desc}
                </p>
              </SectionCard>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-center text-2xl font-bold text-white md:text-3xl">
            Leadership
          </h2>
          <div className="mx-auto mt-8 grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m) => (
              <div
                key={m.name}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
              >
                <img
                  src={m.img}
                  alt={m.name}
                  className="aspect-[4/5] w-full object-cover"
                  loading="lazy"
                />
                <div className="p-3.5">
                  <p className="font-semibold text-white">{m.name}</p>
                  <p className="mt-0.5 text-sm text-cyan-300/80">{m.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  )
}
