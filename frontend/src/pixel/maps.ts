// Pixel art maps. Each string is a row; chars index into PAL (sprite.tsx).
// '.' or ' ' = transparent.

/* ---------------- THE CAT ---------------- */

// Sitting cat body (no eyes — eyes are an overlay so they can blink)
export const CAT_BODY = [
  '.XX..........XX.',
  '.XWWX......XWWX.',
  '.XWPX......XPWX.',
  '.XWWPX....XPWWX.',
  '.XWWWPXXXXPWWWX.',
  'XWWWWWWWWWWWWWWX',
  'XWWWWWWWWWWWWWWX',
  'XWPPWWWWWWWWPPWX',
  'XWWWWWWNNWWWWWWX',
  '.XWWWWWWWWWWWWX.',
  '.XWWWWWWWWWWWWX.',
  '.XWWWWWWWWWWWWX.',
  'XWWWWWWWWWWWWWWX',
  'XWWWWWWWWWWWWWWX',
  'XWWWWWWWWWWWWWWX',
  'XWWXXWWWWWWXXWWX',
  '.XX..XXXXXX..XX.',
]
// Eye positions (col,row) for overlays: left (3,6) right (11,6), each 2x2
export const CAT_EYE = ['BB', 'BB']
// Left ear alone (used for twitch overlay) — occupies cols 1..4 rows 0..4
export const CAT_EAR_L = ['XX..', 'XWWX', 'XWPX', 'XWWP', 'XWWW']

// Curled fluffy tail (attaches at bottom right of body)
export const CAT_TAIL = [
  '..XX.',
  '.XWWX',
  '.XWX.',
  'XWX..',
  'XWX..',
  'XWWX.',
  'XWWX.',
  'XWWWX',
  '.XWWX',
  '..XXX',
]

// Sleeping loaf cat (closed eyes baked in, 'b' = soft dark)
export const CAT_SLEEP = [
  '..XX...XX.............',
  '.XWWX.XWWX............',
  '.XWPX.XPWX............',
  '.XWWWWWWWWX...........',
  'XWWWWWWWWWWXXXXX......',
  'XWbWWbWWWWWWWWWWXXXXX.',
  'XWWWNNWWWWWWWWWWWWWWWX',
  'XWWWWWWWWWWWWWWWWWWWWX',
  'XWWWWWWWWWWWWWWWWWWWWX',
  'XWWWWWWWWWWWWWWWWWWWWX',
  '.XXXXXXXXXXXXXXXXXXXX.',
]

// Walking cat side view, facing left (no legs/tail — those are animated overlays)
export const CAT_WALK_BODY = [
  '.XX...XX............',
  'XWWX.XWWX...........',
  'XWPX.XWPX...........',
  'XWWWXXWWWX..........',
  'XWWWWWWWWWXXXXXXXX..',
  '.XWWWWWWWWWWWWWWWWX.',
  'NWWWWWWWWWWWWWWWWWX.',
  '.XWWWWWWWWWWWWWWWWX.',
  '.XWWWWWWWWWWWWWWWWX.',
  '..XWWWWWWWWWWWWWWX..',
  '...XXXXXXXXXXXXXX...',
]
// walking eye (side) — single 2x2 overlay near the face
export const CAT_WALK_EYE = ['BB', 'BB']
// leg frames
export const CAT_LEGS_A = [
  '.X.X......X.X.',
  '.X.X......X.X.',
  '.XX.X....X.XX.',
]
export const CAT_LEGS_B = [
  '...X.X..X.X...',
  '...X.X..X.X...',
  '...XX...XX....',
]
// upright curled tail (attaches at the rear/right of the walking body)
export const CAT_WALK_TAIL = [
  '..XX.',
  '.XWWX',
  '.XWX.',
  'XWWX.',
  'XWX..',
  'XX...',
]

// Peeking cat (head + paws over an edge)
export const CAT_PEEK = [
  '..XX......XX..',
  '.XWWX....XWWX.',
  '.XWPX....XPWX.',
  'XWWWWXXXXWWWWX',
  'XWWWWWWWWWWWWX',
  'XWBBWWNNWWBBWX',
  'XWWWWWWWWWWWWX',
  'XWWWWWWWWWWWWX',
  'XWWXXXXXXXXWWX',
  'XWWX......XWWX',
  '.XXX......XXX.',
]

