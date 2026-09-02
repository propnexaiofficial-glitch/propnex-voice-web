import { useMemo } from 'react'
import '../../css-animations.css'

export default function HeroScene({ className = '', active = true }) {
  // Generate random particles that will spin around the globe
  const particles = useMemo(() => {
    return Array.from({ length: 48 }).map((_, i) => {
      // Create random points on a sphere
      const theta = Math.random() * 2 * Math.PI
      const phi = Math.acos(Math.random() * 2 - 1)
      const r = 160 + Math.random() * 80 // Radius from center
      const x = r * Math.sin(phi) * Math.cos(theta)
      const y = r * Math.sin(phi) * Math.sin(theta)
      const z = r * Math.cos(phi)
      return { id: i, x, y, z, delay: Math.random() * -20 }
    })
  }, [])

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className="css-orb">
        <div className="css-orb-glow" style={{ opacity: active ? 1 : 0.5 }} />
        
        {/* Main wrapper holding the 55% width for the core and rings */}
        <div className="relative" style={{ width: '55%', aspectRatio: '1' }}>
          
          {/* The 3D Particles */}
          <div className="hero-particles" style={{ transformStyle: 'preserve-3d' }}>
            {particles.map((p) => (
              <div
                key={p.id}
                className="hero-particle"
                style={{
                  transform: `translate3d(${p.x}px, ${p.y}px, ${p.z}px)`,
                  animationDelay: `${p.delay}s`,
                  opacity: active ? 0.8 : 0.3
                }}
              />
            ))}
          </div>
  
          {/* Inner clipping core */}
          <div
            className="hero-orb-core"
            style={{ animationDuration: active ? '3.5s' : '5s' }}
          >
            {/* Wireframe Grid */}
            <div className="hero-orb-wireframe" style={{ opacity: active ? 1 : 0.6 }} />
          </div>
          
          {/* Orbital rings - outside the hidden overflow */}
          <div className="hero-ring-1" style={{ opacity: active ? 1 : 0.4 }} />
          <div className="hero-ring-2" style={{ opacity: active ? 1 : 0.4 }} />
        </div>
      </div>
    </div>
  )
}
