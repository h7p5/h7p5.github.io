import { useEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode, type RefObject } from 'react'
import { clamp, finePointer, lerp, onFrame, reducedMotion } from '../lib/motion'

/* ---------- Magnetic: the child leans towards the cursor, then springs back ---------- */

export function Magnetic({
  children,
  strength = 0.3,
  className = '',
}: {
  children: ReactNode
  strength?: number
  className?: string
}) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !finePointer || reducedMotion) return
    let x = 0
    let y = 0
    let tx = 0
    let ty = 0
    let raf = 0
    const tick = () => {
      x = lerp(x, tx, 0.16)
      y = lerp(y, ty, 0.16)
      el.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`
      raf = Math.abs(x - tx) + Math.abs(y - ty) > 0.05 ? requestAnimationFrame(tick) : 0
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      // Subtract the current offset so the rest position is measured, not the moved one.
      tx = (e.clientX - (r.left - x + r.width / 2)) * strength
      ty = (e.clientY - (r.top - y + r.height / 2)) * strength
      kick()
    }
    const leave = () => {
      tx = 0
      ty = 0
      kick()
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [strength])

  return (
    <span ref={ref} className={`inline-flex ${className}`}>
      {children}
    </span>
  )
}

/* ---------- SplitChars: letters rise one by one out of a mask ---------- */

export function SplitChars({ text, delay = 0, step = 0.04 }: { text: string; delay?: number; step?: number }) {
  return (
    <span aria-label={text} role="text" className="inline-block">
      {[...text].map((c, i) => (
        <span key={i} aria-hidden="true" className="char-mask">
          <span className="char-rise" style={{ animationDelay: `${delay + i * step}s` }}>
            {c === ' ' ? ' ' : c}
          </span>
        </span>
      ))}
    </span>
  )
}

/* ---------- ScrollProgress: thin accent line that fills as you scroll ---------- */

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(
    () =>
      onFrame(({ progress }) => {
        if (ref.current) ref.current.style.transform = `scaleX(${progress.toFixed(4)})`
      }),
    [],
  )
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[70] h-[2px] w-full origin-left bg-[var(--accent)]"
      style={{ transform: 'scaleX(0)' }}
    />
  )
}

/* ---------- CountUp: a number that counts up after a delay ---------- */

export function CountUp({ to, delay = 0, duration = 1400 }: { to: number; delay?: number; duration?: number }) {
  const [n, setN] = useState(reducedMotion ? to : 0)
  useEffect(() => {
    if (reducedMotion) return
    let raf = 0
    const start = performance.now() + delay
    const tick = (t: number) => {
      const k = clamp((t - start) / duration, 0, 1)
      setN(Math.round(to * (1 - Math.pow(1 - k, 4))))
      if (k < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [to, delay, duration])
  return <>{n}</>
}

/* ---------- useParallax: drift an element as its section passes through the viewport ---------- */

export function useParallax(ref: RefObject<HTMLElement | null>, speed = 0.08, max = 40) {
  useEffect(() => {
    const el = ref.current
    const host = el?.parentElement
    if (!el || !host || reducedMotion) return
    let top = 0
    let h = 0
    const measure = () => {
      const r = host.getBoundingClientRect()
      top = r.top + window.scrollY
      h = r.height
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(document.body)
    let cur = 0
    const off = onFrame(({ y, vh }) => {
      // Skip work while far outside the viewport.
      if (top + h < y - vh || top > y + 2 * vh) return
      const target = clamp((top + h / 2 - (y + vh / 2)) * -speed, -max, max)
      cur = lerp(cur, target, 0.12)
      el.style.transform = `translate3d(0, ${cur.toFixed(2)}px, 0)`
    })
    return () => {
      off()
      ro.disconnect()
    }
  }, [ref, speed, max])
}

/* ---------- useTilt: card leans towards the cursor in 3D ---------- */

export function useTilt(ref: RefObject<HTMLElement | null>, enabled = true, max = 3.5) {
  useEffect(() => {
    const el = ref.current
    if (!enabled || !el || !finePointer || reducedMotion) return
    let rx = 0
    let ry = 0
    let trx = 0
    let try_ = 0
    let raf = 0
    const tick = () => {
      rx = lerp(rx, trx, 0.12)
      ry = lerp(ry, try_, 0.12)
      el.style.transform = `perspective(1400px) rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg)`
      raf = Math.abs(rx - trx) + Math.abs(ry - try_) > 0.005 ? requestAnimationFrame(tick) : 0
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      const px = (e.clientX - r.left) / r.width - 0.5
      const py = (e.clientY - r.top) / r.height - 0.5
      trx = -py * max
      try_ = px * max
      kick()
    }
    const leave = () => {
      trx = 0
      try_ = 0
      kick()
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerleave', leave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerleave', leave)
    }
  }, [ref, enabled, max])
}

/** Spotlight: store the cursor position as CSS variables (read by the .spot glow). */
export function spotlight(e: RPointerEvent<HTMLElement>) {
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', `${e.clientX - r.left}px`)
  el.style.setProperty('--my', `${e.clientY - r.top}px`)
}
