import '../../css-animations.css'

export default function HeroScene({ className = '', active = true }) {
  return (
    <div className={`relative ${className}`}>
      <div className="css-orb">
        <div className="css-orb-glow" style={{ opacity: active ? 1 : 0.5 }} />
        <div
          className="css-orb-core"
          style={{
            animationDuration: active ? '2.5s, 7s' : '4s, 12s',
            background: active
              ? `radial-gradient(ellipse at 38% 30%,
                  rgba(200,235,255,.9) 0%,
                  rgba(103,232,249,.75) 14%,
                  rgba(139,92,246,.75) 44%,
                  rgba(168,85,247,.6) 68%,
                  rgba(80,30,140,.4) 84%,
                  transparent 100%)`
              : `radial-gradient(ellipse at 38% 30%,
                  rgba(200,255,235,.85) 0%,
                  rgba(52,211,153,.7) 14%,
                  rgba(103,232,249,.65) 44%,
                  rgba(139,92,246,.5) 68%,
                  rgba(60,30,120,.35) 84%,
                  transparent 100%)`,
          }}
        >
          <div className="css-orb-ring" />
          <div className="css-orb-ring2" />
          <div className="css-orb-halo" />
        </div>
      </div>
    </div>
  )
}
