import { Suspense, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

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
  uniform vec3 uColorA;
  uniform vec3 uColorB;
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
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float r = length(uv);
    float angle = atan(uv.y, uv.x);

    float swirl = fbm(uv * 2.2 + vec2(cos(angle + uTime * 0.4), sin(angle - uTime * 0.35)) * 0.6);
    float pulse = 0.55 + 0.45 * sin(uTime * 2.2 + swirl * 6.0);
    float energy = fbm(uv * 3.5 + uTime * 0.25) * uIntensity;

    float core = smoothstep(0.55, 0.0, r);
    float ring = smoothstep(0.95, 0.35, r) * smoothstep(0.15, 0.55, r);
    float glow = pow(max(0.0, 1.0 - r), 2.2);

    vec3 col = mix(uColorA, uColorB, swirl * 0.7 + 0.3 * pulse);
    col += energy * 0.35;
    float alpha = (core * 0.95 + ring * 0.55 + glow * 0.4) * (0.65 + energy * 0.35);
    alpha *= smoothstep(1.05, 0.2, r);

    gl_FragColor = vec4(col, alpha);
  }
`

function AuraMesh({ intensity = 1, colorA = '#00d2ff', colorB = '#a855f7' }) {
  const mat = useRef()
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uIntensity: { value: intensity },
      uColorA: { value: new THREE.Color(colorA) },
      uColorB: { value: new THREE.Color(colorB) },
    }),
    [colorA, colorB, intensity],
  )

  useFrame((state) => {
    if (!mat.current) return
    mat.current.uniforms.uTime.value = state.clock.elapsedTime
    mat.current.uniforms.uIntensity.value =
      intensity * (0.85 + Math.sin(state.clock.elapsedTime * 2.4) * 0.15)
  })

  return (
    <mesh scale={2.15}>
      <planeGeometry args={[2, 2, 1, 1]} />
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        vertexShader={auraVertex}
        fragmentShader={auraFragment}
        uniforms={uniforms}
      />
    </mesh>
  )
}

function InnerOrb() {
  const ref = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime
    ref.current.scale.setScalar(0.55 + Math.sin(t * 2.5) * 0.04)
    ref.current.rotation.y = t * 0.4
    ref.current.rotation.x = Math.sin(t * 0.6) * 0.2
  })
  return (
    <mesh ref={ref}>
      <icosahedronGeometry args={[0.55, 1]} />
      <meshStandardMaterial
        color="#7dd3fc"
        emissive="#6366f1"
        emissiveIntensity={1.4}
        roughness={0.25}
        metalness={0.6}
        wireframe
      />
    </mesh>
  )
}

export default function AuraOrb({
  className = '',
  intensity = 1,
}) {
  return (
    <div className={`relative ${className}`}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 3.2], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
        }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[2, 2, 3]} intensity={1.2} color="#67e8f9" />
        <pointLight position={[-2, -1, 2]} intensity={0.8} color="#c084fc" />
        <Suspense fallback={null}>
          <AuraMesh intensity={intensity} />
          <InnerOrb />
        </Suspense>
      </Canvas>
    </div>
  )
}
