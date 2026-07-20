import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Cat } from '../pixel/Cat'
import { SectionHeading, softCard } from './shared'
import { Play, RotateCcw } from 'lucide-react'

interface Layer {
  id: string
  label: string
  w: string
  noteIndex: number // maps to NOTES index
  desc: string
}

const LAYERS: Layer[] = [
  { id: 'vfs', label: 'VFS layer', w: '92%', noteIndex: 0, desc: 'Translates OS system calls (write, read) into RacerFS requests.' },
  { id: 'tree', label: 'Inode B+ tree', w: '78%', noteIndex: 1, desc: 'Navigates and updates metadata quickly with checksummed node integrity.' },
  { id: 'alloc', label: 'Extent allocator', w: '64%', noteIndex: 0, desc: 'Finds fresh free blocks on disk to write data without overwriting old blocks.' },
  { id: 'journal', label: 'Journal (CoW)', w: '50%', noteIndex: 2, desc: 'Writes transaction records to ensure atomic, crash-safe operations.' },
]

const NOTES = [
  { n: '01', t: 'Copy-on-write everything', d: 'No in-place updates. New data lands in fresh blocks, then the tree swings over atomically.' },
  { n: '02', t: 'Checksums end to end', d: 'Every metadata block carries a CRC. Silent corruption gets caught, not copied.' },
  { n: '03', t: 'Journalled metadata', d: 'A tiny write-ahead journal makes crash recovery a replay, not a scavenger hunt.' },
]

