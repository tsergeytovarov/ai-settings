import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, RenderElement, SessionMessage } from 'claude-code'

import type { MemoryStatus, Tab } from '../types'
import { statsSvg, statsSvgHeight } from './chart'
import type { StatCell } from './chart'
import { MODEL, SYSTEM, compactInstructions, memorySections, parseMemory, prompt } from './digest'
import { clockTime, formatDuration, formatTokens, transcriptStats } from './layout'

const PANE = 'chat-memory'
const TITLE = 'Память чата'
const MODEL_TIMEOUT_MS = 60_000
const LIMIT_LABELS: Record<string, string> = { five_hour: 'Лимит 5 ч', seven_day: 'Лимит неделя' }

const memory = atom({ plugin: 'chat-memory', key: 'memory' } as const, null)
const IDLE: MemoryStatus = { cursor: 0, isRunning: false }
const status = atom({ plugin: 'chat-memory', key: 'status' } as const, IDLE)
const tab = atom({ plugin: 'chat-memory', key: 'tab' } as const, 'memory' as Tab)

// Module state: starts over on reload, while the atoms above are the host's and stay.
let running: Promise<void> | null = null

// Folds the messages past the cursor into the memory with Haiku. `messages`
// is the whole transcript; the cursor says how much of it is already in.
async function catchUp($: EngineInterface, messages: readonly SessionMessage[]): Promise<void> {
  const before = await read($, status)
  // A compaction shortened the transcript: start over on what is left.
  const cursor = before.cursor > messages.length ? 0 : before.cursor
  const fresh = messages.slice(cursor)
  if (fresh.length === 0) return

  await update($, status, s => ({ ...s, isRunning: true }))
  const reply = await $.model.complete({
    model: MODEL,
    system: SYSTEM,
    prompt: prompt(await read($, memory), fresh),
    maxTokens: 2000,
    effort: 'low',
    timeoutMs: MODEL_TIMEOUT_MS,
  })
  const next = reply.isAnswered ? parseMemory(reply.text) : null
  if (next === null) {
    await update($, status, s => ({ ...s, isRunning: false }))
    $.ui.toast(reply.isAnswered ? 'Память: Haiku ответила не JSON' : `Память: Haiku не ответила (${reply.reason})`)
    return
  }

  await update($, memory, () => next)
  await update($, status, () => ({ cursor: messages.length, isRunning: false }))
}

// One catch-up at a time; a second ask waits for the first.
async function refresh($: EngineInterface, messages?: readonly SessionMessage[]): Promise<void> {
  if (running !== null) await running
  running = (async () => catchUp($, messages ?? (await $.session.messages())))()
  try {
    await running
  } finally {
    running = null
  }
}

function reasonOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

// The button's compaction. The engine skips the calling plugin's own
// session.compact hook, so this does what that hook does for /compact.
async function compactNow($: EngineInterface): Promise<void> {
  await refresh($)
  const current = await read($, memory)
  const instructions = current === null ? '' : compactInstructions(current, undefined)
  try {
    const result = await $.session.compact(instructions === '' ? {} : { instructions })
    if (result.messages === undefined) {
      $.ui.toast(`Сжатие отменено: ${result.skip}`)
      return
    }
    const kept = result.messages.length
    await update($, status, s => ({ ...s, cursor: kept }))
  } catch (direct) {
    // The direct call refuses while the engine counts a turn as running, and a
    // button press may count as one. /compact as a command waits for the session
    // to go idle and runs then, the memory passed along as its instructions.
    $.ui.log(`chat-memory: $.session.compact refused: ${reasonOf(direct)}`, { to: 'debug' })
    try {
      await $.command.run({ command: 'compact', args: instructions })
    } catch (queued) {
      $.ui.toast(`Сжать не вышло: ${reasonOf(queued)}`)
    }
  }
}

// Instructions this plugin already wrote: a /compact the button queued carries them.
const KEPT_MARK = 'Обязательно сохрани в сводке:'

