import { Link } from '@/features/landing/lib/router'
import PageShell, { PageHero, SectionCard } from '../components/PageShell'

const why = [
  {
    title: 'Real-time voice AI at production scale',
    desc: 'Ship systems that handle millions of conversations — not demos.',
  },
  {
    title: 'Small team, high ownership',
    desc: 'Every engineer and designer owns outcomes end-to-end.',
  },
  {
    title: 'Remote-friendly',
    desc: 'Flexible collaboration across India (final policy confirmed during offer).',
  },
]

/** Empty = show fallback. Add roles when open. */
const roles = [
  {
    title: 'GTM — Sales',
    department: 'Go-to-Market',
    location: 'Gurgaon · Hybrid',
  },
  {
    title: 'GTM — Marketing',
    department: 'Go-to-Market',
    location: 'Gurgaon · Hybrid',
  },
  {
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote · India',
  },
  {
    title: 'Voice AI Research Engineer',
    department: 'AI',
    location: 'Bengaluru / Hybrid',
  },
  {
    title: 'Customer Success Manager',
    department: 'Success',
    location: 'Remote · India',
  },
]

export default function CareersPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Company"
        title="Careers"
        subtitle="Build the voice layer for modern sales teams — realtime, human, and production-ready."
        image="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=2000&q=80"
      />

      <section className="relative mx-auto max-w-6xl px-5 pb-16 md:px-8 md:pb-20">
        <h2 className="text-2xl font-bold text-white">Why work here</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {why.map((w) => (
            <SectionCard key={w.title} className="p-6">
              <h3 className="font-semibold text-white">{w.title}</h3>
              <p className="mt-2 text-sm text-white/55">{w.desc}</p>
            </SectionCard>
          ))}
        </div>

        <div className="mt-14">
          <h2 className="text-2xl font-bold text-white">Open roles</h2>
          {roles.length === 0 ? (
            <SectionCard className="mt-6 p-8 text-center">
              <p className="text-white/70">
                No open roles right now — check back soon, or send your profile
                to{' '}
                <a
                  href="mailto:careers@propnex.ai"
                  className="text-cyan-300 hover:underline"
                >
                  careers@propnex.ai
                </a>
                .
              </p>
            </SectionCard>
          ) : (
            <div className="mt-6 space-y-3">
              {roles.map((r) => (
                <SectionCard
                  key={r.title}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-white">{r.title}</h3>
                    <p className="mt-1 text-sm text-white/45">
                      {r.department} · {r.location}
                    </p>
                  </div>
                  <a
                    href={`mailto:careers@propnex.ai?subject=Application: ${encodeURIComponent(r.title)}`}
                    className="inline-flex rounded-full bg-cyan-400 px-5 py-2.5 text-center text-sm font-semibold text-black transition hover:bg-cyan-300"
                  >
                    Apply
                  </a>
                </SectionCard>
              ))}
            </div>
          )}
        </div>

        <p className="mt-10 text-center text-sm text-white/40">
          Prefer partnerships?{' '}
          <Link to="/partners" className="text-cyan-300 hover:underline">
            Become a business partner
          </Link>
        </p>
      </section>
    </PageShell>
  )
}
