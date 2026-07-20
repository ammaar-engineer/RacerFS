import { useEffect, useState } from 'react'
import { PixelSprite } from '../pixel/sprite'
import { SUN, MOON } from '../pixel/maps'
import { useTheme } from '../hooks/useTheme'
import { Github, Menu, X } from 'lucide-react'

export const CAT_FACE = [
  '.XX..XX.',
  'XWWXXWWX',
  'XWPXXPWX',
  'XWBWWBWX',
  'XWWNNWWX',
  'XWWWWWWX',
  '.XXXXXX.',
]

const NAV = [
  { label: 'Home', href: '#home' },
  { label: 'Features', href: '#features' },
  { label: 'Roadmap', href: '#roadmap' },
  { label: 'GitHub', href: '#github' },
  { label: 'Docs', href: '#docs' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Privacy', href: '#privacy' },
]

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme()
  return (
    <button
      onClick={toggle}
      aria-label={theme === 'day' ? 'Switch to night mode' : 'Switch to day mode'}
      className={`group relative grid place-items-center w-10 h-10 rounded-xl border-2 border-[var(--scene-line)]/15 bg-[var(--paper)]/70 dark:bg-[var(--paper)]/10 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_0_rgba(35,35,35,0.12)] active:translate-y-0 active:shadow-none ${className ?? ''}`}
    >
      <span className="transition-transform duration-500 group-hover:rotate-90 inline-block">
        <PixelSprite map={theme === 'day' ? SUN : MOON} px={2} palette={theme === 'night' ? { F: '#ffe9a8' } : {}} />
      </span>
    </button>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'py-2' : 'py-4'
      }`}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div
          className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 transition-all duration-500 border-2 ${
            scrolled
              ? 'bg-[var(--paper)]/85 backdrop-blur-md border-[var(--scene-line)]/10 shadow-[0_10px_30px_rgba(35,35,35,0.10)]'
              : 'bg-transparent border-transparent'
          }`}
        >
          {/* brand */}
          <a href="#home" className="flex items-center gap-2.5 group" aria-label="RacerFS home">
            <span className="inline-block transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110">
              <PixelSprite map={CAT_FACE} px={4} title="RacerFS cat logo" />
            </span>
            <span className="font-pixel text-2xl tracking-tight">RacerFS</span>
            <span className="hidden sm:inline-flex items-center gap-1 rounded-full border border-[var(--scene-line)]/15 bg-[#FFE6A7]/70 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6fbf4a] animate-pulse" />
              Closed Beta
            </span>
          </a>

          {/* center nav */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
            {NAV.map((n) => (
              <a
                key={n.label}
                href={n.href}
                className="px-3 py-1.5 rounded-lg text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-black/5 dark:hover:bg-[var(--paper)]/10 transition-colors"
              >
                {n.label}
              </a>
            ))}
          </nav>

          {/* right actions */}
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/ammaar-engineer/RacerFS"
              target="_blank"
              rel="noreferrer"
              aria-label="RacerFS on GitHub"
              className="hidden sm:grid place-items-center w-10 h-10 rounded-xl border-2 border-[var(--scene-line)]/15 bg-[var(--paper)]/70 backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_6px_0_rgba(35,35,35,0.12)] active:translate-y-0 active:shadow-none"
            >
              <Github size={17} />
            </a>
            <a
              href="#beta"
              className="hidden md:inline-flex items-center gap-1.5 rounded-xl border-2 border-[var(--scene-line)] bg-[#232323] text-white font-silk text-[13px] px-4 py-2.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_0_rgba(35,35,35,0.35)] active:translate-y-0 active:shadow-none"
            >
              Join Closed Beta
            </a>
            <ThemeToggle />
            <button
              className="lg:hidden grid place-items-center w-10 h-10 rounded-xl border-2 border-[var(--scene-line)]/15 bg-[var(--paper)]/70"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* mobile menu */}
        {open && (
          <div className="lg:hidden mt-2 rounded-2xl border-2 border-[var(--scene-line)]/10 bg-[var(--paper)]/95 backdrop-blur-md p-3 shadow-xl">
            <nav className="flex flex-col" aria-label="Mobile">
              {NAV.map((n) => (
                <a
                  key={n.label}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-black/5"
                >
                  {n.label}
                </a>
              ))}
              <a
                href="#beta"
                onClick={() => setOpen(false)}
                className="mt-2 inline-flex justify-center rounded-xl border-2 border-[var(--scene-line)] bg-[#232323] text-white font-silk text-sm px-4 py-3"
              >
                Join Closed Beta
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
