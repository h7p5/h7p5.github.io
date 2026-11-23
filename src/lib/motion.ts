import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

/**
 * One animation loop for the whole page.
 * Lenis smooths wheel scrolling (touch stays native); every scroll-linked effect
 * subscribes with `onFrame` instead of running its own requestAnimationFrame.
 */

export type Frame = {
  /** Current scroll position in px. */
  y: number
  /** Scroll speed, px per frame (positive = scrolling down). */
  v: number
  /** 0 at the top of the page, 1 at the bottom. */
  progress: number
  /** Viewport height. */
  vh: number
  /** Time in ms. */
  t: number
}

type Listener = (f: Frame) => void

export const reducedMotion =
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** True on devices with a mouse or trackpad (hover effects make sense there). */
export const finePointer =
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

const listeners = new Set<Listener>()
let lenis: Lenis | null = null
let started = false
let lastY = 0

function loop(t: number) {
  lenis?.raf(t)
  const y = lenis ? lenis.animatedScroll : window.scrollY
  const v = lenis ? lenis.velocity : y - lastY
  lastY = y
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  const frame: Frame = { y, v, progress: Math.min(1, Math.max(0, y / max)), vh: window.innerHeight, t }
  listeners.forEach((fn) => fn(frame))
  requestAnimationFrame(loop)
}

export function startMotion() {
  if (started || typeof window === 'undefined') return
  started = true
  if (!reducedMotion) {
    lenis = new Lenis({
      lerp: 0.085, // lower = silkier glide
      wheelMultiplier: 0.95,
      smoothWheel: true,
      syncTouch: false, // phones keep their own native momentum
      anchors: { offset: -24, duration: 1.4, easing: (x: number) => 1 - Math.pow(1 - x, 4) },
    })
  }
  requestAnimationFrame(loop)
}

export function onFrame(fn: Listener) {
  listeners.add(fn)
  return () => {
    listeners.delete(fn)
  }
}

export function scrollToTarget(target: string | HTMLElement | number) {
  if (lenis) lenis.scrollTo(target, { offset: typeof target === 'number' ? 0 : -24, duration: 1.4 })
  else if (typeof target === 'number') window.scrollTo({ top: target })
  else (typeof target === 'string' ? document.querySelector(target) : target)?.scrollIntoView()
}

/** Frame-rate independent smoothing: move `a` towards `b` by `k` per 60 fps frame. */
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k

export const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x))
