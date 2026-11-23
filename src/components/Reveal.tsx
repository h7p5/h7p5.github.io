import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Animates its children in the first time they scroll into view.
 *  - up:      fade + lift (default)
 *  - text:    fade + lift + un-blur, for paragraphs and headings
 *  - card:    rises and un-tilts in 3D, for big cards
 *  - stagger: the wrapper stays still; children marked `data-st` (with `--i`) pop in one after another
 */
export default function Reveal({
  children,
  delay = 0,
  className = '',
  variant = 'up',
}: {
  children: ReactNode
  delay?: number
  className?: string
  variant?: 'up' | 'text' | 'card' | 'stagger'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setShown(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { rootMargin: '0px 0px -10% 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal reveal-${variant} ${shown ? 'is-shown' : ''} ${className}`}
      style={{ ['--d' as string]: `${delay}ms` }}
    >
      {children}
    </div>
  )
}
