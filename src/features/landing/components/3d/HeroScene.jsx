import '../css-animations.css'

export default function HeroScene({ className = '', active = true }) {
  return (
    <div className={`relative ${className}`}>
      <div className="css-orb">
        <div
          className="css-orb-glow"
          style={{ opacity: active ? 1 : 0.6 }}
        />
        <div
          className="css-orb-core"
          style={{
            animationDuration: active ? '2.2s, 6s' : '3.5s, 10s',
            background: active
              ? 'radial-gradient(circle at 40% 35%, rgba(103,232,249,0.95) 0%, rgba(139,92,246,0.75) 45%, rgba(168,85,247,0.35) 75%, transparent 100%)'
              : 'radial-gradient(circle at 40% 35%, rgba(52,211,153,0.9) 0%, rgba(103,232,249,0.6) 45%, rgba(139,92,246,0.3) 75%, transparent 100%)',
          }}
        >
          <div className="css-orb-ring" />
          <div className="css-orb-ring2" />
        </div>
      </div>
    </div>
  )
}
