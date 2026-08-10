import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, Line, Grid, Float } from '@react-three/drei'
import * as THREE from 'three'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'

/** Isometric-ish layout matching LiveKit stack diagram */
const NODES = [
  { id: 'media', label: 'Media server', pos: [-1.2, 0.15, -2.8], tone: '#67e8f9', logo: 'server' },
  { id: 'agent', label: 'Agent server', pos: [1.4, 0.15, -2.6], tone: '#67e8f9', logo: 'agent' },
  { id: 'cloud', label: 'PropNex Cloud', pos: [0.1, 0.2, -1.4], tone: '#22d3ee', logo: 'cloud', wide: true },
  { id: 'webrtc', label: 'WebRTC', pos: [-2.2, 0.12, -0.6], tone: '#a5f3fc', logo: 'webrtc' },
  { id: 'sdk', label: 'SDKs', pos: [-3.4, 0.12, 0.6], tone: '#a5f3fc', logo: 'swift' },
  { id: 'io', label: 'I/O', pos: [-4.2, 0.12, 1.8], tone: '#67e8f9', logo: 'mic' },
  { id: 'noise', label: 'Noise cancellation', pos: [-1.6, 0.12, 0.9], tone: '#c4b5fd', logo: 'noise' },
  { id: 'stt', label: 'STT', pos: [-0.2, 0.12, 1.6], tone: '#c4b5fd', logo: 'deepgram' },
  { id: 'turn', label: 'Semantic turn detection', pos: [1.6, 0.12, 1.1], tone: '#ddd6fe', logo: 'brain', wide: true },
  { id: 'llm', label: 'LLM', pos: [3.0, 0.15, 0.2], tone: '#f0abfc', logo: 'openai' },
  { id: 'tts', label: 'TTS', pos: [2.6, 0.12, -1.0], tone: '#f0abfc', logo: 'tts' },
  { id: 'logic', label: 'CUSTOM BUSINESS LOGIC', pos: [4.2, 0.05, -1.6], tone: '#22d3ee', logo: 'chip', chip: true },
  { id: 'http', label: 'HTTP / Webhooks', pos: [3.6, 0.12, 1.5], tone: '#a5f3fc', logo: 'webhook', wide: true },
]

const LINKS = [
  ['io', 'sdk'],
  ['sdk', 'webrtc'],
  ['webrtc', 'cloud'],
  ['cloud', 'media'],
  ['cloud', 'agent'],
  ['agent', 'tts'],
  ['tts', 'llm'],
  ['llm', 'turn'],
  ['turn', 'stt'],
  ['stt', 'noise'],
  ['noise', 'cloud'],
  ['agent', 'logic'],
  ['logic', 'http'],
  ['http', 'turn'],
]

const nodeMap = Object.fromEntries(NODES.map((n) => [n.id, n]))

