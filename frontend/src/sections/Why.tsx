import { motion } from 'framer-motion'
import { PixelSprite } from '../pixel/sprite'
import {
  ICON_BOLT, ICON_SHIELD, ICON_GEAR, HEART, ICON_BLOCKS, ICON_PENGUIN,
} from '../pixel/maps'
import { SectionHeading, cardHover, softCard } from './shared'

const FEATURES = [
  {
    icon: ICON_BOLT,
    tint: '#FFF3D1',
    title: 'Lightning Fast',
    body: 'A data path tuned for modern NVMe. Parallel I/O, zero-copy reads, and metadata that keeps up with your fastest builds.',
  },
  {
    icon: ICON_SHIELD,
    tint: '#EAF8FF',
    title: 'Reliable Metadata',
    body: 'Checksummed metadata with copy-on-write semantics. Power cut mid-write? Your tree is still a tree when you come back.',
  },
  {
    icon: ICON_GEAR,
    tint: '#F7F6F3',
    title: 'Built in Rust',
    body: 'Memory-safe by construction. No data races, no use-after-free — just a kernel module you can actually reason about.',
  },
  {
    icon: HEART,
    tint: '#FFE9EC',
    title: 'Open Source',
    body: 'Every line is public. Audit it, fork it, improve it. RacerFS grows with its community, one paw-print at a time.',
  },
  {
    icon: ICON_BLOCKS,
    tint: '#EAF8FF',
    title: 'Modern Architecture',
    body: 'Extents, B+ trees, and copy-on-write from day one — designed for SSDs and PMEM instead of spinning rust.',
  },
  {
    icon: ICON_PENGUIN,
    tint: '#F0F9E8',
    title: 'Designed for Linux',
    body: 'A first-class Linux citizen: native VFS integration, familiar tooling, and mounts that feel like home.',
  },
]

export default function Why() {
  return (
    <section id="features" className="relative py-24 sm:py-32" aria-label="Why RacerFS">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          kicker="🐾 Why RacerFS?"
          title="Small cat. Serious engineering."
          sub="Under the whiskers is a filesystem built like a race car — every design choice measured, every fast path profiled."
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <motion.article
              key={f.title}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: (i % 3) * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={`${softCard} ${cardHover} group p-7`}
            >
              <div
                className="inline-grid place-items-center w-14 h-14 rounded-2xl border-2 border-[var(--scene-line)]/10 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3"
                style={{ background: f.tint }}
              >
                <PixelSprite map={f.icon} px={4} />
              </div>
              <h3 className="mt-5 font-pixel text-xl">{f.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-foreground/60">{f.body}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}
