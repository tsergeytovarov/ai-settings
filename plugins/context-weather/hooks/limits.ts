import type { ThemeKey } from 'claude-code'

import type { RateLimitReading } from '../types'

export type LimitView = { label: string; percent: number; resetsIn?: string; color: ThemeKey }

const LABELS: ReadonlyArray<readonly [string, string]> = [
  ['five_hour', '5ч'],
  ['seven_day', 'неделя'],
]

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

export function formatDuration(ms: number): string {
  if (ms <= 0) return 'сейчас'
  if (ms >= DAY) return `${Math.floor(ms / DAY)}д ${Math.floor((ms % DAY) / HOUR)}ч`
  if (ms >= HOUR) return `${Math.floor(ms / HOUR)}ч ${Math.floor((ms % HOUR) / 60_000)}м`
  return `${Math.max(1, Math.floor(ms / 60_000))}м`
}

function colorFor(percent: number): ThemeKey {
  if (percent >= 90) return 'error'
  if (percent >= 70) return 'warning'
  return 'success'
}

// The 5-hour and weekly windows in that order; the ones with no reading are left out.
export function limitViews(limits: readonly RateLimitReading[], now: number): LimitView[] {
  return LABELS.flatMap(([kind, label]) => {
    const limit = limits.find(l => l.kind === kind)
    if (!limit) return []
    const resetsAt = limit.resetsAt ? Date.parse(limit.resetsAt) : NaN
    const view: LimitView = {
      label,
      percent: Math.round(limit.percentUsed),
      color: colorFor(limit.percentUsed),
    }
    if (!Number.isNaN(resetsAt)) view.resetsIn = formatDuration(resetsAt - now)
    return [view]
  })
}
