import React, { useMemo } from 'react'
import { PixelSprite } from './sprite'
import {
  CLOUD, CLOUD_SM, SUN, MOON, STAR, MOUNTAIN, SAKURA_TREE, GRASS_TUFT,
  FLOWER, FLOWER_Y, LANTERN, PAW,
} from './maps'
import { Bird, Fish } from './Critters'
import { useTheme } from '../hooks/useTheme'

/** Twinkling stars for night mode */
function Stars({ count = 26 }: { count?: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${(i * 37.7) % 100}%`,
        top: `${(i * 17.3) % 45}%`,
        delay: `${(i * 0.7) % 3}s`,
        px: i % 4 === 0 ? 3 : 2,
      })),
    [count]
  )
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {stars.map((s, i) => (
        <div key={i} className="absolute anim-twinkle" style={{ left: s.left, top: s.top, animationDelay: s.delay }}>
          <PixelSprite map={STAR} px={s.px} palette={{ Y: '#fff7d6' }} />
        </div>
      ))}
    </div>
  )
}

function Cloud({ top, duration, delay, scale = 1, small = false }: { top: string; duration: number; delay: number; scale?: number; small?: boolean }) {
  const { theme } = useTheme()
  const night = theme === 'night'
  return (
    <div
      className="absolute left-0 pointer-events-none"
      style={{ top, animation: `drift-slow ${duration}s linear ${delay}s infinite` }}
      aria-hidden
    >
      <div style={{ transform: `scale(${scale})` }} className="origin-left">
        <PixelSprite
          map={small ? CLOUD_SM : CLOUD}
          px={5}
          palette={night ? { C: '#33477a', c: '#2a3c68', X: '#1a2547' } : {}}
        />
      </div>
    </div>
  )
}

/** Water ripples: expanding soft rings */
function Ripples({ count = 5 }: { count?: number }) {
  const rings = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        left: `${8 + ((i * 41) % 84)}%`,
        top: `${15 + ((i * 29) % 70)}%`,
        delay: `${i * 1.7}s`,
        size: 26 + ((i * 13) % 30),
      })),
    [count]
  )
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {rings.map((r, i) => (
        <div
          key={i}
          className="absolute rounded-full border-2"
          style={{
            left: r.left,
            top: r.top,
            width: r.size,
            height: r.size / 2.6,
            borderColor: 'rgba(255,255,255,0.55)',
            animation: `ripple 4.2s ease-out ${r.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

/** Paw-print trail along the bank */
function Footprints({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`flex gap-5 pointer-events-none ${className ?? ''}`} style={style} aria-hidden>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ transform: `rotate(${i % 2 ? 14 : -10}deg) translateY(${i % 2 ? 4 : 0}px)`, opacity: 0.35 }}>
          <PixelSprite map={PAW} px={2} palette={{ X: '#8a6b4a', W: '#8a6b4a' }} />
        </div>
      ))}
    </div>
  )
}

/**
 * The full Japanese riverside scene.
 * Fills its (relative) parent; content scrolls above it.
 */
