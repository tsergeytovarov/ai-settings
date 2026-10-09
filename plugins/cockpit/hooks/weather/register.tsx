// Generated from plugins/context-weather by cockpit/scripts/sync.py: edit the source, then sync.
import { atom, read, update } from 'claude-code'
import type { Register, RenderElement } from 'claude-code'

import type { ContextReading } from '../../types'
import { limitBuddySvg, moodFor } from './claude'
import { iconSvg } from './icons'
import { limitViews } from './limits'
import { bar, forecast } from './weather'

const reading = atom({ plugin: 'cockpit', key: 'reading' } as const, null)
const limits = atom({ plugin: 'cockpit', key: 'limits' } as const, [])

// CSS pixels; about one line of the prompt's text.
const ICON_SIZE = 20
const BAR_CELLS = 10

// `next(e)` answers `{ type: 'engine' }` when nothing beneath drew: the engine's
// own band, which may only stand alone, never inside another tree.
function drawnBeneath(rest: RenderElement): RenderElement | null {
  return rest.type === 'engine' ? null : rest
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const usage = await $.session.usage()
    const snapshot: ContextReading = { ...usage.context }
    await update($, reading, () => snapshot)
    await update($, limits, () => [...usage.rateLimits])

    return next(e)
  })

  on('session.measure', async ($, e, next) => {
    if (e.changed.includes('context')) {
      const snapshot: ContextReading = { ...e.context }
      await update($, reading, () => snapshot)
    }
    if (e.changed.includes('rateLimits')) {
      await update($, limits, () => [...e.rateLimits])
    }

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    // What other plugins draw in the band (chat-memory's buttons) goes at the right end.
    const rest = await next(e)
    const current = await read($, reading)

    if (e.props.hasSurvey || current === null) {
      return rest
    }

    const { Box, Text } = $.ui.resolve(e)
    const weather = forecast(current.percent)
    const percent = current.percent === undefined ? '—' : `${current.percent}%`

    // The terminal draws no Svg: there the emoji stands in for the icon.
    let icon = <Text>{weather.emoji}</Text>
    if (e.surface !== 'terminal') {
      const { Svg } = $.ui.resolve(e)
      icon = (
        <Svg
          source={iconSvg(weather.sky)}
          alt={weather.alt}
          width={ICON_SIZE}
          height={ICON_SIZE}
          isInteractive
        />
      )
    }

    // One tiny Claude per rate-limit window: its ring fills, it yellows, reddens and saddens.
    // Small enough for any band width; the exact figures are in its tooltip.
    const windows = limitViews(await read($, limits), await $.clock.now())
    const buddies = windows.map(w => {
      const tooltip = `${w.title}: ${w.percent}%${w.resetsIn === undefined ? '' : `, сброс через ${w.resetsIn}`}`
      let face = (
        <Text color={w.color}>
          {moodFor(w.percent).emoji}
          {w.percent}%
        </Text>
      )
      if (e.surface !== 'terminal') {
        const { Svg } = $.ui.resolve(e)
        face = (
          <Svg source={limitBuddySvg(w.percent, tooltip)} alt={tooltip} width={ICON_SIZE} height={ICON_SIZE} isInteractive />
        )
      }
      return (
        <Box key={w.label} flexDirection="row" alignItems="center" gap={1}>
          {face}
          <Text dimColor>{w.label}</Text>
        </Box>
      )
    })

    // Weather and limits never shrink. What the plugins beneath drew follows them:
    // small buttons stay at the right end, a full-width card (the fuse's) wraps onto
    // a line of its own instead of squeezing the weather to nothing.
    return (
      <Box flexDirection="row" flexWrap="wrap" alignItems="center" gap={1} width="100%">
        <Box flexDirection="row" alignItems="center" gap={1} flexGrow={1} flexShrink={0}>
          {icon}
          {current.percent === undefined ? null : <Text color={weather.color}>{bar(current.percent, BAR_CELLS)}</Text>}
          <Text color={weather.color}>{percent}</Text>
        </Box>
        <Box flexDirection="row" alignItems="center" gap={2} flexShrink={0}>
          {buddies}
        </Box>
        {drawnBeneath(rest)}
      </Box>
    )
  })
}
