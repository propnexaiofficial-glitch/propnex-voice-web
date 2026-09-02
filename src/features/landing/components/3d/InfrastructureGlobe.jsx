import '../../css-animations.css'

// 12 nodes placed roughly on a globe using % positions
const NODES = [
  { top: '28%', left: '18%', delay: '0s'   },   // US West
  { top: '30%', left: '25%', delay: '0.4s' },   // US East
  { top: '22%', left: '47%', delay: '0.8s' },   // UK
  { top: '23%', left: '50%', delay: '1.2s' },   // France
  { top: '21%', left: '53%', delay: '0.2s' },   // Germany
  { top: '38%', left: '63%', delay: '1.6s' },   // India
  { top: '42%', left: '74%', delay: '0.6s' },   // Singapore
  { top: '30%', left: '78%', delay: '1.0s' },   // Japan
  { top: '65%', left: '72%', delay: '1.4s' },   // Australia
  { top: '38%', left: '57%', delay: '0.9s' },   // UAE
  { top: '62%', left: '36%', delay: '1.8s' },   // Brazil
  { top: '30%', left: '56%', delay: '0.3s' },   // Israel
]

// Arc lines connecting some nodes
const ARCS = [
  { fromTop: '28%', fromLeft: '18%', toTop: '22%', toLeft: '47%', w: '30%', angle: -10 },
  { fromTop: '22%', fromLeft: '47%', toTop: '38%', toLeft: '63%', w: '18%', angle: 20 },
  { fromTop: '38%', fromLeft: '63%', toTop: '42%', toLeft: '74%', w: '12%', angle: 5 },
  { fromTop: '30%', fromLeft: '25%', toTop: '62%', toLeft: '36%', w: '12%', angle: 60 },
  { fromTop: '38%', fromLeft: '63%', toTop: '65%', toLeft: '72%', w: '16%', angle: 50 },
]

export default function InfrastructureGlobe({ className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <div className="css-globe">
        <div className="css-globe-sphere">
          {/* Latitude rings */}
          {[80, 60, 40, 20].map((s) => (
            <div
              key={s}
              className="css-globe-lat"
              style={{ width: `${s}%`, height: `${s}%` }}
            />
          ))}

          {/* Longitude ovals — tilted */}
          <div className="css-globe-lon" style={{ width: '100%', height: '40%', '--dur': '22s' }} />
          <div className="css-globe-lon" style={{ width: '100%', height: '40%', '--dur': '18s', '--dir': 'reverse', transform: 'translate(-50%,-50%) rotate(60deg)' }} />
          <div className="css-globe-lon" style={{ width: '100%', height: '40%', '--dur': '26s', transform: 'translate(-50%,-50%) rotate(120deg)' }} />

          {/* Arc connector lines */}
          {ARCS.map((a, i) => (
            <div
              key={i}
              className="css-arc-line"
              style={{
                top: a.fromTop, left: a.fromLeft,
                width: a.w,
                transform: `rotate(${a.angle}deg)`,
              }}
            />
          ))}

          {/* Region nodes */}
          {NODES.map((n, i) => (
            <div
              key={i}
              className="css-globe-node"
              style={{ top: n.top, left: n.left, '--ping-delay': n.delay }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
