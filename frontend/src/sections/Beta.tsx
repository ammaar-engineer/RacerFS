import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Check } from 'lucide-react'
import { Cat } from '../pixel/Cat'
import { Petals } from '../pixel/Critters'

/** Cardboard box with a sleeping cat inside */
function CatInBox() {
  return (
    <div className="relative w-fit mx-auto" aria-hidden>
      {/* cat pokes out above the box */}
      <div className="relative z-10 -mb-7 ml-6">
        <Cat variant="sleep" px={4} />
      </div>
      {/* box */}
      <div className="relative">
        {/* flaps */}
        <div className="absolute -top-3 left-2 w-16 h-6 rounded-t-md border-2 border-[var(--scene-line)]/60 bg-[#b98d63] -rotate-6 origin-bottom" />
        <div className="absolute -top-3 right-2 w-16 h-6 rounded-t-md border-2 border-[var(--scene-line)]/60 bg-[#b98d63] rotate-6 origin-bottom" />
        {/* body */}
        <div className="w-56 h-28 rounded-b-xl rounded-t-md border-2 border-[var(--scene-line)]/60 bg-[#c9a173] relative overflow-hidden">
          <div className="absolute left-1/2 top-0 bottom-0 w-6 -translate-x-1/2 bg-[#b98d63]/70" />
          <p className="absolute bottom-3 right-3 font-silk text-[9px] tracking-widest text-[#6b4d12]/60 rotate-[-2deg]">
            RACERFS · HANDLE WITH CARE
          </p>
          <div className="absolute bottom-3 left-3 text-[#6b4d12]/50 font-silk text-[9px] rotate-2">
            ↑ this side up
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Beta() {
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Hmm, that email looks odd — mind checking it?')
      return
    }
    setError('')
    setDone(true)
  }

  return (
    <section id="beta" className="relative py-24 sm:py-32 overflow-hidden" aria-label="Join the closed beta">
      <Petals count={8} />
      <div className="mx-auto max-w-7xl px-4">
        <motion.div
          initial={{ opacity: 0, y: 34 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto max-w-4xl rounded-[2.5rem] border-2 border-[var(--scene-line)]/10 bg-gradient-to-b from-[#FFF3D1] to-[#FFE6A7]/70 paper-tex px-6 sm:px-14 py-14 text-center shadow-[0_24px_60px_rgba(35,35,35,0.10)] overflow-visible"
        >
          <div className="absolute -top-16 left-1/2 -translate-x-1/2">
            <CatInBox />
          </div>

          <div className="pt-24">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--scene-line)]/15 bg-[var(--paper)]/80 px-4 py-1.5 text-xs font-semibold tracking-wide shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6fbf4a] animate-pulse" />
              Closed Beta — invites in small batches
            </span>
            <h2 className="mt-6 font-pixel text-3xl sm:text-5xl leading-tight text-balance">
              There's a box with your name on it.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-foreground/65 text-base sm:text-lg leading-relaxed">
              We're inviting a small group of makers to try RacerFS early and help shape it.
              Free while in beta — bring your weirdest hardware.
            </p>

            {done ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mx-auto mt-9 max-w-md rounded-2xl border-2 border-[#6fbf4a]/40 bg-[#CDEEB6]/70 px-6 py-5"
                role="status"
              >
                <p className="flex items-center justify-center gap-2 font-pixel text-lg">
                  <Check size={18} className="text-[#2f5522]" />
                  You're on the waitlist!
                </p>
                <p className="mt-1.5 text-sm text-foreground/60">
                  The cat will guard your spot. We'll email when a batch opens. 🐾
                </p>
              </motion.div>
            ) : (
              <form onSubmit={submit} className="mx-auto mt-9 flex max-w-md flex-col sm:flex-row gap-3" noValidate>
                <label htmlFor="beta-email" className="sr-only">Email address</label>
                <div className="relative flex-1">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/35" />
                  <input
                    id="beta-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@homelab.dev"
                    className="w-full rounded-2xl border-2 border-[var(--scene-line)]/20 bg-white py-4 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-foreground/30 focus:border-[#f78ca0]/60 focus:shadow-[0_0_0_4px_rgba(247,140,160,0.15)]"
                  />
                </div>
                <button
                  type="submit"
                  className="rounded-2xl border-2 border-[var(--scene-line)] bg-[#232323] px-6 py-4 font-silk text-xs text-white whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_0_rgba(35,35,35,0.35)] active:translate-y-0 active:scale-95 active:shadow-none"
                >
                  Join Waitlist
                </button>
              </form>
            )}
            {error && <p className="mt-3 text-sm text-[#c2465c]" role="alert">{error}</p>}

            <p className="mt-5 text-xs text-foreground/45">
              We'll only send important updates. No spam — the cat hates spam.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
