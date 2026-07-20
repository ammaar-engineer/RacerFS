import React from 'react'
import { motion } from 'framer-motion'
import { SectionHeading } from './shared'
import { PixelSprite } from '../pixel/sprite'
import { TRAIN_ENGINE } from '../pixel/maps'
import { CAT_FACE } from './Header'

type Status = 'done' | 'current' | 'next'

interface Milestone {
  label: string
  status: Status
  detail: string
  quarter: string
  tags: string[]
}

const MILESTONES: Milestone[] = [
  { label: 'Alpha', status: 'done', detail: 'Core format, mounts rw, fsck', quarter: 'Q1 ’25', tags: ['format', 'mount', 'fsck'] },
  { label: 'Closed Beta', status: 'current', detail: 'You are here — testing with makers', quarter: 'Q3 ’25', tags: ['stability', 'feedback'] },
  { label: 'Public Beta', status: 'next', detail: 'Stability hardening, docs, packages', quarter: 'Q1 ’26', tags: ['docs', 'packages'] },
  { label: 'v1.0', status: 'next', detail: 'On-disk format freeze, LTS kernels', quarter: 'Q3 ’26', tags: ['freeze', 'LTS'] },
  { label: 'Enterprise', status: 'next', detail: 'Support, tuning guides, SLAs', quarter: '2027', tags: ['support', 'SLA'] },
]

const statusStyle: Record<Status, { bg: string; border: string; text: string }> = {
  done: { bg: '#CDEEB6', border: '#6fbf4a', text: '#2f5522' },
  current: { bg: '#FFE6A7', border: '#d9a83e', text: '#6b4d12' },
  next: { bg: '#F7F6F3', border: '#d6d3d1', text: '#57534e' },
}


// Shared height (px above the rail) where every coupler + buffer meets, so the
// engine and all wagons link up along one straight line and connect perfectly.
// Raised to sit at the underframe/chassis level (just above the wheels).
const AXLE = 26

function Engine() {
  const px = 7
  return (
    <div className="relative shrink-0 flex flex-col items-center" aria-hidden>
      {/* chimney smoke (chimney sits near the front-left, cols 4-7) */}
      <div className="absolute z-10" style={{ left: 4 * px, top: -6 }}>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="absolute w-2.5 h-2.5 bg-[#e7e5e4]"
            style={{ animation: `smoke-puff 2.4s ease-out ${i * 0.8}s infinite`, left: i * 4 }}
          />
        ))}
      </div>
      <div className="relative">
        <PixelSprite map={TRAIN_ENGINE} px={px} />
        {/* the cat, now the masinis, peeks out of the cab window (cols 17-22) */}
        <div className="absolute z-20" style={{ left: 17 * px + 5, top: 4 * px }}>
          <PixelSprite map={CAT_FACE} px={4} />
        </div>
      </div>
      {/* round driving wheels below the boiler (match the wagons) */}
      <EngineWheels />
      {/* rear coupler buffer — sits on the shared axle line */}
      <span
        className="absolute right-0 w-2.5 h-2 bg-[#57534e] border border-[var(--scene-line)]"
        style={{ bottom: AXLE - 4 }}
      />
    </div>
  )
}

