import { motion } from 'framer-motion'
import { ArrowRight, Github, Star, Scale, Heart } from 'lucide-react'
import RiversideScene from '../pixel/Scene'
import { Cat } from '../pixel/Cat'
import { Butterfly, Dragonfly, Petals } from '../pixel/Critters'
import { PixelSprite } from '../pixel/sprite'
import { YARN, MILK } from '../pixel/maps'
import { useRepoStats } from '../hooks/useRepoStats'

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.12 * i, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

export default function Hero() {
  const stats = useRepoStats()

  return (
    <section id="home" className="relative min-h-[108vh] overflow-hidden" aria-label="RacerFS hero">
      <RiversideScene />
      <Petals count={12} />

      {/* butterflies & dragonflies around the hero */}
      <Butterfly className="absolute left-[12%] top-[30%] z-20" delay={1} />
      <Butterfly className="absolute right-[14%] top-[42%] z-20" color="U" delay={4} />
      <Dragonfly className="absolute left-[22%] bottom-[26%] z-20" delay={2} />

      {/* card + decorations */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-36 sm:pt-40 pb-24">
        <div className="relative mx-auto max-w-3xl">
          {/* hiding cat — behind the card, left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            className="absolute -left-16 top-24 hidden md:block z-0"
          >
            <Cat variant="sit" px={4} lookAtCursor className="opacity-95" />
          </motion.div>

          {/* sitting cat — right of card, on the grass */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.8 }}
            className="absolute -right-24 -bottom-14 hidden lg:block z-20"
          >
            <Cat variant="sit" px={5} lookAtCursor playful />
          </motion.div>

          {/* the card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 rounded-[2rem] border-2 border-[var(--scene-line)]/10 bg-[var(--paper)] paper-tex shadow-[0_24px_60px_rgba(35,35,35,0.12),0_4px_0_rgba(35,35,35,0.06)] px-6 sm:px-12 py-12 sm:py-14 text-center backdrop-blur-sm"
          >
            {/* sleeping cat on the card's top-right corner */}
            <motion.div
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.7 }}
              className="absolute -top-5 right-8 hidden sm:block"
            >
              <Cat variant="sleep" px={3} />
            </motion.div>

            {/* yarn + milk tucked at card base */}
            <div className="absolute -bottom-3 left-8 hidden sm:block anim-floaty-sm">
              <PixelSprite map={YARN} px={3} />
            </div>
            <div className="absolute -bottom-4 left-24 hidden sm:block anim-floaty-sm" style={{ animationDelay: '1.2s' }}>
              <PixelSprite map={MILK} px={3} />
            </div>

            <motion.div variants={fadeUp} initial="hidden" animate="show" custom={0}>
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--scene-line)]/12 bg-[var(--paper)]/80 px-4 py-1.5 text-xs sm:text-sm font-medium text-foreground/80 shadow-sm">
                🐾 Built for makers, not just kernel hackers
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={1}
              className="mt-7 font-pixel text-4xl sm:text-6xl leading-[1.08] tracking-tight text-balance"
            >
              The cutest filesystem
              <br />
              you'll ever{' '}
              <span className="relative inline-block">
                trust.
                <svg
                  className="absolute -bottom-2 left-0 w-full"
                  viewBox="0 0 120 10"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <motion.path
                    d="M2 7 Q 30 2, 60 6 T 118 4"
                    fill="none"
                    stroke="#f78ca0"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1.0, duration: 0.8, ease: 'easeOut' }}
                  />
                </svg>
              </span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={2}
              className="mt-5 font-silk text-sm sm:text-base tracking-wide text-foreground/70"
            >
              Fast. Reliable. Built in Rust.
            </motion.p>

            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={3}
              className="mx-auto mt-5 max-w-xl text-base sm:text-lg leading-relaxed text-foreground/65"
            >
              RacerFS is an experimental next-generation filesystem focused on performance,
              simplicity, and reliability. Designed for developers, homelabs, researchers and
              Linux enthusiasts.
            </motion.p>

            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={4}
              className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <a
                href="#beta"
                className="group inline-flex items-center gap-2 rounded-2xl border-2 border-[var(--scene-line)] bg-[#232323] px-7 py-4 font-silk text-sm text-white transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_0_rgba(35,35,35,0.35)] active:translate-y-0 active:scale-95 active:shadow-none"
              >
                Join Closed Beta
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href="https://github.com/ammaar-engineer/RacerFS"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-[var(--scene-line)]/25 bg-[var(--paper)] px-7 py-4 font-silk text-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_8px_0_rgba(35,35,35,0.14)] active:translate-y-0 active:scale-95 active:shadow-none"
              >
                <Github size={16} />
                View GitHub
              </a>
            </motion.div>

            {/* meta row */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="show"
              custom={5}
              className="mt-9 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-foreground/55"
            >
              <span className="inline-flex items-center gap-1.5">
                <Star size={14} className="text-[#f5cf7d]" fill="currentColor" />
                {stats.stars !== null ? `${stats.stars} GitHub stars` : 'Fresh on GitHub'}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Scale size={14} />
                {stats.license ?? 'Open Source'} License
              </span>
              <span className="inline-flex items-center gap-1.5">🦀 Written in Rust</span>
              <span className="inline-flex items-center gap-1.5">
                <Heart size={14} className="text-[#f78ca0]" fill="currentColor" />
                Open Source
              </span>
            </motion.div>
          </motion.div>

          {/* peeking cat under the card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7, duration: 0.8 }}
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 z-0 hidden sm:block"
          >
            <Cat variant="peek" px={4} />
          </motion.div>
        </div>
      </div>

      {/* climbing cat on the river bank */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute left-[7%] bottom-[24%] z-10 hidden xl:block"
      >
        <div className="anim-floaty-sm">
          <PixelSprite map={MILK} px={3} className="absolute -left-8 top-10 opacity-90" />
        </div>
      </motion.div>
    </section>
  )
}
