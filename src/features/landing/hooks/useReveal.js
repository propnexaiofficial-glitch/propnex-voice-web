import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const defaultScroll = {
  start: 'top 88%',
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
          { autoAlpha: 0, y: options.y ?? 36 },
          {
            autoAlpha: 1,
            y: 0,
            duration: options.duration ?? 0.8,
            ease: 'power3.out',
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
        { autoAlpha: 0, y: 28 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.08,
          ease: 'power3.out',
          immediateRender: false,
          scrollTrigger: {
            trigger: els[0],
            start: options.start ?? 'top 90%',
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
          autoAlpha: 0,
          y: options.y ?? 36,
          scale: options.scale ?? 0.96,
          rotateX: options.rotateX ?? 6,
        },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          rotateX: 0,
          duration: options.duration ?? 0.75,
          stagger: options.stagger ?? 0.1,
          ease: 'power3.out',
          immediateRender: false,
          transformPerspective: 900,
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
    y: options.y ?? 32,
    ...options,
  })
}
