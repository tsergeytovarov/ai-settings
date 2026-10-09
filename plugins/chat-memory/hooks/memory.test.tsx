import { describe, expect, mock, test } from 'claude-code/testing'

import type { On, SessionMessage } from 'claude-code'

import { compactInstructions, memorySections, parseMemory } from './digest'
import { formatDuration, transcriptStats } from './layout'

const MEMORY = {
  goal: 'Сделать панель памяти',
  decisions: ['Сжимать Haiku по кнопке и перед компактом'],
  findings: ['Таймер в десктопе не перерисовывает картинки'],
  questions: [],
  next: 'Написать тесты',
}

const MESSAGES: SessionMessage[] = [
  { role: 'user', text: 'Сделай панель памяти', toolUses: [] },
  {
    role: 'assistant',
    text: 'Пишу плагин',
    toolUses: [
      { tool_use_id: 't1', tool: 'Write', input: { file_path: '/repo/hooks/register.tsx' } },
      { tool_use_id: 't2', tool: 'mcp__yandex-tracker__issue_get', input: {} },
    ],
  },
]

const PANE_PROPS = {
  title: 'Память чата',
  isFocused: false,
  bodyColumns: 60,
  placement: 'dock' as const,
  scroll: { offset: 0, bodyRows: 40 },
  view: {},
}

const BAND_PROPS = {
  hasSurvey: false,
  isWorking: false,
  maxRows: 10,
  bodyColumns: 120,
  scroll: { offset: 0, bodyRows: 10 },
  view: {},
}

const USAGE_NOW = { startedAt: 0, context: { window: 200_000 }, rateLimits: [] }
const USAGE = { input_tokens: 1, output_tokens: 1, cache_creation_input_tokens: 0, cache_read_input_tokens: 0 }

// The engine's side of the chain: the transcript, Haiku's reply, a clock, and at the
// bottom of ui.render what the engine really answers when nothing beneath drew.
function standInForEngine(on: On, asked: string[] = [], usage: unknown = USAGE_NOW) {
  const clock = mock.clock(on, { now: 0 })
  on('session.usage', () => ({ value: usage as never }))
  on('session.messages', () => ({ value: MESSAGES }))
  on('model.complete', (_$, e) => {
    asked.push(e.prompt)
    return { value: { isAnswered: true, text: '```json\n' + JSON.stringify(MEMORY) + '\n```', usage: USAGE } }
  })
  on('ui.render', () => ({ type: 'engine', ref: 0 }))
  return clock
}

describe('сжатие', () => {
  test('ответ Haiku разбирается даже в обёртке markdown', async () => {
    expect(parseMemory('```json\n' + JSON.stringify(MEMORY) + '\n```')).toEqual(MEMORY)
    expect(parseMemory('не JSON')).toBeNull()
  })

  test('память в панели — блок на раздел, markdown внутри, пустые разделы скрыты', async () => {
    const sections = memorySections(MEMORY)
    expect(sections.map(section => section.key)).toEqual(['goal', 'decisions', 'findings', 'next'])
    expect(sections[1]?.markdown).toBe('- Сжимать Haiku по кнопке и перед компактом')
  })

  test('статистика по транскрипту: запросы и изменённые файлы', async () => {
    expect(transcriptStats(MESSAGES)).toEqual({ prompts: 1, changedFiles: 1 })
    expect(formatDuration(75 * 3_600_000)).toBe('3 д 3 ч')
  })

  test('компакту передаются решения и выводы', async () => {
    const text = compactInstructions(MEMORY, 'про план')
    expect(text.startsWith('про план')).toBe(true)
    expect(text).toContain('- Сжимать Haiku по кнопке и перед компактом')
    expect(text).toContain('Следующий шаг: Написать тесты')
  })
})

test('полоса рисуется, когда под плагином никто ничего не рисует', async ($, on) => {
  standInForEngine(on)

  for (const surface of ['terminal', 'desktop'] as const) {
    const band = await $.ui.mount({ plugin: 'chat-memory', surface, component: 'AbovePrompt', props: BAND_PROPS })
    expect(await band.find({ type: 'Button', key: 'memory-refresh' })).toBeDefined()
    expect(await band.find({ type: 'engine' })).toBeUndefined()
    await band.unmount()
  }
})

test('полоса сохраняет то, что нарисовал плагин под ней', async ($, on) => {
  // Registered first, so it answers before the stand-in's engine element.
  on('ui.render', { component: 'AbovePrompt' }, ($, e) => {
    const { Text } = $.ui.resolve(e)
    return <Text>погода</Text>
  })
  standInForEngine(on)

  const band = await $.ui.mount({ plugin: 'chat-memory', surface: 'desktop', component: 'AbovePrompt', props: BAND_PROPS })
  expect(await band.find({ type: 'Text', text: 'погода' })).toBeDefined()
  expect(await band.find({ type: 'Button', key: 'memory-compact' })).toBeDefined()
  await band.unmount()
})

