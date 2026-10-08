import { FRAME_STYLE } from './icons'

// A small terracotta character beside the limits: the less limit is left,
// the sadder it gets. 32x32, animated with CSS keyframes like the weather.

export type Mood = 'joy' | 'calm' | 'worried' | 'sad' | 'crying' | 'drained'

export type MoodView = { mood: Mood; emoji: string; alt: string }

const BODY = '#D97757'
const BODY_SHADE = '#C4643F'
const FACE = '#3A2620'
const CHEEK = '#F2A48A'
const TEAR = '#7CC4FF'

// Upper bound of percent used (exclusive) -> mood. Last entry catches the rest.
const MOODS: ReadonlyArray<readonly [number, MoodView]> = [
  [50, { mood: 'joy', emoji: '😄', alt: 'Claude радуется: лимита много' }],
  [70, { mood: 'calm', emoji: '🙂', alt: 'Claude спокоен' }],
  [85, { mood: 'worried', emoji: '😟', alt: 'Claude волнуется: лимит тает' }],
  [95, { mood: 'sad', emoji: '😢', alt: 'Claude грустит: лимит почти кончился' }],
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
@keyframes hop{0%,100%{transform:translateY(0)}50%{transform:translateY(-1.5px)}}
@keyframes sway{0%,100%{transform:translateY(0)}50%{transform:translateY(-0.5px)}}
@keyframes blink{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.15)}}
@keyframes tear{0%{transform:translateY(0);opacity:1}80%{opacity:1}100%{transform:translateY(7px);opacity:0}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`

const n = (value: number) => Number(value.toFixed(2))

// Eight soft bumps around a round core.
function body(): string {
  const bumps = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI) / 4
    return `<circle cx="${n(16 + 11 * Math.cos(angle))}" cy="${n(17 + 11 * Math.sin(angle))}" r="3.3"/>`
  })
  return `<g fill="${BODY_SHADE}">${bumps.join('')}</g><circle cx="16" cy="17" r="11" fill="${BODY}"/>`
}

function eyes(droop: number): string {
  const y = n(15.5 + droop)
  return (
    `<g class="blink"><ellipse cx="12" cy="${y}" rx="1.6" ry="2" fill="${FACE}"/>` +
    `<ellipse cx="20" cy="${y}" rx="1.6" ry="2" fill="${FACE}"/></g>`
  )
}

// Inner ends up: worried and sad brows.
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
  worried: brows(0.5) + eyes(0.5) + mouth('M12.5 22q1.75-1 3.5 0t3.5 0'),
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
  worried: { dy: 0, motion: '' },
  sad: { dy: 1, motion: '' },
  crying: { dy: 1, motion: '' },
  drained: { dy: 1, motion: '' },
}

export function claudeSvg(mood: Mood): string {
  const { dy, motion } = POSE[mood]
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">' +
    `<style>${FRAME_STYLE}${STYLE}</style>` +
    `<g transform="translate(0 ${dy})"><g class="${motion}">${body()}${FACES[mood]}</g></g></svg>`
  )
}