// Stretching / climbing cat (front paws up)
export const CAT_CLIMB = [
  '.XWX..............',
  '.XWX..............',
  '.XWXX.............',
  '.XWWXXXXXXXXXX....',
  'XWWWWWWWWWWWWWWX..',
  'XWWWWWWWWWWWWWWWX.',
  'XWWWWWWWWWWWWWWWWX',
  '.XWWWWWWWWWWWWWWX.',
  '..XWWWWWWWWWWWWX..',
  '...XXXXXXXXXXXX...',
]

// Sitting cat waving (body reuse CAT_BODY, arm overlay)
export const CAT_ARM = [
  'XWX.',
  'XWX.',
  'XWWX',
  'XWWX',
  '.XW.',
]

/* ---------------- NATURE ---------------- */

export const CLOUD = [
  '...XX...XXXX....',
  '..XCCXXXCCCCXX..',
  '.XCCCCCCCCCCCCX.',
  'XCCCCCCCCCCCCCCX',
  'XCCCCCCCCCCCCCCX',
  'XCCCCCCCCCCCCCCX',
  '.XccccccccccccX.',
  '..XXXXXXXXXXXX..',
]

export const CLOUD_SM = [
  '...XXX......',
  '..XCCCXXX...',
  '.XCCCCCCCX..',
  'XCCCCCCCCCX.',
  'XCcccccccCX.',
  '.XXXXXXXXX..',
]

export const SUN = [
  '......Y......',
  '.Y....Y....Y.',
  '..Y.......Y..',
  '.....YYY.....',
  '....YYYYY....',
  '...YYYYYYY...',
  'YY.YYYYYYY.YY',
  '...YYYYYYY...',
  '....YYYyy....',
  '.....Yyy.....',
  '..Y.......Y..',
  '.Y....Y....Y.',
  '......Y......',
]

export const MOON = [
  '...XXXX....',
  '..XFFFFX...',
  '.XFFFFFX...',
  '.XFFFfFX...',
  'XFFFFFX....',
  'XFFFFX.....',
  'XFFFFFX....',
  '.XFFFFX....',
  '.XFFFFfX...',
  '..XFFFFX...',
  '...XXXX....',
]

export const STAR = ['.Y.', 'YYY', '.Y.']

export const MOUNTAIN = [
  '.......XX........',
  '......XmmX.......',
  '.....XmWWmX......',
  '....XmWWWMX......',
  '...XMWWWMMMX.....',
  '..XMMMWMMMMMX....',
  '.XMMMMWMMMMMMX...',
  'XMMMMMMMMMMMMMMX.',
]

export const SAKURA_TREE = [
  '........XXXX..............',
  '......XXrrrrXX......XXX...',
  '.....XrrRRrrrX....XrrrX...',
  '....XrRRRRrrrXXXXrrRRrX...',
  '...XrRRrRRrrrrrXrrRRRrX...',
  '..XrrRRrrRRrrRrrrRrRrrX...',
  '..XrRrrrrRrrrRRrrRRrrrX...',
  '.XrrRrrRRrrrRRrrRrrrRrrX..',
  '.XrRRrrrRrrRRrrRRrrrRRrX..',
  '.XrRrrrRRrrrRrrrRrRrrrX...',
  '..XrrRRrrrXXrrrRRrrrXX....',
  '...XXXXXX..XLLX..XXX......',
  '...........XLLX...........',
  '..........XLLLX...........',
  '..........XLLX............',
  '.........XLLLX............',
  '........XLLLX.............',
  '......XXLLLXX.............',
]

export const GRASS_TUFT = [
  '..G.....G..',
  '.GG.G.G.GG.',
  '.GGgG.GgGG.',
  'GGGgGGGgGGG',
  'GGGGGGGGGGG',
  '.gGGGGGGGg.',
]

