import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import Sections from './components/Sections'
import { CountUp, Magnetic, ScrollProgress, SplitChars } from './components/fx'
import { clamp, onFrame, reducedMotion } from './lib/motion'
import { profile } from './data/profile'

/*
 * Two portraits with the exact same framing (the normal one was scaled/shifted so the eyes line up):
 * the base image, and the "upgraded" one revealed under the cursor.
 */
const BG_IMAGE_1 = '/images/hero-normal.webp'
const BG_IMAGE_2 = '/images/hero-cyber.webp'

const CHESS_DEMO = profile.projects.find((p) => p.art === 'chess')?.links[0]?.href

const NAV_LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  ...(profile.education.length ? [{ label: 'Education', href: '#education' }] : []),
  ...(CHESS_DEMO ? [{ label: 'Live Demo', href: CHESS_DEMO, external: true }] : []),
]

/** Decorative stats on the arcs. r / from / to / dot are the arc radius and angles (degrees). */
const STATS: { r: number; from: number; to: number; dot: number; value: string; suffix?: string; label: string }[] = [
  { r: 330, from: -92, to: 16, dot: -46, value: String(profile.languages.length), label: 'LANGUAGES SPOKEN' },
  { r: 395, from: -56, to: 60, dot: 2, value: String(profile.projects.filter((p) => p.status !== 'planned').length), label: 'PROJECTS' },
  { r: 460, from: -14, to: 72, dot: 44, value: '100', suffix: '%', label: 'OPEN SOURCE' },
].filter((s) => s.value !== '0')
const ARC_CENTER = { x: -110, y: 300 }

/* Brush-stroke reveal */
const TRAIL_LIFE = 950 // ms a point of the stroke lives before the tail has shrunk past it
const FOLLOW = 0.2 // how fast the brush tip catches up with the cursor, per 60 fps frame (lower = silkier lag)
const MASK_SCALE = 0.25 // the mask is drawn at ¼ size and blurred, which gives soft edges for almost nothing
const IDLE_BEFORE_WANDER = 2500 // touch only: ms without input before the stroke wanders on its own

type TrailPoint = { x: number; y: number; t: number }

const EASE_OUT = 'cubic-bezier(0.22,1,0.36,1)'

/* ---------- helpers ---------- */

const polar = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180
  return { x: ARC_CENTER.x + r * Math.cos(a), y: ARC_CENTER.y + r * Math.sin(a) }
}

function Logo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="#fff" aria-hidden="true">
      <path d="M 256 64 L 256 128 L 192.5 128 L 160 95 L 128 64 L 96 95 L 63.5 128 L 64 128 L 128 192 L 128 256 L 64.5 256 L 32 223 L 0 192 L 0 64 L 64 0 L 192 0 Z M 256 192 L 256 256 L 192.5 256 L 160 223 L 128 192 L 128 128 L 192 128 Z" />
    </svg>
  )
}

/* ---------- navbar ---------- */

/** Which section is in the middle of the screen right now ('' while on the hero). */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState('')
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => io.observe(el))
    const hero = document.getElementById('top')
    const heroIo = new IntersectionObserver(([e]) => e.isIntersecting && setActive(''), { rootMargin: '-50% 0px -50% 0px' })
    if (hero) heroIo.observe(hero)
    return () => {
      io.disconnect()
      heroIo.disconnect()
    }
  }, [ids])
  return active
}

const SECTION_IDS = NAV_LINKS.filter((l) => l.href.startsWith('#')).map((l) => l.href.slice(1))

