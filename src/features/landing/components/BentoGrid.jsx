import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import InteractiveCard from './InteractiveCard'

gsap.registerPlugin(ScrollTrigger)

const tiles = [
  {
    title: 'Neural call routing',
    tag: 'Core',
    img: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1400&q=80',
    span: 'md:col-span-7 md:row-span-2 min-h-[220px] md:min-h-[340px]',
  },
  {
    title: 'Realtime analytics',
    tag: 'Insight',
    img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    span: 'md:col-span-5 min-h-[160px] md:min-h-[162px]',
  },
  {
    title: 'Always-on agents',
    tag: 'Scale',
    img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80',
    span: 'md:col-span-5 min-h-[160px] md:min-h-[162px]',
  },
]

export default function BentoGrid() {
  const ref = useRef(null)

  useGSAP(
    () => {
      gsap.fromTo(
        '.gallery-head > *',
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: { trigger: ref.current, start: 'top 78%' },
        },
      )

      gsap.fromTo(
        '.gallery-tile',
        { opacity: 0, y: 40, scale: 0.97 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.85,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: '.gallery-grid', start: 'top 82%' },
        },
      )

      gsap.utils.toArray('.gallery-img').forEach((img, i) => {
        gsap.to(img, {
          scale: 1.12,
          x: i % 2 === 0 ? '2%' : '-2%',
          duration: 14 + i * 1.5,
          yoyo: true,
          repeat: -1,
          ease: 'sine.inOut',
        })
      })
    },
    { scope: ref },
  )

  return (
    <section
      id="gallery"
      ref={ref}
      className="relative overflow-hidden py-14 md:py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_30%_0%,rgba(34,211,238,0.06),transparent_45%)]" />

      <div className="relative mx-auto max-w-6xl px-5 md:px-8">
        <div className="gallery-head mb-7 flex flex-col gap-3 md:mb-9 md:flex-row md:items-end md:justify-between">
          <div className="max-w-lg">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
              Visual platform
            </p>
            <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-white md:text-[34px]">
              Built to look as powerful{' '}
              <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">
                as it performs
              </span>
            </h2>
          </div>
          <p className="max-w-xs text-[12px] leading-relaxed text-white/45 md:text-right md:text-[13px]">
            A few image-led surfaces — from first ring to closed deal.
          </p>
        </div>

        <div className="gallery-grid grid gap-2.5 md:grid-cols-12 md:gap-3">
          {tiles.map((t, i) => (
            <InteractiveCard
              key={t.title}
              className={`gallery-tile group relative !overflow-hidden !rounded-xl p-0 md:!rounded-2xl ${t.span}`}
            >
              <img
                src={t.img}
                alt={t.title}
                className="gallery-img absolute inset-0 h-full w-full object-cover will-change-transform transition duration-700 group-hover:scale-105"
                loading="lazy"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-transparent to-violet-600/0 opacity-0 transition duration-500 group-hover:from-cyan-500/15 group-hover:to-violet-600/20 group-hover:opacity-100" />
              <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/10" />

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3 md:p-4">
                <div>
                  <span className="mb-1 inline-block text-[8px] font-semibold uppercase tracking-[0.2em] text-white/45">
                    {t.tag}
                  </span>
                  <h3
                    className={`font-semibold tracking-tight text-white ${
                      i === 0
                        ? 'text-[16px] md:text-[20px]'
                        : 'text-[12px] md:text-[13px]'
                    }`}
                  >
                    {t.title}
                  </h3>
                </div>
              </div>
            </InteractiveCard>
          ))}
        </div>
      </div>
    </section>
  )
}
