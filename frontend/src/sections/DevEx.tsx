import { useEffect, useRef, useState } from 'react'
import { motion, useInView } from 'framer-motion'
import { Hammer, GitBranch, PackageCheck, Puzzle } from 'lucide-react'
import { SectionHeading, softCard } from './shared'

const SCRIPT = [
  { text: '$ cargo build --release', type: 'cmd' },
  { text: '    Finished `release` profile [optimized] in 12.4s', type: 'out' },
  { text: '$ sudo mkfs.racerfs /dev/nvme0n1', type: 'cmd' },
  { text: '🐾 racerfs: formatted 953.9 GiB in 0.8s — purrfect', type: 'out' },
  { text: '$ sudo mount -t racerfs /dev/nvme0n1 /mnt/fast', type: 'cmd' },
  { text: '$ echo "nyan" > /mnt/fast/hello.txt', type: 'cmd' },
  { text: '$ cat /mnt/fast/hello.txt', type: 'cmd' },
  { text: 'nyan', type: 'out' },
  { text: '$ df -h /mnt/fast', type: 'cmd' },
  { text: 'Filesystem      Size  Used Avail Use% Mounted on\n/dev/nvme0n1    954G   4.0K  954G   1% /mnt/fast', type: 'out' },
  { text: '$ racerfs-cli status', type: 'cmd' },
  { text: '🐱 RacerFS status: active & purring\n   Uptime: 12s | IOPS: 128.4k | Temp: 38°C\n   All blocks healthy.', type: 'out' },
] as const

/** Terminal with a typewriter replay */
function Terminal() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [progress, setProgress] = useState(0) // total chars revealed
  const full = SCRIPT.map((l) => l.text).join('\n')
  const total = full.length

  useEffect(() => {
    if (!inView) return
    let i = 0
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      i += 1 + Math.floor(Math.random() * 3)
      setProgress(Math.min(i, total))
      if (i < total) timer = setTimeout(tick, 24 + Math.random() * 40)
    }
    timer = setTimeout(tick, 500)
    return () => clearTimeout(timer)
  }, [inView, total])

  // render revealed portion, line-aware
  let remaining = progress
  const lines = SCRIPT.map((l) => {
    const take = Math.max(0, Math.min(remaining, l.text.length))
    remaining -= l.text.length + 1 // newline
    return { ...l, shown: l.text.slice(0, take) }
  })
  const lastShown = lines.reduce((acc, l, i) => (l.shown ? i : acc), -1)

  return (
    <div ref={ref} className="rounded-2xl border-2 border-[var(--scene-line)]/60 bg-[#1c1f26] shadow-[0_20px_50px_rgba(35,35,35,0.25)] overflow-hidden h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 bg-[#262a33] border-b border-white/5">
        <span className="w-3 h-3 rounded-full bg-[#ff8fa3]" />
        <span className="w-3 h-3 rounded-full bg-[#f5cf7d]" />
        <span className="w-3 h-3 rounded-full bg-[#8ecf6f]" />
        <span className="ml-3 font-silk text-[10px] tracking-wider text-white/40">
          shiro@racerlab — building RacerFS
        </span>
      </div>
      <div className="p-5 font-mono text-[12.5px] sm:text-sm leading-7 min-h-[264px] flex-1" aria-label="Terminal demo: building and mounting RacerFS">
        {lines.map((l, i) =>
          l.shown ? (
            <div key={i} className={l.type === 'cmd' ? 'text-[#cdeeb6]' : 'text-white/55'}>
              <span className="whitespace-pre-wrap">{l.shown}</span>
              {i === lastShown && progress < total ? (
                <span className="anim-caret inline-block w-2 h-4 bg-[#cdeeb6] align-middle ml-0.5" />
              ) : null}
            </div>
          ) : null
        )}
        {progress >= total && (
          <div className="text-[#cdeeb6]">
            $ <span className="anim-caret inline-block w-2 h-4 bg-[#cdeeb6] align-middle" />
          </div>
        )}
      </div>
    </div>
  )
}

const POINTS = [
  { icon: Hammer, title: 'Easy build', body: 'One cargo command. No patch quilt, no kernel-tree surgery, no tears.' },
  { icon: Puzzle, title: 'Simple API', body: 'Small, documented ioctls and a friendly CLI. Scriptable from day one.' },
  { icon: GitBranch, title: 'GitHub workflow', body: 'Issues, PRs and discussions in the open. Roadmap shaped with the community.' },
  { icon: PackageCheck, title: 'CI/CD', body: 'Every commit built, tested and fuzzed on real block devices in CI.' },
]

export default function DevEx() {
  return (
    <section id="devex" className="relative py-24 sm:py-32 bg-[var(--secondary)]/50" aria-label="Developer experience">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          kicker="🛠️ Developer Experience"
          title="From git clone to mounted in minutes."
          sub="The CLI does the chores. You keep the flow state — and the cat keeps the watch."
        />

        <div className="mt-14 grid items-stretch gap-10 lg:grid-cols-2">
          <motion.div
            className="h-full"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <Terminal />
          </motion.div>

          <div className="grid gap-5 sm:grid-cols-2">
            {POINTS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className={`${softCard} p-6`}
              >
                <div className="inline-grid place-items-center w-11 h-11 rounded-xl bg-[#EAF8FF] border-2 border-[var(--scene-line)]/10">
                  <p.icon size={19} />
                </div>
                <h3 className="mt-4 font-pixel text-lg">{p.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-foreground/60">{p.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
