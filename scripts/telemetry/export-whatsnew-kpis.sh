#!/usr/bin/env bash

set -euo pipefail

if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "sqlite3 command not found. Install sqlite3 first." >&2
  exit 1
fi

if [[ $# -lt 1 || $# -gt 3 ]]; then
  cat >&2 <<'USAGE'
Usage:
  bash scripts/telemetry/export-whatsnew-kpis.sh <sqlite-db-path> [from_day_utc] [to_day_utc]

Examples:
  bash scripts/telemetry/export-whatsnew-kpis.sh /tmp/db.db
  bash scripts/telemetry/export-whatsnew-kpis.sh /tmp/db.db 2026-04-01
  bash scripts/telemetry/export-whatsnew-kpis.sh /tmp/db.db 2026-04-01 2026-04-07
USAGE
  exit 1
fi

db_path="$1"
from_day="${2:-}"
to_day="${3:-}"
query_file="$(cd "$(dirname "$0")" && pwd)/whatsnew-kpi.sql"

if [[ ! -f "$db_path" ]]; then
  echo "Database file not found: $db_path" >&2
  exit 1
fi

if [[ ! -f "$query_file" ]]; then
  echo "Query file not found: $query_file" >&2
  exit 1
fi

base_query="$(sed '$s/;[[:space:]]*$//' "$query_file")"

if [[ -n "$from_day" || -n "$to_day" ]]; then
  day_filter="WHERE 1=1"
  if [[ -n "$from_day" ]]; then
    day_filter="${day_filter}
  AND event_day_utc >= '${from_day}'"
  fi
  if [[ -n "$to_day" ]]; then
    day_filter="${day_filter}
  AND event_day_utc <= '${to_day}'"
  fi

  query=$(
    cat <<SQL
WITH base AS (
$base_query
)
SELECT *
FROM base
$day_filter
ORDER BY event_day_utc ASC, environment ASC;
SQL
  )
else
  query="$base_query"
fi

sqlite3 -header -csv "$db_path" "$query"
