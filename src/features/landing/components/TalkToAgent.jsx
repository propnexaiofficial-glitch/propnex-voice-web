import { Link } from '@/features/landing/lib/router'
import AuraOrb from './3d/AuraOrb'

/** Floating CTA — opens dedicated Live Demo page */
export default function TalkToAgent() {
  return (
    <Link
      to="/live-demo"
      className="group fixed bottom-6 right-6 z-[60] flex items-center gap-3 rounded-full border border-white/15 bg-black/80 py-2 pl-2 pr-5 shadow-[0_0_40px_rgba(34,211,238,0.3)] backdrop-blur-xl transition hover:border-cyan-400/50 hover:shadow-[0_0_50px_rgba(34,211,238,0.4)] md:bottom-8 md:right-8"
    >
      <span className="relative h-12 w-12 overflow-hidden rounded-full">
        <AuraOrb className="h-12 w-12" intensity={1.2} />
      </span>
      <span className="text-left">
        <span className="block text-[11px] font-medium uppercase tracking-wider text-cyan-300/90">
          Try now
        </span>
        <span className="block text-sm font-semibold text-white">Live Demo</span>
      </span>
    </Link>
  )
}
