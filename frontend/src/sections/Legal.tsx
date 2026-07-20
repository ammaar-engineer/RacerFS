import { motion } from 'framer-motion'
import { ShieldCheck, ScrollText } from 'lucide-react'
import { softCard, cardHover } from './shared'

export default function Legal() {
  return (
    <section id="privacy" className="relative py-20" aria-label="Privacy and terms">
      <div className="mx-auto max-w-5xl px-4 grid gap-5 sm:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6 }}
          className={`${softCard} ${cardHover} p-7`}
        >
          <div className="inline-grid place-items-center w-11 h-11 rounded-xl bg-[#EAF8FF] border-2 border-[var(--scene-line)]/10">
            <ShieldCheck size={19} />
          </div>
          <h3 className="mt-4 font-pixel text-lg">Privacy Policy</h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground/60">
            We collect exactly one thing: the email you volunteer for the waitlist. No trackers,
            no analytics pixels, no third-party cookies. Your address is used only for beta
            invites and important updates, and you can leave the list any time with one click.
          </p>
        </motion.div>
        <motion.div
          id="terms"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`${softCard} ${cardHover} p-7`}
        >
          <div className="inline-grid place-items-center w-11 h-11 rounded-xl bg-[#FFF3D1] border-2 border-[var(--scene-line)]/10">
            <ScrollText size={19} />
          </div>
          <h3 className="mt-4 font-pixel text-lg">Terms of the Beta</h3>
          <p className="mt-2 text-sm leading-relaxed text-foreground/60">
            RacerFS is experimental software provided as-is. It may eat your data (it hasn't yet,
            and the cat works hard to keep it that way). Use the beta for testing, keep backups,
            and share feedback so v1.0 earns your trust.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