export function RiversideScene() {
  const { theme } = useTheme()
  const night = theme === 'night'

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      {/* sky */}
      <div
        className="absolute inset-0 transition-colors duration-700"
        style={{ background: `linear-gradient(to bottom, var(--sky-top), var(--sky-mid) 45%, var(--sky-low) 70%)` }}
      />

      {/* stars (night) */}
      {night && <Stars />}

      {/* sun / moon */}
      <div className="absolute right-[8%] top-[9%] pointer-events-none">
        {night ? (
          <div className="anim-floaty-sm">
            <PixelSprite map={MOON} px={7} />
          </div>
        ) : (
          <div style={{ animation: 'spin-slow 70s linear infinite' }} className="origin-center">
            <PixelSprite map={SUN} px={7} />
          </div>
        )}
      </div>

      {/* clouds */}
      <Cloud top="7%" duration={95} delay={-12} />
      <Cloud top="16%" duration={120} delay={-55} scale={0.75} small />
      <Cloud top="4%" duration={140} delay={-90} scale={0.6} small />
      <Cloud top="22%" duration={105} delay={-30} scale={0.85} />

      {/* birds */}
      <Bird top="13%" duration={32} delay={2} />
      <Bird top="20%" duration={41} delay={14} px={2} />

      {/* far mountains */}
      <div className="absolute left-[4%] bottom-[42%] opacity-80 pointer-events-none">
        <PixelSprite map={MOUNTAIN} px={11} />
      </div>
      <div className="absolute left-[56%] bottom-[43%] opacity-60 pointer-events-none">
        <PixelSprite map={MOUNTAIN} px={9} />
      </div>

      {/* far hill */}
      <div
        className="absolute left-[-10%] right-[-10%] bottom-[30%] h-[16%] rounded-t-[100%] transition-colors duration-700"
        style={{ background: 'var(--far-hill)' }}
      />
      {/* near hill */}
      <div
        className="absolute left-[-15%] right-[-15%] bottom-[22%] h-[13%] rounded-t-[100%] transition-colors duration-700"
        style={{ background: 'var(--near-hill)' }}
      />

      {/* sakura trees on the hills */}
      <div className="absolute left-[6%] bottom-[31%] pointer-events-none">
        <div className="anim-sway-sm">
          <PixelSprite map={SAKURA_TREE} px={5} />
        </div>
      </div>
      <div className="absolute right-[9%] bottom-[30%] pointer-events-none scale-x-[-1]">
        <div className="anim-sway-sm" style={{ animationDelay: '1.4s' }}>
          <PixelSprite map={SAKURA_TREE} px={4} />
        </div>
      </div>

      {/* river */}
      <div
        className="absolute left-0 right-0 bottom-0 h-[24%] transition-colors duration-700"
        style={{ background: `linear-gradient(to bottom, var(--river), var(--river-deep))` }}
      >
        {/* dithered shoreline */}
        <div
          className="absolute -top-2 left-0 right-0 h-3 opacity-60"
          style={{
            backgroundImage: `radial-gradient(circle, var(--river) 1.6px, transparent 1.7px)`,
            backgroundSize: '7px 7px',
          }}
        />
        <Ripples />
        <Fish style={{ top: '30%' }} duration={26} delay={0} />
        <Fish style={{ top: '62%' }} duration={34} delay={-14} px={2} />
        {night && <Fireflies />}
      </div>

      {/* near bank grass strip */}
      <div
        className="absolute left-0 right-0 bottom-[20%] h-[4%] transition-colors duration-700"
        style={{ background: 'var(--ground)' }}
      />

      {/* wooden bridge */}
      <Bridge className="absolute right-[16%] bottom-[13%] hidden md:block" />

      {/* grass tufts & flowers on bank */}
      <div className="absolute left-[3%] bottom-[21%] flex items-end gap-10 pointer-events-none">
        <div className="anim-sway"><PixelSprite map={GRASS_TUFT} px={4} /></div>
        <div className="anim-sway-sm" style={{ animationDelay: '0.8s' }}><PixelSprite map={FLOWER} px={4} /></div>
        <div className="anim-sway" style={{ animationDelay: '1.6s' }}><PixelSprite map={GRASS_TUFT} px={3} /></div>
      </div>
      <div className="absolute right-[4%] bottom-[21%] flex items-end gap-8 pointer-events-none">
        <div className="anim-sway-sm"><PixelSprite map={FLOWER_Y} px={4} /></div>
        <div className="anim-sway" style={{ animationDelay: '0.5s' }}><PixelSprite map={GRASS_TUFT} px={4} /></div>
      </div>

      {/* stone lantern (glows at night) */}
      <div className="absolute left-[16%] bottom-[22%] pointer-events-none">
        <div className="relative">
          <PixelSprite map={LANTERN} px={5} palette={night ? { F: '#ffe9a8' } : {}} />
          {night && (
            <div
              className="absolute inset-[-30%] rounded-full anim-twinkle"
              style={{ background: 'radial-gradient(circle, rgba(255,230,150,0.35), transparent 70%)' }}
            />
          )}
        </div>
      </div>

      {/* footprints */}
      <Footprints className="absolute left-[26%] bottom-[21.5%] hidden lg:flex" />
    </div>
  )
}

function Fireflies() {
  const flies = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        left: `${(i * 23) % 90 + 5}%`,
        top: `${(i * 31) % 60}%`,
        delay: `${i * 0.9}s`,
      })),
    []
  )
  return (
    <div className="absolute inset-0 pointer-events-none" aria-hidden>
      {flies.map((f, i) => (
        <div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full anim-twinkle"
          style={{ ...f, background: '#fff3a0', boxShadow: '0 0 8px 2px rgba(255,240,150,0.8)' }}
        />
      ))}
    </div>
  )
}

/** Wooden footbridge built from divs (arched planks) */
export function Bridge({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const planks = 9
  return (
    <div className={`pointer-events-none ${className ?? ''}`} style={style} aria-hidden>
      <div className="relative flex items-end gap-[3px]">
        {Array.from({ length: planks }, (_, i) => {
          const t = i / (planks - 1)
          const arch = Math.sin(t * Math.PI) * 14
          return (
            <div
              key={i}
              className="w-3 rounded-t-sm border border-b-0"
              style={{
                height: 26 - arch,
                background: 'var(--paper)',
                borderColor: '#9b7653',
                backgroundColor: '#b98d63',
                transform: 'translateY(2px)',
              }}
            />
          )
        })}
        {/* posts */}
        <div className="absolute -left-1 bottom-0 w-1.5 h-10 rounded-t" style={{ background: '#9b7653' }} />
        <div className="absolute -right-1 bottom-0 w-1.5 h-10 rounded-t" style={{ background: '#9b7653' }} />
        {/* rail */}
        <div
          className="absolute left-[-6px] right-[-6px] bottom-8 h-1.5 rounded-full"
          style={{ background: '#9b7653' }}
        />
      </div>
    </div>
  )
}

export default RiversideScene
