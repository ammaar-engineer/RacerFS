import { useEffect, useRef, useState } from 'react'
import { PixelSprite } from '../pixel/sprite'
import { PAW, SPARKLE } from '../pixel/maps'

interface Paw { id: number; x: number; y: number; rot: number }
interface Spark { id: number; x: number; y: number }

/** Paw prints appear where you click; sparkles trail the cursor. */
export default function Fx() {
  const [paws, setPaws] = useState<Paw[]>([])
  const [sparks, setSparks] = useState<Spark[]>([])
  const idRef = useRef(0)
  const lastSpark = useRef(0)

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const onClick = (e: MouseEvent) => {
      const id = ++idRef.current
      const rot = Math.round(Math.random() * 70 - 35)
      setPaws((p) => [...p.slice(-14), { id, x: e.clientX, y: e.clientY, rot }])
      setTimeout(() => setPaws((p) => p.filter((x) => x.id !== id)), 1400)
    }

    const onMove = (e: MouseEvent) => {
      const now = performance.now()
      if (now - lastSpark.current < 130) return
      lastSpark.current = now
      const id = ++idRef.current
      const jx = e.clientX + (Math.random() * 26 - 13)
      const jy = e.clientY + (Math.random() * 26 - 13)
      setSparks((s) => [...s.slice(-10), { id, x: jx, y: jy }])
      setTimeout(() => setSparks((s) => s.filter((x) => x.id !== id)), 900)
    }

    // Defer tracking setup to keep the page mount lightweight and smooth
    const initTimer = setTimeout(() => {
      window.addEventListener('click', onClick)
      window.addEventListener('mousemove', onMove, { passive: true })
    }, 1500)

    return () => {
      clearTimeout(initTimer)
      window.removeEventListener('click', onClick)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[90]" aria-hidden>
      {paws.map((p) => (
        <div
          key={p.id}
          className="absolute"
          style={{
            left: p.x - 14,
            top: p.y - 14,
            ['--paw-rot' as string]: `${p.rot}deg`,
            animation: 'paw-fade 1.3s ease-out forwards',
          }}
        >
          <PixelSprite map={PAW} px={4} palette={{ X: '#f78ca0', W: '#f78ca0' }} />
        </div>
      ))}
      {sparks.map((s) => (
        <div
          key={s.id}
          className="absolute"
          style={{
            left: s.x - 10,
            top: s.y - 10,
            animation: 'sparkle-pop 0.85s ease-out forwards',
          }}
        >
          <PixelSprite map={SPARKLE} px={3} />
        </div>
      ))}
    </div>
  )
}
