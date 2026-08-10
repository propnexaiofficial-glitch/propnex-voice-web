import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float } from '@react-three/drei'
import * as THREE from 'three'

const DATA = [0.38, 0.55, 0.48, 0.72, 0.64, 0.92, 0.78]

function NeonBar({ x, targetH, delay = 0, colorA = '#7c3aed', colorB = '#f472b6' }) {
  const mesh = useRef()
  const glow = useRef()
  const h = useRef(0.02)

  useFrame((state) => {
    const t = Math.max(0, state.clock.elapsedTime - delay)
    const goal = THREE.MathUtils.clamp(targetH, 0.08, 1.15)
    // ease grow then subtle pulse
    const grown = Math.min(1, t * 1.4)
    const ease = 1 - Math.pow(1 - grown, 3)
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 2.2 + x) * 0.03
    h.current = THREE.MathUtils.lerp(h.current, goal * ease * pulse, 0.12)

    const height = h.current
    mesh.current.scale.y = height
    mesh.current.position.y = height / 2
    glow.current.scale.y = height
    glow.current.position.y = height / 2
  })

  return (
    <group position={[x, 0, 0]}>
      <mesh ref={glow}>
        <boxGeometry args={[0.28, 1, 0.28]} />
        <meshBasicMaterial
          color={colorB}
          transparent
          opacity={0.22}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={mesh} castShadow>
        <boxGeometry args={[0.18, 1, 0.18]} />
        <meshStandardMaterial
          color={colorA}
          emissive={colorB}
          emissiveIntensity={1.4}
          metalness={0.35}
          roughness={0.25}
        />
      </mesh>
      {/* top cap glow */}
      <mesh position={[0, targetH + 0.02, 0]}>
        <boxGeometry args={[0.2, 0.04, 0.2]} />
        <meshBasicMaterial color="#fce7f3" toneMapped={false} />
      </mesh>
    </group>
  )
}

function SparkParticles({ count = 60 }) {
  const ref = useRef()
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 3.2
      arr[i * 3 + 1] = Math.random() * 1.4
      arr[i * 3 + 2] = (Math.random() - 0.5) * 1.2
    }
    return arr
  }, [count])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const pos = ref.current.geometry.attributes.position.array
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 1] += 0.004 + (i % 5) * 0.0006
      if (pos[i * 3 + 1] > 1.5) pos[i * 3 + 1] = 0
      pos[i * 3] += Math.sin(t + i) * 0.001
    }
    ref.current.geometry.attributes.position.needsUpdate = true
    ref.current.rotation.y = t * 0.05
  })

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#e879f9"
        transparent
        opacity={0.75}
        depthWrite={false}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

function GridFloor() {
  return (
    <gridHelper
      args={[6, 12, '#4c1d95', '#1e1b4b']}
      position={[0, 0.001, 0]}
    />
  )
}

function ChartScene() {
  const group = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime
    group.current.rotation.y = Math.sin(t * 0.35) * 0.18
    group.current.rotation.x = 0.28 + Math.sin(t * 0.4) * 0.04
  })

  const spacing = 0.38
  const start = -((DATA.length - 1) * spacing) / 2

  return (
    <group ref={group} position={[0, -0.35, 0]}>
      <GridFloor />
      <SparkParticles />
      <Float speed={1.2} floatIntensity={0.15} rotationIntensity={0}>
        {DATA.map((h, i) => (
          <NeonBar
            key={i}
            x={start + i * spacing}
            targetH={h * 1.15}
            delay={0.15 + i * 0.1}
            colorA={i % 2 === 0 ? '#7c3aed' : '#a855f7'}
            colorB={i % 2 === 0 ? '#f472b6' : '#fb7185'}
          />
        ))}
      </Float>
      {/* Ambient neon plane under bars */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <planeGeometry args={[3.4, 1.6]} />
        <meshBasicMaterial
          color="#a855f7"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

export default function Chart3D({ className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [0, 1.4, 3.4], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.35} />
        <pointLight position={[2, 3, 2]} intensity={1.4} color="#e879f9" />
        <pointLight position={[-2, 2, 1]} intensity={0.8} color="#67e8f9" />
        <Suspense fallback={null}>
          <ChartScene />
        </Suspense>
      </Canvas>
    </div>
  )
}