export default function Architecture() {
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null)
  const [hoveredNote, setHoveredNote] = useState<number | null>(null)
  
  // Simulation states
  const [simStep, setSimStep] = useState<number>(-1) // -1: idle, 0: VFS, 1: Tree, 2: Allocator, 3: Journal, 4: SSD, 5: Done
  const [simStatus, setSimStatus] = useState<string>('System idle. Ready for write request.')

  useEffect(() => {
    if (simStep === -1) {
      setSimStatus('System idle. Ready for write request.')
      return
    }

    const statuses = [
      '📥 VFS: Intercepting write request and checking permissions...',
      '🔍 B+ Tree: Locating metadata node and preparing transaction...',
      '💾 Extent Allocator: Reserving fresh blocks on NVMe (No overwrite!)...',
      '📝 Journal: Logging CoW transaction logs to write-ahead log...',
      '⚡ NVMe SSD: Committing blocks atomically! Blocks updated.',
      '✨ Write Completed! System state is consistent and clean.',
    ]

    setSimStatus(statuses[simStep])

    if (simStep < 5) {
      const timer = setTimeout(() => {
        setSimStep((prev) => prev + 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else {
      const timer = setTimeout(() => {
        setSimStep(-1)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [simStep])

  const startSimulation = () => {
    setSimStep(0)
  }

  return (
    <section id="architecture" className="relative py-24 sm:py-32 bg-[var(--secondary)]/50" aria-label="Filesystem architecture">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          kicker="📐 Filesystem Architecture"
          title="Drawn up by a very careful cat."
          sub="A clean, layered design — small enough to hold in your head, fast enough to matter."
        />

        <div className="mt-14 grid items-stretch gap-10 lg:grid-cols-2">
          {/* Left Side: Blueprint Panel */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className={`${softCard} relative p-6 sm:p-8 paper-tex flex flex-col justify-between`}
          >
            {/* pencil note */}
            <div className="absolute top-5 right-6 rotate-6 rounded-lg border border-[var(--scene-line)]/15 bg-[#FFE6A7] px-3 py-1.5 font-silk text-[10px] shadow-sm z-10">
              v0.3 draft ♡
            </div>

            <div className="relative rounded-2xl border-2 border-[#3b5f8a]/40 bg-[#10233d] p-6 sm:p-8 overflow-hidden flex-1 flex flex-col justify-between min-h-[440px]">
              {/* blueprint grid */}
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'linear-gradient(rgba(190,232,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(190,232,255,0.35) 1px, transparent 1px)',
                  backgroundSize: '22px 22px',
                }}
                aria-hidden
              />
              
              <div className="relative flex flex-col items-center gap-3">
                <span className="font-silk text-[10px] tracking-[0.25em] text-[#BEE8FF]/70 mb-2">
                  RACERFS · ON-DISK LAYOUT
                </span>

                {LAYERS.map((l, i) => {
                  const isHovered = hoveredLayer === l.id || (hoveredNote !== null && NOTES[hoveredNote].n === NOTES[l.noteIndex].n)
                  const isActiveInSim = simStep === i
                  
                  return (
                    <div
                      key={l.id}
                      onMouseEnter={() => setHoveredLayer(l.id)}
                      onMouseLeave={() => setHoveredLayer(null)}
                      className={`relative rounded-lg border-2 px-4 py-2.5 text-center font-silk text-[11px] sm:text-xs transition-all duration-300 cursor-help ${
                        isActiveInSim
                          ? 'border-[#8ecf6f] bg-[#164f26]/90 text-[#8ecf6f] shadow-[0_0_15px_rgba(142,207,111,0.5)] scale-[1.03]'
                          : isHovered
                          ? 'border-[#ff8fa3] bg-[#4f1624]/90 text-[#ff8fa3] shadow-[0_0_15px_rgba(255,143,163,0.4)] scale-[1.02]'
                          : 'border-[#BEE8FF]/60 bg-[#16304f]/80 text-[#EAF8FF]'
                      }`}
                      style={{ width: l.w }}
                    >
                      {l.label}
                      {isHovered && (
                        <div className="absolute left-1/2 -bottom-1 translate-y-full -translate-x-1/2 bg-[#1c1f26] border border-[#ff8fa3]/30 text-[9px] font-sans px-2.5 py-1 rounded text-white/90 shadow-lg z-20 pointer-events-none whitespace-normal w-64 leading-normal">
                          {l.desc}
                        </div>
                      )}
                    </div>
                  )
                })}

                {/* animated flow line */}
                <svg width="4" height="34" className="my-0.5" aria-hidden>
                  <line
                    x1="2" y1="0" x2="2" y2="34"
                    stroke={simStep >= 0 && simStep < 4 ? '#8ecf6f' : '#BEE8FF'}
                    strokeWidth="2.5" strokeDasharray="6 6"
                    style={{ animation: 'dash-flow 1.2s linear infinite' }}
                  />
                </svg>

                {/* SSD */}
                <div
                  className={`flex items-center gap-3 rounded-xl border-2 px-6 py-3 transition-all duration-300 ${
                    simStep === 4
                      ? 'border-[#8ecf6f] bg-[#164f26]/90 text-[#8ecf6f] shadow-[0_0_15px_rgba(142,207,111,0.5)] scale-[1.03]'
                      : 'border-[#FFE6A7]/70 bg-[#1d3a5f]'
                  }`}
                >
                  <div className="flex gap-1" aria-hidden>
                    {[0, 1, 2, 3].map((idx) => {
                      const isSSDActive = simStep === 4 || simStep === 5
                      return (
                        <div
                          key={idx}
                          className={`w-2.5 h-5 rounded-[3px] transition-all duration-300 ${
                            isSSDActive
                              ? 'bg-[#8ecf6f] shadow-[0_0_8px_rgba(142,207,111,0.8)]'
                              : 'bg-[#9ed9f2]/80'
                          }`}
                        />
                      )
                    })}
                  </div>
                  <span className={`font-silk text-xs ${simStep === 4 ? 'text-[#8ecf6f]' : 'text-[#FFE6A7]'}`}>
                    NVMe SSD
                  </span>
                </div>
              </div>

              {/* Inspector status display */}
              <div className="mt-6 border-t border-[#3b5f8a]/30 pt-4 flex flex-col gap-3">
                <div className="bg-black/40 rounded-lg p-3 border border-white/5 font-mono text-[11px] leading-relaxed text-[#BEE8FF]/90 min-h-[50px] flex items-center">
                  {simStatus}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={startSimulation}
                    disabled={simStep !== -1}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 font-silk text-[10px] border transition-all duration-200 ${
                      simStep !== -1
                        ? 'border-white/10 bg-white/5 text-white/40 cursor-not-allowed'
                        : 'border-[#8ecf6f]/50 bg-[#164f26]/30 text-[#8ecf6f] hover:bg-[#164f26]/60 active:scale-95'
                    }`}
                  >
                    {simStep !== -1 && simStep < 5 ? (
                      <>
                        <RotateCcw size={11} className="animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play size={11} fill="currentColor" />
                        Simulate Write
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -right-4 sm:-right-8 z-10">
              <Cat variant="sit" px={5} lookAtCursor />
            </div>
          </motion.div>

          {/* Right Side: Notes */}
          <div className="flex flex-col justify-center gap-5">
            {NOTES.map((n, i) => {
              const isLayerHovered = LAYERS.some(l => l.noteIndex === i && l.id === hoveredLayer)
              const isNoteHovered = hoveredNote === i
              const isHighlight = isLayerHovered || isNoteHovered
              const isSimActive = (simStep === 0 && i === 0) || (simStep === 1 && i === 1) || (simStep === 2 && i === 0) || (simStep === 3 && i === 2)
              
              return (
                <motion.div
                  key={n.n}
                  onMouseEnter={() => setHoveredNote(i)}
                  onMouseLeave={() => setHoveredNote(null)}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className={`${softCard} flex gap-5 p-6 items-start transition-all duration-300 border-2 ${
                    isSimActive
                      ? 'border-[#8ecf6f]/80 bg-[#164f26]/10 shadow-[0_0_15px_rgba(142,207,111,0.15)] scale-[1.01]'
                      : isHighlight
                      ? 'border-[#ff8fa3]/80 bg-[#4f1624]/10 shadow-[0_0_15px_rgba(255,143,163,0.15)] scale-[1.01]'
                      : 'border-[var(--scene-line)]/60'
                  }`}
                >
                  <span className={`font-pixel text-2xl transition-colors duration-300 ${isSimActive ? 'text-[#8ecf6f]' : isHighlight ? 'text-[#ff8fa3]' : 'text-[#f78ca0]'}`}>
                    {n.n}
                  </span>
                  <div>
                    <h3 className="font-pixel text-lg">{n.t}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">{n.d}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