function NodeLogo({ type, size = 14 }) {
  const s = { width: size, height: size, viewBox: '0 0 24 24', className: 'shrink-0' }
  switch (type) {
    case 'swift':
      return (
        <svg {...s} aria-label="Swift">
          <path
            fill="#F05138"
            d="M17.5 4.5c-2.5 3.5-7 7.5-12 9.5 2.2-.3 4.2-.2 6 .6-3.2 1.2-6.2 1-8.5.2 3.8 3.2 9.2 4.2 13.8 1.8 3.2-1.7 5.2-4.8 5.4-8.3-1.4 1-3 1.6-4.7 1.7 2.2-1.5 3.6-3.6 4-6-.1.1-2.2.8-4 1.5z"
          />
        </svg>
      )
    case 'webrtc':
      return (
        <svg {...s} aria-label="WebRTC">
          <circle cx="12" cy="8" r="3.2" fill="#F7DF1E" />
          <circle cx="7.2" cy="15.2" r="3.2" fill="#34A853" />
          <circle cx="16.8" cy="15.2" r="3.2" fill="#4285F4" />
          <path
            d="M12 11.2l-2.8 2.4M12 11.2l2.8 2.4M7.2 15.2h9.6"
            stroke="#111"
            strokeWidth="1.2"
            fill="none"
          />
        </svg>
      )
    case 'openai':
      return (
        <svg {...s} aria-label="OpenAI" fill="#fff">
          <path d="M22.3 10.2a5.4 5.4 0 00-.9-5.1 5.5 5.5 0 00-6-2.4A5.5 5.5 0 008.2 1a5.5 5.5 0 00-4.7 4.7 5.4 5.4 0 00-3.6 4 5.5 5.5 0 00.9 5.1 5.4 5.4 0 00.9 5.1 5.5 5.5 0 006 2.4A5.5 5.5 0 0015.8 23a5.5 5.5 0 004.7-4.7 5.4 5.4 0 003.6-4 5.5 5.5 0 00-1.8-4.1zM15.8 21.4a4 4 0 01-2.6-1l.1-.1 4.1-2.4a.7.7 0 00.3-.6v-5.7l1.8 1v5.3a4.1 4.1 0 01-3.7 4.5zm-9.2-1.1a4 4 0 01-.5-2.8l.1.1 4.1 2.4a.7.7 0 00.7 0l5-2.9v2.1l-4.2 2.4a4.1 4.1 0 01-5.2-.2zm-1.2-9.7a4 4 0 012.1-1.8v5.7a.7.7 0 00.3.6l5 2.9-1.8 1-4.2-2.4a4.1 4.1 0 01-1.4-5.9zm15.2 1.8l-4.1-2.4a.7.7 0 00-.7 0l-5 2.9V11l4.2-2.4a4.1 4.1 0 016.6 4.2l-.1.1-.9.5zM9.3 8.1l1.8-1 4.2 2.4a.7.7 0 00.7 0l4.1-2.4.1.1a4.1 4.1 0 01-6.6 1.6L9.3 8.1z" />
        </svg>
      )
    case 'deepgram':
      return (
        <svg {...s} aria-label="Deepgram" viewBox="0 0 24 24">
          <rect width="24" height="24" rx="6" fill="#13EF93" />
          <path
            d="M7 16V8h3.2c2.2 0 3.6 1.2 3.6 3.1S12.4 14.2 10.2 14.2H9.2V16H7zm2.2-3.6h.9c.9 0 1.5-.5 1.5-1.3s-.6-1.3-1.5-1.3h-.9v2.6zM15.2 16l2.6-8h2.3l2.6 8h-2.2l-.4-1.4h-2.3L17.4 16h-2.2zm3.2-3h1.4l-.7-2.3-.7 2.3z"
            fill="#0a0a0a"
          />
        </svg>
      )
    case 'mic':
      return (
        <svg {...s} fill="none" stroke="#67e8f9" strokeWidth="1.8">
          <path d="M12 3a3 3 0 00-3 3v5a3 3 0 006 0V6a3 3 0 00-3-3z" />
          <path d="M19 11a7 7 0 01-14 0M12 18v3" strokeLinecap="round" />
        </svg>
      )
    case 'cloud':
      return (
        <svg {...s} fill="none" stroke="#22d3ee" strokeWidth="1.8">
          <path d="M18 18H7a4 4 0 01-.5-8 5.5 5.5 0 0110.3-1.7A3.5 3.5 0 0118 18z" />
        </svg>
      )
    case 'server':
      return (
        <svg {...s} fill="none" stroke="#67e8f9" strokeWidth="1.7">
          <rect x="3" y="4" width="18" height="6" rx="1.5" />
          <rect x="3" y="14" width="18" height="6" rx="1.5" />
          <circle cx="7" cy="7" r="1" fill="#67e8f9" stroke="none" />
          <circle cx="7" cy="17" r="1" fill="#67e8f9" stroke="none" />
        </svg>
      )
    case 'agent':
      return (
        <svg {...s} fill="none" stroke="#67e8f9" strokeWidth="1.7">
          <rect x="5" y="8" width="14" height="10" rx="2" />
          <path d="M12 4v4M9 13h.01M15 13h.01M9 17h6" strokeLinecap="round" />
        </svg>
      )
    case 'noise':
      return (
        <svg {...s} fill="none" stroke="#c4b5fd" strokeWidth="1.8">
          <path d="M3 12c2-4 4-4 6 0s4 4 6 0 4-4 6 0" strokeLinecap="round" />
          <path d="M4 18l16-12" stroke="#f472b6" strokeWidth="1.4" />
        </svg>
      )
    case 'brain':
      return (
        <svg {...s} fill="none" stroke="#ddd6fe" strokeWidth="1.6">
          <path d="M9 6a3 3 0 015.8-1A3.5 3.5 0 0118 8.5V12a3 3 0 01-1 2.2V18a2 2 0 01-2 2h-1v-5H10v5H9a2 2 0 01-2-2v-3.8A3 3 0 016 12V9a3 3 0 013-3z" />
        </svg>
      )
    case 'tts':
      return (
        <svg {...s} fill="none" stroke="#f0abfc" strokeWidth="1.7">
          <path d="M11 5L6 9H3v6h3l5 4V5zM16 9a4 4 0 010 6M18.5 7a7 7 0 010 10" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )
    case 'webhook':
      return (
        <svg {...s} fill="none" stroke="#a5f3fc" strokeWidth="1.7">
          <path d="M10 13a5 5 0 007.5.5l2-2a5 5 0 00-7-7l-1.2 1.1" strokeLinecap="round" />
          <path d="M14 11a5 5 0 00-7.5-.5l-2 2a5 5 0 007 7l1.1-1.1" strokeLinecap="round" />
        </svg>
      )
    case 'chip':
      return (
        <svg {...s} fill="none" stroke="#22d3ee" strokeWidth="1.6">
          <rect x="7" y="7" width="10" height="10" rx="1.5" />
          <path d="M9 3v4M12 3v4M15 3v4M9 17v4M12 17v4M15 17v4M3 9h4M3 12h4M3 15h4M17 9h4M17 12h4M17 15h4" strokeLinecap="round" />
        </svg>
      )
    default:
      return null
  }
}

