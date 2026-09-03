import { Suspense, useMemo, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useIsMobile } from '../../../../hooks/useIsMobile'

const vertex = /* glsl */ `
  uniform float uTime;
  uniform float uAmp;
  varying vec3 vNormal;
  varying vec3 vPos;
  varying float vWave;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec3 p = position;

    // Organic voice-like undulation around the torus
    float a = atan(p.y, p.x);
    float tube = length(vec2(length(p.xy) - 1.0, p.z));
    float wave =
      sin(a * 5.0 + uTime * 2.2) * 0.55 +
      sin(a * 9.0 - uTime * 1.6) * 0.28 +
      cos(tube * 10.0 + uTime * 3.0) * 0.18;

    float disp = wave * uAmp;
    p += normal * disp;

    vWave = wave * 0.5 + 0.5;
    vPos = p;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragment = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vPos;
  varying float vWave;

  void main() {
    vec3 cyan = vec3(0.05, 0.92, 1.0);
    vec3 purple = vec3(0.75, 0.25, 1.0);
    vec3 pink = vec3(1.0, 0.35, 0.85);

    float mixA = smoothstep(-0.4, 0.6, vPos.y + vWave * 0.4);
    float mixB = smoothstep(-0.2, 0.8, vPos.x * 0.5 + sin(uTime) * 0.1);
    vec3 col = mix(cyan, purple, mixA);
    col = mix(col, pink, mixB * 0.45);

    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), vec3(0.0, 0.0, 1.0))), 2.2);
    col += fresnel * 0.55;
    col *= 0.75 + vWave * 0.55;

    float alpha = 0.72 + fresnel * 0.28;
    gl_FragColor = vec4(col, alpha);
  }
`

function GlowRing({ amp = 0.12 }) {
  const mat = useRef()
  const mesh = useRef()
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmp: { value: amp },
    }),
    [amp],
  )

  useFrame((state) => {
    const t = state.clock.elapsedTime
    mat.current.uniforms.uTime.value = t
    mat.current.uniforms.uAmp.value =
      amp * (0.85 + Math.sin(t * 2.5) * 0.2)
    mesh.current.rotation.x = Math.sin(t * 0.35) * 0.35 + 0.55
    mesh.current.rotation.z = t * 0.18
    mesh.current.rotation.y = Math.sin(t * 0.25) * 0.2
  })

  return (
    <mesh ref={mesh}>
      <torusGeometry args={[1.05, 0.28, 96, 240]} />
      <shaderMaterial
        ref={mat}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
      />
    </mesh>
  )
}

function SoftHalo() {
  const ref = useRef()
  useFrame((s) => {
    const t = s.clock.elapsedTime
    ref.current.scale.setScalar(1.35 + Math.sin(t * 1.8) * 0.06)
    ref.current.material.opacity = 0.18 + Math.sin(t * 2) * 0.04
  })
  return (
    <mesh ref={ref}>
      <torusGeometry args={[1.05, 0.55, 32, 100]} />
      <meshBasicMaterial
        color="#67e8f9"
        transparent
        opacity={0.18}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  )
}

export default function WaveRingVisualizer({
  className = '',
  active = true,
  compact = false,
}) {
  const isMobile = useIsMobile()
  
  return (
    <div className={`relative ${className}`}>
      <div
        className={`pointer-events-none absolute inset-0 ${
          compact
            ? 'bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1),rgba(168,85,247,0.06)_40%,transparent_68%)]'
            : 'bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.14),rgba(168,85,247,0.1)_45%,transparent_70%)]'
        }`}
      />
      <Canvas
        dpr={isMobile ? 1 : [1, 1.6]}
        camera={{
          position: [0, 0.1, compact ? 5.1 : 3.6],
          fov: compact ? 32 : 40,
        }}
        gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[2, 2, 3]} intensity={compact ? 0.9 : 1.1} color="#67e8f9" />
        <pointLight position={[-2, -1, 2]} intensity={compact ? 0.65 : 0.8} color="#c084fc" />
        <Suspense fallback={null}>
          <group scale={compact ? 0.68 : 1}>
            <SoftHalo />
            <GlowRing amp={active ? (compact ? 0.08 : 0.14) : 0.05} />
          </group>
        </Suspense>
      </Canvas>
    </div>
  )
}
