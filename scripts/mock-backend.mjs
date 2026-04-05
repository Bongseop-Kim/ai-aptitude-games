import { createServer } from "node:http";

const port = Number(process.env.PORT ?? 4000);

const json = (res, statusCode, payload) => {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(JSON.stringify(payload));
};

const server = createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
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

  json(res, 404, { error: "Not found" });
});

server.listen(port, "0.0.0.0", () => {
  process.stdout.write(`mock-api listening on :${port}\n`);
});
