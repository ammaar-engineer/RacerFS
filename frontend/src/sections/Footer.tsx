import { Cat } from '../pixel/Cat'
import { PixelSprite } from '../pixel/sprite'
import { GRASS_TUFT, GRASS_TALL, FLOWER, FLOWER_Y, BUTTERFLY, DRAGONFLY, YARN } from '../pixel/maps'
import { CAT_FACE } from './Header'

const LINKS = [
  { label: 'GitHub', href: 'https://github.com/ammaar-engineer/RacerFS', external: true },
  { label: 'Documentation', href: '#docs', external: false },
  { label: 'Privacy Policy', href: '#privacy', external: false },
  { label: 'Terms', href: '#terms', external: false },
  { label: 'Contact', href: 'mailto:hello@racerfs.dev', external: false },
  { label: 'Open Source', href: 'https://github.com/ammaar-engineer/RacerFS', external: true },
]

export default function Footer() {
  return (
    <footer className="relative pt-8" aria-label="Footer">
      {/* pixel meadow scene */}
      <div className="relative h-28 overflow-hidden" aria-hidden>
        {/* ground with a soft gradient for depth */}
        <div
          className="absolute inset-x-0 bottom-0 h-10"
          style={{ background: 'linear-gradient(to bottom, var(--near-hill), var(--ground))' }}
        />

        {/* far grass layer — shorter, faded, denser (parallax depth) */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-between px-1 opacity-45">
          {Array.from({ length: 42 }, (_, i) => (
            <div key={i} className={i % 2 === 0 ? 'anim-sway-sm' : ''} style={{ animationDelay: `${(i % 6) * 0.35}s` }}>
              <PixelSprite map={GRASS_TUFT} px={2} />
            </div>
          ))}
        </div>

        {/* front grass + flowers — taller, swaying */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-between px-2">
          {Array.from({ length: 26 }, (_, i) => (
            <div key={i} className={i % 3 === 0 ? 'anim-sway-sm' : ''} style={{ animationDelay: `${(i % 5) * 0.4}s` }}>
              <PixelSprite
                map={i % 7 === 0 ? FLOWER : i % 5 === 0 ? FLOWER_Y : i % 3 === 0 ? GRASS_TALL : GRASS_TUFT}
                px={i % 7 === 0 || i % 5 === 0 ? 3 : 4}
              />
            </div>
          ))}
        </div>

        {/* floating critters above the meadow */}
        <div className="absolute bottom-16 left-[12%]" style={{ animation: 'butterfly-flutter 7s ease-in-out infinite' }}>
          <PixelSprite map={BUTTERFLY} px={3} />
        </div>
        <div className="absolute bottom-20 right-[20%]" style={{ animation: 'butterfly-flutter 9s ease-in-out 1.5s infinite' }}>
          <PixelSprite map={BUTTERFLY} px={2} palette={{ V: '#8ad0f0' }} />
        </div>
        <div className="absolute bottom-14 left-[52%]" style={{ animation: 'floaty 6s ease-in-out infinite' }}>
          <PixelSprite map={DRAGONFLY} px={2} />
        </div>

        {/* resting playful cat — follows the cursor, waves, with a yarn ball */}
        <div className="absolute bottom-6 right-[9%] flex items-end gap-1.5">
          <div className="relative">
            <Cat variant="sit" px={3} lookAtCursor playful />
            {/* soft shadow */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-14 h-1.5 rounded-full bg-[var(--scene-line)]/15 blur-[1px]" />
          </div>
          <div className="anim-floaty-sm"><PixelSprite map={YARN} px={2} /></div>
        </div>
      </div>

      {/* walking cat crossing the footer */}
      <div className="relative h-0" aria-hidden>
        <div
          className="absolute -top-16 left-0"
          style={{ animation: 'drift 34s linear infinite' }}
        >
          <div className="relative">
            <Cat variant="walk" px={3} lookAtCursor />
            {/* moving ground shadow */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-16 h-1.5 rounded-full bg-[var(--scene-line)]/15 blur-[1px]" />
          </div>
        </div>
      </div>

      <div className="border-t-2 border-[var(--scene-line)]/8 bg-[var(--paper)]">
        <div className="mx-auto max-w-7xl px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <PixelSprite map={CAT_FACE} px={3} />
            <span className="font-pixel text-lg">RacerFS</span>
            <span className="text-xs text-foreground/40 ml-2">© 2026 RacerFS contributors</span>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Footer">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                {...(l.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                className="text-sm text-foreground/55 hover:text-foreground transition-colors"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <p className="text-sm text-foreground/50">
            Made with <span className="text-[#f78ca0]">❤️</span> for the Rust community.
          </p>
        </div>
      </div>
    </footer>
  )
}
