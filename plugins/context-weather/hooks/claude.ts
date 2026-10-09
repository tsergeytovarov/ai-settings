import { FRAME_STYLE } from './icons'

// A tiny round Claude per rate-limit window, inside a ring that fills with the
// share used: the less limit is left, the yellower, redder and sadder it gets.
// 32x32, animated with CSS keyframes like the weather.

export type Mood = 'joy' | 'calm' | 'sad' | 'crying' | 'drained'

export type MoodView = { mood: Mood; emoji: string; alt: string }

const FACE = '#3A2620'
const CHEEK = '#F2A48A'
const TEAR = '#7CC4FF'

// Upper bound of percent used (exclusive) -> mood. Last entry catches the rest.
const MOODS: ReadonlyArray<readonly [number, MoodView]> = [
  [25, { mood: 'joy', emoji: '😄', alt: 'Claude радуется: лимита много' }],
  [50, { mood: 'calm', emoji: '🙂', alt: 'Claude доволен' }],
  [75, { mood: 'sad', emoji: '😢', alt: 'Claude грустит: половина лимита позади' }],
  [100, { mood: 'crying', emoji: '😭', alt: 'Claude плачет: лимит на исходе' }],
  [Infinity, { mood: 'drained', emoji: '😵', alt: 'Claude без сил: лимит исчерпан' }],
]

export function moodFor(percentUsed: number): MoodView {
  const match = MOODS.find(([upper]) => percentUsed < upper)
  return (match ?? MOODS[MOODS.length - 1]!)[1]
}

const STYLE = `
.hop{animation:hop .8s ease-in-out infinite}
.sway{animation:sway 1.6s ease-in-out infinite}
.blink{transform-box:fill-box;transform-origin:center;animation:blink 3.2s infinite}
.tear{animation:tear 1.2s ease-in infinite}
@keyframes hop{0%,100%{transform:translateY(0)}50%{transform:translateY(-1px)}}
@keyframes sway{0%,100%{transform:translateY(0)}50%{transform:translateY(-0.5px)}}
@keyframes blink{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.15)}}
@keyframes tear{0%{transform:translateY(0);opacity:1}80%{opacity:1}100%{transform:translateY(7px);opacity:0}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`

const n = (value: number) => Number(value.toFixed(2))

export type Level = 'ok' | 'warn' | 'alarm'

// One color for body and ring, by how much of the window is used.
const LEVELS: Record<Level, string> = {
  ok: '#3FB950',
  warn: '#E8B931',
  alarm: '#E5484D',
}

// Green below half, yellow to 90%, red from there.
export function levelFor(percentUsed: number): Level {
  if (percentUsed >= 90) return 'alarm'
  if (percentUsed >= 50) return 'warn'
  return 'ok'
}

// Room above and below the ring for the whole character to hop.
const RING_R = 13.5
const RING_LENGTH = 2 * Math.PI * RING_R

// The share used as an arc from the top, clockwise, over a faint track.
function ring(percentUsed: number, color: string): string {
  const filled = n((Math.max(0, Math.min(100, percentUsed)) / 100) * RING_LENGTH)
  return (
    `<circle cx="16" cy="16" r="${RING_R}" fill="none" stroke="#8884" stroke-width="3"/>` +
    `<circle cx="16" cy="16" r="${RING_R}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round" ` +
    `stroke-dasharray="${filled} ${n(RING_LENGTH)}" transform="rotate(-90 16 16)"/>`
  )
}

function eyes(droop: number): string {
  const y = n(15.5 + droop)
  return (
    `<g class="blink"><ellipse cx="12" cy="${y}" rx="1.6" ry="2" fill="${FACE}"/>` +
    `<ellipse cx="20" cy="${y}" rx="1.6" ry="2" fill="${FACE}"/></g>`
  )
}

// Inner ends up: sad and crying brows.
function brows(lift: number): string {
  return (
    `<g stroke="${FACE}" stroke-width="1.4" stroke-linecap="round">` +
    `<path d="M9.5 ${n(12 + lift)}L13.5 10.5"/><path d="M22.5 ${n(12 + lift)}L18.5 10.5"/></g>`
  )
}

function mouth(d: string): string {
  return `<path d="${d}" fill="none" stroke="${FACE}" stroke-width="1.6" stroke-linecap="round"/>`
}

function tear(x: number, delay: number): string {
  return (
    `<g class="tear" style="animation-delay:-${delay}s">` +
    `<path d="M${x} 18q-1.3 2 0 2.6q1.3-.6 0-2.6z" fill="${TEAR}"/></g>`
  )
}

const FACES: Record<Mood, string> = {
  joy:
    eyes(0) +
    `<circle cx="9.5" cy="19.5" r="1.6" fill="${CHEEK}"/><circle cx="22.5" cy="19.5" r="1.6" fill="${CHEEK}"/>` +
    `<path d="M12 20q4 4.5 8 0z" fill="${FACE}"/>`,
  calm: eyes(0) + mouth('M12.5 20.5q3.5 2.5 7 0'),
  sad: brows(1.5) + eyes(1) + mouth('M12.5 23q3.5-2.8 7 0'),
  crying: brows(1.5) + eyes(1) + mouth('M12 23.5q4-3.2 8 0') + tear(11, 0) + tear(21, 0.6),
  drained:
    `<g stroke="${FACE}" stroke-width="1.5" stroke-linecap="round">` +
    '<path d="M10.5 14l3 3M13.5 14l-3 3M18.5 14l3 3M21.5 14l-3 3"/></g>' +
    mouth('M12.5 22.5h7'),
}

// Happy moods hop, sad ones slump a pixel lower and keep still.
const POSE: Record<Mood, { dy: number; motion: string }> = {
  joy: { dy: 0, motion: 'hop' },
  calm: { dy: 0, motion: 'sway' },
  sad: { dy: 1, motion: '' },
  crying: { dy: 1, motion: '' },
  drained: { dy: 1, motion: '' },
}

// `title` is the tooltip the desktop shows over the interactive frame.
export function limitBuddySvg(percentUsed: number, title: string): string {
  const { mood } = moodFor(percentUsed)
  const color = LEVELS[levelFor(percentUsed)]
  const { dy, motion } = POSE[mood]
  const safeTitle = title.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  // The face was drawn for a body of r=11 at (16,17); here the body is r=10 at (16,16).
  const face = `<g transform="translate(16 16) scale(0.82) translate(-16 -17)">${FACES[mood]}</g>`
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">' +
    `<title>${safeTitle}</title><style>${FRAME_STYLE}${STYLE}</style>` +
    // The ring moves with the body: the whole character hops or slumps.
    `<g transform="translate(0 ${dy * 0.5})"><g class="${motion}">` +
    ring(percentUsed, color) +
    `<circle cx="16" cy="16" r="10" fill="${color}"/>${face}</g></g></svg>`
  )
}