// One spoked, spinning steel wheel — reused by every car so they all match.
function Wheel({ size = 28 }: { size?: number }) {
  return (
    <div
      className="relative overflow-hidden rounded-full border-[3px] border-[var(--scene-line)] bg-[#3f3f3f]"
      style={{ width: size, height: size, animation: 'spin-left 1.4s linear infinite' }}
    >
      {/* four spokes */}
      <span className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-[#e7e5e4]/70" />
      <span className="absolute top-1/2 left-0 right-0 h-[2px] -translate-y-1/2 bg-[#e7e5e4]/70" />
      <span className="absolute left-1/2 top-1/2 h-[140%] w-[2px] -translate-x-1/2 -translate-y-1/2 rotate-45 bg-[#e7e5e4]/40" />
      <span className="absolute left-1/2 top-1/2 h-[140%] w-[2px] -translate-x-1/2 -translate-y-1/2 -rotate-45 bg-[#e7e5e4]/40" />
      {/* hub */}
      <span className="absolute inset-[34%] rounded-full bg-[#e7e5e4] border border-[var(--scene-line)]" />
    </div>
  )
}

// A two-wheel bogie shared by every wagon so all wheels match.
function Wheels() {
  return (
    <div className="mx-auto w-36 flex justify-between px-3 -mt-1" aria-hidden>
      <Wheel />
      <Wheel />
    </div>
  )
}

// Engine running gear: one small leading wheel + two big drivers under the boiler.
function EngineWheels() {
  return (
    <div className="flex items-end gap-3 -mt-1 pl-3" aria-hidden>
      <Wheel size={22} />
      <Wheel size={30} />
      <Wheel size={30} />
    </div>
  )
}

// Knuckle coupler bridging two cars, centred on the shared axle line. The steel
// draw bar is extended past its own box (-inset-x) and the whole coupler is pulled
// in with negative margins so it tucks under both cars and reads as one solid link.
function Coupler() {
  return (
    <div
      className="relative z-10 shrink-0 mx-2 flex items-center justify-center -translate-y-0.5"
      style={{ width: 12, height: AXLE * 2 }}
      aria-hidden
    >
      {/* continuous steel draw bar, extended to overlap the buffers on both cars */}
      <span className="absolute -inset-x-3 top-1/2 -translate-y-1/2 h-2 bg-[#57534e] border-y border-[var(--scene-line)]" />
      {/* central knuckle joint */}
      <span className="relative w-4 h-4 rounded-[3px] border-2 border-[var(--scene-line)] bg-[#8a6b4a] shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]" />
    </div>
  )
}

function Wagon({ label, status, detail, quarter, tags }: Milestone) {
  const s = statusStyle[status]
  const isCurrent = status === 'current'
  return (
    <motion.div
      initial={false}
      animate={{ y: 0 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.2 }}
      className="relative shrink-0"
    >
      {/* status flag */}
      <div
        className={`absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border-2 px-3 py-1 font-silk text-[10px] z-20 ${
          isCurrent ? 'animate-pulse' : ''
        }`}
        style={{ background: s.bg, borderColor: s.border, color: s.text }}
      >
        {status === 'done' ? '✓ done' : isCurrent ? '● now' : '○ next'}
      </div>

      <div className="relative">
        {/* pulsing halo for the current milestone */}
        {isCurrent && (
          <div
            className="absolute -inset-2 rounded-lg blur-md opacity-60 animate-pulse"
            style={{ background: s.border }}
            aria-hidden
          />
        )}
        {/* pixel roof cap */}
        <div
          className="relative z-10 mx-auto h-3 w-40 border-2 border-b-0 border-[var(--scene-line)]"
          style={{ background: s.border }}
          aria-hidden
        />
        {/* boxcar body (square pixel frame) */}
        <div
          className="relative z-10 w-44 border-2 border-[var(--scene-line)] px-4 pt-3 pb-4 text-center shadow-[0_6px_16px_rgba(35,35,35,0.10)]"
          style={{ background: s.bg }}
        >
          {/* corner rivets */}
          {['left-1 top-1', 'right-1 top-1', 'left-1 bottom-1', 'right-1 bottom-1'].map((pos) => (
            <span key={pos} className={`absolute ${pos} w-1 h-1 bg-[var(--scene-line)]/40`} aria-hidden />
          ))}
          <p className="font-silk text-[10px] tracking-wide" style={{ color: s.text, opacity: 0.7 }}>
            {quarter}
          </p>
          <p className="mt-1 font-pixel text-lg leading-none" style={{ color: s.text }}>
            {label}
          </p>
          <p className="mt-2 text-[11px] leading-snug" style={{ color: s.text, opacity: 0.8 }}>
            {detail}
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-1">
            {tags.map((t) => (
              <span
                key={t}
                className="border px-1.5 py-0.5 text-[9px] font-semibold leading-none"
                style={{ borderColor: s.border, color: s.text, background: 'rgba(255,255,255,0.35)' }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>
        {/* underframe / chassis */}
        <div
          className="relative z-10 mx-auto h-2.5 w-40 border-2 border-t-0 border-[var(--scene-line)] bg-[#57534e]"
          aria-hidden
        />
      </div>
      {/* wheels */}
      <Wheels />
      {/* side coupler buffers on the shared axle line */}
      <span
        className="absolute left-0 w-2.5 h-2 bg-[#57534e] border border-[var(--scene-line)]"
        style={{ bottom: AXLE - 4 }}
        aria-hidden
      />
      <span
        className="absolute right-0 w-2.5 h-2 bg-[#57534e] border border-[var(--scene-line)]"
        style={{ bottom: AXLE - 4 }}
        aria-hidden
      />
    </motion.div>
  )
}

export default function Roadmap() {
  return (
    <section id="roadmap" className="relative py-24 sm:py-32 overflow-hidden" aria-label="Roadmap">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeading
          kicker="🚂 Roadmap"
          title="The little train that could."
          sub="Every wagon is a milestone. We're chugging steadily — no hype, just track."
        />

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.8 }}
          className="mt-16"
        >
          <div className="overflow-x-auto pb-1 -mx-4 px-4 no-scrollbar">
            <div className="anim-chug w-fit mx-auto">
              <div className="flex items-end gap-0 w-max pt-14">
                <Engine />
                {MILESTONES.map((m) => (
                  <React.Fragment key={m.label}>
                    <Coupler />
                    <Wagon {...m} />
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
          {/* railroad track: steel rail on animated wooden sleepers. The train stays
              put, but the ties + a rail glint scroll left so it reads as moving. */}
          <div className="relative h-5 -mt-1.5" aria-hidden>
            {/* wooden sleepers (ties) — scroll left to fake forward motion */}
            <div
              className="anim-rail absolute inset-x-0 top-2 h-2"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, #9B7653 0 5px, transparent 5px 17px)',
              }}
            />
            {/* steel rail */}
            <div className="absolute inset-x-0 top-1 h-1.5 rounded bg-[#6f6f6f]" />
            <div className="absolute inset-x-0 top-1 h-[3px] rounded bg-[#c8c8c8]/40" />
            {/* a bright glint sliding along the rail for extra speed */}
            <div
              className="anim-rail-shine absolute inset-x-0 top-1 h-[3px] rounded"
              style={{
                backgroundImage:
                  'repeating-linear-gradient(90deg, transparent 0 22px, rgba(255,255,255,0.75) 22px 28px, transparent 28px 40px)',
              }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
