import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { ErrorBoundary } from '../../../../components/ErrorBoundary'

const auraVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const auraFragment = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.05;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float r = length(uv);
    float angle = atan(uv.y, uv.x);

    float swirl = fbm(uv * 1.8 + vec2(cos(angle + uTime * 0.35), sin(angle - uTime * 0.3)) * 0.45);
    float pulse = 0.6 + 0.4 * sin(uTime * 1.8 + swirl * 4.0);

    vec3 cyan = vec3(0.0, 0.82, 1.0);
    vec3 violet = vec3(0.55, 0.28, 0.98);
    vec3 col = mix(cyan, violet, swirl * 0.65 + 0.2);

    float core = smoothstep(0.42, 0.0, r);
    float glow = pow(max(0.0, 1.0 - r), 2.8);
    float alpha = (core * 0.55 + glow * 0.5) * uIntensity * (0.7 + pulse * 0.2);
    alpha *= smoothstep(0.92, 0.28, r);

    gl_FragColor = vec4(col, alpha);
  }
`

function SoftAura({ intensity = 1 }) {
  const mat = useRef()
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: intensity },
    }),
    [intensity],
  )

  useFrame((state) => {
    if (!mat.current) return
    mat.current.uniforms.uTime.value = state.clock.elapsedTime
    mat.current.uniforms.uIntensity.value =
      intensity * (0.9 + Math.sin(state.clock.elapsedTime * 2) * 0.1)
  })

  return (
    <mesh scale={1.85} position={[0, 0, -0.4]}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={auraVertex}
        fragmentShader={auraFragment}
        uniforms={uniforms}
      />
    </mesh>
  )
}

function WireOrb({ active }) {
  const ref = useRef()
  const ring = useRef()

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (!ref.current || !ring.current) return
    ref.current.rotation.y = t * 0.35
    ref.current.rotation.x = Math.sin(t * 0.45) * 0.25
    const s = (active ? 0.72 : 0.64) + Math.sin(t * 2.2) * 0.025
    ref.current.scale.setScalar(s)
    ring.current.rotation.z = t * 0.4
    ring.current.rotation.x = Math.PI / 2.4 + Math.sin(t * 0.5) * 0.08
  })

  return (
    <group>
      <mesh ref={ref}>
        <icosahedronGeometry args={[0.48, 1]} />
        <meshStandardMaterial
          color="#7dd3fc"
          emissive="#22d3ee"
          emissiveIntensity={1.15}
          roughness={0.2}
          metalness={0.55}
          wireframe
        />
      </mesh>
      <mesh ref={ring}>
        <torusGeometry args={[0.78, 0.008, 16, 120]} />
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.55} />
      </mesh>
      <mesh rotation={[Math.PI / 3, 0.4, 0]}>
        <torusGeometry args={[0.92, 0.004, 12, 100]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.28} />
      </mesh>
    </group>
  )
}

function OrbitParticles({ count = 48 }) {
  const ref = useRef()
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const a = (i / count) * Math.PI * 2
      const r = 1.05 + (i % 5) * 0.08
      arr[i * 3] = Math.cos(a) * r
      arr[i * 3 + 1] = Math.sin(a * 1.7) * 0.35
      arr[i * 3 + 2] = Math.sin(a) * r * 0.55
    }
    return arr
  }, [count])

  useFrame((state) => {
    if (!ref.current) return
    ref.current.rotation.y = state.clock.elapsedTime * 0.18
    ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.3) * 0.12
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
        size={0.028}
        color="#67e8f9"
        transparent
        opacity={0.85}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

export default function HeroScene({
  className = '',
  active = true,
}) {
  return (
    <div
      className={`relative ${className}`}
      style={{
        WebkitMaskImage:
          'radial-gradient(ellipse 60% 58% at 50% 58%, #000 40%, transparent 76%)',
        maskImage:
          'radial-gradient(ellipse 60% 58% at 50% 58%, #000 40%, transparent 76%)',
      }}
    >
      <ErrorBoundary>
        <Canvas
          dpr={[1, 1.2]}
          camera={{ position: [0, -0.15, 3.2], fov: 38 }}
          gl={{ antialias: false, alpha: true, premultipliedAlpha: false, powerPreference: 'high-performance' }}
          style={{ background: 'transparent' }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0)
          }}
        >
          <ambientLight intensity={0.45} />
          <pointLight position={[2.2, 1.8, 2.5]} intensity={1.1} color="#67e8f9" />
          <pointLight position={[-2, -1.2, 1.8]} intensity={0.7} color="#a78bfa" />
          <Suspense fallback={null}>
            <SoftAura intensity={active ? 1.05 : 0.75} />
            <WireOrb active={active} />
            <OrbitParticles />
          </Suspense>
        </Canvas>
      </ErrorBoundary>
    </div>
  )
}
