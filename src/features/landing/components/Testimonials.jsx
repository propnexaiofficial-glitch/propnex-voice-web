import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useHeadReveal, useStaggerReveal } from '../hooks/useReveal'
import InteractiveCard from './InteractiveCard'
import '../css-animations.css'

gsap.registerPlugin(ScrollTrigger)

// Particle positions for CTA background
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  x: `${5 + (i * 5.5) % 90}%`,
  d: `${(i * 0.4).toFixed(1)}s`,
  tx: `${(i % 2 === 0 ? 1 : -1) * (10 + (i * 7) % 30)}px`,
}))

const stats = [
  {
    title: '10x',
    sub: 'more meetings booked',
    path: 'M13 2L3 14h8l-1 8 10-12h-8l1-8z',
  },
  {
    title: '70%',
    sub: 'lower cost per lead',
    path: 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 3v5l4 2',
  },
  {
    title: '5 Star',
    sub: 'Client Rating',
    path: 'M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 17.8 5.7 21l2.3-7-6-4.6h7.6L12 2z',
  },
  {
    title: '2',
    sub: 'Countries Served',
    path: 'M12 2a10 10 0 100 20 10 10 0 000-20zm1 10.4l3.5 2.1-.9 1.5L11 13V7h2v5.4z',
  },
]

const testimonials = [
  {
    quote:
      'Propnex AI completely transformed how we handle insurance renewal follow-ups. Their AI Voice Agent called our entire customer base in Gurugram within hours — something our human team would have taken weeks to do. The conversations were natural, professional, and incredibly effective. Our renewal conversion rate shot up dramatically.',
    name: 'Rohit Sharma',
    company: 'Grab Your Car',
    detail: 'Insurance Renewal — Gurugram',
    rating: '5.0 / 5.0',
  },
  {
    quote:
      'Working with Propnex AI has been a game-changer for Pinpro. Their comprehensive platform — from the AI Voice Agent to CRM and WhatsApp automation — gave us a complete sales ecosystem we never had before. Our team is now closing deals faster, leads are better qualified, and our brand presence has grown significantly.',
    name: 'Ananya Reddy',
    company: 'PINPRO',
    detail: 'Real Estate — Bangalore',
    rating: '5.0 / 5.0',
  },
  {
    quote:
      'We were struggling to manage the volume of international leads coming in for our Dubai properties. Propnex AI\'s Voice Agent changed everything — it qualifies leads in real time, understands buyer intent, and books appointments with serious investors automatically. Our sales team now only speaks with pre-qualified buyers.',
    name: 'Vikram Mehta',
    company: 'Dubai Real Estate Client',
    detail: 'Luxury Property — Dubai, UAE',
    rating: '5.0 / 5.0',
  },
]

function QuoteCard({ t }) {
  return (
    <InteractiveCard className="quote-card flex h-full w-[340px] shrink-0 flex-col justify-between p-6 md:w-[420px]">
      <div>
        <p className="text-xs font-semibold tracking-wide text-cyan-300/90">
          ★★★★★ {t.rating}
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-white/80 md:text-[15px]">
          &ldquo;{t.quote}&rdquo;
        </p>
      </div>
      <div className="mt-6 border-t border-white/10 pt-5">
        <p className="text-sm font-semibold text-white">{t.name}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {t.company} · {t.detail}
        </p>
      </div>
    </InteractiveCard>
  )
}

export default function Testimonials() {
  const ref = useRef(null)
  const trackRef = useRef(null)
  useHeadReveal(ref)
  useStaggerReveal(ref, '.trust-card', { stagger: 0.1 })

  useGSAP(
    () => {
      const track = trackRef.current
      if (!track) return

      gsap.fromTo(
        '.quote-marquee',
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: '.quote-marquee',
            start: 'top 88%',
            once: true,
          },
        },
      )

      const tween = gsap.to(track, {
        xPercent: -50,
        duration: 48,
        ease: 'none',
        repeat: -1,
      })

      const pause = () => tween.pause()
      const play = () => tween.play()
      track.addEventListener('mouseenter', pause)
      track.addEventListener('mouseleave', play)
      track.addEventListener('touchstart', pause, { passive: true })
      track.addEventListener('touchend', play, { passive: true })

      return () => {
        track.removeEventListener('mouseenter', pause)
        track.removeEventListener('mouseleave', play)
        track.removeEventListener('touchstart', pause)
        track.removeEventListener('touchend', play)
        tween.kill()
      }
    },
    { scope: ref },
  )

  const loop = [...testimonials, ...testimonials]

  return (
    <section id="about" ref={ref} className="section-edge relative py-20 md:py-28 overflow-hidden">
      {/* Animated background */}
      <div className="cta-bg-gradient" />
      <div className="cta-grid" />
      <div className="cta-particles">
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="cta-particle"
            style={{ '--x': p.x, '--d': p.d, '--tx': p.tx }}
          />
        ))}
      </div>
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="reveal-head mb-12 text-center md:mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Ready to scale? Teams trust PropNex AI.
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-slate-400">
            Real Indian clients across Real Estate, Insurance & more — in India
            and Dubai.
          </p>
        </div>

        <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <InteractiveCard
              key={s.title}
              className="trust-card p-5 text-center"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-violet-500/15 text-cyan-300 ring-1 ring-white/10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d={s.path} />
                </svg>
              </div>
              <p className="text-2xl font-bold text-white">{s.title}</p>
              <p className="mt-1 text-sm text-slate-400">{s.sub}</p>
            </InteractiveCard>
          ))}
        </div>
      </div>

      <div className="quote-marquee relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-black to-transparent md:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-black to-transparent md:w-28" />
        <div className="overflow-hidden">
          <div
            ref={trackRef}
            className="flex w-max gap-4 px-5 will-change-transform md:gap-5 md:px-8"
          >
            {loop.map((t, i) => (
              <QuoteCard key={`${t.name}-${i}`} t={t} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
