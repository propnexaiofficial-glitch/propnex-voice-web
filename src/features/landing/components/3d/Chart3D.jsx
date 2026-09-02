import '../../css-animations.css'

// Heights for the 7 bars (38%, 55%, 48%, 72%, 64%, 92%, 78%)
const BAR_HEIGHTS = [38, 55, 48, 72, 64, 92, 78]

export default function Chart3D({ className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <div className="css-chart">
        {BAR_HEIGHTS.map((h, i) => (
          <div
            key={i}
            className="css-bar"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  )
}
