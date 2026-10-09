import { expect, mock, test } from 'claude-code/testing'

import type { On } from 'claude-code'

const BAND = {
  hasSurvey: false,
  isWorking: false,
  maxRows: 10,
  bodyColumns: 120,
  scroll: { offset: 0, bodyRows: 10 },
  view: {},
}

// The engine beneath: measures pass through; nothing else draws the band.
function standInForEngine(on: On): void {
  mock.clock(on, { now: 0 })
  on('session.measure', (_$, e) => ({ changed: e.changed }))
  on('ui.render', () => ({ type: 'engine', ref: 0 }))
}

test('одна полоса: погода, лимиты и «Сжать» вместе', async ($, on) => {
  standInForEngine(on)
  await $.session.measure({
    context: { tokens: 120_000, window: 200_000, percent: 60 },
    rateLimits: [{ kind: 'five_hour', percentUsed: 34 }],
    changed: ['context', 'rateLimits'],
  } as never)

  for (const surface of ['terminal', 'desktop'] as const) {
    const band = await $.ui.mount({ plugin: 'cockpit', surface, component: 'AbovePrompt', props: BAND })
    expect(await band.find({ type: 'Button', key: 'cockpit-compact' })).toBeDefined()
    expect(await band.find({ type: 'Text', text: '60%' })).toBeDefined()
    expect(await band.find({ type: 'engine' })).toBeUndefined()
    await band.unmount()
  }
})

test('«Сжать» сжимает сразу, а если движок отказал — ставит /compact в очередь', async ($, on) => {
  standInForEngine(on)
  let compacted = 0
  let isRefusing = false
  on('session.compact', () => {
    if (isRefusing) throw new Error('a turn is running')
    compacted += 1
    return { messages: [{ role: 'user', text: 'сводка', toolUses: [] }] }
  })
  const queued: string[] = []
  on('command.run', (_$, e) => {
    queued.push(e.command)
    return { text: '' }
  })

  const band = await $.ui.mount({ plugin: 'cockpit', surface: 'desktop', component: 'AbovePrompt', props: BAND })
  await band.press({ key: 'cockpit-compact' })
  isRefusing = true
  await band.press({ key: 'cockpit-compact' })
  await band.unmount()

  expect(compacted).toBe(1)
  expect(queued).toEqual(['compact'])
})
