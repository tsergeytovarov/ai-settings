export function computeFontSize(title: string): number {
  const length = [...title].length;
  if (length <= 30) return 128;
  if (length <= 60) return 104;
  if (length <= 100) return 80;
  return 64;
}

const MAX_LEN = 140;

export function truncateTitle(title: string): string {
  const chars = [...title];
  if (chars.length <= MAX_LEN) return title;

  // Режем до 139 и откатываемся до последнего пробела
  const head = chars.slice(0, MAX_LEN - 1);
  const lastSpace = head.lastIndexOf(" ");
  if (lastSpace > 0) {
    return head.slice(0, lastSpace).join("") + "…";
  }
  // Нет пробела в первых 139 — режем жёстко
  return head.join("") + "…";
}
