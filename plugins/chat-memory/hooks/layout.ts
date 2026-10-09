import type { SessionMessage } from 'claude-code'

export function formatDuration(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / 60_000))
  if (minutes < 60) return `${minutes} мин`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ч ${minutes % 60} мин`
  return `${Math.floor(hours / 24)} д ${hours % 24} ч`
}

export function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${Math.round(n / 1_000)}k`
  return String(n)
}

export function clockTime(at: number): string {
  const date = new Date(at)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const WRITERS = new Set(['Edit', 'Write', 'NotebookEdit'])

export type TranscriptStats = {
  // Messages the person typed: user rows with text and no tool results.
  prompts: number
  // Distinct files written with Edit, Write or NotebookEdit.
  changedFiles: number
}

export function transcriptStats(messages: readonly SessionMessage[]): TranscriptStats {
  const written = new Set<string>()
  let prompts = 0
  for (const message of messages) {
    if (message.role === 'user' && message.text.trim() !== '' && (message.toolResults?.length ?? 0) === 0) {
      prompts += 1
    }
    for (const use of message.toolUses) {
      const path = use.input.file_path ?? use.input.notebook_path
      if (WRITERS.has(use.tool) && typeof path === 'string') written.add(path)
    }
  }
  return { prompts, changedFiles: written.size }
}