// `next(e)` answers `{ type: 'engine' }` when nothing beneath drew: the engine's
// own band, which may only stand alone, never inside another tree.
function drawnBeneath(rest: RenderElement): RenderElement | null {
  return rest.type === 'engine' ? null : rest
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({ name: 'chat-memory', description: 'Открыть панель с памятью чата' })
    void $.ui.open({ id: PANE, title: TITLE })

    return next(e)
  })

  on('command.run', { command: 'chat-memory' }, async $ => {
    await $.ui.open({ id: PANE, title: TITLE })

    return { text: 'Панель «Память чата» открыта.' }
  })

  // Before a compaction: bring the memory up to date and ask the summary to keep it.
  on('session.compact', async ($, e, next) => {
    if (e.agentId !== undefined || e.trigger === 'precompute') return next(e)

    await refresh($, e.messages)
    const current = await read($, memory)
    const isKept = current === null || (e.instructions ?? '').includes(KEPT_MARK)
    const compacted = await next(isKept ? e : { ...e, instructions: compactInstructions(current, e.instructions) })
    if (compacted.messages !== undefined) {
      const kept = compacted.messages.length
      await update($, status, s => ({ ...s, cursor: kept }))
    }

    return compacted
  })

  // The buttons live in the band above the prompt, which never scrolls away. Another
  // plugin may draw the band too (context-weather does): its tree comes first, these after.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const rest = await next(e)
    if (e.props.hasSurvey) return rest

    const { Box, Button } = $.ui.resolve(e)
    const state = await read($, status)

    const buttons = (
      <Box flexDirection="row" alignItems="center" gap={1} flexShrink={0}>
        <Button
          key="memory-refresh"
          label={state.isRunning ? '⏳ Память' : '↻ Память'}
          onPress={async () => {
            if (!state.isRunning) await refresh($)
          }}
        />
        <Button key="memory-compact" label="🗜 Сжать" onPress={async () => compactNow($)} />
      </Box>
    )
    const others = drawnBeneath(rest)
    if (others === null) return buttons

    // The other plugin's band (context-weather's is full width) takes the room the buttons leave.
    return (
      <Box flexDirection="row" alignItems="center" gap={1} width="100%">
        <Box flexGrow={1} flexShrink={1} minWidth={0}>
          {others}
        </Box>
        {buttons}
      </Box>
    )
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button, Markdown } = $.ui.resolve(e)
    const shown = await read($, tab)

    let body
    if (shown === 'memory') {
      const current = await read($, memory)
      body =
        current === null ? (
          <Markdown
            dimColor
            text="Пока пусто. Нажми **↻ Память** над строкой ввода или сожми чат: перед сжатием память соберётся сама."
          />
        ) : (
          <Box flexDirection="column">
            {memorySections(current).map(section => (
              <Box
                key={section.key}
                flexDirection="column"
                borderStyle="round"
                borderColor={section.color}
                paddingX={1}
                marginBottom={1}
              >
                <Text bold color={section.color}>
                  {section.title}
                </Text>
                <Markdown text={section.markdown} />
              </Box>
            ))}
          </Box>
        )
    } else {
      const usage = await $.session.usage()
      const now = await $.clock.now()
      const seen = transcriptStats(await $.session.messages())
      const hours = (now - usage.startedAt) / 3_600_000
      const cost = usage.cost?.usd
      const context = usage.context
      const cells: StatCell[] = [
        {
          label: 'Потрачено',
          value: cost === undefined ? '—' : `$${cost.toFixed(2)}`,
          note: cost === undefined || hours < 0.05 ? '' : `$${(cost / hours).toFixed(2)} в час`,
        },
        { label: 'Идёт', value: formatDuration(now - usage.startedAt), note: `с ${clockTime(usage.startedAt)}` },
        { label: 'Запросов', value: String(seen.prompts), note: `файлов изменено: ${seen.changedFiles}` },
        {
          label: 'Контекст',
          value: context.percent === undefined ? '—' : `${context.percent}%`,
          note: `${formatTokens(context.tokens ?? 0)} из ${formatTokens(context.window)}`,
        },
        ...usage.rateLimits.flatMap(limit => {
          const label = LIMIT_LABELS[limit.kind]
          if (label === undefined) return []
          const resetsAt = limit.resetsAt === undefined ? NaN : Date.parse(limit.resetsAt)
          const note = Number.isNaN(resetsAt) ? '' : `сброс через ${formatDuration(resetsAt - now)}`
          return [{ label, value: `${Math.round(limit.percentUsed)}%`, note }]
        }),
      ]

      if (e.surface === 'terminal') {
        body = (
          <Box flexDirection="column">
            {cells.map(cell => (
              <Text>
                <Text dimColor>{cell.label.padEnd(14)}</Text>
                <Text bold>{cell.value}</Text>
                {cell.note === '' ? '' : <Text dimColor> · {cell.note}</Text>}
              </Text>
            ))}
          </Box>
        )
      } else {
        const { Svg } = $.ui.resolve(e)
        body = (
          <Svg
            source={statsSvg(cells)}
            alt={cells.map(cell => `${cell.label}: ${cell.value}`).join(', ')}
            height={statsSvgHeight(cells.length)}
          />
        )
      }
    }

    const tabs: Array<[Tab, string]> = [
      ['memory', '🧠 Память'],
      ['stats', '📊 Цифры'],
    ]

    return (
      <Box flexDirection="column">
        <Box flexDirection="row" gap={1} marginBottom={1}>
          {tabs.map(([id, label]) => (
            <Button
              key={`tab-${id}`}
              label={label}
              variant={id === shown ? 'primary' : 'secondary'}
              onPress={async () => {
                await update($, tab, () => id)
              }}
            />
          ))}
        </Box>
        {body}
      </Box>
    )
  })
}
