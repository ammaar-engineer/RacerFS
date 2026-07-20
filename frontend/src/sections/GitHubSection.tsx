import { motion } from 'framer-motion'
import { Github, Star, GitFork, GitCommit, Users, Tag, ExternalLink } from 'lucide-react'
import { SectionHeading, softCard } from './shared'
import { useRepoStats } from '../hooks/useRepoStats'
import { PixelSprite } from '../pixel/sprite'
import { CAT_FACE } from './Header'

const REPOS = [
  { name: 'RacerFS', desc: 'The filesystem core — kernel module & format tools.' },
  { name: 'racer-cli-system', desc: 'The friendly CLI for mounting, inspecting and tuning.' },
  { name: 'racer-backend-system', desc: 'Backend services powering the beta program.' },
]

export default function GitHubSection() {
  const stats = useRepoStats()

  const cells = [
    { icon: Star, label: 'Stars', value: stats.stars !== null ? String(stats.stars) : '—' },
    { icon: GitFork, label: 'Forks', value: stats.forks !== null ? String(stats.forks) : '—' },
    { icon: GitCommit, label: 'Commits', value: 'daily' },
    { icon: Users, label: 'Contributors', value: 'growing' },
    { icon: Tag, label: 'Latest release', value: 'v0.3.0-beta' },
  ]

  return (
    <section id="github" className="relative py-24 sm:py-32 bg-[var(--secondary)]/50" aria-label="GitHub repository">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          kicker="🐙 GitHub"
          title="Open source, whiskers and all."
          sub="Star the repo to give the cat a treat. Watch it to follow the journey to v1.0."
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className={`${softCard} mt-14 overflow-hidden`}
        >
          {/* repo header */}
          <div className="flex flex-wrap items-center gap-4 border-b-2 border-[var(--scene-line)]/8 bg-[var(--paper)]/60 px-6 sm:px-10 py-6">
            <div className="grid place-items-center w-12 h-12 rounded-2xl border-2 border-[var(--scene-line)]/10 bg-[#EAF8FF]">
              <PixelSprite map={CAT_FACE} px={4} />
            </div>
            <div className="min-w-0">
              <p className="font-pixel text-xl truncate">ammaar-engineer / RacerFS</p>
              <p className="text-sm text-foreground/55 truncate">
                The cutest filesystem you'll ever trust. Rust · Linux · Closed Beta
              </p>
            </div>
            <a
              href="https://github.com/ammaar-engineer/RacerFS"
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-2 rounded-xl border-2 border-[var(--scene-line)] bg-[#232323] px-5 py-3 font-silk text-xs text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_6px_0_rgba(35,35,35,0.35)] active:translate-y-0 active:shadow-none"
            >
              <Github size={15} />
              View Repository
              <ExternalLink size={12} />
            </a>
          </div>

          {/* stats */}
          <div className="grid grid-cols-2 sm:grid-cols-5 divide-x-2 divide-[var(--scene-line)]/5">
            {cells.map((c) => (
              <div key={c.label} className="px-4 py-6 text-center">
                <c.icon size={17} className="mx-auto text-foreground/40" />
                <p className="mt-2 font-pixel text-xl">{c.value}</p>
                <p className="text-xs text-foreground/45">{c.label}</p>
              </div>
            ))}
          </div>

          {/* sub repos */}
          <div className="grid gap-4 sm:grid-cols-3 border-t-2 border-[var(--scene-line)]/8 bg-[var(--paper)]/40 px-6 sm:px-10 py-7">
            {REPOS.map((r) => (
              <a
                key={r.name}
                href={`https://github.com/ammaar-engineer/${r.name}`}
                target="_blank"
                rel="noreferrer"
                className="group rounded-2xl border-2 border-[var(--scene-line)]/10 bg-[var(--paper)] p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(35,35,35,0.12)]"
              >
                <p className="font-silk text-xs flex items-center gap-2">
                  <Github size={13} />
                  {r.name}
                  <ExternalLink size={11} className="opacity-0 transition-opacity group-hover:opacity-60" />
                </p>
                <p className="mt-2 text-sm text-foreground/55 leading-relaxed">{r.desc}</p>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
