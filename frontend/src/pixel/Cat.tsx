import React, { useEffect, useMemo, useRef, useState } from 'react'
import { PixelSprite } from './sprite'
import {
  CAT_BODY, CAT_EYE, CAT_EAR_L, CAT_TAIL, CAT_SLEEP, CAT_PEEK,
  CAT_WALK_BODY, CAT_WALK_EYE, CAT_LEGS_A, CAT_LEGS_B, CAT_WALK_TAIL, CAT_ARM,
} from './maps'

export type CatVariant = 'sit' | 'sleep' | 'walk' | 'peek' | 'climb'

interface CatProps {
  variant?: CatVariant
  px?: number
  className?: string
  style?: React.CSSProperties
  /** eyes follow the cursor a tiny bit */
  lookAtCursor?: boolean
  /** random playful behaviours (wave, stretch, tail chase) */
  playful?: boolean
  title?: string
}

/** Tiny hook: returns clamped eye offset toward the cursor relative to element center. */
function useEyeTracking(ref: React.RefObject<HTMLElement | null>, enabled: boolean) {
  const [off, setOff] = useState({ x: 0, y: 0 })
  useEffect(() => {
    if (!enabled) return
    let lastTime = 0
    let cachedRect: DOMRect | null = null

    const onMove = (e: MouseEvent) => {
      const el = ref.current
      if (!el) return

      const now = performance.now()
      // Throttle bounding rect calculation to 250ms to prevent layout thrashing
      if (!cachedRect || now - lastTime > 250) {
        cachedRect = el.getBoundingClientRect()
        lastTime = now
      }

      const cx = cachedRect.left + cachedRect.width / 2
      const cy = cachedRect.top + cachedRect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      const dist = Math.hypot(dx, dy) || 1
      const max = Math.max(1, cachedRect.width / 24)
      const m = Math.min(max, dist / 60)
      setOff({ x: (dx / dist) * m, y: (dy / dist) * m * 0.7 })
    }

    const resetCache = () => {
      cachedRect = null
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('scroll', resetCache, { passive: true })
    window.addEventListener('resize', resetCache, { passive: true })
    
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('scroll', resetCache)
      window.removeEventListener('resize', resetCache)
    }
  }, [enabled, ref])
  return off
}

