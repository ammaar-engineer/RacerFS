import React, { useEffect, useMemo, useState } from 'react'
import { PixelSprite } from './sprite'
import { BUTTERFLY, DRAGONFLY, BIRD, FISH, PETAL } from './maps'

/* Butterfly with flapping wings, drifting on a random path */
export function Butterfly({
  px = 3,
  color = 'V',
  className,
  style,
  delay = 0,
}: {
  px?: number
  color?: 'V' | 'U' | 'R'
  className?: string
  style?: React.CSSProperties
  delay?: number
}) {
  const [flap, setFlap] = useState(0)
  useEffect(() => {
    const i = setInterval(() => setFlap((f) => 1 - f), 260)
    return () => clearInterval(i)
  }, [])
  const pal: Record<string, string> =
    color === 'V' ? {} : color === 'U' ? { V: '#8ad0f0' } : { V: '#ff8fa3' }
  return (
    <div
      className={`pointer-events-none ${className ?? ''}`}
      style={{ animation: `butterfly-flutter 9s ease-in-out ${delay}s infinite`, ...style }}
      aria-hidden
    >
      <div style={{ transform: flap ? 'scaleX(1)' : 'scaleX(0.45)', transition: 'transform 0.12s steps(2)' }}>
        <PixelSprite map={BUTTERFLY} px={px} palette={pal} />
      </div>
    </div>
  )
}

export function Dragonfly({ px = 3, className, style, delay = 0 }: { px?: number; className?: string; style?: React.CSSProperties; delay?: number }) {
  return (
    <div
      className={`pointer-events-none ${className ?? ''}`}
      style={{ animation: `butterfly-flutter 7s ease-in-out ${delay}s infinite reverse`, ...style }}
      aria-hidden
    >
      <PixelSprite map={DRAGONFLY} px={px} />
    </div>
  )
}

/** A tiny bird crossing the sky every so often */
export function Bird({ px = 3, top = '12%', duration = 26, delay = 0 }: { px?: number; top?: string; duration?: number; delay?: number }) {
  const [flap, setFlap] = useState(0)
  useEffect(() => {
    const i = setInterval(() => setFlap((f) => 1 - f), 320)
    return () => clearInterval(i)
  }, [])
  const map = flap ? BIRD : ['.X.X.', 'X...X']
  return (
    <div
      className="pointer-events-none absolute left-0"
      style={{ top, animation: `bird-fly ${duration}s linear ${delay}s infinite` }}
      aria-hidden
    >
      <PixelSprite map={map} px={px} />
    </div>
  )
}

/** Fish drifting in the river */
export function Fish({ px = 3, className, style, duration = 18, delay = 0, flip = false }: { px?: number; className?: string; style?: React.CSSProperties; duration?: number; delay?: number; flip?: boolean }) {
  return (
    <div
      className={`pointer-events-none absolute ${className ?? ''}`}
      style={{ animation: `drift ${duration}s linear ${delay}s infinite`, ...style }}
      aria-hidden
    >
      <div style={{ transform: flip ? 'scaleX(-1)' : undefined, opacity: 0.85 }}>
        <PixelSprite map={FISH} px={px} />
      </div>
    </div>
  )
}

/** Falling sakura petals across the whole viewport-height scene */
export function Petals({ count = 10, area = 'absolute inset-0' }: { count?: number; area?: string }) {
  const petals = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(i * 97.3) % 100}%`,
        delay: `${(i * 2.7) % 14}s`,
        duration: `${11 + ((i * 3.1) % 8)}s`,
        px: 2 + (i % 2),
        opacity: 0.7 + (i % 3) * 0.1,
      })),
    [count]
  )
  return (
    <div className={`pointer-events-none overflow-hidden ${area}`} aria-hidden>
      {petals.map((p, i) => (
        <div
          key={i}
          className="absolute top-0"
          style={{
            left: p.left,
            opacity: p.opacity,
            animation: `petal-fall ${p.duration} linear ${p.delay} infinite`,
          }}
        >
          <PixelSprite map={PETAL} px={p.px} />
        </div>
      ))}
    </div>
  )
}