// Taller bladed clump for variety
export const GRASS_TALL = [
  '.G...G...G.',
  '.G.G.G.G.G.',
  'gG.GgG.GgG.',
  'GGgGGGgGGGG',
  'GGGGGGGGGGG',
]

export const FLOWER = [
  '..r..',
  '.rRr.',
  '..r..',
  '..G..',
  'G.G..',
  '.GG..',
]

export const FLOWER_Y = [
  '..Y..',
  '.YyY.',
  '..Y..',
  '..G..',
  '..G.G',
  '.GGG.',
]

export const BUTTERFLY = [
  'V..V',
  'VV.V',
  'VVXV',
  'VXV.',
  'V..V',
]

export const DRAGONFLY = [
  'U.U.U.U',
  '.UUXUU.',
  '..XXX..',
  '..X....',
  '..X....',
]

export const BIRD = [
  'X...X',
  '.X.X.',
]

export const FISH = [
  '...XXX...',
  '..XOOOX..',
  '.XOWOOOX.',
  'XOOOOOOXX',
  '.XOOOOOX.',
  '..XOOOX..',
  '...XXX...',
]

export const PETAL = [
  'rR',
  'Rr',
]

export const LEAF = [
  '..GG.',
  '.GGGG',
  'GGGG.',
  '.GG..',
]

/* ---------------- OBJECTS ---------------- */

export const LANTERN = [
  '.....XX......',
  '...XXXXXX....',
  '..XEEEEEXX...',
  '.XEEEEEEEEEX.',
  '.XEXXXXXXXEX.',
  '..XEXXXXEX...',
  '..XEFFFFEX...',
  '..XEXXXXEX...',
  '...XEEEEX....',
  '....XEEX.....',
  '....XEEX.....',
  '...XEEEEX....',
  '..XEEEEEEX...',
  '..XXXXXXXX...',
]

export const YARN = [
  '..XXXX..',
  '.XRRRRX.',
  'XRrRRRrX',
  'XRRrRrRX',
  'XRrRRRrX',
  'XRRrRrRX',
  '.XRRRRX.',
  '..XXXX..',
]

export const MILK = [
  '..XXX..',
  '..XSX..',
  '.XWWWX.',
  '.XWWWX.',
  'XWWWWWX',
  'XWSWSWX',
  'XWWWWWX',
  'XWWWWWX',
  'XWWWWWX',
  '.XXXXX.',
]

export const PAW = [
  '.X.X.X.',
  'XWXWXWX',
  '.XXXXX.',
  'XWWWWWX',
  'XWWWWWX',
  '.XXXXX.',
]

export const SPARKLE = [
  '..Y..',
  '..Y..',
  'YYYYY',
  '..Y..',
  '..Y..',
]

export const HEART = [
  '.XX.XX.',
  'XHHXHHX',
  'XHHHHHX',
  '.XHHHX.',
  '..XHX..',
  '...X...',
]

/* ---------------- FEATURE ICONS (12x12-ish) ---------------- */

export const ICON_BOLT = [
  '.....XXXX..',
  '....XYYYX..',
  '...XYYYX...',
  '..XYYYX....',
  '.XYYYYXXXX.',
  '.XXXYYYYX..',
  '....XYYYX..',
  '...XYYYX...',
  '..XYYYX....',
  '.XYYYX.....',
  '.XXXX......',
]

export const ICON_SHIELD = [
  '.XXXXXXXXXX.',
  'XWWWWWWWWWWX',
  'XWWWWWWWWWWX',
  'XWWXXWWWWWWX',
  'XWWXXXWWWWWX',
  'XWWWWXXXWWWX',
  'XWWWWWWXXXWX',
  '.XWWWWWWWXX.',
  '.XWWWWWWWWX.',
  '..XWWWWWWX..',
  '...XWWWWX...',
  '....XXXX....',
]

export const ICON_GEAR = [
  '....XXXX.....',
  '...XEEEE.....',
  '.XXXEXXEXXX..',
  '.XEEEEEEEEEX.',
  'XEEEXXXEEEEXX',
  'XEEX...XEEX..',
  'XEEEX.XEEEX..',
  '.XEEEEXEEEX..',
  '.XXXEXXXEXX..',
  '...XEEEX.....',
  '....XXXX.....',
]

