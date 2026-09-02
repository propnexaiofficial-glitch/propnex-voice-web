import { useEffect, useState } from 'react'
import '../../css-animations.css'

export function BarVisualizer3D({ className = '', active = true }) {
  return (
    <div className={`flex items-end justify-center gap-1.5 p-4 ${className}`}>
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="w-1.5 origin-bottom rounded-t-sm bg-gradient-to-t from-cyan-400 to-purple-500 shadow-[0_0_8px_rgba(34,211,238,0.4)]"
          style={{
            height: active ? `${30 + ((i * 37) % 70)}%` : '15%',
            animation: active
              ? `heroBar ${0.4 + (i % 5) * 0.1}s ease-in-out ${i * 0.05}s infinite alternate`
              : 'none',
            opacity: 0.6 + (i % 3) * 0.2,
          }}
        />
      ))}
    </div>
  )
}

export function RadialVisualizer3D({ className = '', active = true }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div 
        className="relative h-48 w-48 rounded-full border border-cyan-400/20"
        style={{
          animation: active ? 'spin-slow 20s linear infinite' : 'none'
        }}
      >
        <div className="absolute inset-0 rounded-full shadow-[inset_0_0_40px_rgba(34,211,238,0.2)]" />
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * 360;
          return (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 w-1 origin-bottom rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
              style={{
                height: active ? `${25 + (i % 4) * 15}px` : '20px',
                transform: `translate(-50%, -100%) rotate(${a}deg) translateY(-80px)`,
                animation: active
                  ? `pulse-glow ${0.5 + (i % 3) * 0.2}s ease-in-out ${i * 0.05}s infinite alternate`
                  : 'none',
              }}
            />
          )
        })}
      </div>
      <div className="absolute h-16 w-16 rounded-full bg-cyan-400/20 blur-xl" />
    </div>
  )
}

export function WaveVisualizer3D({ className = '', active = true }) {
  return (
    <div className={`flex items-center justify-center overflow-hidden ${className}`}>
      <div className="relative h-12 w-full max-w-sm">
        {Array.from({ length: 3 }).map((_, i) => (
          <svg
            key={i}
            className="absolute inset-0 h-full w-full"
            preserveAspectRatio="none"
            viewBox="0 0 100 20"
            style={{
              opacity: 0.4 + (i * 0.2),
              animation: active 
                ? `marquee-bg ${3 + i}s linear infinite alternate` 
                : 'none',
              strokeDasharray: '400',
              strokeDashoffset: active ? '0' : '400',
              transition: 'stroke-dashoffset 2s ease'
            }}
          >
            <path
              d={`M0 ${10 + i * 2} Q 25 ${5 - i * 3}, 50 ${10 + i * 2} T 100 ${10 + i * 2}`}
              fill="none"
              stroke={i === 2 ? '#a855f7' : '#22d3ee'}
              strokeWidth="1.5"
            />
          </svg>
        ))}
      </div>
    </div>
  )
}

export function useSimulatedSpeaking(period = 4200) {
  const [speaking, setSpeaking] = useState(true)
  useEffect(() => {
    const id = setInterval(() => setSpeaking((v) => !v), period)
    return () => clearInterval(id)
  }, [period])
  return speaking
}
