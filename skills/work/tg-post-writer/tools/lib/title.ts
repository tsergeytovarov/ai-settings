export function computeFontSize(title: string): number {
  const length = [...title].length;
  if (length <= 30) return 128;
  if (length <= 60) return 104;
  if (length <= 100) return 80;
  return 64;
}
