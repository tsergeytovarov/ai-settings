// Generated from plugins/context-weather by cockpit/scripts/sync.py: edit the source, then sync.
import type { Sky } from './weather'

// Flat 2D weather icons, 32x32, animated with CSS keyframes. The band draws
// them with Svg isInteractive, in a frame where the keyframes run.
// Every animated <g> sits inside a positioned <g>: a CSS transform replaces
// the element's transform attribute, so the two never share an element.

const SUN = '#FFC531'
const RAY = '#FFA41B'
const CLOUD_LIGHT = '#EEF2F6'
const CLOUD_EDGE = '#C3CCD6'
const CLOUD_GREY = '#A3AEBA'
const CLOUD_DARK = '#6E7987'
const CLOUD_STORM = '#4E5866'
const DROP = '#4DA3FF'
const BOLT = '#FFD43B'
const SWIRL = '#E5484D'

// Without color-scheme the frame stays light inside the dark app and Chrome
// paints it opaque white; with both schemes it takes the app's and stays clear.
export const FRAME_STYLE = ':root{color-scheme:light dark;background:transparent}'

const STYLE = `
.spin{transform-box:fill-box;transform-origin:center;animation:spin 12s linear infinite}
.spin-fast{transform-box:fill-box;transform-origin:center;animation:spin 1.4s linear infinite}
.drift{animation:drift 4s ease-in-out infinite}
.drift-back{animation:drift 5s ease-in-out infinite reverse}
.bob{animation:bob 3s ease-in-out infinite}
.rise{animation:rise 4s ease-in-out infinite}
.pulse{animation:pulse 2s ease-in-out infinite}
.drop{animation:fall 1s linear infinite}
.flash{animation:flash 2.4s steps(1) infinite}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes drift{0%,100%{transform:translateX(-1.2px)}50%{transform:translateX(1.2px)}}
@keyframes bob{0%,100%{transform:translateY(0)}50%{transform:translateY(1px)}}
@keyframes rise{0%,100%{transform:translateY(1.5px)}50%{transform:translateY(-0.5px)}}
@keyframes pulse{0%,100%{opacity:.45}50%{opacity:1}}
@keyframes fall{0%{transform:translateY(-2px);opacity:0}20%{opacity:1}100%{transform:translateY(6px);opacity:0}}
@keyframes flash{0%,70%{opacity:1}74%{opacity:.15}78%{opacity:1}82%,92%{opacity:.15}}
@media (prefers-reduced-motion:reduce){*{animation:none!important}}
`

function rays(cx: number, cy: number, inner: number, outer: number, width: number): string {
  const lines = Array.from({ length: 8 }, (_, i) => {
    const angle = (i * Math.PI) / 4
    const point = (r: number) =>
      `${(cx + r * Math.cos(angle)).toFixed(2)} ${(cy + r * Math.sin(angle)).toFixed(2)}`
    return `<path d="M${point(inner)}L${point(outer)}"/>`
  })
  return `<g stroke="${RAY}" stroke-width="${width}" stroke-linecap="round">${lines.join('')}</g>`
}

function sun(cx: number, cy: number, r: number): string {
  const spinning = `<g class="spin">${rays(cx, cy, r + 2.6, r + 5.4, r / 2.8)}</g>`
  return `${spinning}<circle cx="${cx}" cy="${cy}" r="${r}" fill="${SUN}"/>`
}

// A cloud 24 wide and 14 tall, its top-left corner at (x, y).
function cloud(x: number, y: number, scale: number, fill: string, motion: string, edge?: string): string {
  const stroke = edge ? ` stroke="${edge}" stroke-width="1"` : ''
  const shape =
    `<g fill="${fill}"${stroke}>` +
    '<circle cx="6" cy="9" r="5"/><circle cx="12.5" cy="6" r="6"/><circle cx="18.5" cy="9" r="5"/>' +
    '<rect x="1" y="8.5" width="22.5" height="5.5" rx="2.75"/></g>' +
    // Same shape without the stroke on top, so the inner seams of the circles disappear.
    (edge
      ? `<g fill="${fill}"><circle cx="6" cy="9" r="4.5"/><circle cx="12.5" cy="6" r="5.5"/>` +
        '<circle cx="18.5" cy="9" r="4.5"/><rect x="1.5" y="9" width="21.5" height="4.5" rx="2.25"/></g>'
      : '')
  return `<g transform="translate(${x} ${y}) scale(${scale})"><g class="${motion}">${shape}</g></g>`
}

function drops(xs: number[], top: number): string {
  return xs
    .map(
      (x, i) =>
        `<g class="drop" style="animation-delay:-${(i * 0.33).toFixed(2)}s">` +
        `<path d="M${x} ${top}l-1 3" stroke="${DROP}" stroke-width="2" stroke-linecap="round"/></g>`,
    )
    .join('')
}

const BODIES: Record<Sky, string> = {
  dawn:
    `<defs><clipPath id="sky"><rect width="32" height="23"/></clipPath></defs>` +
    `<g clip-path="url(#sky)"><g class="rise">` +
    `<g class="pulse">${rays(16, 22, 9, 12, 2.2)}</g>` +
    `<circle cx="16" cy="22" r="7" fill="${SUN}"/></g></g>` +
    `<path d="M4 23.5H28" stroke="${RAY}" stroke-width="2" stroke-linecap="round"/>`,
  clear: sun(16, 16, 6.5),
  mostlyClear: sun(12, 12, 5) + cloud(9, 15, 0.85, CLOUD_LIGHT, 'drift', CLOUD_EDGE),
  cloudy:
    cloud(9, 6, 0.8, CLOUD_GREY, 'drift-back') + cloud(3, 13, 0.95, CLOUD_LIGHT, 'drift', CLOUD_EDGE),
  overcast: cloud(8, 5, 0.85, CLOUD_DARK, 'drift-back') + cloud(3, 12, 1, CLOUD_GREY, 'bob'),
  rain: cloud(4, 4, 1, CLOUD_GREY, 'bob') + drops([10, 16, 22], 21),
  storm:
    cloud(4, 3, 1, CLOUD_STORM, 'bob') +
    `<g class="flash"><path d="M17 15l-4 7h3.5l-2 6 6-8.5h-3.6l2.1-4.5z" fill="${BOLT}"/></g>` +
    drops([9, 24], 20),
  hurricane:
    `<g class="spin-fast">` +
    `<path d="M16 12C16 6.5 20.5 4 26 4.5C22 6 20 9 20 12.5Z" fill="${SWIRL}"/>` +
    `<path d="M16 20C16 25.5 11.5 28 6 27.5C10 26 12 23 12 19.5Z" fill="${SWIRL}"/>` +
    `<circle cx="16" cy="16" r="4.2" fill="none" stroke="${SWIRL}" stroke-width="2.6"/></g>`,
}

export function iconSvg(sky: Sky): string {
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">' +
    `<style>${FRAME_STYLE}${STYLE}</style>${BODIES[sky]}</svg>`
  )
}
