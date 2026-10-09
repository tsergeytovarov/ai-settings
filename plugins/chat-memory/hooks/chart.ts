// The stats tab as one SVG image for the desktop: figures in a two-column grid.
// Laid out here, so nothing overlaps whatever the pane's width does; the image
// scales down to the slot.

export type StatCell = { label: string; value: string; note: string }

const WIDTH = 320
const GAP = 10
const CELL_W = (WIDTH - GAP) / 2
const CELL_H = 66

const STYLE =
  'text{font-family:-apple-system,system-ui,sans-serif;fill:#29261b}' +
  '.dim{fill:#73726c}.cell{fill:#00000009}' +
  '.label{font-size:11px}.value{font-size:19px;font-weight:600}.note{font-size:11px}' +
  '@media (prefers-color-scheme:dark){text{fill:#ebe9e1}.dim{fill:#9c9a92}.cell{fill:#ffffff0d}}'

function escape(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function cut(text: string, limit: number): string {
  return text.length > limit ? `${text.slice(0, limit - 1)}…` : text
}

export function statsSvg(cells: readonly StatCell[]): string {
  const parts = cells.map((cell, i) => {
    const x = (i % 2) * (CELL_W + GAP)
    const y = Math.floor(i / 2) * (CELL_H + GAP)
    return (
      `<rect class="cell" x="${x}" y="${y}" width="${CELL_W}" height="${CELL_H}" rx="10"/>` +
      `<text class="label dim" x="${x + 12}" y="${y + 19}">${escape(cut(cell.label, 22))}</text>` +
      `<text class="value" x="${x + 12}" y="${y + 41}">${escape(cut(cell.value, 14))}</text>` +
      `<text class="note dim" x="${x + 12}" y="${y + 57}">${escape(cut(cell.note, 24))}</text>`
    )
  })
  const height = statsSvgHeight(cells.length)
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${WIDTH} ${height}" width="${WIDTH}" height="${height}">` +
    `<style>${STYLE}</style>${parts.join('')}</svg>`
  )
}

export function statsSvgHeight(cells: number): number {
  return Math.ceil(cells / 2) * (CELL_H + GAP) - GAP
}
