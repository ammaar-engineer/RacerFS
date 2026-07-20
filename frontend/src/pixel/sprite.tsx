import React from 'react'

export type PixelMap = string[]

export const PAL = {
  X: '#232323', // dark outline
  W: '#ffffff', // cat white
  w: '#f2f0ec', // white shading
  P: '#ffc2cf', // pink (inner ear)
  N: '#f78ca0', // nose pink
  B: '#232323', // eyes
  b: '#5a5a5a',
  Y: '#ffe6a7', // accent yellow
  y: '#f5cf7d',
  O: '#ff9d5c', // orange (fish)
  R: '#ff8fa3', // sakura deep
  r: '#ffd9e2', // sakura light
  G: '#8ecf6f', // grass deep
  g: '#cdeeb6', // grass light
  D: '#6fbf4a', // leaf dark
  L: '#9b7653', // brown wood
  l: '#b98d63', // light wood
  S: '#bee8ff', // sky
  C: '#ffffff', // cloud
  c: '#e8f4fb', // cloud shade
  M: '#a8c6e8', // mountain
  m: '#c7dcf2', // mountain light
  T: '#7cc6e8', // water
  t: '#a5ddf5', // water light
  K: '#4a4a4a', // soft black
  E: '#e7e5e4', // warm gray
  V: '#b9a7f9', // lavender butterfly
  U: '#8ad0f0', // blue butterfly
  A: '#3b82c4', // deep blue
  F: '#fff7e0', // lantern glow
  H: '#e35656', // red accent
  d: '#d9d7d4', // gray shade
} as const

export type PalKey = keyof typeof PAL

interface SpriteProps extends React.SVGAttributes<SVGSVGElement> {
  map: PixelMap
  px?: number
  palette?: Record<string, string>
  className?: string
  style?: React.CSSProperties
  title?: string
}

/** Renders a pixel-art string map as crisp SVG rects. */
export function PixelSprite({ map, px = 4, palette, className, style, title, ...rest }: SpriteProps) {
  const pal: Record<string, string> = { ...PAL, ...palette }
  const h = map.length
  const w = Math.max(...map.map((r) => r.length))
  const rects: React.ReactElement[] = []
  for (let y = 0; y < h; y++) {
    const row = map[y]
    let x = 0
    while (x < row.length) {
      const ch = row[x]
      if (ch === '.' || ch === ' ') {
        x++
        continue
      }
      let run = 1
      while (x + run < row.length && row[x + run] === ch) run++
      rects.push(
        <rect key={`${x}-${y}`} x={x} y={y} width={run} height={1} fill={pal[ch] ?? ch} />
      )
      x += run
    }
  }
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w * px}
      height={h * px}
      className={`pixel ${className ?? ''}`}
      style={style}
      role={title ? 'img' : 'presentation'}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {rects}
    </svg>
  )
}

/** Row-run merge keeps node counts low for big sprites. */
export default PixelSprite
