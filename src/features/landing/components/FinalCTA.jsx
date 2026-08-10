import { useRef } from 'react'
import { Link } from '@/features/landing/lib/router'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import AuraOrb from './3d/AuraOrb'

gsap.registerPlugin(ScrollTrigger)

export default function FinalCTA() {
  const ref = useRef(null)

  useGSAP(
    () => {
      gsap.fromTo(
        '.cta-inner',
        { autoAlpha: 0, scale: 0.96, y: 30 },
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 85%',
            once: true,
          },
        },
      )
      gsap.fromTo(
        '.cta-copy > *',
        { autoAlpha: 0, y: 18 },
        {
          autoAlpha: 1,
          y: 0,
          stagger: 0.1,
          duration: 0.65,
          delay: 0.15,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 85%',
            once: true,
          },
        },
      )
    },
    { scope: ref },
  )

  return (
    <section ref={ref} className="section-edge relative py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="cta-inner relative overflow-hidden rounded-3xl border border-white/10 bg-[#08080c] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_30px_80px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 opacity-80">
            <AuraOrb className="h-full w-full scale-125" intensity={1.2} />
          </div>
          <div className="absolute inset-0 bg-black/55" />

          <div className="cta-copy relative px-6 py-16 text-center md:px-12 md:py-24">
            <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white md:text-5xl">
              Ready to Transform Your Business with AI?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-slate-300">
              Join the growing list of businesses in India and Dubai closing more
              deals, qualifying more leads, and building stronger brands — with
              the power of Propnex AI.
            </p>
            <Link
              to="/live-demo"
              className="btn-primary mt-8 inline-flex rounded-full px-10 py-4 text-base"
            >
              Book a Free Demo Call
            </Link>
            <p className="mt-4 text-xs text-white/40">
              www.propnexai.com · Gurgaon, India | Dubai, UAE
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
