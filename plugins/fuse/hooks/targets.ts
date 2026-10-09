import type { TargetInfo } from '../types'

// How the fuse words what an rm would take with it. The walk that counts it
// lives in register.tsx: `$` may not cross an import.

function formatBytes(bytes: number): string {
  const units = ['Б', 'КБ', 'МБ', 'ГБ']
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value >= 10 || unit === 0 ? Math.round(value) : value.toFixed(1)} ${units[unit]}`
}

function plural(n: number, one: string, few: string, many: string): string {
  const last = n % 10
  const lastTwo = n % 100
  if (last === 1 && lastTwo !== 11) return one
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return few
  return many
}

// One line per path for the card and the dialog's preview.
export function targetLine(target: TargetInfo): string {
  switch (target.kind) {
    case 'pattern':
      return `${target.path} — шаблон, что под него попадёт, решит shell`
    case 'missing':
      return `${target.path} — не найден или нет доступа посмотреть`
    case 'file':
      return `${target.path} — файл, ${formatBytes(target.bytes ?? 0)}`
    case 'dir': {
      const files = target.files ?? 0
      const more = target.isPartial ? ' (посчитано не всё — внутри больше)' : ''
      return `${target.path} — папка: ${files.toLocaleString('ru')} ${plural(files, 'файл', 'файла', 'файлов')}, ${formatBytes(target.bytes ?? 0)}${more}`
    }
  }
}
