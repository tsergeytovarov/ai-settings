import { describe, expect, mock, test } from 'claude-code/testing'

import type { On } from 'claude-code'

import { levelFor, limitBuddySvg, moodFor } from './claude'
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

// The engine's own ends of the chain: echo the measurement, and at the bottom of
// ui.render what the engine really answers when nothing beneath drew.
function standInForEngine(on: On) {
  on('session.measure', (_$, e) => ({ changed: e.changed }))
  on('ui.render', () => ({ type: 'engine', ref: 0 }))
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
    const moods = [10, 30, 60, 80, 95, 99, 100].map(p => moodFor(p).mood)
    expect(moods).toEqual(['joy', 'calm', 'sad', 'crying', 'crying', 'crying', 'drained'])
  })

  test('кольцо заполняется, Claude целиком зеленеет, желтеет и краснеет, моргает и плачет', async () => {
    expect([10, 49, 50, 80, 89, 90, 100].map(levelFor)).toEqual(['ok', 'ok', 'warn', 'warn', 'warn', 'alarm', 'alarm'])
    const calm = limitBuddySvg(30, 'Лимит на 5 часов: 30%')
    expect(calm).toContain('<title>Лимит на 5 часов: 30%</title>')
    expect(calm).toContain('class="blink"')
    expect(calm).toContain('#3FB950')
    // 75–90%: yellow and crying; 90% and up: red and crying.
    expect(limitBuddySvg(80, 'x')).toContain('class="tear"')
    expect(limitBuddySvg(80, 'x')).toContain('#E8B931')
    expect(limitBuddySvg(97, 'x')).toContain('class="tear"')
    expect(limitBuddySvg(97, 'x')).toContain('#E5484D')
    // Half the ring used draws half its length.
    expect(limitBuddySvg(50, 'x')).toContain('stroke-dasharray="42.41 84.82"')
    expect(calm).toContain('color-scheme:light dark')
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
      { label: '5ч', title: 'Лимит на 5 часов', percent: 34, color: 'success', resetsIn: '2ч 10м' },
      { label: '7д', title: 'Лимит на неделю', percent: 72, color: 'warning', resetsIn: '3д 3ч' },
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
  // One ring buddy per window, the figures in its tooltip.
  const svgs = await desktop.findAll({ type: 'Svg' })
  expect(svgs.map(svg => svg.props.alt)).toEqual([
    'Гроза',
    'Лимит на 5 часов: 34%, сброс через 2ч 10м',
    'Лимит на неделю: 72%, сброс через 3д 3ч',
  ])
  expect((await desktop.find({ type: 'Box', key: '7д' }))?.text).toBe('7д')
  for (const svg of svgs) expect(svg.props.isInteractive).toBe(true)
  // The engine's own element never ends up inside the band's tree.
  expect(await desktop.find({ type: 'engine' })).toBeUndefined()
  await desktop.unmount()

  const terminal = await $.ui.mount({
    plugin: 'context-weather',
    surface: 'terminal',
    component: 'AbovePrompt',
    props: { ...BAND, bodyColumns: 40 },
  })
  expect(await terminal.find({ type: 'Text', text: '⛈' })).toBeDefined()
  // Narrow or not, the limits stay: an emoji and the share on the terminal.
  expect((await terminal.find({ type: 'Box', key: '5ч' }))?.text).toBe('🙂34%5ч')
  expect((await terminal.find({ type: 'Box', key: '7д' }))?.text).toBe('😢72%7д')
  await terminal.unmount()
})

test('то, что рисуют плагины под полосой, встаёт в её конец', async ($, on) => {
  // Registered first, so it answers before the stand-in's engine element.
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>кнопки</Text>
  })
  standInForEngine(on)
  mock.clock(on, { now: 0 })
  await $.session.measure({
    context: { tokens: 20_000, window: 200_000, percent: 10 },
    rateLimits: [],
    changed: ['context'],
  })

  const band = await $.ui.mount({ plugin: 'context-weather', surface: 'desktop', component: 'AbovePrompt', props: BAND })
  expect(await band.find({ type: 'Text', text: 'кнопки' })).toBeDefined()
  expect(await band.find({ type: 'Text', text: '10%' })).toBeDefined()
  await band.unmount()
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
