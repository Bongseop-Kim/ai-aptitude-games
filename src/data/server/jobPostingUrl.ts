const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid',
  'fbclid',
]);

export function normalizeJobPostingUrl(url: string): string | null {
  const trimmed = url.trim();
  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
  parsed.hash = '';
  TRACKING_PARAMS.forEach((param) => parsed.searchParams.delete(param));
  parsed.hostname = parsed.hostname.toLowerCase();
  let result = parsed.toString();
  if (result.endsWith('/')) result = result.slice(0, -1);
  return result;
}
