import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useIsMobile } from '../../../../hooks/useIsMobile'

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform float uTime;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorC;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
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
    mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 6; i++) {
      v += a * noise(p);
      p = m * p;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float r = length(uv);

    // Soft cloudy swirl — LiveKit Cove style
    vec2 p = uv * 1.8;
    float t = uTime * 0.3;
    float n1 = fbm(p + vec2(t * 0.7, -t * 0.4));
    float n2 = fbm(p * 1.4 + vec2(-t * 0.5, t * 0.6) + n1);
    float n3 = fbm(p * 0.9 - vec2(t * 0.3, t * 0.5) + n2 * 0.8);

    vec3 col = mix(uColorA, uColorB, n2);
    col = mix(col, uColorC, n3 * 0.65);
    col = mix(col, vec3(1.0), smoothstep(0.55, 0.95, n1) * 0.45);

    float alpha = smoothstep(1.02, 0.72, r);
    // Soft vignette inside circle
    float soft = mix(0.75, 1.0, 1.0 - smoothstep(0.0, 0.85, r));
    col *= soft;

    gl_FragColor = vec4(col, alpha);
  }
`

function CoveCloud({ colors }) {
  const mat = useRef()
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColorA: { value: new THREE.Color(colors[0]) },
      uColorB: { value: new THREE.Color(colors[1]) },
      uColorC: { value: new THREE.Color(colors[2]) },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [colors[0], colors[1], colors[2]],
  )

  useFrame((state) => {
    if (!mat.current) return
    mat.current.uniforms.uTime.value = state.clock.elapsedTime
    mat.current.uniforms.uColorA.value.set(colors[0])
    mat.current.uniforms.uColorB.value.set(colors[1])
    mat.current.uniforms.uColorC.value.set(colors[2])
  })

  return (
    <mesh scale={2.05}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
      />
    </mesh>
  )
}

export default function CoveOrb({
  className = '',
  colors = ['#7eb8ff', '#3b82f6', '#e8f3ff'],
}) {
  const isMobile = useIsMobile(768)

  if (isMobile) {
    return (
      <div 
        className={`overflow-hidden rounded-full ${className}`}
        style={{
          background: `radial-gradient(circle at 45% 45%, ${colors[2]} 0%, ${colors[0]} 40%, ${colors[1]} 80%, #000 100%)`,
          boxShadow: `inset -10px -10px 40px rgba(0,0,0,0.5), inset 10px 10px 40px ${colors[2]}`,
          animation: 'cove-orb-float 6s ease-in-out infinite alternate'
        }}
      >
        <div 
          className="h-full w-full opacity-60 mix-blend-overlay"
          style={{
            background: `radial-gradient(circle at 75% 25%, #ffffff 0%, transparent 40%)`,
            animation: 'cove-orb-shine 4s ease-in-out infinite alternate'
          }}
        />
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes cove-orb-float {
            0% { transform: scale(0.95) rotate(0deg); }
            100% { transform: scale(1.05) rotate(5deg); }
          }
          @keyframes cove-orb-shine {
            0% { opacity: 0.3; }
            100% { opacity: 0.8; }
          }
        `}} />
      </div>
    )
  }

  return (
    <div className={`overflow-hidden rounded-full ${className}`}>
      <Canvas
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 2.6], fov: 40 }}
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <CoveCloud colors={colors} />
      </Canvas>
    </div>
  )
}
