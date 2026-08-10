import { useMemo, useState, useEffect } from 'react'
import { useParams, useNavigate } from '@/features/landing/lib/router'
import PageShell, { PageHero } from '../components/PageShell'

const docs = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    tag: 'Setup',
    img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    accent: 'from-cyan-500/45 via-black/55 to-black/90',
    border: 'border-cyan-400/30',
    glow: 'shadow-[0_0_32px_rgba(34,211,238,0.12)]',
    body: [
      'Create a PropNex workspace and invite your sales / ops team.',
      'Provision numbers under PropNex Telephony (buy new DIDs or port existing lines).',
      'Import a PropNex AI agent template (Real Estate, Insurance, EdTech, FinTech, or HealthTech).',
      'Publish a campaign, connect your CRM webhooks, and place a test call within minutes.',
    ],
  },
  {
    id: 'apis',
    title: 'PropNex AI APIs',
    tag: 'REST API',
    img: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=900&q=80',
    accent: 'from-blue-500/45 via-black/55 to-black/90',
    border: 'border-blue-400/25',
    glow: 'shadow-[0_0_32px_rgba(59,130,246,0.12)]',
    body: [
      'Auth: API keys via Authorization: Bearer <key>. Default 120 req/min per workspace (burst 30).',
      'Core resources: Agents, Campaigns, Calls, Leads, Analytics, Webhooks.',
      'Example: GET /v1/calls?campaign_id=… · POST /v1/calls to trigger outbound dials.',
      'Errors return JSON with code + message (401, 422, 429). Idempotency-Key supported on write routes.',
    ],
  },
  {
    id: 'sdk',
    title: 'SDK & Agent Import',
    tag: 'Developer',
    img: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&w=900&q=80',
    accent: 'from-violet-500/45 via-black/55 to-black/90',
    border: 'border-violet-400/25',
    glow: 'shadow-[0_0_32px_rgba(139,92,246,0.12)]',
    body: [
      'Install: npm i @propnexai/agent  ·  pip install propnexai',
      'Import a packaged agent: from propnexai import Agent → Agent.import_("propnex-voice")',
      'TypeScript: import { PropnexAI } from "@propnexai/agent" then PropnexAI.import("propnex-voice")',
      'SDKs wrap session start/stop, streaming transcripts, and webhook verification helpers.',
    ],
  },
  {
    id: 'voice-cloning',
    title: 'Voice Cloning',
    tag: 'Voice AI',
    img: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=900&q=80',
    accent: 'from-fuchsia-500/45 via-black/55 to-black/90',
    border: 'border-fuchsia-400/25',
    glow: 'shadow-[0_0_32px_rgba(217,70,239,0.12)]',
    body: [
      'Upload 1–3 minutes of clean, consented speech (minimal background noise).',
      'Pipeline: upload → consent review → train → preview → approve for production.',
      'Assign the cloned voice to any agent or sub-agent from the Agents panel.',
      'Retain consent records; never clone a voice without explicit rights.',
    ],
  },
  {
    id: 'telephony',
    title: 'PropNex Telephony',
    tag: 'Calls',
    img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=900&q=80',
    accent: 'from-teal-500/45 via-black/55 to-black/90',
    border: 'border-teal-400/25',
    glow: 'shadow-[0_0_32px_rgba(45,212,191,0.12)]',
    body: [
      'PropNex Telephony is the native calling layer — inbound DID routing, outbound dialers, and SIP trunks in one place.',
      'Provision India / UAE numbers inside the PropNex dashboard (or port existing lines into PropNex Telephony).',
      'Missed-call callbacks, concurrent dialing, and failover to human queues are handled on PropNex Telephony.',
      'Connect PropNex Telephony to your CRM via webhooks for dispositions, recordings, and call events.',
    ],
  },
  {
    id: 'lead-reactivation',
    title: 'How Lead Reactivation Works',
    tag: 'Playbook',
    img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80',
    accent: 'from-amber-500/40 via-black/55 to-black/90',
    border: 'border-amber-400/25',
    glow: 'shadow-[0_0_32px_rgba(245,158,11,0.1)]',
    body: [
      'Pull dormant leads from CRM inactivity windows or CSV uploads.',
      'PropNex Voice Agent re-introduces the brand, confirms interest, and books or nurtures.',
      'Quiet hours, max attempts, and staggered retries keep campaigns compliant.',
      'Hot intent is handed to sales with full transcript and scoring.',
    ],
  },
  {
    id: 'missed-call',
    title: 'How the Missed Call Agent Works',
    tag: 'Playbook',
    img: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=900&q=80',
    accent: 'from-rose-500/40 via-black/55 to-black/90',
    border: 'border-rose-400/25',
    glow: 'shadow-[0_0_32px_rgba(244,63,94,0.1)]',
    body: [
      'Any unanswered inbound ring on PropNex Telephony triggers the Missed Call Agent.',
      'Callback fires within seconds (or your configured delay window).',
      'Agent qualifies need, location, and budget — then books or queues a human follow-up.',
      'Every miss is logged, scored, and visible in Analytics.',
    ],
  },
  {
    id: 'industries',
    title: 'Industry Playbooks',
    tag: 'Verticals',
    img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80',
    accent: 'from-sky-500/40 via-black/55 to-black/90',
    border: 'border-sky-400/25',
    glow: 'shadow-[0_0_32px_rgba(56,189,248,0.1)]',
    body: [
      'Real Estate: site-visit booking, channel-partner leads, Dubai / Gurgaon high-intent qualification.',
      'EdTech: demo scheduling, batch counselling callbacks, fee-follow-up nurture.',
      'FinTech: KYC reminders, loan / credit reactivation, EMI payment intent collection.',
      'HealthTech: appointment booking, report follow-ups, insurance pre-auth reminders.',
      'Insurance: renewal calling, policy intent capture, at-risk account flagging.',
    ],
  },
]