export function Cat({
  variant = 'sit',
  px = 4,
  className,
  style,
  lookAtCursor = false,
  playful = false,
  title = 'Shiro, the RacerFS cat',
}: CatProps) {
  const ref = useRef<HTMLDivElement>(null)
  const eye = useEyeTracking(ref, lookAtCursor)
  const blinkDelay = useMemo(() => `${(Math.random() * 4).toFixed(2)}s`, [])
  const tailDelay = useMemo(() => `${(Math.random() * 1.5).toFixed(2)}s`, [])
  const [mood, setMood] = useState<'idle' | 'wave' | 'stretch'>('idle')
  const [legFrame, setLegFrame] = useState(0)

  // playful behaviour loop
  useEffect(() => {
    if (!playful) return
    let t: ReturnType<typeof setTimeout>
    const tick = () => {
      const pick = Math.random()
      setMood(pick < 0.4 ? 'wave' : pick < 0.6 ? 'stretch' : 'idle')
      t = setTimeout(tick, 2600 + Math.random() * 5200)
    }
    t = setTimeout(tick, 1800 + Math.random() * 3000)
    return () => clearTimeout(t)
  }, [playful])

  // walking legs
  useEffect(() => {
    if (variant !== 'walk') return
    const i = setInterval(() => setLegFrame((f) => 1 - f), 210)
    return () => clearInterval(i)
  }, [variant])

  const eyeTransform = `translate(${eye.x.toFixed(1)}px, ${eye.y.toFixed(1)}px)`

  if (variant === 'sleep') {
    return (
      <div ref={ref} className={`relative ${className ?? ''}`} style={style} role="img" aria-label={title}>
        <div className="anim-breathe">
          <PixelSprite map={CAT_SLEEP} px={px} />
        </div>
        {/* floating zzz */}
        <div className="absolute font-silk text-[10px] select-none" style={{ left: px * 16, top: -px * 3 }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="absolute opacity-0"
              style={{
                animation: `zzz 3s ease-out ${i * 1}s infinite`,
                color: 'var(--scene-line)',
                left: i * 8,
              }}
            >
              z
            </span>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'peek') {
    return (
      <div ref={ref} className={`relative ${className ?? ''}`} style={style} role="img" aria-label={title}>
        <div className="anim-floaty-sm">
          <PixelSprite map={CAT_PEEK} px={px} />
        </div>
      </div>
    )
  }

  if (variant === 'walk') {
    // sprite is drawn facing left; the footer drifts it rightward, so mirror it
    // to face its travel direction (forward).
    return (
      <div ref={ref} className={`relative ${className ?? ''}`} style={{ ...style, transform: 'scaleX(-1)' }} role="img" aria-label={title}>
        <div className="anim-bob relative">
          <PixelSprite map={CAT_WALK_BODY} px={px} />
          <div
            className="absolute anim-blink"
            style={{ left: 3 * px, top: 6 * px, animationDelay: blinkDelay, transform: eyeTransform }}
          >
            <PixelSprite map={CAT_WALK_EYE} px={px} />
          </div>
          {/* tail */}
          <div className="absolute anim-tail" style={{ left: 15 * px, top: 0, animationDelay: tailDelay }}>
            <PixelSprite map={CAT_WALK_TAIL} px={px} />
          </div>
          {/* legs */}
          <div className="absolute" style={{ left: 3 * px, top: 10 * px }}>
            <PixelSprite map={legFrame ? CAT_LEGS_A : CAT_LEGS_B} px={px} />
          </div>
        </div>
      </div>
    )
  }

  // ---- sitting cat (default) ----
  const stretch = mood === 'stretch'
  return (
    <div
      ref={ref}
      className={`relative ${className ?? ''}`}
      style={style}
      role="img"
      aria-label={title}
    >
      <div
        className="relative transition-transform duration-700"
        style={{ transform: stretch ? 'scaleY(1.06) translateY(-1%)' : undefined, transformOrigin: 'bottom center' }}
      >
        {/* body (head+b+body) */}
        <PixelSprite map={CAT_BODY} px={px} />
        {/* eyes overlay */}
        <div
          className="absolute anim-blink"
          style={{ left: 3 * px, top: 6 * px, animationDelay: blinkDelay, transform: eyeTransform }}
        >
          <PixelSprite map={CAT_EYE} px={px} />
        </div>
        <div
          className="absolute anim-blink"
          style={{ left: 11 * px, top: 6 * px, animationDelay: blinkDelay, transform: eyeTransform }}
        >
          <PixelSprite map={CAT_EYE} px={px} />
        </div>
        {/* waving arm */}
        <div
          className="absolute transition-all duration-500"
          style={{
            left: 13 * px,
            top: 10 * px,
            opacity: mood === 'wave' ? 1 : 0,
            transform: mood === 'wave' ? 'rotate(-28deg) translateY(-6px)' : 'rotate(0deg)',
            transformOrigin: 'bottom left',
          }}
        >
          <div className={mood === 'wave' ? 'anim-sway-sm' : ''}>
            <PixelSprite map={CAT_ARM} px={px} />
          </div>
        </div>
        {/* twitching left ear overlay (subtle scale highlight) */}
        <div
          className="absolute anim-ear pointer-events-none"
          style={{ left: 1 * px, top: 0, opacity: 0.0 }}
        >
          <PixelSprite map={CAT_EAR_L} px={px} />
        </div>
      </div>
      {/* curled tail */}
      <div
        className="absolute anim-tail"
        style={{ right: -5 * px, bottom: 0, animationDelay: tailDelay }}
      >
        <PixelSprite map={CAT_TAIL} px={px} />
      </div>
    </div>
  )
}

export default Cat
