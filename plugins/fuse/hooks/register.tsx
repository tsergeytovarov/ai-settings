import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, RenderElement } from 'claude-code'

import type { AllowedRules, PendingDanger, TargetInfo } from '../types'
import { findDanger } from './rules'
import type { Danger } from './rules'
import { targetLine } from './targets'

const allowed = atom({ plugin: 'fuse', key: 'allowed' } as const, [] as AllowedRules)
const isUnattended = atom({ plugin: 'fuse', key: 'isUnattended' } as const, false)
// The question waiting for an answer, for the red card above the prompt.
const pending = atom({ plugin: 'fuse', key: 'pending' } as const, null as PendingDanger | null)

export const RUN = 'Выполнить'
export const RUN_ALWAYS = 'Разрешать до конца сессии'
export const STOP = 'Запретить'
export const HEADER = '⛔ Опасно'
export const ALARM = 'sounds/alarm.wav'

// Folders a walk counts before it stops and says «больше».
const WALK_LIMIT = 3000

// The home folder, for `~` in a command (the engine does not expand it).
function homeOf(cwd: string): string | undefined {
  return /^(\/Users\/[^/]+|\/home\/[^/]+)/.exec(cwd)?.[1]
}

// What an rm would take with it: per path, whether it is there, and for a
// folder how many files and bytes lie under it (counted up to a limit).
function resolve(path: string, home: string | undefined): string {
  if (home !== undefined && (path === '~' || path.startsWith('~/'))) return home + path.slice(1)
  return path
}

async function walk(
  $: EngineInterface,
  dir: string,
  budget: { left: number },
): Promise<{ files: number; bytes: number; isPartial: boolean }> {
  let files = 0
  let bytes = 0
  let isPartial = false
  const queue = [dir]
  while (queue.length > 0) {
    if (budget.left <= 0) {
      isPartial = true
      break
    }
    budget.left -= 1
    const current = queue.shift()!
    let entries
    try {
      entries = await $.fs.list(current)
    } catch {
      isPartial = true
      continue
    }
    for (const entry of entries) {
      if (entry.kind === 'dir' && !entry.isLink) queue.push(`${current}/${entry.name}`)
      else {
        files += 1
        bytes += entry.size
      }
    }
  }
  return { files, bytes, isPartial }
}

