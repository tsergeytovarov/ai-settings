import { expect, test } from 'claude-code/testing'

import type { On } from 'claude-code'

import { ASK, DONE } from './register'

// The engine beneath: clips are recorded, not played; tools and turns just end.
function standInForEngine(on: On): string[] {
  const played: string[] = []
  on('audio.play', (_$, e) => {
    if (e.clip.asset !== undefined) played.push(e.clip.asset)
    return { value: undefined }
  })
  on('turn.complete', () => ({ text: 'готово' }))
  on('tool.call', () => ({ result: { answers: {} } }) as never)
  on('prompt.submit', (_$, e) => ({ text: e.text }) as never)
  on('classic.PermissionRequest', () => ({}) as never)
  return played
}

const turn = (reason: string, agentId?: string) => ({ turnId: 't1', answer: 'готово', durationMs: 1, reason, agentId }) as never
const question = (header: string) =>
  ({ tool: 'AskUserQuestion', tool_use_id: 'q1', questions: [{ question: 'Какой вариант?', header, options: [] }] }) as never

test('ответ дописан — звучит «готово»; остановка и субагент молчат', async ($, on) => {
  const played = standInForEngine(on)

  await $.turn.complete(turn('answer'))
  await $.turn.complete(turn('aborted'))
  await $.turn.complete(turn('answer', 'agent-1'))
  expect(played).toEqual([DONE])
})

test('вопрос модели и план звучат «ждёт тебя», вопрос предохранителя — нет', async ($, on) => {
  const played = standInForEngine(on)

  await $.tool.call(question('Подход'))
  await $.tool.call({ tool: 'ExitPlanMode', tool_use_id: 'p1', plan: '1. Сделать' } as never)
  await $.tool.call(question('⛔ Опасно'))
  await $.tool.call({ tool: 'Read', tool_use_id: 'r1', file_path: '/etc/hosts' } as never)
  expect(played).toEqual([ASK, ASK])
})

test('диалог разрешения звучит «ждёт тебя», кроме вопросов, которые уже прозвенели', async ($, on) => {
  const played = standInForEngine(on)

  await $.classic.PermissionRequest({ tool_name: 'Bash', tool_input: { command: 'npm publish' } } as never)
  await $.classic.PermissionRequest({ tool_name: 'AskUserQuestion', tool_input: {} } as never)
  expect(played).toEqual([ASK])
})

test('в автозадаче тихо', async ($, on) => {
  const played = standInForEngine(on)

  await $.prompt.submit({ text: '<scheduled-task name="digest">…</scheduled-task>', wait: false } as never)
  await $.turn.complete(turn('answer'))
  await $.tool.call(question('Подход'))
  expect(played).toEqual([])
})
