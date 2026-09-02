import '../../css-animations.css'

export default function AuraOrb({ className = '', intensity = 1 }) {
  return (
    <div className={`relative ${className}`}>
      <div className="css-orb">
        <div className="css-orb-glow" style={{ opacity: Math.min(intensity, 1) }} />
        <div className="css-orb-core">
          <div className="css-orb-ring" />
          <div className="css-orb-ring2" />
          <div className="css-orb-halo" />
        </div>
      </div>
    </div>
  )
}
