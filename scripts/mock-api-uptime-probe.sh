#!/usr/bin/env bash
set -euo pipefail

duration_minutes="${1:-30}"
interval_seconds="${2:-300}"
health_url="${3:-http://localhost:4000/health}"

if ! [[ "$duration_minutes" =~ ^[1-9][0-9]*$ ]] || ! [[ "$interval_seconds" =~ ^[1-9][0-9]*$ ]]; then
  echo "usage: $0 [duration_minutes] [interval_seconds] [health_url]" >&2
  exit 2
fi

start_time="$(date +%s)"
end_ts=$(( start_time + duration_minutes * 60 ))
attempt=0
temp_file="$(mktemp)"
trap 'rm -f "$temp_file"' EXIT

echo "# mock-api uptime probe start=$(date -u +%Y-%m-%dT%H:%M:%SZ) duration_min=${duration_minutes} interval_sec=${interval_seconds} url=${health_url}"

while (( $(date +%s) <= end_ts )); do
  attempt=$((attempt + 1))
  ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  http_code="$(curl -sS -o "$temp_file" -w '%{http_code}' "$health_url" || true)"
  body="$(cat "$temp_file" 2>/dev/null || true)"

  echo "${ts} attempt=${attempt} http=${http_code} body=${body}"

  if [[ "$http_code" != "200" ]]; then
    echo "# failure detected at ${ts}; expected http=200"
    exit 1
  fi

  now="$(date +%s)"
  elapsed=$(( now - start_time ))
  if (( elapsed >= duration_minutes * 60 )); then
    break
  fi

  remaining=$(( duration_minutes * 60 - elapsed ))
  sleep_seconds=$interval_seconds
  if (( remaining < sleep_seconds )); then
    sleep_seconds=$remaining
  fi

  sleep "$sleep_seconds"
done

echo "# mock-api uptime probe done=$(date -u +%Y-%m-%dT%H:%M:%SZ) status=pass"
