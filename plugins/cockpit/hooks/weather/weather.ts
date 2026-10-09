// Generated from plugins/context-weather by cockpit/scripts/sync.py: edit the source, then sync.
import type { ThemeKey } from 'claude-code'

export type Sky =
  | 'dawn'
  | 'clear'
  | 'mostlyClear'
  | 'cloudy'
  | 'overcast'
  | 'rain'
  | 'storm'
  | 'hurricane'

export type Forecast = {
  sky: Sky
  // Fallback for surfaces without Svg (the terminal), and the icon's alt text.
  emoji: string
  alt: string
  color: ThemeKey
}

// Upper bound of percent used (exclusive) -> forecast. Last entry catches the rest.
const SCALE: ReadonlyArray<readonly [number, Forecast]> = [
  [20, { sky: 'clear', emoji: '☀️', alt: 'Ясно', color: 'success' }],
  [40, { sky: 'mostlyClear', emoji: '🌤', alt: 'Малооблачно', color: 'success' }],
  [60, { sky: 'cloudy', emoji: '⛅', alt: 'Облачно', color: 'text' }],
  [75, { sky: 'overcast', emoji: '🌥', alt: 'Пасмурно', color: 'warning' }],
  [85, { sky: 'rain', emoji: '🌧', alt: 'Дождь', color: 'warning' }],
  [95, { sky: 'storm', emoji: '⛈', alt: 'Гроза', color: 'error' }],
  [Infinity, { sky: 'hurricane', emoji: '🌪', alt: 'Ураган', color: 'error' }],
]

export const DAWN: Forecast = { sky: 'dawn', emoji: '🌅', alt: 'Рассвет', color: 'subtle' }

export function forecast(percent: number | undefined): Forecast {
  if (percent === undefined) return DAWN
  const match = SCALE.find(([upper]) => percent < upper)
  return (match ?? SCALE[SCALE.length - 1]!)[1]
}

export function bar(percent: number, cells: number): string {
  const filled = Math.max(0, Math.min(cells, Math.round((percent / 100) * cells)))
  return '█'.repeat(filled) + '░'.repeat(cells - filled)
}
