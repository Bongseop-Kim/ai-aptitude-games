export function parseSessionIdParam(id: string | string[] | undefined): number | null {
  if (typeof id !== "string") {
    return null;
  }

  const sessionId = Number(id);

  if (!Number.isInteger(sessionId) || sessionId <= 0) {
    return null;
  }

  return sessionId;
}
