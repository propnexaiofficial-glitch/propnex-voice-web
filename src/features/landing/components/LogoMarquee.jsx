const clients = [
  { name: 'Urban Money', industry: 'FinTech' },
  { name: 'Grab Your Car', industry: 'Insurance' },
  { name: 'ApexVue Consulting', industry: 'Consulting' },
  { name: 'SchoolKnot', industry: 'EdTech' },
  { name: 'Orbitel', industry: 'Telecom' },
  { name: 'Aeropack Software IT', industry: 'Software IT' },
  { name: 'Incrivel', industry: 'US Client' },
]

function ClientItem({ name, industry }) {
  return (
    <div className="mx-8 flex h-14 shrink-0 flex-col items-center justify-center md:mx-12 md:h-16">
      <p className="text-sm font-semibold tracking-wide text-white/80 md:text-base">
        {name}
      </p>
      <p className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-white/35">
        {industry}
      </p>
    </div>
  )
}

export default function LogoMarquee() {
  const doubled = [...clients, ...clients, ...clients]
  return (
    <section className="relative border-y border-white/5 py-10 md:py-12">
      <p className="mb-7 text-center text-xs font-medium uppercase tracking-[0.2em] text-white/35">
        Trusted by real clients
      </p>
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-black to-transparent md:w-40" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-black to-transparent md:w-40" />
        <div className="marquee-track">
          {doubled.map((c, i) => (
            <ClientItem key={`${c.name}-${i}`} name={c.name} industry={c.industry} />
          ))}
        </div>
      </div>
    </section>
  )
}
