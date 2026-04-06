export function generateSessionId(gameKey: string): string {
  return `${gameKey}-${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
}

export function pick<T>(values: T[]): T {
  return values[Math.floor(Math.random() * values.length)] as T;
}

export function shuffle<T>(values: T[]): T[] {
  const arr = [...values];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]] as [T, T];
  }
  return arr;
}
