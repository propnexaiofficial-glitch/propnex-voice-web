import { useEffect } from 'react'

/**
 * Pure CSS + IntersectionObserver reveal system.
 * Zero GSAP dependency — elements animate once and STAY revealed forever.
 * Completely eliminates the "flash → visible → flash" GSAP ScrollTrigger bug.
 */

const observerOptions = { threshold: 0, rootMargin: '0px 0px 50px 0px' }

function observeReveal(root, selector, delay = 0) {
  if (!root) return () => {}
  const els = root.querySelectorAll(selector)
  if (!els.length) return () => {}

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed')
        observer.unobserve(entry.target) // Never re-trigger
      }
    })
  }, observerOptions)

  els.forEach((el, i) => {
    if (delay) el.style.transitionDelay = `${i * delay}ms`
    observer.observe(el)
  })

  return () => observer.disconnect()
}

export function useReveal(scopeRef, selector = '.reveal', options = {}) {
  useEffect(() => {
    return observeReveal(scopeRef.current, selector)
  }, [])
}

export function useHeadReveal(scopeRef, selector = '.reveal-head', options = {}) {
  useEffect(() => {
    return observeReveal(scopeRef.current, selector, 60)
  }, [])
}

export function useStaggerReveal(scopeRef, selector, options = {}) {
  useEffect(() => {
    const delay = options.stagger ? options.stagger * 1000 : 80
    return observeReveal(scopeRef.current, selector, delay)
  }, [])
}

export function useCardAnimations(scopeRef, options = {}) {
  useEffect(() => {
    const delay = options.stagger ? options.stagger * 1000 : 80
    return observeReveal(scopeRef.current, '.gsap-card', delay)
  }, [])
}
