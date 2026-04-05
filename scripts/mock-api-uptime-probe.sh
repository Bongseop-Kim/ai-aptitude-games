#!/usr/bin/env bash
set -euo pipefail

duration_minutes="${1:-30}"
interval_seconds="${2:-300}"
health_url="${3:-http://localhost:4000/health}"

if ! [[ "$duration_minutes" =~ ^[0-9]+$ ]] || ! [[ "$interval_seconds" =~ ^[0-9]+$ ]]; then
  echo "usage: $0 [duration_minutes] [interval_seconds] [health_url]" >&2
  exit 2
fi

end_ts=$(( $(date +%s) + duration_minutes * 60 ))
attempt=0

echo "# mock-api uptime probe start=$(date -u +%Y-%m-%dT%H:%M:%SZ) duration_min=${duration_minutes} interval_sec=${interval_seconds} url=${health_url}"

while (( $(date +%s) <= end_ts )); do
  attempt=$((attempt + 1))
  ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  http_code="$(curl -sS -o /tmp/mock-api-health.json -w '%{http_code}' "$health_url" || true)"
  body="$(cat /tmp/mock-api-health.json 2>/dev/null || true)"
  rm -f /tmp/mock-api-health.json

  echo "${ts} attempt=${attempt} http=${http_code} body=${body}"

  if [[ "$http_code" != "200" ]]; then
    echo "# failure detected at ${ts}; expected http=200"
    exit 1
  fi

  sleep "$interval_seconds"
done

echo "# mock-api uptime probe done=$(date -u +%Y-%m-%dT%H:%M:%SZ) status=pass"