export const ICON_BLOCKS = [
  'XXXX.XXXX...',
  'XSSX.XSSX...',
  'XXXX.XXXX...',
  '............',
  '.XXXXXXXXX..',
  '.XSSSXSSSX..',
  '.XXXXXXXXX..',
  '............',
  '..XXXX.XXXX.',
  '..XSSX.XSSX.',
  '..XXXX.XXXX.',
]

export const ICON_TERMINAL = [
  'XXXXXXXXXXXXX',
  'XKKKKKKKKKKKX',
  'XKYYXKKKKKKKX',
  'XKYXYXKKKKKKX',
  'XKYYXKKKKKKKX',
  'XKKKKKYYXKKKX',
  'XKKKKKYXYXKKX',
  'XKKKKKYYXKKKX',
  'XKKKKKKKKKKKX',
  'XKKKYYYYYYKKX',
  'XXXXXXXXXXXXX',
]

export const ICON_PENGUIN = [
  '....XXXX....',
  '...XKKKKX...',
  '..XKKKKKKX..',
  '..XKWXXKWX..',
  '..XKKKKKKX..',
  '.XKKKWWKKKX.',
  '.XKWKWWKWKX.',
  '.XKKWWWWKKX.',
  '..XKWWWWKX..',
  '..XKWKWKX...',
  '...XX.XX....',
  '..XYYXYYX...',
]

export const ICON_DOC = [
  '.XXXXXXXX.',
  '.XWWWWWWX.',
  '.XWKKKKWX.',
  '.XWWWWWWX.',
  '.XWKKKKKX.',
  '.XWWWWWWX.',
  '.XWKKKWX..',
  '.XWWWWWWX.',
  '.XXXXXXXX.',
]

export const ICON_FOLDER = [
  'XXXXXX......',
  'XSSSSXXXXXXX',
  'XSSSSSSSSSSX',
  'XSXSSSSSSSSX',
  'XSSSSSSSSSSX',
  'XSSSSSSSSSSX',
  'XSSSSSSSSSSX',
  'XXXXXXXXXXXX',
]

/* ---------------- MISC BIG ---------------- */

export const BOX = [
  '.XXXXXXXXXXXXXXXXXXXXXX.',
  'XllllllllllllllllllllllX',
  'XlLLLLLLLLLLLLLLLLLLLLlX',
  'XlLXXXXXXXXXXXXXXXXXXLlX',
  'XlLX................XLlX',
]

export const WHEEL = [
  '.XXXX.',
  'XKKKKX',
  'XKXXKX',
  'XKKKKX',
  '.XXXX.',
]

/* ---------------- TRAIN ---------------- */

// Pixel steam locomotive (side view, facing LEFT — nose/chimney lead, cabin +
// coupling on the right connect to the wagons behind). Wheels are NOT part of
// the sprite — round CSS wheels are overlaid below (see EngineWheels). The cab
// window (S, cols 17-22 / rows 4-7) is left open so the cat masinis peeks out.
// Smoke is an animated overlay above the chimney (cols 4-7). Headlight = Y at
// the far-left nose; gold steam dome + boiler band add the "powerful" look.
export const TRAIN_ENGINE = [
  '...XKKKKX.................',
  '....XKKX..XYYX............',
  '....XKKX..XYYX.XKKKKKKKKKX',
  '..XrrrrrrrrrrrXXKKKKKKKKX.',
  'XYXRRRRRRRRRRRXXbSSSSSSbX.',
  'XYXRRRRYRRRRRRXXbSSSSSSbX.',
  '.XRRRRRRRRRRRRXXbSSSSSSbX.',
  '.XRRRRRRRRRRRRXXbSSSSSSbX.',
  'XXRRRRRRRRRRRRXXRRRRRRRRX.',
  'XXRRRRRRRRRRRRXXRRRRRRRRX.',
  '.XXXXXXXXXXXXXXXXXXXXXXXX.',
  '.LllllllllllllllllllllllL.',
]
