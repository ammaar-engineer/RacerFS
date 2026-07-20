import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { SectionHeading, softCard, cardHover } from './shared'
import { PixelSprite } from '../pixel/sprite'
import { CAT_FACE } from './Header'

function CountUp({ to, suffix = '', decimals = 0, duration = 1.6 }: { to: number; suffix?: string; decimals?: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    let raf = 0
    const start = performance.now()
    const step = (t: number) => {
      const p = Math.min(1, (t - start) / (duration * 1000))
      const eased = 1 - Math.pow(1 - p, 3)
      setVal(to * eased)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])
  return (
    <span ref={ref}>
      {val.toFixed(decimals)}
      {suffix}
    </span>
  )
}

/** Pixel-segment bar that lights up block by block */
function PixelBar({ ratio, color = '#8ecf6f', segments = 24 }: { ratio: number; color?: string; segments?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const lit = Math.round(ratio * segments)
  return (
    <div ref={ref} className="flex gap-[3px]" aria-hidden>
      {Array.from({ length: segments }, (_, i) => {
        const isLit = i < lit
        return (
          <div
            key={i}
            className="h-6 flex-1 rounded-[3px] transition-all duration-300 origin-bottom"
            style={{
              background: isLit ? color : 'var(--scene-line)',
              opacity: inView ? (isLit ? 1 : 0.14) : 0,
              transform: inView ? 'scaleY(1)' : 'scaleY(0.3)',
              transitionDelay: `${0.02 * i}s`,
            }}
          />
        )
      })}
    </div>
  )
}

const METRICS = [
  { label: '4K random read IOPS', value: 1.2, suffix: 'M', decimals: 1, ratio: 0.96, color: '#8ecf6f', note: 'queue depth 32' },
  { label: 'p99 read latency', value: 61, suffix: 'µs', decimals: 0, ratio: 0.9, color: '#7cc6e8', note: 'lower is better' },
  { label: 'Sequential throughput', value: 6.8, suffix: ' GB/s', decimals: 1, ratio: 0.92, color: '#f5cf7d', note: '128K blocks' },
  { label: 'CPU per 1M IOPS', value: 0.8, suffix: ' cores', decimals: 1, ratio: 0.28, color: '#f78ca0', note: 'efficiency' },
  { label: 'Resident memory', value: 96, suffix: ' MB', decimals: 0, ratio: 0.22, color: '#b9a7f9', note: 'module loaded' },
]

export default function Performance() {
  return (
    <section id="performance" className="relative py-24 sm:py-32" aria-label="Performance">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          kicker="⚡ Performance"
          title="Zoomies, measured."
          sub="Numbers from our internal preview rig. Full methodology and reproducible scripts ship with the beta."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {METRICS.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: (i % 3) * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={`${softCard} ${cardHover} p-7 ${i === 0 ? 'sm:col-span-2 lg:col-span-1' : ''}`}
            >
              <p className="text-sm font-medium text-foreground/55">{m.label}</p>
              <p className="mt-2 font-pixel text-4xl tracking-tight">
                <CountUp to={m.value} suffix={m.suffix} decimals={m.decimals} />
              </p>
              <div className="mt-4">
                <PixelBar ratio={m.ratio} color={m.color} />
              </div>
              <p className="mt-3 text-xs text-foreground/40 font-silk">{m.note}</p>
            </motion.div>
          ))}

          {/* cat card */}
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className={`${softCard} p-7 flex items-center gap-5 bg-gradient-to-br from-[#FFE6A7]/60 to-[#FFDCC8]/50`}
          >
            <div className="anim-floaty-sm" aria-hidden>
              <PixelSprite map={CAT_FACE} px={7} />
            </div>
            <p className="text-sm leading-relaxed text-foreground/70">
              <span className="font-pixel text-base block mb-1">Cat-approved speed.</span>
              If a build takes longer than a cat nap, we consider it a bug.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