function WorldDots() {
  const positions = useMemo(() => {
    const pts = []
    // Rough continents as point clusters
    const blobs = [
      [-2.5, -0.8, 80],
      [0.5, -1.2, 60],
      [2.2, 0.4, 70],
      [-1.0, 1.5, 50],
      [1.8, -2.0, 40],
    ]
    for (const [cx, cz, n] of blobs) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2
        const r = Math.random() ** 0.6 * 1.4
        pts.push(cx + Math.cos(a) * r, 0.02, cz + Math.sin(a) * r * 0.7)
      }
    }
    return new Float32Array(pts)
  }, [])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#67e8f9"
        size={0.035}
        transparent
        opacity={0.28}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  )
}

function Pulse({ from, to, delay = 0, color = '#67e8f9' }) {
  const ref = useRef()
  const curve = useMemo(() => {
    const a = new THREE.Vector3(...from)
    const b = new THREE.Vector3(...to)
    const mid = a.clone().lerp(b, 0.5)
    mid.y += 0.35 + Math.random() * 0.2
    return new THREE.QuadraticBezierCurve3(a, mid, b)
  }, [from, to])

  useFrame((state) => {
    const t = ((state.clock.elapsedTime * 0.16 + delay) % 1)
    const p = curve.getPoint(t)
    ref.current.position.copy(p)
    ref.current.scale.setScalar(0.7 + Math.sin(t * Math.PI) * 0.5)
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.06, 12, 12]} />
      <meshBasicMaterial color={color} transparent opacity={0.95} />
    </mesh>
  )
}

function Connector({ a, b }) {
  const points = useMemo(() => {
    const from = new THREE.Vector3(...a)
    const to = new THREE.Vector3(...b)
    const mid = from.clone().lerp(to, 0.5)
    mid.y += 0.25
    return [from, mid, to]
  }, [a, b])

  return (
    <>
      <Line
        points={points}
        color="#94a3b8"
        lineWidth={1}
        transparent
        opacity={0.35}
      />
      <Line
        points={points}
        color="#67e8f9"
        lineWidth={1.2}
        transparent
        opacity={0.25}
        dashed
        dashSize={0.12}
        gapSize={0.18}
      />
    </>
  )
}

