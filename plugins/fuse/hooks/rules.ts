// What the fuse stops, and how it explains it. A rule looks at one tool call
// and answers what would happen, or null when the call is not its business.

export type Kind = 'destructive' | 'outward'

export type Danger = {
  rule: string
  kind: Kind
  // What happens if the call runs, as a verb phrase: «удалит без корзины».
  what: string
  // The command or payload, shortened, to show under the question.
  detail: string
  // Why the model makes the call, in its own words (a Bash call's description).
  why?: string
  // Paths a recursive rm would delete, as the command writes them.
  targets?: string[]
}

type Found = Omit<Danger, 'rule' | 'kind' | 'why'>

type Rule = {
  id: string
  kind: Kind
  check: (tool: string, input: Record<string, unknown>) => Found | null
  // Words a description must touch to explain this danger. A Bash description
  // often sums up the whole compound line («Add README, git status») and says
  // nothing of the rm in it: then the fuse says the reason is missing.
  about?: RegExp
}

const DETAIL_LIMIT = 300

function cut(text: string, limit = DETAIL_LIMIT): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length <= limit ? flat : `${flat.slice(0, limit - 1)}…`
}

function command(tool: string, input: Record<string, unknown>): string | null {
  if (tool !== 'Bash') return null
  return typeof input.command === 'string' ? input.command : null
}

// Paths a recursive rm may touch freely: throwaway folders.
const SCRATCH = /^(\/private)?\/tmp\/|\/scratchpad\//

