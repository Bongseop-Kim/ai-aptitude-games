import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 4000);

const json = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS,POST", // Added POST
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
};

const TELEMETRY_EVENTS = [
  {
    timestamp: "2026-04-01T09:00:00.000Z",
    event: "ui.whatsnew.shown",
    environment: "prod",
  },
  {
    timestamp: "2026-04-01T09:05:00.000Z",
    event: "ui.whatsnew.shown",
    environment: "web",
  },
  {
    timestamp: "2026-04-01T09:10:00.000Z",
    event: "ui.whatsnew.dismissed",
    environment: "web",
  },
  {
    timestamp: "2026-04-02T10:20:00.000Z",
    event: "ui.whatsnew.clicked",
    environment: "prod",
  },
  {
    timestamp: "2026-04-03T10:40:00.000Z",
    event: "ui.whatsnew.shown",
    environment: "android",
  },
  {
    timestamp: "2026-04-03T11:05:00.000Z",
    event: "ui.whatsnew.error",
    environment: "android",
  },
  {
    timestamp: "2026-04-04T08:15:00.000Z",
    event: "ui.whatsnew.clicked",
    environment: "android",
  },
  {
    timestamp: "2026-04-05T14:30:00.000Z",
    event: "ui.whatsnew.shown",
    environment: "prod",
  },
  {
    timestamp: "2026-04-05T14:32:00.000Z",
    event: "ui.whatsnew.dismissed",
    environment: "prod",
  },
  {
    timestamp: "2026-04-06T07:50:00.000Z",
    event: "ui.whatsnew.shown",
    environment: "web",
  },
];

const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
};

const matchesDateRange = (eventDate, fromDay, toDay) => {
  if (fromDay && eventDate < fromDay) return false;
  if (toDay && eventDate > toDay) return false;
  return true;
};

const aggregateTelemetryByDay = (events, fromDay, toDay) => {
  const totals = new Map();

  for (const row of events) {
    const eventDay = row.timestamp.slice(0, 10);
    if (!matchesDateRange(eventDay, fromDay, toDay)) continue;
    if (!row.event.startsWith("ui.whatsnew.")) continue;
    const key = `${eventDay}|${row.environment}`;
    const bucket = totals.get(key) ?? {
      event_day_utc: eventDay,
      environment: row.environment,
      shown_count: 0,
      dismissed_count: 0,
      clicked_count: 0,
      error_count: 0,
    };
    if (row.event === "ui.whatsnew.shown") bucket.shown_count += 1;
    if (row.event === "ui.whatsnew.dismissed") bucket.dismissed_count += 1;
    if (row.event === "ui.whatsnew.clicked") bucket.clicked_count += 1;
    if (row.event === "ui.whatsnew.error") bucket.error_count += 1;
    totals.set(key, bucket);
  }

  return [...totals.values()].sort((lhs, rhs) => {
    if (lhs.event_day_utc === rhs.event_day_utc) {
      return lhs.environment.localeCompare(rhs.environment);
    }
    return lhs.event_day_utc.localeCompare(rhs.event_day_utc);
  });
};

const server = createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS,POST", // Added POST
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (req.url === "/health") {
    json(res, 200, { ok: true, service: "mock-api" });
    return;
  }

  if (req.url === "/api/version") {
    json(res, 200, {
      name: "ai-aptitude-games-mock-api",
      version: "0.1.0",
      now: new Date().toISOString(),
    });
    return;
  }

  if (req.url === "/api/games") {
    json(res, 200, {
      games: [
        { id: "nback", enabled: true },
        { id: "stroop", enabled: true },
        { id: "rotation", enabled: true },
      ],
    });
    return;
  }

  const url = new URL(req.url ?? "", `http://localhost:${port}`);

  if (url.pathname === "/api/events") {
    json(res, 200, {
      total: TELEMETRY_EVENTS.length,
      events: TELEMETRY_EVENTS,
    });
    return;
  }

  if (url.pathname === "/api/scores") {
    json(res, 200, {
      count: 3,
      scores: [
        { userId: "user-001", score: 92, environment: "prod", createdAt: "2026-04-05T14:40:00.000Z" },
        { userId: "user-002", score: 85, environment: "web", createdAt: "2026-04-05T15:20:00.000Z" },
        { userId: "user-003", score: 78, environment: "android", createdAt: "2026-04-06T07:55:00.000Z" },
      ],
    });
    return;
  }

  if (url.pathname === "/api/telemetry") {
    const fromDay = parseDate(url.searchParams.get("from"));
    const toDay = parseDate(url.searchParams.get("to"));
    const rows = aggregateTelemetryByDay(TELEMETRY_EVENTS, fromDay, toDay);
    json(res, 200, {
      count: rows.length,
      fromDay,
      toDay,
      rows,
    });
    return;
  }

  if (req.url === "/api/v1/auth/sign-in" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      try {
        const { displayName } = JSON.parse(body);
        const normalizedDisplayName = String(displayName || "").trim().slice(0, 40);
        
        if (normalizedDisplayName.length === 0) {
          // Mimic invalid_credentials error for empty display name
          res.writeHead(401, {
            "Content-Type": "application/json; charset=utf-8",
            "Access-Control-Allow-Origin": "*",
          });
          res.end(JSON.stringify({ error: "invalid_credentials" }));
          return;
        }
        
        // Simulate serverUserId and create a session ID
        const userId = `server_user_${Date.now().toString(36)}_${Math.floor(Math.random() * 1_000_000)}`;
        const sessionDisplayName = normalizedDisplayName;

        json(res, 200, { 
          serverUserId: userId,
          displayName: sessionDisplayName
        });
      } catch (e) {
        res.writeHead(400, {
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Origin": "*",
        });
        res.end(JSON.stringify({ error: "invalid_request_body" }));
      }
    });
    return;
  }

  json(res, 404, { error: "Not found" });
});

server.listen(port, "0.0.0.0", () => {
  process.stdout.write(`mock-api listening on :${port}
`);
});
