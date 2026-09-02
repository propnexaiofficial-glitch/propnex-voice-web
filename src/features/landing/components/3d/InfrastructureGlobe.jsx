import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Line } from '@react-three/drei'
import * as THREE from 'three'

/** Rough lat/lon → sphere coords */
function latLonToVec(lat, lon, r = 1.42) {
  const phi = ((90 - lat) * Math.PI) / 180
  const theta = ((lon + 180) * Math.PI) / 180
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta),
  )
}

const MARKERS = [
  { lat: 37.7, lon: -122.4 }, // US West
  { lat: 40.7, lon: -74 }, // US East
  { lat: 51.5, lon: -0.1 }, // UK
  { lat: 48.8, lon: 2.3 }, // France
  { lat: 52.5, lon: 13.4 }, // Germany
  { lat: 28.6, lon: 77.2 }, // India
  { lat: 1.3, lon: 103.8 }, // Singapore
  { lat: 35.6, lon: 139.7 }, // Japan
  { lat: -33.8, lon: 151.2 }, // Australia
  { lat: 25.2, lon: 55.3 }, // UAE
  { lat: -23.5, lon: -46.6 }, // Brazil
  { lat: 32.0, lon: 34.8 }, // Israel
]

function ContinentDots({ count = 3200 }) {
  const points = useRef()
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const c = new THREE.Color('#8b9cb3')
    for (let i = 0; i < count; i++) {
      // Bias toward equatorial "land-like" bands for a globe feel
      const lat = (Math.random() * 140 - 70) * (0.55 + Math.random() * 0.45)
      const lon = Math.random() * 360 - 180
      const jitter = 0.02 * Math.random()
      const v = latLonToVec(lat, lon, 1.38 + jitter)
      pos[i * 3] = v.x
      pos[i * 3 + 1] = v.y
      pos[i * 3 + 2] = v.z
      const shade = 0.55 + Math.random() * 0.45
      col[i * 3] = c.r * shade
      col[i * 3 + 1] = c.g * shade
      col[i * 3 + 2] = c.b * shade
    }
    return { positions: pos, colors: col }
  }, [count])

  useFrame((state) => {
    if (!points.current) return
    points.current.rotation.y = state.clock.elapsedTime * 0.07
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.016}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  )
}

function RegionMarkers() {
  const group = useRef()
  useFrame((state) => {
    if (!group.current) return
    group.current.rotation.y = state.clock.elapsedTime * 0.07
    group.current.children.forEach((child, i) => {
      const pulse = 0.85 + Math.sin(state.clock.elapsedTime * 2.4 + i) * 0.2
      child.scale.setScalar(pulse)
    })
  })

  return (
    <group ref={group}>
      {MARKERS.map((m, i) => {
        const p = latLonToVec(m.lat, m.lon, 1.45)
        return (
          <mesh key={i} position={p}>
            <boxGeometry args={[0.07, 0.07, 0.07]} />
            <meshBasicMaterial color="#22d3ee" toneMapped={false} />
          </mesh>
        )
      })}
    </group>
  )
}

function ArcLines() {
  const arcs = useMemo(() => {
    const pairs = [
      [0, 2],
      [1, 4],
      [2, 5],
      [5, 6],
      [6, 7],
      [7, 8],
      [3, 9],
      [1, 10],
    ]
    return pairs.map(([a, b]) => {
      const A = latLonToVec(MARKERS[a].lat, MARKERS[a].lon, 1.45)
      const B = latLonToVec(MARKERS[b].lat, MARKERS[b].lon, 1.45)
      const mid = A.clone().add(B).multiplyScalar(0.5).normalize().multiplyScalar(2.0)
      return new THREE.QuadraticBezierCurve3(A, mid, B).getPoints(28)
    })
  }, [])

  const group = useRef()
  useFrame((s) => {
    if (group.current) group.current.rotation.y = s.clock.elapsedTime * 0.07
  })

  return (
    <group ref={group}>
      {arcs.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color="#22d3ee"
          lineWidth={1}
          transparent
          opacity={0.35}
        />
      ))}
    </group>
  )
}

function WireSphere() {
  const mesh = useRef()
  useFrame((s) => {
    if (mesh.current) mesh.current.rotation.y = s.clock.elapsedTime * 0.07
  })
  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1.36, 48, 48]} />
      <meshBasicMaterial color="#1e293b" wireframe transparent opacity={0.12} />
    </mesh>
  )
}

export default function InfrastructureGlobe({ className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Canvas
        dpr={[1, 1.6]}
        // Adjusted camera z from 4.1 to 4.9 to fit the globe completely and prevent vertical clipping
        camera={{ position: [0, 0.15, 4.9], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.4} />
        <pointLight position={[3, 2, 4]} intensity={0.8} color="#67e8f9" />
        <Suspense fallback={null}>
          <Float speed={0.9} rotationIntensity={0.05} floatIntensity={0.25}>
            <WireSphere />
            <ContinentDots />
            <RegionMarkers />
            <ArcLines />
          </Float>
        </Suspense>
      </Canvas>
    </div>
  )
}