function StackNode({ node }) {
  const mesh = useRef()
  const w = node.chip ? 1.15 : node.wide ? 0.45 : 0.32
  const d = node.chip ? 0.85 : 0.28
  const h = node.chip ? 0.06 : 0.02

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!mesh.current) return
    mesh.current.position.y =
      node.pos[1] + Math.sin(t * 0.7 + node.pos[0]) * 0.04
  })

  return (
    <group position={node.pos}>
      {/* Tiny floor marker — open LiveKit style, no heavy cards */}
      <mesh ref={mesh} castShadow>
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color="#0a0e14"
          emissive={node.tone}
          emissiveIntensity={node.chip ? 0.2 : 0.08}
          metalness={0.5}
          roughness={0.45}
          transparent
          opacity={node.chip ? 0.9 : 0.28}
        />
      </mesh>

      {node.chip && (
        <group position={[0, 0.08, 0]}>
          {Array.from({ length: 20 }).map((_, i) => {
            const x = ((i % 5) - 2) * 0.16
            const z = (Math.floor(i / 5) - 1.5) * 0.16
            return (
              <mesh key={i} position={[x, 0, z]}>
                <boxGeometry args={[0.07, 0.025, 0.07]} />
                <meshBasicMaterial
                  color="#22d3ee"
                  transparent
                  opacity={0.4 + (i % 3) * 0.12}
                />
              </mesh>
            )
          })}
        </group>
      )}

      <Html
        center
        style={{ pointerEvents: 'none', userSelect: 'none' }}
        position={[0, node.chip ? 0.28 : 0.14, 0]}
      >
        <div
          className={`flex items-center gap-1 whitespace-nowrap ${
            node.chip ? 'flex-col gap-0.5' : ''
          }`}
          style={{
            filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.95))',
          }}
        >
          <NodeLogo type={node.logo} size={12} />
          <span
            className={`font-medium tracking-tight text-white/85 ${
              node.chip
                ? 'uppercase tracking-[0.12em] text-cyan-200/85'
                : ''
            }`}
            style={{ fontSize: '12px', lineHeight: 1.25 }}
          >
            {node.label}
          </span>
        </div>
      </Html>
    </group>
  )
}

function CameraRig() {
  useFrame((state) => {
    const t = state.clock.elapsedTime * 0.15
    state.camera.position.x = 7.5 + Math.sin(t) * 0.55
    state.camera.position.z = 7.5 + Math.cos(t) * 0.55
    state.camera.position.y = 6.2 + Math.sin(t * 0.7) * 0.15
    state.camera.lookAt(0.2, 0, 0)
  })
  return null
}

function Scene() {
  return (
    <>
      <CameraRig />
      <fog attach="fog" args={['#000000', 12, 24]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 8, 3]} intensity={1.1} color="#e0f2fe" />
      <pointLight position={[-3, 4, 2]} intensity={0.8} color="#22d3ee" />
      <pointLight position={[4, 3, -2]} intensity={0.6} color="#a855f7" />

      <Grid
        position={[0, 0, 0]}
        args={[16, 16]}
        cellSize={0.5}
        cellThickness={0.45}
        cellColor="#1e293b"
        sectionSize={2}
        sectionThickness={0.8}
        sectionColor="#334155"
        fadeDistance={16}
        fadeStrength={1.4}
        infiniteGrid
      />

      <WorldDots />

      {/* Axis labels via Html */}
      <Html position={[-5.2, 0.1, 0]} style={{ pointerEvents: 'none' }}>
        <div
          className="origin-left -rotate-90 font-medium tracking-[0.28em] text-white/20"
          style={{ fontSize: '11px' }}
        >
          AGENTS FRAMEWORK
        </div>
      </Html>
      <Html position={[0, 0.05, 3.6]} center style={{ pointerEvents: 'none' }}>
        <div
          className="font-medium tracking-[0.28em] text-white/20"
          style={{ fontSize: '11px' }}
        >
          REALTIME MEDIA
        </div>
      </Html>

      {LINKS.map(([a, b], i) => (
        <group key={`${a}-${b}`}>
          <Connector a={nodeMap[a].pos} b={nodeMap[b].pos} />
          <Pulse
            from={nodeMap[a].pos}
            to={nodeMap[b].pos}
            delay={i * 0.12}
            color={i % 2 === 0 ? '#67e8f9' : '#c084fc'}
          />
        </group>
      ))}

      <Float speed={0.8} rotationIntensity={0} floatIntensity={0.15}>
        {NODES.map((n) => (
          <StackNode key={n.id} node={n} />
        ))}
      </Float>
    </>
  )
}

export default function IsometricStackDiagram() {
  const wrap = useRef(null)

  useGSAP(
    () => {
      if (!wrap.current) return
      gsap.fromTo(
        wrap.current,
        { y: 16 },
        { y: 0, duration: 0.9, ease: 'power3.out' },
      )
    },
    { scope: wrap },
  )

  return (
    <div
      ref={wrap}
      className="relative h-[440px] w-full md:h-[540px] lg:h-[580px]"
    >
      <Canvas
        dpr={[1, 1.75]}
        camera={{
          position: [7.5, 6.2, 7.5],
          fov: 32,
          near: 0.1,
          far: 60,
        }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        onCreated={({ camera, gl }) => {
          camera.lookAt(0, 0, 0)
          gl.setClearColor(0x000000, 0)
        }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
