import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { ContextReading } from '../types'
import { claudeSvg, moodFor } from './claude'
import { iconSvg } from './icons'
import { limitViews } from './limits'
import { bar, forecast } from './weather'

const reading = atom({ plugin: 'context-weather', key: 'reading' } as const, null)
const limits = atom({ plugin: 'context-weather', key: 'limits' } as const, [])

// CSS pixels; about one line of the prompt's text.
const ICON_SIZE = 20
const BAR_CELLS = 10
const LIMIT_BAR_CELLS = 5
// Narrower than this, the band keeps the weather and drops the limits.
const LIMITS_MIN_COLUMNS = 70

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
    const current = await read($, reading)

    if (e.props.hasSurvey || current === null) {
      return next(e)
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

    const windows =
      e.props.bodyColumns < LIMITS_MIN_COLUMNS
        ? []
        : limitViews(await read($, limits), await $.clock.now())
    // Claude's mood and the one reset time shown follow the window closest to running out.
    const tightest = windows.reduce<(typeof windows)[number] | undefined>(
      (worst, w) => (worst === undefined || w.percent > worst.percent ? w : worst),
      undefined,
    )
    const mood = tightest === undefined ? null : moodFor(tightest.percent)
    let face = null
    if (mood !== null) {
      face = <Text>{mood.emoji}</Text>
      if (e.surface !== 'terminal') {
        const { Svg } = $.ui.resolve(e)
        face = (
          <Svg
            source={claudeSvg(mood.mood)}
            alt={mood.alt}
            width={ICON_SIZE}
            height={ICON_SIZE}
            isInteractive
          />
        )
      }
    }

    return (
      <Box flexDirection="row" justifyContent="space-between" alignItems="center" width="100%">
        <Box flexDirection="row" alignItems="center" gap={1}>
          {icon}
          {current.percent === undefined ? null : (
            <Text color={weather.color}>{bar(current.percent, BAR_CELLS)}</Text>
          )}
          <Text color={weather.color}>{percent}</Text>
        </Box>
        <Box flexDirection="row" alignItems="center" gap={2}>
          {face}
          {windows.map(w => (
            <Box key={w.label} flexDirection="row" gap={1}>
              <Text dimColor>{w.label}</Text>
              <Text color={w.color}>{bar(w.percent, LIMIT_BAR_CELLS)}</Text>
              <Text color={w.color}>{w.percent}%</Text>
              {w !== tightest || w.resetsIn === undefined ? null : (
                <Text dimColor>↻ {w.resetsIn}</Text>
              )}
            </Box>
          ))}
        </Box>
      </Box>
    )
  })
}