function Navbar() {
  const [open, setOpen] = useState(false)
  const [hidden, setHidden] = useState(false)
  const active = useActiveSection(SECTION_IDS)
  const linkProps = (external?: boolean) => (external ? { target: '_blank', rel: 'noreferrer' } : {})

  // Slide away while scrolling down, come back as soon as the visitor scrolls up.
  useEffect(() => {
    let last = false
    return onFrame(({ y, v, vh }) => {
      const next = y > vh * 0.6 && v > 0.5 ? true : v < -0.5 || y < vh * 0.6 ? false : last
      if (next !== last) {
        last = next
        setHidden(next)
      }
    })
  }, [])

  // The white pill glides under whichever link matches the section on screen.
  const pillHost = useRef<HTMLDivElement>(null)
  const [pill, setPill] = useState({ x: 0, w: 0, show: false })
  useEffect(() => {
    const measure = () => {
      const el = pillHost.current?.querySelector<HTMLElement>(`a[href="#${active}"]`)
      if (!el || !el.offsetWidth) return setPill((p) => ({ ...p, show: false }))
      setPill({ x: el.offsetLeft, w: el.offsetWidth, show: true })
    }
    measure()
    // Link widths change when the web font arrives or the window crosses the desktop breakpoint.
    document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [active])

  return (
    <>
      <nav
        className={`nav-shell fixed top-0 right-0 left-0 z-50 flex items-center justify-between p-4 sm:p-5 md:justify-center ${
          hidden && !open ? 'is-hidden' : ''
        }`}
      >
        {/* Desktop: one centred pill */}
        <div className="nav-drop hidden items-center gap-1 rounded-full bg-black/60 py-2 pr-2 pl-3 backdrop-blur-md md:flex">
          <a href="#top" aria-label={`${profile.name}, back to top`} className="mr-2 flex items-center">
            <Logo />
          </a>
          <div ref={pillHost} className="relative flex items-center gap-1">
            <span
              aria-hidden="true"
              className="nav-pill absolute top-0 left-0 h-full rounded-full bg-white/12"
              style={{ transform: `translateX(${pill.x}px)`, width: pill.w, opacity: pill.show ? 1 : 0 }}
            />
            {NAV_LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                {...linkProps(l.external)}
                className={`relative rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-300 hover:text-white ${
                  l.href === `#${active}` ? 'text-white' : 'text-gray-300'
                }`}
              >
                {l.label}
              </a>
            ))}
          </div>
          <Magnetic strength={0.25}>
            <a
              href="#contact"
              className="ml-1 rounded-full bg-white px-5 py-1.5 text-sm font-semibold text-gray-900 transition-colors hover:bg-gray-100"
            >
              Connect
            </a>
          </Magnetic>
        </div>

        {/* Mobile: logo pill + toggle pill */}
        <a
          href="#top"
          aria-label={`${profile.name}, back to top`}
          className="nav-drop flex items-center rounded-full bg-black/60 p-3 backdrop-blur-md md:hidden"
        >
          <Logo />
        </a>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          className="nav-drop flex cursor-pointer items-center rounded-full bg-black/60 p-2.5 text-white backdrop-blur-md md:hidden"
        >
          <span className="relative block h-[22px] w-[22px]">
            <Menu size={22} className={`absolute inset-0 transition-all duration-500 ${open ? 'scale-50 rotate-90 opacity-0' : ''}`} />
            <X size={22} className={`absolute inset-0 transition-all duration-500 ${open ? '' : 'scale-50 -rotate-90 opacity-0'}`} />
          </span>
        </button>
      </nav>

      <div
        className={`mobile-menu fixed top-0 right-0 left-0 z-40 bg-white px-5 pt-16 pb-6 shadow-lg md:hidden ${open ? 'is-open' : ''}`}
        aria-hidden={!open}
      >
        {NAV_LINKS.map((l, i) => (
          <a
            key={l.label}
            href={l.href}
            {...linkProps(l.external)}
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
            data-st
            style={{ ['--i' as string]: i }}
            className="block border-b border-gray-100 py-3 text-gray-800"
          >
            {l.label}
          </a>
        ))}
        <a
          href="#contact"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
          data-st
          style={{ ['--i' as string]: NAV_LINKS.length }}
          className="mt-5 inline-block rounded-full bg-gray-900 px-6 py-2.5 text-sm font-semibold text-white"
        >
          Connect
        </a>
      </div>
    </>
  )
}

/* ---------- stats arc ---------- */

function StatsArc() {
  return (
    <div className="pointer-events-none absolute inset-y-0 right-0 z-50 hidden sm:block" aria-hidden="true">
      <svg viewBox="0 0 380 700" preserveAspectRatio="xMaxYMid meet" className="h-full w-auto">
        <defs>
          {STATS.map((s, i) => {
            const a = polar(s.r, s.from)
            const b = polar(s.r, s.to)
            return (
              <linearGradient key={i} id={`arc-grad-${i}`} gradientUnits="userSpaceOnUse" x1={a.x} y1={a.y} x2={b.x} y2={b.y}>
                <stop offset="0" stopColor="#fff" stopOpacity="0" />
                <stop offset="0.22" stopColor="#fff" stopOpacity="0.5" />
                <stop offset="0.55" stopColor="#fff" stopOpacity="0.5" />
                <stop offset="0.85" stopColor="#fff" stopOpacity="0.1" />
                <stop offset="1" stopColor="#fff" stopOpacity="0" />
              </linearGradient>
            )
          })}
        </defs>

        {STATS.map((s, i) => {
          const a = polar(s.r, s.from)
          const b = polar(s.r, s.to)
          const d = polar(s.r, s.dot)
          const len = s.r * (((s.to - s.from) * Math.PI) / 180)
          const lineDelay = 0.4 + i * 0.22
          const markDelay = lineDelay + 0.9
          return (
            <g key={i}>
              <path
                className="arc-line"
                d={`M ${a.x} ${a.y} A ${s.r} ${s.r} 0 0 1 ${b.x} ${b.y}`}
                fill="none"
                stroke={`url(#arc-grad-${i})`}
                strokeWidth="1.1"
                style={{ ['--len' as string]: len, animationDelay: `${lineDelay}s` }}
              />
              <circle
                className="arc-ring"
                cx={d.x}
                cy={d.y}
                r="7"
                fill="none"
                stroke="#fff"
                strokeOpacity="0.35"
                style={{ animationDelay: `${markDelay + 0.3}s` }}
              />
              <circle className="arc-dot" cx={d.x} cy={d.y} r="3.4" fill="#fff" style={{ animationDelay: `${markDelay}s` }} />
              <text
                className="arc-text"
                x={d.x + 16}
                y={d.y + 4}
                fill="#fff"
                fontSize="32"
                letterSpacing="-1"
                style={{ animationDelay: `${markDelay + 0.15}s` }}
              >
                <CountUp to={Number(s.value)} delay={(markDelay + 0.15) * 1000} />
                {s.suffix && (
                  <tspan fontSize="19" dy="-10">
                    {s.suffix}
                  </tspan>
                )}
              </text>
              <text
                className="arc-text"
                x={d.x + 18}
                y={d.y + 22}
                fill="#fff"
                fillOpacity="0.8"
                fontSize="8.5"
                fontWeight="600"
                letterSpacing="2"
                style={{ animationDelay: `${markDelay + 0.3}s` }}
              >
                {s.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ---------- hero ---------- */

function Hero() {
  const heroRef = useRef<HTMLElement>(null)
  const patternRef = useRef<SVGPatternElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageLayerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const dimRef = useRef<HTMLDivElement>(null)

  // Scrolling away from the hero: the portrait sinks slower than the page (depth),
  // the text lifts and fades, and the whole scene dims into the dark sections below.
  useEffect(() => {
    if (reducedMotion) return
    let lastY = -1
    return onFrame(({ y, vh }) => {
      if (y === lastY || y > vh * 1.2) return
      lastY = y
      const p = clamp(y / vh, 0, 1)
      if (imageLayerRef.current) imageLayerRef.current.style.transform = `translate3d(0, ${(y * 0.32).toFixed(1)}px, 0)`
      if (textRef.current) {
        textRef.current.style.transform = `translate3d(0, ${(-y * 0.18).toFixed(1)}px, 0)`
        textRef.current.style.opacity = String(clamp(1 - p * 1.7, 0, 1))
      }
      if (statsRef.current) {
        statsRef.current.style.transform = `translate3d(0, ${(-y * 0.08).toFixed(1)}px, 0)`
        statsRef.current.style.opacity = String(clamp(1 - p * 1.4, 0, 1))
      }
      if (dimRef.current) dimRef.current.style.opacity = String(clamp(p * 0.85, 0, 0.85))
    })
  }, [])

  // One rAF loop drives both mouse effects: grid parallax and the brush-trail reveal.
  useEffect(() => {
    const hero = heroRef.current
    const pattern = patternRef.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!hero || !pattern || !canvas || !ctx) return

    // Live touch detection (a laptop can switch modes, e.g. a convertible).
    const touchMQ = window.matchMedia('(hover: none), (pointer: coarse)')
    let coarse = touchMQ.matches
    const syncTouch = () => (coarse = touchMQ.matches)
    touchMQ.addEventListener('change', syncTouch)

    // Offscreen canvas holding the brush stroke (opaque where the cyber image should show).
    const mask = document.createElement('canvas')
    const mctx = mask.getContext('2d')!

    const back = new Image()
    let backReady = false
    back.onload = () => (backReady = true)
    back.src = BG_IMAGE_2

    let W = 0
    let H = 0
    let dpr = 1
    // Checked every frame, so the canvas always matches the hero (window resize,
    // mobile toolbars, or CSS that arrives after the first render).
    const fitCanvas = (r: DOMRect) => {
      const d = Math.min(window.devicePixelRatio || 1, 2)
      if (r.width === W && r.height === H && d === dpr) return
      dpr = d
      W = r.width
      H = r.height
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
    }
    fitCanvas(hero.getBoundingClientRect())

    // Brush size follows the portrait (≈ ¾ of the hero height), not the full screen width.
    const ref = () => Math.max(H * 0.75, 260)

    // Low-res mask + a blurred copy of it (soft edge). Sized in fitMask().
    const soft = document.createElement('canvas')
    const sctx = soft.getContext('2d')!
    const fitMask = () => {
      const mw = Math.max(1, Math.round(W * MASK_SCALE))
      const mh = Math.max(1, Math.round(H * MASK_SCALE))
      if (mask.width !== mw || mask.height !== mh) {
        mask.width = soft.width = mw
        mask.height = soft.height = mh
      }
    }

    let trail: TrailPoint[] = []
    let target: { x: number; y: number } | null = null // where the cursor is
    let tip: { x: number; y: number } | null = null // the brush tip, gliding after the cursor
    let lastMove = -Infinity
    let lastTick = performance.now()
    let autoT = 0

    const pointerTo = (clientX: number, clientY: number, now: number) => {
      const r = canvas.getBoundingClientRect()
      target = { x: clientX - r.left, y: clientY - r.top }
      if (!tip) tip = { ...target }
      lastMove = now
    }

    // Touch only: after a while with no input, the stroke drifts around the face by itself.
    const autoWander = (now: number, frames: number) => {
      if (now - lastMove < IDLE_BEFORE_WANDER) return
      autoT += 0.016 * frames
      target = { x: W * 0.5 + Math.sin(autoT * 1.3) * 0.28 * ref(), y: H * (0.32 + Math.sin(autoT * 0.9 + 1) * 0.22) }
      if (!tip) tip = { ...target }
    }

    // The stroke: a smooth curve through the trail, full width at the tip, tapering to nothing at the tail.
    const drawStroke = (now: number) => {
      mctx.setTransform(MASK_SCALE, 0, 0, MASK_SCALE, 0, 0)
      mctx.clearRect(0, 0, W, H)
      mctx.strokeStyle = mctx.fillStyle = '#000'
      mctx.lineCap = 'round'
      mctx.lineJoin = 'round'
      const base = ref() * (coarse ? 0.26 : 0.22)
      const width = (p: TrailPoint) => base * Math.pow(Math.max(0, 1 - (now - p.t) / TRAIL_LIFE), 0.65)
      const n = trail.length
      if (n === 1) {
        mctx.beginPath()
        mctx.arc(trail[0].x, trail[0].y, width(trail[0]) / 2, 0, Math.PI * 2)
        mctx.fill()
        return
      }
      // Each piece runs midpoint → midpoint with the trail point as control, so joins are seamless.
      for (let i = 1; i < n; i++) {
        const p0 = trail[i - 1]
        const p1 = trail[i]
        const p2 = trail[i + 1] ?? p1
        mctx.beginPath()
        mctx.moveTo(i === 1 ? p0.x : (p0.x + p1.x) / 2, i === 1 ? p0.y : (p0.y + p1.y) / 2)
        mctx.quadraticCurveTo(p1.x, p1.y, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2)
        mctx.lineWidth = width(p1)
        mctx.stroke()
      }
    }

    // Cover-fit + centred, exactly like the CSS `bg-cover bg-center` base image, so both line up.
    const drawCover = (img: HTMLImageElement) => {
      const cw = canvas.width
      const ch = canvas.height
      const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
      const w = img.naturalWidth * s
      const h = img.naturalHeight * s
      ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h)
    }

    const mouse = { x: 0, y: 0 }
    let hasMouse = false
    const grid = { x: 0, y: 0 }
    let painted = false
    let raf = 0

    const onPointerMove = (e: PointerEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      hasMouse = true
      pointerTo(e.clientX, e.clientY, performance.now())
    }
    const onPointerDown = (e: PointerEvent) => pointerTo(e.clientX, e.clientY, performance.now())
    const onPointerLeave = () => {
      // Stop feeding the stroke; what is left shrinks away on its own.
      target = null
      tip = null
    }

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const rect = hero.getBoundingClientRect()
      if (rect.bottom <= 0) return // scrolled past: nothing to update
      fitCanvas(rect)

      // Grid parallax: (normalised cursor − 0.5) × 16px, eased.
      const nx = hasMouse ? mouse.x / window.innerWidth : 0.5
      const ny = hasMouse ? mouse.y / window.innerHeight : 0.5
      grid.x += ((nx - 0.5) * 16 - grid.x) * 0.06
      grid.y += ((ny - 0.5) * 16 - grid.y) * 0.06
      pattern.setAttribute('x', grid.x.toFixed(2))
      pattern.setAttribute('y', grid.y.toFixed(2))

      // Brush stroke: the tip glides after the cursor (frame-rate independent), leaving points behind.
      const frames = Math.min(4, (now - lastTick) / 16.67)
      lastTick = now
      if (coarse) autoWander(now, frames)
      if (target && tip) {
        const k = 1 - Math.pow(1 - FOLLOW, frames)
        tip.x += (target.x - tip.x) * k
        tip.y += (target.y - tip.y) * k
        const lastP = trail[trail.length - 1]
        if (!lastP || Math.hypot(tip.x - lastP.x, tip.y - lastP.y) > 1.5) trail.push({ x: tip.x, y: tip.y, t: now })
        else lastP.t = now // resting cursor: keep the tip alive under it
      }
      trail = trail.filter((p) => now - p.t < TRAIL_LIFE)
      if (!trail.length) {
        if (painted) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          painted = false
        }
        return
      }

      // 1. Mask at ¼ size, then a blurred copy of it for soft edges.
      fitMask()
      drawStroke(now)
      sctx.setTransform(1, 0, 0, 1, 0, 0)
      sctx.clearRect(0, 0, soft.width, soft.height)
      sctx.filter = 'blur(1.2px)'
      sctx.drawImage(mask, 0, 0)
      sctx.filter = 'none'

      // 2. Cyber image clipped to the mask. The base image underneath is opaque,
      //    so inside the trail only the cyber version is visible.
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.globalCompositeOperation = 'source-over'
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      if (backReady) {
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'
        ctx.drawImage(soft, 0, 0, canvas.width, canvas.height)
        ctx.globalCompositeOperation = 'source-in'
        drawCover(back)
        ctx.globalCompositeOperation = 'source-over'
        painted = true
      }
    }

    hero.addEventListener('pointermove', onPointerMove)
    hero.addEventListener('pointerdown', onPointerDown)
    hero.addEventListener('pointerleave', onPointerLeave)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      touchMQ.removeEventListener('change', syncTouch)
      hero.removeEventListener('pointermove', onPointerMove)
      hero.removeEventListener('pointerdown', onPointerDown)
      hero.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return (
    <section ref={heroRef} id="top" className="relative h-dvh touch-pan-y overflow-hidden bg-[#c2410c]">
      {/* 1. Grid */}
      <svg className="absolute inset-0 z-0 h-full w-full" style={{ opacity: 0.1 }} aria-hidden="true">
        <defs>
          <pattern ref={patternRef} id="hero-grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#64748b" strokeWidth="0.6" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>

      {/* Parallax layer: portrait + brush canvas move together so they stay aligned */}
      <div ref={imageLayerRef} className="will-move absolute inset-0 z-10">
        {/* 2. Base image with a Ken Burns intro */}
        <div
          className="ken-burns absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url("${BG_IMAGE_1}")` }}
          role="img"
          aria-label={`3D portrait of ${profile.name} on an orange background`}
        />

        {/* 3. Cyber image, painted only inside the brush trail that follows the pointer */}
        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />
      </div>

      {/* Soft shade behind the text so white copy stays readable */}
      <div
        className="pointer-events-none absolute inset-0 z-40 bg-linear-to-tr from-black/50 via-black/5 to-transparent"
        aria-hidden="true"
      />

      {/* Darkens as you scroll down, so the hero melts into the sections */}
      <div ref={dimRef} className="pointer-events-none absolute inset-0 z-40 bg-[#0c0a09]" style={{ opacity: 0 }} aria-hidden="true" />

      {/* 4. Stats on arcs */}
      <div ref={statsRef} className="will-move pointer-events-none absolute inset-0 z-50">
        <StatsArc />
      </div>

      {/* 5. Text */}
      <div
        ref={textRef}
        className="will-move absolute bottom-12 left-5 z-50 max-w-[300px] sm:bottom-16 sm:left-8 sm:max-w-md md:bottom-24 md:left-12"
      >
        <p className="hero-rise text-[11px] font-semibold tracking-[0.12em] text-white/90 sm:text-xs" style={{ animationDelay: '0.15s' }}>
          Developer <span className="italic">from Algeria</span>
        </p>
        <h1 className="mt-4 text-4xl leading-[1.05] tracking-[-0.08em] text-white sm:text-5xl md:text-6xl">
          <SplitChars text={`I'm ${profile.name}.`} delay={0.3} />
        </h1>
        <p className="hero-rise mt-5 text-sm leading-relaxed text-white/90 sm:text-base" style={{ animationDelay: '0.5s' }}>
          Web apps, desktop tools and Arduino projects.
        </p>
        <div className="hero-rise mt-7" style={{ animationDelay: '0.75s' }}>
          <Magnetic strength={0.35}>
            <a
              href="#projects"
              className="group relative inline-flex overflow-hidden rounded-full bg-white px-7 py-3 text-sm font-semibold text-gray-900 shadow-lg shadow-black/20 transition-transform duration-300 hover:scale-[1.04] active:scale-95 sm:px-8 sm:py-3.5"
              style={{ transitionTimingFunction: EASE_OUT }}
            >
              <span className="relative z-10">See my work</span>
              <span
                aria-hidden="true"
                className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover:translate-x-full"
              />
            </a>
          </Magnetic>
        </div>
      </div>
    </section>
  )
}

/* ---------- app ---------- */

export default function App() {
  useEffect(() => {
    document.title = `${profile.name} — Portfolio`
  }, [])

  return (
    <div className="min-h-screen bg-white tracking-[-0.02em]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
      <ScrollProgress />
      <Navbar />
      <Hero />
      <Sections />
    </div>
  )
}
