import { Suspense, useRef, useLayoutEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'

const EARTH_DAY =
  'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg'
const EARTH_NIGHT =
  'https://unpkg.com/three-globe/example/img/earth-night.jpg'
const EARTH_BUMP =
  'https://unpkg.com/three-globe/example/img/earth-topology.png'

function Stars() {
  const ref = useRef()
  const count = 1200
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const r = 18 + Math.random() * 22
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = r * Math.cos(phi)
  }

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.015
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
        size={0.06}
        color="#ffffff"
        transparent
        opacity={0.75}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

function EarthSphere() {
  const group = useRef()
  const [dayMap, nightMap, bumpMap] = useTexture([
    EARTH_DAY,
    EARTH_NIGHT,
    EARTH_BUMP,
  ])

  useLayoutEffect(() => {
    ;[dayMap, nightMap, bumpMap].forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace
      tex.anisotropy = 8
    })
  }, [dayMap, nightMap, bumpMap])

  useFrame((_, delta) => {
    if (group.current) group.current.rotation.y += delta * 0.22
  })

  return (
    <group ref={group} position={[2.4, -0.35, 0]} scale={2.15}>
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial
          map={dayMap}
          emissiveMap={nightMap}
          emissive="#ffb86a"
          emissiveIntensity={1.35}
          bumpMap={bumpMap}
          bumpScale={0.045}
          roughness={0.62}
          metalness={0.08}
        />
      </mesh>

      <mesh scale={1.05}>
        <sphereGeometry args={[1, 48, 48]} />
        <meshBasicMaterial
          color="#67e8f9"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <mesh scale={1.1}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#3b82f6"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.55} color="#b8d4ff" />
      <hemisphereLight
        args={['#7dd3fc', '#0a1628', 0.85]}
        position={[0, 1, 0]}
      />
      <directionalLight
        position={[7, 2, 5]}
        intensity={2.4}
        color="#fff4e0"
      />
      <directionalLight
        position={[-4, -1, 2]}
        intensity={0.35}
        color="#22d3ee"
      />
      <Stars />
      <EarthSphere />
    </>
  )
}

export default function PlanetHero3D({ className = '' }) {
  return (
    <div className={`pointer-events-none ${className}`}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0, 6.2], fov: 42 }}
        gl={{
          antialias: true,
          alpha: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.25,
        }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
