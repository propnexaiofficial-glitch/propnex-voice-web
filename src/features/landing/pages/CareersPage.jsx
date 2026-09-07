'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/features/landing/lib/router'
import PageShell, { PageHero, SectionCard } from '../components/PageShell'
import { ChevronDown, ChevronUp } from 'lucide-react'

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

export default function CareersPage() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedJobId, setExpandedJobId] = useState(null)

  useEffect(() => {
    async function fetchJobs() {
      try {
        const res = await fetch('/api/jobs')
        const json = await res.json()
        if (json.success) {
          setJobs(json.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [])

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
          
          {loading ? (
            <SectionCard className="mt-6 p-8 text-center">
              <p className="text-white/70">Loading open roles...</p>
            </SectionCard>
          ) : jobs.length === 0 ? (
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
              {jobs.map((job) => {
                const isExpanded = expandedJobId === job.id
                return (
                  <SectionCard
                    key={job.id}
                    className="flex flex-col p-5 transition-colors overflow-hidden"
                  >
                    <div 
                      className="flex cursor-pointer items-center justify-between"
                      onClick={() => setExpandedJobId(isExpanded ? null : job.id)}
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-white">{job.title}</h3>
                          <div className="flex items-center gap-2">
                            {job.jobType && (
                              <span className="inline-flex items-center rounded-full bg-cyan-400/10 px-2 py-0.5 text-xs font-medium text-cyan-400 border border-cyan-400/20">
                                {job.jobType}
                              </span>
                            )}
                            {job.location && (
                              <span className="inline-flex items-center rounded-full bg-white/5 px-2 py-0.5 text-xs font-medium text-white/70 border border-white/10">
                                {job.location}
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="mt-1 text-sm text-white/45">
                          {job.experience} · {job.education}
                        </p>
                      </div>
                      <button className="text-white/40 hover:text-white transition">
                        {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                      </button>
                    </div>
                    
                    {isExpanded && (
                      <div className="mt-5 border-t border-white/10 pt-5 space-y-6">
                        <div>
                          <h4 className="text-sm font-semibold text-white/80">About the Role</h4>
                          <p className="mt-2 text-sm text-white/60 whitespace-pre-wrap">{job.description}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white/80">Responsibilities</h4>
                          <p className="mt-2 text-sm text-white/60 whitespace-pre-wrap">{job.responsibilities}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-white/80">Knowledge & Skills</h4>
                          <p className="mt-2 text-sm text-white/60 whitespace-pre-wrap">{job.knowledge}</p>
                        </div>
                        <div className="pt-2 flex justify-end">
                          <Link
                            to={`/careers/apply/${job.id}`}
                            className="inline-flex rounded-full bg-cyan-400 px-6 py-2.5 text-center text-sm font-semibold text-black transition hover:bg-cyan-300"
                          >
                            Apply Now
                          </Link>
                        </div>
                      </div>
                    )}
                  </SectionCard>
                )
              })}
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
