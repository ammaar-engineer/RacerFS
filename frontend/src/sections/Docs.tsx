import { motion } from 'framer-motion'
import { ArrowRight, BookOpen, FolderTree, LifeBuoy, TerminalSquare } from 'lucide-react'
import { SectionHeading, softCard } from './shared'
import { Cat } from '../pixel/Cat'

const DOCS = [
  { icon: BookOpen, title: 'Getting Started', body: 'Install, build the module, and mount your first volume in ten minutes.' },
  { icon: TerminalSquare, title: 'CLI Reference', body: 'Every racer command, flag and config knob — with examples.' },
  { icon: FolderTree, title: 'On-disk Format', body: 'Superblocks, B+ trees and journals, explained with diagrams.' },
  { icon: LifeBuoy, title: 'Troubleshooting', body: 'fsck, recovery and the classic “my cat unplugged the SSD”.' },
]

/** A little pixel bookshelf */
function Bookshelf() {
  const books = [
    { c: '#f78ca0', h: 74 }, { c: '#7cc6e8', h: 64 }, { c: '#f5cf7d', h: 70 },
    { c: '#8ecf6f', h: 60 }, { c: '#b9a7f9', h: 72 }, { c: '#FFDCC8', h: 58 },
    { c: '#9ed9f2', h: 68 },
  ]
  return (
    <div className="relative flex items-end gap-1.5 px-2" aria-hidden>
      {books.map((b, i) => (
        <div
          key={i}
          className="w-6 rounded-t-[4px] border-2 border-[var(--scene-line)]/60 origin-bottom relative"
          style={{ height: b.h, background: b.c }}
        >
          <span className="absolute left-1/2 top-2 -translate-x-1/2 w-2.5 h-1 rounded bg-white/70" />
        </div>
      ))}
      {/* shelf */}
      <div className="absolute -bottom-2 left-0 right-0 h-2.5 rounded-sm bg-[#9B7653] border-2 border-[var(--scene-line)]/50" />
    </div>
  )
}

export default function Docs() {
  return (
    <section id="docs" className="relative py-24 sm:py-32" aria-label="Documentation">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          kicker="📚 Documentation"
          title="Docs a human can read."
          sub="Short pages, real examples, and diagrams drawn with care. The docs grow with every beta batch."
        />

        <div className="mt-12 flex flex-col items-center">
          {/* illustration side */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className={`${softCard} relative paper-tex px-8 pt-10 pb-24 overflow-visible w-full max-w-2xl`}
          >
            <p className="font-silk text-[10px] tracking-[0.25em] text-foreground/40 text-center">
              THE RACERFS LIBRARY
            </p>
            <div className="mt-8 flex justify-center">
              <Bookshelf />
            </div>
            {/* reading cat */}
            <div className="absolute -bottom-6 right-8">
              <Cat variant="sit" px={5} lookAtCursor />
            </div>
            {/* open book in front of cat */}
            <div className="absolute bottom-2 right-[4.7rem] w-16 h-9" aria-hidden>
              <div className="absolute inset-0 rounded-sm border-2 border-[var(--scene-line)]/60 bg-white" />
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-[var(--scene-line)]/30" />
              <div className="absolute left-2 top-2 right-9 space-y-1">
                <div className="h-0.5 bg-[#d6d3d1] rounded" />
                <div className="h-0.5 bg-[#d6d3d1] rounded w-4/5" />
                <div className="h-0.5 bg-[#d6d3d1] rounded" />
              </div>
              <div className="absolute right-2 top-2 left-9 space-y-1">
                <div className="h-0.5 bg-[#d6d3d1] rounded" />
                <div className="h-0.5 bg-[#d6d3d1] rounded w-3/5" />
                <div className="h-0.5 bg-[#d6d3d1] rounded" />
              </div>
            </div>
          </motion.div>

          {/* content side */}
          <div className="mt-12 w-full">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {DOCS.map((d, i) => (
                <motion.a
                   key={d.title}
                   href="https://github.com/ammaar-engineer/RacerFS"
                   target="_blank"
                   rel="noreferrer"
                   initial={{ opacity: 0, y: 22 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true, margin: '-40px' }}
                   transition={{ delay: i * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                   className={`${softCard} group p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(35,35,35,0.12)]`}
                >
                  <div className="inline-grid place-items-center w-11 h-11 rounded-xl bg-[#FFF3D1] border-2 border-[var(--scene-line)]/10 transition-transform duration-300 group-hover:scale-110">
                    <d.icon size={19} />
                  </div>
                  <h3 className="mt-4 font-pixel text-lg">{d.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">{d.body}</p>
                </motion.a>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mt-10 flex justify-center"
            >
              <a
                href="https://github.com/ammaar-engineer/RacerFS"
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-2xl border-2 border-[var(--scene-line)] bg-[#232323] px-6 py-3.5 font-silk text-xs text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_0_rgba(35,35,35,0.35)] active:translate-y-0 active:shadow-none"
              >
                Read Documentation
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

