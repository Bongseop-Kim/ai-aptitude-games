WITH filtered AS (
  SELECT
    date(timestamp) AS event_day_utc,
    COALESCE(NULLIF(json_extract(payload, '$.environment'), ''), device, 'unknown') AS environment,
    lower(event) AS event_name
  FROM assessment_telemetry_events
  WHERE lower(event) GLOB 'ui.whatsnew.*'
)
SELECT
  event_day_utc,
  environment,
  SUM(CASE WHEN event_name = 'ui.whatsnew.shown' THEN 1 ELSE 0 END) AS shown_count,
  SUM(CASE WHEN event_name = 'ui.whatsnew.dismissed' THEN 1 ELSE 0 END) AS dismissed_count,
  SUM(CASE WHEN event_name = 'ui.whatsnew.clicked' THEN 1 ELSE 0 END) AS clicked_count,
  SUM(CASE WHEN event_name = 'ui.whatsnew.error' THEN 1 ELSE 0 END) AS error_count
FROM filtered
GROUP BY event_day_utc, environment
ORDER BY event_day_utc ASC, environment ASC;
