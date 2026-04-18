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

export type ValidationResult = { ok: true } | { ok: false; error: string };

// Regex для базовых эмоджи (covers Emoji_Presentation + most pictographs)
const EMOJI_RE = /\p{Extended_Pictographic}/u;

export function validateTitle(title: string): ValidationResult {
  if (title.trim().length === 0) {
    return { ok: false, error: "title пуст или состоит только из пробелов" };
  }
  if (EMOJI_RE.test(title)) {
    return { ok: false, error: "title содержит эмоджи — по правилам бренда запрещено" };
  }
  return { ok: true };
}