test('«↻ Память» заполняет панель', async ($, on) => {
  const asked: string[] = []
  standInForEngine(on, asked)

  for (const surface of ['terminal', 'desktop'] as const) {
    const band = await $.ui.mount({ plugin: 'chat-memory', surface, component: 'AbovePrompt', props: BAND_PROPS })
    await band.press({ key: 'memory-refresh' })
    await band.unmount()

    const ui = await $.ui.mount({ plugin: 'chat-memory', surface, component: 'Pane', requestId: 'chat-memory', props: PANE_PROPS })
    expect((await ui.find({ type: 'Text', text: /Решения · 1/ }))).toBeDefined()
    const blocks = await ui.findAll({ type: 'Markdown' })
    expect(blocks.some(block => String(block.props.text).includes('Сжимать Haiku'))).toBe(true)
    await ui.unmount()
  }
  // The second press found nothing new past the cursor: one call to Haiku.
  expect(asked.length).toBe(1)
})

test('сама по себе память не обновляется, сколько бы ни было ответов', async ($, on) => {
  const asked: string[] = []
  const clock = standInForEngine(on, asked)
  on('turn.complete', (_$, e) => ({ text: e.answer }))

  for (let i = 0; i < 12; i++) {
    await $.turn.complete({ answer: 'ok', durationMs: 1, isAborted: false, turnId: `t${i}` } as never)
  }
  await clock.advance(60_000)
  expect(asked.length).toBe(0)
})

test('цифры: деньги, время, запросы, контекст, лимиты — без инструментов', async ($, on) => {
  standInForEngine(on, [], {
    startedAt: 0,
    context: { tokens: 50_000, window: 200_000, percent: 25 },
    rateLimits: [
      { kind: 'five_hour', percentUsed: 34, resetsAt: new Date(2 * 3_600_000).toISOString() },
      { kind: 'seven_day', percentUsed: 71.6 },
    ],
    cost: { usd: 1.234 },
  })

  const desktop = await $.ui.mount({ plugin: 'chat-memory', surface: 'desktop', component: 'Pane', requestId: 'chat-memory', props: PANE_PROPS })
  await desktop.press({ key: 'tab-stats' })
  const svg = await desktop.find({ type: 'Svg' })
  expect(svg?.props.alt).toContain('Потрачено: $1.23')
  expect(svg?.props.alt).toContain('Контекст: 25%')
  expect(svg?.props.alt).toContain('Лимит 5 ч: 34%')
  expect(svg?.props.alt).toContain('Лимит неделя: 72%')
  expect(String(svg?.props.source)).toContain('сброс через 2 ч 0 мин')
  expect(String(svg?.props.source)).not.toContain('Инструменты')
  await desktop.unmount()

  const terminal = await $.ui.mount({ plugin: 'chat-memory', surface: 'terminal', component: 'Pane', requestId: 'chat-memory', props: PANE_PROPS })
  await terminal.press({ key: 'tab-stats' })
  expect(await terminal.find({ type: 'Text', text: /Запросов\s*1/ })).toBeDefined()
  expect(await terminal.find({ type: 'Text', text: /50k из 200k/ })).toBeDefined()
  await terminal.unmount()
})

test('«🗜 Сжать» сжимает и до этого обновляет память', async ($, on) => {
  const asked: string[] = []
  standInForEngine(on, asked)
  let instructions: string | undefined
  on('session.compact', (_$, e) => {
    instructions = e.instructions
    return { messages: [{ role: 'user', text: 'сводка', toolUses: [] }] }
  })

  const band = await $.ui.mount({ plugin: 'chat-memory', surface: 'desktop', component: 'AbovePrompt', props: BAND_PROPS })
  await band.press({ key: 'memory-compact' })
  expect(asked.length).toBe(1)
  expect(instructions).toContain('Сжимать Haiku по кнопке и перед компактом')
  await band.unmount()
})

test('перед /compact память уходит в инструкции', async ($, on) => {
  standInForEngine(on)
  let instructions: string | undefined
  on('session.compact', (_$, e) => {
    instructions = e.instructions
    return { messages: [{ role: 'user', text: 'сводка', toolUses: [] }] }
  })

  await $.session.compact({ trigger: 'manual', instructions: 'про план', messages: MESSAGES } as never)
  expect(instructions).toContain('про план')
  expect(instructions).toContain('Таймер в десктопе')
})
