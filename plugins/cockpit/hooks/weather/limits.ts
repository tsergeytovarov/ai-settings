// Generated from plugins/context-weather by cockpit/scripts/sync.py: edit the source, then sync.
import type { ThemeKey } from 'claude-code'

import type { RateLimitReading } from '../../types'

export type LimitView = { label: string; title: string; percent: number; resetsIn?: string; color: ThemeKey }

// kind, the short label beside the character, the name in its tooltip.
const LABELS: ReadonlyArray<readonly [string, string, string]> = [
  ['five_hour', '5ч', 'Лимит на 5 часов'],
  ['seven_day', '7д', 'Лимит на неделю'],
]

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

export function formatDuration(ms: number): string {
  if (ms <= 0) return 'сейчас'
  if (ms >= DAY) return `${Math.floor(ms / DAY)}д ${Math.floor((ms % DAY) / HOUR)}ч`
  if (ms >= HOUR) return `${Math.floor(ms / HOUR)}ч ${Math.floor((ms % HOUR) / 60_000)}м`
  return `${Math.max(1, Math.floor(ms / 60_000))}м`
}

// The same thresholds as the character's color (levelFor in claude.ts).
function colorFor(percent: number): ThemeKey {
  if (percent >= 90) return 'error'
  if (percent >= 50) return 'warning'
  return 'success'
}

// The 5-hour and weekly windows in that order; the ones with no reading are left out.
export function limitViews(limits: readonly RateLimitReading[], now: number): LimitView[] {
  return LABELS.flatMap(([kind, label, title]) => {
    const limit = limits.find(l => l.kind === kind)
    if (!limit) return []
    const resetsAt = limit.resetsAt ? Date.parse(limit.resetsAt) : NaN
    const view: LimitView = {
      label,
      title,
      percent: Math.round(limit.percentUsed),
      color: colorFor(limit.percentUsed),
    }
    if (!Number.isNaN(resetsAt)) view.resetsIn = formatDuration(resetsAt - now)
    return [view]
  })
}
