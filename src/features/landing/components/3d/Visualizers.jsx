import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useIsMobile } from '../../../hooks/useIsMobile'
import '../../css-animations.css'

function Bars({ count = 32, active = true }) {
  const group = useRef()
  const heights = useRef(new Float32Array(count).fill(0.2))

  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    for (let i = 0; i < count; i++) {
      const target = active
        ? 0.25 +
          Math.abs(Math.sin(t * 3.2 + i * 0.45)) * 0.9 +
          Math.abs(Math.sin(t * 5.1 + i * 0.2)) * 0.35
        : 0.18 + Math.sin(t + i) * 0.05
      heights.current[i] += (target - heights.current[i]) * 0.18
      const mesh = group.current.children[i]
      if (!mesh) continue
      mesh.scale.y = heights.current[i]
      mesh.position.y = heights.current[i] / 2 - 0.5
    }
  })

  const spacing = 0.12
  const start = -((count - 1) * spacing) / 2

  return (
    <group ref={group}>
      {Array.from({ length: count }).map((_, i) => (
        <mesh key={i} position={[start + i * spacing, 0, 0]}>
          <boxGeometry args={[0.08, 1, 0.08]} />
          <meshStandardMaterial
            color={i % 3 === 0 ? '#22d3ee' : i % 3 === 1 ? '#818cf8' : '#e879f9'}
            emissive={i % 2 === 0 ? '#06b6d4' : '#a855f7'}
            emissiveIntensity={0.7}
            roughness={0.3}
            metalness={0.4}
          />
        </mesh>
      ))}
    </group>
  )
}

function Radial({ bars = 48, active = true }) {
  const group = useRef()
  useFrame((state) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    group.current.rotation.z = t * 0.15
    group.current.children.forEach((child, i) => {
      const h = active
        ? 0.2 + Math.abs(Math.sin(t * 3 + i * 0.3)) * 0.7
        : 0.25
      child.scale.y = h
    })
  })

  return (
    <group ref={group}>
      {Array.from({ length: bars }).map((_, i) => {
        const a = (i / bars) * Math.PI * 2
        return (
          <mesh
            key={i}
            position={[Math.cos(a) * 0.9, Math.sin(a) * 0.9, 0]}
            rotation={[0, 0, a - Math.PI / 2]}
          >
            <boxGeometry args={[0.05, 1, 0.05]} />
            <meshStandardMaterial
              color="#67e8f9"
              emissive="#6366f1"
              emissiveIntensity={0.9}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function WaveRibbon({ active = true }) {
  const mesh = useRef()
  const geo = useMemo(() => new THREE.PlaneGeometry(3.2, 1.2, 64, 16), [])

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const z = active
        ? Math.sin(x * 3.5 + t * 3) * 0.18 + Math.sin(y * 4 + t * 2) * 0.08
        : Math.sin(x + t) * 0.05
      pos.setZ(i, z)
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
    mesh.current.rotation.x = -0.35
  })

  return (
    <mesh ref={mesh} geometry={geo}>
      <meshStandardMaterial
        color="#22d3ee"
        emissive="#7c3aed"
        emissiveIntensity={0.6}
        wireframe
        transparent
        opacity={0.85}
      />
    </mesh>
  )
}

export function BarVisualizer3D({ className = '', active = true }) {
  const isMobile = useIsMobile(768)

  if (isMobile) {
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

  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.2, 3.2], fov: 40 }}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[2, 2, 3]} intensity={1.2} color="#67e8f9" />
        <Bars active={active} />
      </Canvas>
    </div>
  )
}

export function RadialVisualizer3D({ className = '', active = true }) {
  const isMobile = useIsMobile(768)

  if (isMobile) {
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

  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 3.4], fov: 40 }}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[2, 2, 3]} intensity={1} color="#c084fc" />
        <Radial active={active} />
      </Canvas>
    </div>
  )
}

export function WaveVisualizer3D({ className = '', active = true }) {
  const isMobile = useIsMobile(768)

  if (isMobile) {
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

  return (
    <div className={className}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.4, 3.5], fov: 40 }}
        gl={{ alpha: true, antialias: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[1, 2, 3]} intensity={1.1} color="#67e8f9" />
        <WaveRibbon active={active} />
      </Canvas>
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