// Quoted text: '…' or "…" with escapes.
const QUOTED = /(["'])(?:\\.|(?!\1)[^\\])*\1/g

// Leading env assignments and wrappers that run the next word; `rtk` and
// `rtk proxy` run the command after them too.
const WRAPPERS = /^(?:\w+=\S*\s+)*(?:(?:time|nohup|exec|command|env|rtk(?:\s+proxy)?|xargs(?:\s+-\S+)*)\s+)*/

// Git's own options before the subcommand: `git -C "$dir" -c k=v --no-pager branch -D x`
// is `git branch -D x` to the rules. Each group: -C with its path (quoted or not),
// -c with its setting, a long option with an optional =value, or -P.
const GIT_GLOBALS = /^git((?:\s+(?:-C\s+(?:"[^"]*"|'[^']*'|\S+)|-c\s+\S+|--[\w-]+(?:=\S+)?|-P))+)(?=\s)/

// The commands a shell line runs, each from its first word. Heredoc bodies are
// dropped and quoted text loses its separators, so a dangerous word inside a
// message, a commit text or a script fed through `<<EOF` is not a command.
export function commandsOf(line: string): string[] {
  const withoutHeredocs = line.replace(/<<-?\s*(['"]?)(\w+)\1[^\n]*\n[\s\S]*?\n[ \t]*\2[ \t]*(?=\n|$)/g, '')
  const flattened = withoutHeredocs.replace(QUOTED, quoted => quoted.replace(/[;&|\n]/g, ' '))
  return flattened
    .split(/&&|\|\||[;|\n]/)
    .map(part => part.trim().replace(WRAPPERS, '').replace(GIT_GLOBALS, 'git'))
    .filter(part => part !== '')
}

// A Bash rule: `pattern` is tried on each command from its first word.
function bash(
  id: string,
  pattern: RegExp,
  about: RegExp,
  what: (match: RegExpMatchArray) => Omit<Found, 'detail'> | null,
): Rule {
  return {
    id,
    kind: 'destructive',
    about,
    check: (tool, input) => {
      const cmd = command(tool, input)
      if (cmd === null) return null
      for (const part of commandsOf(cmd)) {
        const match = part.match(pattern)
        if (match === null) continue
        const found = what(match)
        if (found !== null) return { ...found, detail: cut(cmd) }
      }
      return null
    },
  }
}

// SQL that removes data: DROP, TRUNCATE, or DELETE with no WHERE.
const DESTRUCTIVE_SQL = /\b(DROP\s+(TABLE|DATABASE|SCHEMA|VIEW)|TRUNCATE(\s+TABLE)?\s+\w|DELETE\s+FROM\s+[\w.`"]+\s*(;|$|\)|'|"))/i
const SQL_CLIENT = /^(?:psql|mysql|sqlite3|clickhouse(?:-client)?|duckdb)\b/

function sqlIn(input: Record<string, unknown>): string | null {
  for (const key of ['query', 'sql', 'statement']) {
    const value = input[key]
    if (typeof value === 'string' && DESTRUCTIVE_SQL.test(value)) return value
  }
  return null
}

function mcpServer(tool: string): string {
  const match = /^mcp__([^_]+(?:_[^_]+)*?)__/.exec(tool)
  return match?.[1] ?? tool
}

const REMOVING = /удал|снес|снос|стер|стир|чист|чищ|убра|убер|clean|delet|remov|wipe|purge|\brm\b/i
const FORCE_PUSH = /push|пуш|forc|перезапис|истори|rebase|amend/i
const DISCARDING = /reset|сброс|откат|отмен|discard|restor|revert|верн|выбро/i
const BRANCHES = /ветк|branch|удал|delet|remov|чист|чищ|clean/i
const INSTALLING = /install|установ|скрипт|script|setup/i
const SUPERUSER = /sudo|прав|админ|root|install|установ|систем/i
const CLOUD = /удал|снес|delet|remov|uninstall|destroy|откат|rollback/i
const DATA = /удал|delet|drop|truncat|чист|чищ|clean|очист|сброс|reset|миграц|migrat/i

export const RULES: readonly Rule[] = [
  bash('rm-recursive', /^(?:sudo\s+)?rm\s+((?:-\S+(?:\s+|$))*)(.*)$/, REMOVING, match => {
    if (!/(^|\s)(-[a-zA-Z]*[rR][a-zA-Z]*|--recursive)(\s|$)/.test(match[1] ?? '')) return null
    const targets = (match[2] ?? '')
      .trim()
      .split(/\s+/)
      .filter(t => t !== '' && !t.startsWith('-'))
      .map(t => t.replace(/^["']|["']$/g, ''))
    if (targets.length > 0 && targets.every(t => SCRATCH.test(t))) return null
    return { what: 'удалит без корзины', targets }
  }),
  bash('git-force-push', /^git\s+push\b.*\s(?:--force(?:-with-lease)?|-f)\b/, FORCE_PUSH, () => ({
    what: 'перезапишет историю ветки на сервере — чужие коммиты могут пропасть',
  })),
  bash('git-reset-hard', /^git\s+reset\b.*--hard\b/, DISCARDING, () => ({ what: 'сотрёт все незакоммиченные изменения' })),
  bash('git-clean', /^git\s+clean\b.*\s-[a-zA-Z]*f/, REMOVING, () => ({ what: 'удалит все неотслеживаемые файлы — их не вернуть' })),
  bash('git-discard', /^git\s+(?:checkout\s+--\s|restore\s+(?!--staged)[^-])/, DISCARDING, () => ({ what: 'откатит правки, которых нет в коммитах' })),
  bash('git-branch-delete', /^git\s+branch\b.*\s-D\b/, BRANCHES, () => ({ what: 'удалит ветку, даже если она не влита' })),
  {
    id: 'pipe-to-shell',
    kind: 'destructive',
    about: INSTALLING,
    check: (tool, input) => {
      const cmd = command(tool, input)
      if (cmd === null) return null
      const flat = cmd.replace(QUOTED, '""')
      return /\b(?:curl|wget)\b[^|;&]*\|\s*(?:sudo\s+)?(?:ba|z)?sh\b/.test(flat)
        ? { what: 'скачает скрипт из интернета и сразу выполнит его, не показав', detail: cut(cmd) }
        : null
    },
  },
  bash('sudo', /^sudo\s/, SUPERUSER, () => ({ what: 'выполнит команду с правами администратора' })),
  bash('cloud-delete', /^(?:kubectl|helm|yc)\b.*\b(?:delete|uninstall|destroy)\b/, CLOUD, () => ({ what: 'удалит ресурс в облаке или кластере' })),
  {
    id: 'sql-destructive',
    kind: 'destructive',
    about: DATA,
    check: (tool, input) => {
      const cmd = command(tool, input)
      if (cmd === null || !DESTRUCTIVE_SQL.test(cmd)) return null
      return commandsOf(cmd).some(part => SQL_CLIENT.test(part)) ? { what: 'удалит данные в базе', detail: cut(cmd) } : null
    },
  },
  {
    id: 'mcp-sql-destructive',
    kind: 'destructive',
    check: (tool, input) => {
      if (!tool.startsWith('mcp__')) return null
      const sql = sqlIn(input)
      return sql === null ? null : { what: `удалит данные в базе ${mcpServer(tool)}`, detail: cut(sql) }
    },
  },
  {
    id: 'mcp-delete',
    kind: 'destructive',
    check: tool => {
      if (!tool.startsWith('mcp__')) return null
      const action = tool.slice(tool.lastIndexOf('__') + 2)
      if (/(^|_)(delete|trash|remove_permission|destroy)(_|$)/.test(action)) {
        return { what: `удалит в ${mcpServer(tool)} (${action})`, detail: action }
      }
      if (/(^|_)bulk(_|$)/.test(action)) {
        return { what: `массово изменит в ${mcpServer(tool)} (${action})`, detail: action }
      }
      return null
    },
  },
  {
    id: 'artifact-delete',
    kind: 'destructive',
    check: (tool, input) =>
      tool === 'Artifact' && input.action === 'delete'
        ? { what: 'удалит артефакт — ссылка перестанет работать у всех', detail: String(input.url ?? '') }
        : null,
  },
  {
    id: 'mattermost-post',
    kind: 'outward',
    check: (tool, input) => {
      if (!/mattermost_post_create$/.test(tool)) return null
      const text = typeof input.message === 'string' ? input.message : JSON.stringify(input)
      return { what: 'отправит сообщение в Mattermost', detail: cut(text) }
    },
  },
  {
    id: 'mail-send',
    kind: 'outward',
    check: (tool, input) => {
      if (!tool.startsWith('mcp__') || !/__(send_message|forward|reply)$/.test(tool)) return null
      const to = input.to ?? input.recipients ?? ''
      return {
        what: `отправит письмо${to === '' ? '' : ` (${cut(String(to), 60)})`}`,
        detail: cut(String(input.subject ?? input.body ?? '')),
      }
    },
  },
  {
    id: 'drive-share',
    kind: 'outward',
    check: tool => (/drive_share$/.test(tool) ? { what: 'откроет доступ к файлу на Google Drive', detail: tool } : null),
  },
]

export function findDanger(tool: string, input: unknown): Danger | null {
  const fields = typeof input === 'object' && input !== null ? (input as Record<string, unknown>) : {}
  const described = typeof fields.description === 'string' ? fields.description.trim() : ''
  for (const rule of RULES) {
    const found = rule.check(tool, fields)
    if (found === null) continue
    // A description that never touches this danger does not explain it.
    const explains = described !== '' && (rule.about === undefined || rule.about.test(described))
    return { rule: rule.id, kind: rule.kind, ...found, ...(explains ? { why: described } : {}) }
  }
  return null
}
