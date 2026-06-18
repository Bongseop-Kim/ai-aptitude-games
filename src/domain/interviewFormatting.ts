export function formatAnswerMinutes(durationMs: number) {
  return `${Math.max(1, Math.round(durationMs / 60000))}분`;
}
