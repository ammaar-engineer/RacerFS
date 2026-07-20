import { motion } from 'framer-motion'

export function SectionHeading({
  kicker,
  title,
  sub,
}: {
  kicker: string
  title: string
  sub?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="text-center max-w-2xl mx-auto"
    >
      <span className="inline-flex items-center gap-2 rounded-full border border-[var(--scene-line)]/12 bg-[var(--paper)]/80 px-4 py-1.5 text-xs font-semibold tracking-wide text-foreground/70 shadow-sm">
        {kicker}
      </span>
      <h2 className="mt-5 font-pixel text-3xl sm:text-5xl leading-tight tracking-tight text-balance">
        {title}
      </h2>
      {sub && <p className="mt-4 text-foreground/60 text-base sm:text-lg leading-relaxed">{sub}</p>}
    </motion.div>
  )
}

export const cardHover =
  'transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_16px_36px_rgba(35,35,35,0.12)]'

export const softCard =
  'rounded-3xl border-2 border-[var(--scene-line)]/10 bg-[var(--paper)] shadow-[0_8px_24px_rgba(35,35,35,0.06)]'
