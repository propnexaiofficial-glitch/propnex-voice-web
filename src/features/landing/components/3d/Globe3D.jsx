import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Line } from '@react-three/drei'
import * as THREE from 'three'

function ParticleField({ count = 1800 }) {
  const points = useRef()
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const r = 1.35 + Math.random() * 0.35
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      arr[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      arr[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i * 3 + 2] = r * Math.cos(phi)
    }
    return arr
  }, [count])

  useFrame((state) => {
    points.current.rotation.y = state.clock.elapsedTime * 0.08
    points.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.15) * 0.12
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        color="#67e8f9"
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  )
}

function ArcLines() {
  const arcs = useMemo(() => {
    const make = (lat1, lon1, lat2, lon2) => {
      const toVec = (lat, lon) => {
        const phi = ((90 - lat) * Math.PI) / 180
        const theta = ((lon + 180) * Math.PI) / 180
        const r = 1.52
        return new THREE.Vector3(
          -r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta),
        )
      }
      const a = toVec(lat1, lon1)
      const b = toVec(lat2, lon2)
      const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(2.05)
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b)
      return curve.getPoints(40)
    }
    return [
      make(37, -122, 1.3, 103),
      make(51.5, -0.1, 35.6, 139),
      make(40.7, -74, 28.6, 77),
      make(48.8, 2.3, -33.8, 151),
      make(25.2, 55.2, 1.3, 103),
    ]
  }, [])

  return arcs.map((pts, i) => (
    <Line
      key={i}
      points={pts}
      color={i % 2 === 0 ? '#22d3ee' : '#c084fc'}
      lineWidth={1.2}
      transparent
      opacity={0.55}
    />
  ))
}

function CoreGlobe() {
  const mesh = useRef()
  useFrame((s) => {
    mesh.current.rotation.y = s.clock.elapsedTime * 0.12
  })
  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[1.35, 48, 48]} />
      <meshStandardMaterial
        color="#0b1220"
        emissive="#1e1b4b"
        emissiveIntensity={0.4}
        wireframe
        transparent
        opacity={0.35}
      />
    </mesh>
  )
}

export default function Globe3D({ className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.2, 4.2], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[4, 3, 5]} intensity={1.4} color="#67e8f9" />
        <pointLight position={[-3, -2, 2]} intensity={0.9} color="#a855f7" />
        <Suspense fallback={null}>
          <Float speed={1.2} rotationIntensity={0.2} floatIntensity={0.4}>
            <CoreGlobe />
            <ParticleField />
            <ArcLines />
          </Float>
        </Suspense>
      </Canvas>
    </div>
  )
}
