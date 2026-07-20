import { motion } from 'framer-motion'
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion'
import { SectionHeading } from './shared'
import { PixelSprite } from '../pixel/sprite'
import { PAW } from '../pixel/maps'
import { CAT_FACE } from './Header'

const QA = [
  {
    q: 'Is RacerFS production-ready?',
    a: "Not yet — it's an experimental filesystem in closed beta. Perfect for homelabs, test rigs and brave side-projects. For anything irreplaceable: backups first, always. The cat insists.",
  },
  {
    q: 'Which Linux kernels are supported?',
    a: 'We target recent LTS kernels (6.6+) during the beta, with the aim to support the two most recent LTS lines at v1.0.',
  },
  {
    q: 'How is it different from ext4, XFS or Btrfs?',
    a: 'RacerFS is copy-on-write and checksummed end-to-end like Btrfs, but deliberately smaller in scope: a compact codebase, extents + B+ trees, and a fast path tuned for modern NVMe — simplicity is a feature.',
  },
  {
    q: 'Can I try it today?',
    a: 'Yes — join the closed beta waitlist below. Invites roll out in small batches so we can pair every tester with a human (and a cat) who reads their feedback.',
  },
  {
    q: 'Is it really open source?',
    a: 'Every line. The kernel module, the CLI and the backend live in public GitHub repositories under an OSI-approved license. Audit away.',
  },
  {
    q: 'How can I contribute?',
    a: 'Start with the issue tracker — good first issues are labeled. Bug reports from weird hardware are especially treasured; benchmark PRs get head pats.',
  },
]

// Per-question cat tints so each little face has its own personality
const CAT_TINTS: Record<string, string>[] = [
  {},
  { P: '#cdeeb6', N: '#8ecf6f' },
  { P: '#bee8ff', N: '#8ad0f0' },
  { P: '#ffe6a7', N: '#f5cf7d' },
  { P: '#e7d6ff', N: '#b9a7f9' },
  { P: '#ffd9e2', N: '#ff8fa3' },
]

export default function FAQ() {
  return (
    <section id="faq" className="relative py-24 sm:py-32 bg-[var(--secondary)]/50" aria-label="Frequently asked questions">
      <div className="mx-auto max-w-3xl px-4">
        <SectionHeading
          kicker="💬 FAQ"
          title="Ask the cat anything."
          sub="The questions we hear most, answered honestly."
        />

        <motion.div
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12"
        >
          <Accordion type="single" collapsible className="flex flex-col gap-4">
            {QA.map((item, i) => (
              <AccordionItem
                key={i}
                value={`q-${i}`}
                className="relative rounded-3xl border-2 border-[var(--scene-line)]/10 bg-[var(--paper)] px-6 shadow-[0_6px_18px_rgba(35,35,35,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(35,35,35,0.10)] data-[state=open]:border-[#f78ca0]/40"
              >
                {/* speech bubble tail */}
                <span
                  className="absolute -left-1.5 top-8 w-3 h-3 rotate-45 border-l-2 border-b-2 border-[var(--scene-line)]/10 bg-[var(--paper)]"
                  aria-hidden
                />
                <AccordionTrigger className="py-5 hover:no-underline gap-4 [&>svg]:text-[#f78ca0]">
                  <span className="flex items-center gap-3 text-left">
                    <span className="shrink-0" aria-hidden>
                      <PixelSprite map={CAT_FACE} px={4} palette={CAT_TINTS[i % CAT_TINTS.length]} />
                    </span>
                    <span className="font-pixel text-base sm:text-lg leading-snug">{item.q}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pb-6 pl-11 text-sm sm:text-base leading-relaxed text-foreground/65">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        <div className="mt-10 flex justify-center gap-4 opacity-50" aria-hidden>
          <PixelSprite map={PAW} px={3} />
          <PixelSprite map={PAW} px={3} style={{ transform: 'rotate(20deg)' }} />
          <PixelSprite map={PAW} px={3} style={{ transform: 'rotate(-14deg)' }} />
        </div>
      </div>
    </section>
  )
}