export async function describeTargets(
  $: EngineInterface,
  targets: readonly string[],
  home: string | undefined,
  folderLimit: number,
): Promise<TargetInfo[]> {
  const budget = { left: folderLimit }
  const described: TargetInfo[] = []
  for (const path of targets) {
    // A glob or a variable is the shell's to expand: say so rather than guess.
    if (/[*?$`{[]/.test(path)) {
      described.push({ path, kind: 'pattern' })
      continue
    }
    try {
      const stat = await $.fs.stat(resolve(path, home))
      if (stat.kind === 'dir') {
        const { files, bytes, isPartial } = await walk($, resolve(path, home), budget)
        described.push({ path, kind: 'dir', files, bytes, isPartial })
      } else {
        described.push({ path, kind: 'file', files: 1, bytes: stat.size, isPartial: false })
      }
    } catch {
      described.push({ path, kind: 'missing' })
    }
  }
  return described
}

// `next(e)` answers `{ type: 'engine' }` when nothing beneath drew the band:
// it may only stand alone, never inside another tree.
function drawnBeneath(rest: RenderElement): RenderElement | null {
  return rest.type === 'engine' ? null : rest
}

function questionFor(danger: Danger, targets: TargetInfo[]): string {
  if (targets.length === 0) return `Команда ${danger.what}. Разрешить?`
  return `Команда ${danger.what}: ${targets.map(t => t.path).join(', ')}. Разрешить?`
}

async function ask($: EngineInterface, danger: Danger): Promise<string> {
  const targets =
    danger.targets === undefined ? [] : await describeTargets($, danger.targets, homeOf(await $.session.cwd()), WALK_LIMIT)
  const question = questionFor(danger, targets)
  await update($, pending, () => ({
    question,
    what: danger.what,
    detail: danger.detail,
    why: danger.why ?? null,
    targets,
  }))
  // Not awaited: the question opens while the alarm plays.
  $.audio.play({ asset: ALARM }).catch(error => {
    $.ui.log(`fuse: alarm did not play: ${error instanceof Error ? error.message : String(error)}`, { to: 'debug' })
  })
  try {
    return await $.ui.ask(question, { options: [RUN, RUN_ALWAYS, STOP], header: HEADER })
  } finally {
    await update($, pending, () => null)
  }
}

// No session.start hook: cockpit bundles this module with context-weather's, and
// one plugin may hook an event only once without a matcher.
export const register: Register = on => {
  // A scheduled task opens with its own marker: nobody is there to answer.
  on('prompt.submit', async ($, e, next) => {
    if (e.text.startsWith('<scheduled-task')) await update($, isUnattended, () => true)
    return next(e)
  })

  on('tool.call', async ($, e, next) => {
    // The call's arguments sit on the event itself, beside `tool`.
    const danger = findDanger(e.tool, e)
    if (danger === null) return next(e)
    if ((await read($, allowed)).includes(danger.rule)) return next(e)

    // A scheduled task posts and mails on purpose; it may not destroy anything.
    if (await read($, isUnattended)) {
      if (danger.kind === 'outward') return next(e)
      return { deny: `Предохранитель: в автозадаче это запрещено — команда ${danger.what}. Сделай без этого или остановись и опиши, что нужно.` }
    }

    let answer: string
    try {
      answer = await ask($, danger)
    } catch {
      return { deny: `Предохранитель: подтвердить было некому — команда ${danger.what}. Не повторяй без явной просьбы.` }
    }

    if (answer === RUN) return next(e)
    if (answer === RUN_ALWAYS) {
      await update($, allowed, list => [...list, danger.rule])
      return next(e)
    }
    const why = answer === STOP ? '' : ` Пояснение: ${answer}`
    return { deny: `Пользователь запретил: команда ${danger.what}. Не повторяй без явной просьбы.${why}` }
  })

  // The fuse's own question gets a line under each choice and, on «Выполнить»,
  // a preview of the command and everything it touches.
  on('ui.render', { component: 'AskUserQuestion' }, async ($, e, next) => {
    const waiting = await read($, pending)
    const [first, ...rest] = e.props.questions as Array<Record<string, unknown>>
    if (waiting === null || first === undefined || first.question !== waiting.question) return next(e)

    const touched = waiting.targets.map(target => `- ${targetLine(target)}`).join('\n')
    const preview =
      '```sh\n' + waiting.detail + '\n```' + (touched === '' ? '' : `\n\n**Затронет:**\n${touched}`)
    const descriptions: Record<string, string> = {
      [RUN]: waiting.why === null ? 'Модель не объяснила зачем' : `Зачем: ${waiting.why}`,
      [RUN_ALWAYS]: 'Больше не спрашивать про такое в этой сессии',
      [STOP]: 'Модель получит отказ и не будет повторять без просьбы',
    }
    const options = (first.options as Array<Record<string, unknown>>).map(option => ({
      ...option,
      description: descriptions[String(option.label)] ?? '',
      ...(option.label === RUN ? { preview } : {}),
    }))
    return next({ ...e, props: { ...e.props, questions: [{ ...first, options }, ...rest] } })
  })

  // While the fuse waits for an answer, a red card above the prompt says what is at stake.
  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const rest = await next(e)
    const waiting = await read($, pending)
    if (waiting === null || e.props.hasSurvey) return rest

    const { Box, Text } = $.ui.resolve(e)
    const others = drawnBeneath(rest)
    const card = (
      // Full width: in a band that wraps (context-weather's) the card takes a line of its own.
      <Box
        key="fuse-card"
        flexDirection="column"
        borderStyle="round"
        borderColor="error"
        paddingX={1}
        marginBottom={1}
        width="100%"
        minWidth={0}
      >
        <Text bold color="error">
          ⛔ Опасно: команда {waiting.what}
        </Text>
        <Text wrap="wrap">
          <Text dimColor>Зачем: </Text>
          {waiting.why ?? <Text dimColor>модель не объяснила</Text>}
        </Text>
        {waiting.targets.map(target => (
          <Text wrap="truncate-end">
            <Text color="error">• </Text>
            {targetLine(target)}
          </Text>
        ))}
        <Text dimColor wrap="truncate-end">
          {waiting.detail}
        </Text>
        <Text dimColor>Ответь в вопросе ниже: выполнить, разрешать до конца сессии или запретить.</Text>
      </Box>
    )
    if (others === null) return card
    return (
      <Box flexDirection="column" width="100%">
        {card}
        {others}
      </Box>
    )
  })
}
