import type { Href } from "expo-router";

const FALLBACK_RETURN_TO: Href = "/";

export const resolveReturnTo = (returnTo: string | string[] | undefined): Href => {
  const candidate = Array.isArray(returnTo) ? returnTo[0] : returnTo;
  if (!candidate || candidate.length === 0) {
    return FALLBACK_RETURN_TO;
  }

  let decoded = candidate;
  try {
    decoded = decodeURIComponent(candidate);
  } catch {
    return FALLBACK_RETURN_TO;
  }

  if (!decoded.startsWith("/") || decoded === "/auth") {
    return FALLBACK_RETURN_TO;
  }

  if (
    decoded === "/" ||
    decoded === "/setting" ||
    decoded.startsWith("/setting/") ||
    decoded.startsWith("/games/") ||
    decoded.startsWith("/pre-game/")
  ) {
    return decoded as Href;
  }

  return FALLBACK_RETURN_TO;
};
