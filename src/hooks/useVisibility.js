import { useState, useEffect, useRef } from 'react'

export function useVisibility(margin = '400px') {
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting)
        })
      },
      { rootMargin: margin, threshold: 0 }
    )

    observer.observe(ref.current)

    return () => {
      observer.disconnect()
    }
  }, [margin])

  return { ref, isVisible }
}
