import type { SessionMessage } from 'claude-code'

import type { Memory } from '../types'

export const MODEL = 'claude-haiku-5-5'

// Each message is cut to this many characters, the whole batch to the last MAX_BATCH.
const MAX_MESSAGE = 1500
const MAX_BATCH = 80_000

export const SYSTEM = `Ты ведёшь краткую память рабочей сессии человека с ИИ-ассистентом.
Тебе дают текущую память и новые сообщения. Обнови память и верни ТОЛЬКО JSON без пояснений и без markdown:
{"goal": string, "decisions": string[], "findings": string[], "questions": string[], "next": string}

goal — цель сессии одной фразой.
decisions — что решили делать или не делать.
findings — выводы и проверенные факты: что выяснили, что работает, что нет.
questions — только открытые вопросы; закрытые убирай.
next — следующий шаг одной фразой.

Правила: по-русски, каждый пункт до 140 символов, в каждом списке не больше 8 пунктов,
устаревшее и отменённое убирай, новое важнее старого. Ничего не выдумывай: только то, что есть в сообщениях.`

const EMPTY: Memory = { goal: '', decisions: [], findings: [], questions: [], next: '' }

function cut(text: string, limit: number): string {
  return text.length <= limit ? text : `${text.slice(0, limit)}…`
}

function pathOf(input: Record<string, unknown>): string | undefined {
  const path = input.file_path ?? input.notebook_path
  return typeof path === 'string' ? path : undefined
}

export function transcript(messages: readonly SessionMessage[]): string {
  const lines = messages.flatMap(message => {
    const who = message.role === 'user' ? 'Пользователь' : 'Ассистент'
    const tools = message.toolUses.map(use => {
      const path = pathOf(use.input)
      return path === undefined ? use.tool : `${use.tool}(${path})`
    })
    const text = message.text.trim()
    if (text === '' && tools.length === 0) return []
    const toolLine = tools.length === 0 ? '' : `\n[инструменты: ${tools.join(', ')}]`
    return [`${who}: ${cut(text, MAX_MESSAGE)}${toolLine}`]
  })
  const joined = lines.join('\n\n')
  return joined.length <= MAX_BATCH ? joined : joined.slice(joined.length - MAX_BATCH)
}

export function prompt(memory: Memory | null, messages: readonly SessionMessage[]): string {
  const current = memory === null ? 'пусто' : JSON.stringify(memory)
  return `Текущая память:\n${current}\n\nНовые сообщения:\n${transcript(messages)}\n\nОбнови память.`
}

function strings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

// The model's reply as a Memory, or null when it is not the JSON asked for.
export function parseMemory(reply: string): Memory | null {
  const start = reply.indexOf('{')
  const end = reply.lastIndexOf('}')
  if (start === -1 || end <= start) return null
  let data: unknown
  try {
    data = JSON.parse(reply.slice(start, end + 1))
  } catch {
    return null
  }
  if (typeof data !== 'object' || data === null) return null
  const record = data as Record<string, unknown>
  return {
    ...EMPTY,
    goal: typeof record.goal === 'string' ? record.goal : '',
    decisions: strings(record.decisions),
    findings: strings(record.findings),
    questions: strings(record.questions),
    next: typeof record.next === 'string' ? record.next : '',
  }
}

// What a compaction is asked to keep, so the summary does not lose it.
export function compactInstructions(memory: Memory, own: string | undefined): string {
  const list = (title: string, items: string[]) =>
    items.length === 0 ? '' : `\n${title}:\n${items.map(item => `- ${item}`).join('\n')}`
  const kept =
    `Обязательно сохрани в сводке:\nЦель: ${memory.goal}` +
    list('Решения', memory.decisions) +
    list('Выводы', memory.findings) +
    list('Открытые вопросы', memory.questions) +
    (memory.next === '' ? '' : `\nСледующий шаг: ${memory.next}`)
  return own === undefined || own.trim() === '' ? kept : `${own.trim()}\n\n${kept}`
}

export type MemorySection = { key: string; title: string; color: string; markdown: string }

// The memory as the pane shows it: one block per non-empty section, its body markdown.
export function memorySections(memory: Memory): MemorySection[] {
  const list = (items: string[]) => items.map(item => `- ${item}`).join('\n')
  const sections: MemorySection[] = [
    { key: 'goal', title: '🎯 Цель', color: 'claude', markdown: memory.goal },
    { key: 'decisions', title: `✅ Решения · ${memory.decisions.length}`, color: 'success', markdown: list(memory.decisions) },
    { key: 'findings', title: `💡 Выводы · ${memory.findings.length}`, color: 'suggestion', markdown: list(memory.findings) },
    { key: 'questions', title: `❓ Открытые вопросы · ${memory.questions.length}`, color: 'warning', markdown: list(memory.questions) },
    { key: 'next', title: '→ Следующий шаг', color: 'claude', markdown: memory.next },
  ]
  return sections.filter(section => section.markdown.trim() !== '')
}
