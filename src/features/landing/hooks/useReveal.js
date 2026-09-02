import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// Use CSS to pre-hide elements instead of autoAlpha — avoids FOUC (flash of unstyled content)
const HIDDEN = { opacity: 0, y: 28 }
const VISIBLE = { opacity: 1, y: 0 }

const defaultScroll = {
  start: 'top 90%',
  once: true,
}

export function useReveal(scopeRef, selector = '.reveal', options = {}) {
  useGSAP(
    () => {
      const root = scopeRef.current
      if (!root) return
      const els = gsap.utils.toArray(selector, root)
      els.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: options.y ?? 28 },
          {
            opacity: 1,
            y: 0,
            duration: options.duration ?? 0.65,
            ease: 'power2.out',
            immediateRender: false,
            scrollTrigger: {
              trigger: el,
              start: options.start ?? defaultScroll.start,
              once: true,
            },
          },
        )
      })
    },
    { scope: scopeRef, dependencies: options.deps ?? [] },
  )
}

export function useHeadReveal(scopeRef, selector = '.reveal-head', options = {}) {
  useGSAP(
    () => {
      const root = scopeRef.current
      if (!root) return
      const els = gsap.utils.toArray(selector, root)
      if (!els.length) return
      gsap.fromTo(
        els,
        { opacity: 0, y: 20 },
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          stagger: 0.07,
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: els[0],
            start: options.start ?? 'top 92%',
            once: true,
          },
        },
      )
    },
    { scope: scopeRef, dependencies: options.deps ?? [] },
  )
}

export function useStaggerReveal(scopeRef, selector, options = {}) {
  useGSAP(
    () => {
      const root = scopeRef.current
      if (!root) return
      const els = gsap.utils.toArray(selector, root)
      if (!els.length) return
      gsap.fromTo(
        els,
        {
          opacity: 0,
          y: options.y ?? 28,
          // Removed rotateX — creates stacking contexts that cause text flicker
        },
        {
          opacity: 1,
          y: 0,
          duration: options.duration ?? 0.65,
          stagger: options.stagger ?? 0.09,
          ease: 'power2.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: options.trigger || els[0].parentElement || els[0],
            start: options.start ?? defaultScroll.start,
            once: true,
          },
        },
      )
    },
    { scope: scopeRef, dependencies: options.deps ?? [] },
  )
}

/** Animate every .gsap-card inside a section */
export function useCardAnimations(scopeRef, options = {}) {
  useStaggerReveal(scopeRef, '.gsap-card', {
    stagger: options.stagger ?? 0.09,
    y: options.y ?? 28,
    ...options,
  })
}
