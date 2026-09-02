import { useRef } from 'react'
import gsap from 'gsap'

/**
 * Elegant interactive card — soft tilt on hover, press on click.
 */
export default function InteractiveCard({
  as: Tag = 'article',
  className = '',
  children,
  tilt = true,
  onClick,
  ...props
}) {
  const ref = useRef(null)
  const shine = useRef(null)

  const onMove = (e) => {
    if (!tilt || !ref.current) return
    const el = ref.current
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width
    const y = (e.clientY - r.top) / r.height
    gsap.to(el, {
      rotateY: (x - 0.5) * 8,
      rotateX: -(y - 0.5) * 6,
      y: -4,
      duration: 0.35,
      ease: 'power2.out',
      overwrite: 'auto',
    })
    if (shine.current) {
      gsap.to(shine.current, {
        opacity: 0.55,
        x: `${(x - 0.5) * 40}%`,
        y: `${(y - 0.5) * 40}%`,
        duration: 0.35,
        overwrite: 'auto',
      })
    }
  }

  const reset = () => {
    if (!ref.current) return
    gsap.to(ref.current, {
      rotateY: 0,
      rotateX: 0,
      y: 0,
      scale: 1,
      duration: 0.5,
      ease: 'power3.out',
      overwrite: 'auto',
    })
    if (shine.current) {
      gsap.to(shine.current, { opacity: 0, duration: 0.4, overwrite: 'auto' })
    }
  }

  const onDown = () => {
    if (!ref.current) return
    gsap.to(ref.current, {
      scale: 0.97,
      duration: 0.12,
      ease: 'power2.out',
      overwrite: 'auto',
    })
  }

  const onUp = () => {
    if (!ref.current) return
    gsap.to(ref.current, {
      scale: 1,
      duration: 0.4,
      ease: 'back.out(2.2)',
      overwrite: 'auto',
    })
  }

  return (
    <Tag
      ref={ref}
      className={`card-panel card-interactive gsap-card relative ${className}`}
      style={{ transformStyle: 'preserve-3d', perspective: 800 }}
      onMouseMove={onMove}
      onMouseLeave={reset}
      onMouseDown={onDown}
      onMouseUp={onUp}
      onTouchStart={onDown}
      onTouchEnd={onUp}
      onClick={onClick}
      {...props}
    >
      <span
        ref={shine}
        aria-hidden
        className="pointer-events-none absolute -left-1/4 -top-1/4 h-1/2 w-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.25),transparent_70%)] opacity-0"
      />
      <div className="relative z-[1] h-full">{children}</div>
    </Tag>
  )
}
