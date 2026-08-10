import { useCallback, useEffect, useRef, useState } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import CoveOrb from './3d/CoveOrb'

const personalities = [
  {
    name: 'Atlas',
    tagline: 'Calm and precise',
    colors: ['#93c5fd', '#2563eb', '#dbeafe'],
  },
  {
    name: 'Nova',
    tagline: 'Warm and curious',
    colors: ['#fda4af', '#f43f5e', '#ffe4e6'],
  },
  {
    name: 'Echo',
    tagline: 'Energetic and sharp',
    colors: ['#86efac', '#22c55e', '#dcfce7'],
  },
  {
    name: 'Cove',
    tagline: 'Composed and direct',
    colors: ['#7eb8ff', '#3b82f6', '#e8f3ff'],
  },
  {
    name: 'Lumen',
    tagline: 'Bright and witty',
    colors: ['#fcd34d', '#f59e0b', '#fef3c7'],
  },
  {
    name: 'Pulse',
    tagline: 'Focused and fast',
    colors: ['#c4b5fd', '#8b5cf6', '#ede9fe'],
  },
  {
    name: 'Drift',
    tagline: 'Soft and patient',
    colors: ['#67e8f9', '#06b6d4', '#cffafe'],
  },
  {
    name: 'Forge',
    tagline: 'Bold and decisive',
    colors: ['#fdba74', '#ea580c', '#ffedd5'],
  },
]

export default function PhoneCarousel() {
  const [active, setActive] = useState(3) // Cove — matches reference
  const [dir, setDir] = useState(1)
  const sceneRef = useRef(null)
  const phoneRef = useRef(null)
  const contentRef = useRef(null)
  const autoRef = useRef(null)
  const dragging = useRef(false)
  const startX = useRef(0)

  const goTo = useCallback((index, direction = 1) => {
    setDir(direction)
    setActive((index + personalities.length) % personalities.length)
  }, [])

  const next = useCallback(() => goTo(active + 1, 1), [active, goTo])
  const prev = useCallback(() => goTo(active - 1, -1), [active, goTo])

  // Auto-advance like LiveKit
  useEffect(() => {
    autoRef.current = setInterval(() => {
      setDir(1)
      setActive((i) => (i + 1) % personalities.length)
    }, 3800)
    return () => clearInterval(autoRef.current)
  }, [])

  const pauseAuto = () => clearInterval(autoRef.current)

  // Content crossfade / slide on personality change
  useGSAP(
    () => {
      if (!contentRef.current) return
      gsap.fromTo(
        contentRef.current,
        { autoAlpha: 0, x: dir * 20 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 0.45,
          ease: 'power3.out',
          overwrite: true,
        },
      )
    },
    { dependencies: [active, dir] },
  )

  // Entrance + floating idle
  useGSAP(
    () => {
      if (!phoneRef.current) return
      gsap.set(phoneRef.current, { opacity: 1, y: 0 })
      gsap.fromTo(
        phoneRef.current,
        { y: 40, rotateX: 14, rotateY: -24 },
        {
          y: 0,
          rotateX: 8,
          rotateY: -18,
          duration: 1.1,
          ease: 'power3.out',
        },
      )
      gsap.to(phoneRef.current, {
        y: '+=8',
        duration: 3.2,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut',
        delay: 1.1,
      })
    },
    { scope: sceneRef },
  )

  // Mouse parallax tilt
  useEffect(() => {
    const el = sceneRef.current
    if (!el) return

    const onMove = (e) => {
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5
      gsap.to(phoneRef.current, {
        rotateY: -18 + x * 12,
        rotateX: 8 - y * 8,
        duration: 0.6,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    }

    const onLeave = () => {
      gsap.to(phoneRef.current, {
        rotateY: -18,
        rotateX: 8,
        duration: 0.8,
        ease: 'power2.out',
      })
    }

    el.addEventListener('mousemove', onMove)
    el.addEventListener('mouseleave', onLeave)
    return () => {
      el.removeEventListener('mousemove', onMove)
      el.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  // Swipe / drag
  const onPointerDown = (e) => {
    pauseAuto()
    dragging.current = true
    startX.current = e.clientX ?? e.touches?.[0]?.clientX ?? 0
  }

  const onPointerUp = (e) => {
    if (!dragging.current) return
    dragging.current = false
    const endX = e.clientX ?? e.changedTouches?.[0]?.clientX ?? 0
    const dx = endX - startX.current
    if (Math.abs(dx) > 40) {
      if (dx < 0) next()
      else prev()
    }
  }

  const p = personalities[active]

  return (
    <div
      ref={sceneRef}
      className="phone-scene relative mx-auto flex h-[440px] w-full max-w-md items-center justify-center md:h-[520px]"
      style={{ perspective: '1200px' }}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onTouchStart={onPointerDown}
      onTouchEnd={onPointerUp}
    >
      {/* Soft glow behind phone */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(59,130,246,0.25),transparent_70%)] blur-2xl" />

      {/* Main phone */}
      <div
        ref={phoneRef}
        className="phone-body relative z-20 h-[400px] w-[220px] md:h-[480px] md:w-[260px]"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateY(-18deg) rotateX(8deg)',
        }}
      >
        {/* Rim light / glass edge */}
        <div
          className="absolute inset-0 rounded-[42px] border border-white/15 md:rounded-[48px]"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.06) 18%, #0a0a0c 40%)',
            padding: '1.5px',
            boxShadow:
              '0 30px 80px rgba(0,0,0,0.65), inset 0 0 0 1px rgba(255,255,255,0.08)',
          }}
        >
          <div className="relative h-full w-full overflow-hidden rounded-[40.5px] bg-[#08080a] md:rounded-[46.5px]">
            <div className="relative flex h-full flex-col items-center px-5 pb-6 pt-12 md:px-7 md:pb-7 md:pt-14">
              {/* Fluid orb (DO NOT key it, otherwise Canvas remounts on persona change and looks like stop/start) */}
              <CoveOrb
                className="h-[120px] w-[120px] shadow-[0_0_40px_rgba(96,165,250,0.35)] md:h-[148px] md:w-[148px]"
                colors={p.colors}
              />

              {/* Crossfade content only (orb continues spinning continuously) */}
              <div ref={contentRef} className="flex w-full flex-1 flex-col items-center">
                <h3 className="mt-6 w-full text-center text-[24px] font-bold tracking-tight text-white md:text-[28px]">
                  {p.name}
                </h3>
                <p className="mt-1 w-full text-center text-[13px] italic text-white/45 md:text-[14px]">
                  {p.tagline}
                </p>

                {/* Dots */}
                <div className="mt-5 flex items-center gap-[7px]">
                  {personalities.map((item, i) => (
                    <button
                      key={item.name}
                      type="button"
                      aria-label={`Select ${item.name}`}
                      onClick={(e) => {
                        e.stopPropagation()
                        pauseAuto()
                        goTo(i, i > active ? 1 : -1)
                      }}
                      className={`h-[6px] w-[6px] rounded-full transition-all duration-300 ${
                        i === active
                          ? 'scale-110 bg-white'
                          : 'bg-white/25 hover:bg-white/45'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex-1" />

                <button
                  type="button"
                  className="w-full rounded-full bg-white py-3.5 text-[15px] font-semibold italic text-black transition hover:bg-white/90 active:scale-[0.98] md:py-4 md:text-base"
                  onClick={(e) => e.stopPropagation()}
                >
                  Start a new chat
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
