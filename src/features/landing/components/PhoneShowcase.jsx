import { useRef } from 'react'
import PhoneCarousel from './PhoneCarousel'
import { useReveal } from '../hooks/useReveal'

export default function PhoneShowcase() {
  const ref = useRef(null)

  useReveal(ref, '.reveal')

  return (
    <section
      id="phone"
      ref={ref}
      className="relative overflow-hidden py-16 md:py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.12),transparent_60%)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-5 md:grid-cols-2 md:gap-6 md:px-8">
        <div className="reveal order-2 md:order-1">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-blue-400/80">
            Agent personalities
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-[42px]">
            Give your agent a face users love
          </h2>
          <p className="mt-4 max-w-md text-slate-400 leading-relaxed">
            The PropNex phone experience — 3D tilt, fluid orb, and swipeable
            personalities. Pick a voice vibe and start a chat in one tap.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-white/70">
            {[
              'Fluid WebGL cloud orb per personality',
              '3D phone with rim light + parallax tilt',
              'Auto-advance carousel with swipe gestures',
            ].map((item) => (
              <li key={item} className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="order-1 md:order-2">
          <PhoneCarousel />
        </div>
      </div>
    </section>
  )
}
