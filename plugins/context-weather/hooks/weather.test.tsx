import { describe, expect, mock, test } from 'claude-code/testing'

import type { On } from 'claude-code'

import { claudeSvg, moodFor } from './claude'
import { iconSvg } from './icons'
import { formatDuration, limitViews } from './limits'
import { bar, forecast } from './weather'

const BAND = {
  hasSurvey: false,
  isWorking: false,
  maxRows: 10,
  bodyColumns: 120,
  scroll: { offset: 0, bodyRows: 10 },
  view: {},
}

// The engine's own ends of the chain: echo the measurement, draw a placeholder.
function standInForEngine(on: On) {
  on('session.measure', (_$, e) => ({ changed: e.changed }))
  on('ui.render', ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text key="engine">engine</Text>
  })
}

describe('forecast', () => {
  test('погода портится по мере заполнения окна', async () => {
    expect(forecast(undefined).sky).toBe('dawn')
    expect(forecast(5).sky).toBe('clear')
    expect(forecast(50).sky).toBe('cloudy')
    expect(forecast(80).sky).toBe('rain')
    expect(forecast(90).sky).toBe('storm')
    expect(forecast(100).sky).toBe('hurricane')
  })

  test('у каждой погоды своя анимированная иконка без белого фона', async () => {
    const icons = [undefined, 10, 30, 50, 70, 80, 90, 99].map(p => iconSvg(forecast(p).sky))
    expect(new Set(icons).size).toBe(8)
    for (const svg of icons) {
      expect(svg).toContain('@keyframes')
      expect(svg).toContain('color-scheme:light dark')
    }
  })

  test('прогресс-бар', async () => {
    expect(bar(0, 10)).toBe('░░░░░░░░░░')
    expect(bar(21, 10)).toBe('██░░░░░░░░')
    expect(bar(100, 10)).toBe('██████████')
  })
})

describe('Claude', () => {
  test('чем меньше лимита, тем грустнее', async () => {
    const moods = [10, 60, 80, 90, 97, 100].map(p => moodFor(p).mood)
    expect(moods).toEqual(['joy', 'calm', 'worried', 'sad', 'crying', 'drained'])
  })

  test('моргает, а когда плачет, текут слёзы', async () => {
    expect(claudeSvg('calm')).toContain('class="blink"')
    expect(claudeSvg('crying')).toContain('class="tear"')
    expect(claudeSvg('joy')).toContain('color-scheme:light dark')
  })
})

describe('лимиты', () => {
  test('5 часов и неделя по порядку, со временем до сброса', async () => {
    const now = Date.parse('2026-10-08T12:00:00Z')
    const views = limitViews(
      [
        { kind: 'seven_day', percentUsed: 72.4, resetsAt: '2026-10-11T15:00:00Z' },
        { kind: 'spend_limit', percentUsed: 10 },
        { kind: 'five_hour', percentUsed: 34, resetsAt: '2026-10-08T14:10:00Z' },
      ],
      now,
    )
    expect(views).toEqual([
      { label: '5ч', percent: 34, color: 'success', resetsIn: '2ч 10м' },
      { label: 'неделя', percent: 72, color: 'warning', resetsIn: '3д 3ч' },
    ])
  })

  test('короткие сроки', async () => {
    expect(formatDuration(25 * 60_000)).toBe('25м')
    expect(formatDuration(-1)).toBe('сейчас')
  })
})

test('в полосе погода слева и лимиты справа', async ($, on) => {
  standInForEngine(on)
  mock.clock(on, { now: Date.parse('2026-10-08T12:00:00Z') })
  await $.session.measure({
    context: { tokens: 180_000, window: 200_000, percent: 90 },
    rateLimits: [
      { kind: 'five_hour', percentUsed: 34, resetsAt: '2026-10-08T14:10:00Z' },
      { kind: 'seven_day', percentUsed: 72, resetsAt: '2026-10-11T15:00:00Z' },
    ],
    changed: ['context', 'rateLimits'],
  })

  const desktop = await $.ui.mount({
    plugin: 'context-weather',
    surface: 'desktop',
    component: 'AbovePrompt',
    props: BAND,
  })
  expect((await desktop.find({ type: 'Svg' }))?.props.alt).toBe('Гроза')
  expect(await desktop.find({ type: 'Text', text: '█████████░' })).toBeDefined()
  expect(await desktop.find({ type: 'Text', text: '90%' })).toBeDefined()
  // The reset time shows once, beside the window closest to running out.
  expect((await desktop.find({ type: 'Box', key: '5ч' }))?.text).toBe('5ч██░░░34%')
  expect((await desktop.find({ type: 'Box', key: 'неделя' }))?.text).toBe('неделя████░72%↻ 3д 3ч')
  const svgs = await desktop.findAll({ type: 'Svg' })
  expect(svgs.map(svg => svg.props.alt)).toEqual(['Гроза', 'Claude волнуется: лимит тает'])
  for (const svg of svgs) expect(svg.props.isInteractive).toBe(true)
  await desktop.unmount()

  const terminal = await $.ui.mount({
    plugin: 'context-weather',
    surface: 'terminal',
    component: 'AbovePrompt',
    props: { ...BAND, bodyColumns: 40 },
  })
  expect(await terminal.find({ type: 'Text', text: '⛈' })).toBeDefined()
  expect(await terminal.find({ type: 'Box', key: '5ч' })).toBeUndefined()
  expect(await terminal.find({ type: 'Text', text: '😟' })).toBeUndefined()
  await terminal.unmount()
})

test('без замера полоса не рисуется', async ($, on) => {
  standInForEngine(on)
  const ui = await $.ui.mount({
    plugin: 'context-weather',
    surface: 'terminal',
    component: 'AbovePrompt',
    props: BAND,
  })
  expect(await ui.find({ type: 'Text', text: /%/ })).toBeUndefined()
  await ui.unmount()
})