function DocNavItem({ doc, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(doc.id)}
      className={`shrink-0 rounded-xl border px-3 py-2 text-left transition duration-200 lg:px-3.5 lg:py-3 ${
        active
          ? 'border-cyan-400/30 bg-cyan-400/15 text-cyan-100'
          : 'border-transparent text-white/55 hover:border-white/10 hover:bg-white/5 hover:text-white'
      }`}
    >
      <span
        className={`text-[9px] font-semibold uppercase tracking-[0.14em] lg:text-[10px] ${
          active ? 'text-cyan-300/80' : 'text-white/35'
        }`}
      >
        {doc.tag}
      </span>
      <p className="mt-1 text-xs font-medium leading-snug lg:text-sm">
        {doc.title}
      </p>
    </button>
  )
}

export default function DocsPage() {
  const { section } = useParams()
  const navigate = useNavigate()
  const initial = docs.find((d) => d.id === section)?.id ?? docs[0].id
  const [active, setActive] = useState(initial)

  useEffect(() => {
    if (section && docs.some((d) => d.id === section)) {
      setActive(section)
    }
  }, [section])

  const doc = useMemo(
    () => docs.find((d) => d.id === active) ?? docs[0],
    [active],
  )

  const onSelect = (id) => {
    setActive(id)
    navigate(`/docs/${id}`, { replace: true })
  }

  return (
    <PageShell>
      <PageHero
        eyebrow="Resources"
        title="Docs Hub"
        subtitle="APIs, PropNex Telephony, SDKs, and playbooks to ship voice agents fast."
        image="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=2000&q=80"
      />

      <section className="relative mx-auto max-w-6xl px-5 pb-16 md:px-8 md:pb-20">
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[240px_1fr] lg:gap-8">
          <nav className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible">
            {docs.map((d) => (
              <DocNavItem
                key={d.id}
                doc={d}
                active={active === d.id}
                onSelect={onSelect}
              />
            ))}
          </nav>

          <article
            className={`overflow-hidden rounded-2xl border bg-[#0c0c10] ${doc.border} ${doc.glow}`}
          >
            <div className="relative h-40 md:h-52">
              <img
                src={doc.img}
                alt=""
                className="h-full w-full object-cover"
                loading="lazy"
              />
              <div
                className={`absolute inset-0 bg-gradient-to-t ${doc.accent}`}
              />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                  {doc.tag}
                </p>
                <h2 className="mt-1 text-xl font-bold text-white md:text-2xl">
                  {doc.title}
                </h2>
              </div>
            </div>
            <ul className="space-y-3 p-5 md:p-6">
              {doc.body.map((line) => (
                <li
                  key={line}
                  className="flex gap-3 text-sm leading-relaxed text-white/65"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400/80" />
                  {line}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </PageShell>
  )
}
