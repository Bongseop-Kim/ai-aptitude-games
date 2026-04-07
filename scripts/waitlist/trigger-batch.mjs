#!/usr/bin/env node

import { pathToFileURL } from "node:url";

const PHASE_SCHEDULE = {
  t0: {
    kst: "2026-04-07T10:00:00+09:00",
    utc: "2026-04-07T01:00:00Z",
  },
  t3: {
    kst: "2026-04-10T10:00:00+09:00",
    utc: "2026-04-10T01:00:00Z",
  },
  t7: {
    kst: "2026-04-14T10:00:00+09:00",
    utc: "2026-04-14T01:00:00Z",
  },
};

const PHASES = new Set(Object.keys(PHASE_SCHEDULE));

function readRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function readPhase() {
  const raw = (process.env.WAITLIST_BATCH_PHASE ?? "").toLowerCase();
  if (!PHASES.has(raw)) {
    throw new Error(
      `WAITLIST_BATCH_PHASE must be one of: ${[...PHASES].join(", ")}; got '${raw || "<empty>"}'`
    );
  }
  return raw;
}

function toBoolean(raw, defaultValue = false) {
  if (raw == null) {
    return defaultValue;
  }
  return ["1", "true", "yes", "on"].includes(raw.trim().toLowerCase());
}

export function buildPayload({ phase, runId, repository, sha }) {
  const schedule = PHASE_SCHEDULE[phase];
  const idempotencyKey = `waitlist-${phase}-${schedule.utc}`;

  return {
    phase,
    schedule,
    idempotencyKey,
    flags: {
      "app.delivery.t0_enabled": true,
      "ui.modals.whats_new_enabled": true,
      "comms.waitlist_batch_enabled": true,
      "app.delivery.rollback_enabled": false,
    },
    source: {
      provider: "github-actions",
      runId,
      repository,
      sha,
    },
    requestedAt: new Date().toISOString(),
  };
}

async function postBatch(url, token, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Idempotency-Key": payload.idempotencyKey,
    },
    body: JSON.stringify(payload),
  });

  const body = await response.text();
  if (!response.ok) {
    throw new Error(`Batch trigger failed (${response.status}): ${body}`);
  }

  return {
    status: response.status,
    body,
  };
}

export async function main() {
  const phase = readPhase();
  const dryRun = toBoolean(process.env.DRY_RUN, false);
  const runId = process.env.GITHUB_RUN_ID ?? "local";
  const repository = process.env.GITHUB_REPOSITORY ?? "local";
  const sha = process.env.GITHUB_SHA ?? "local";

  const payload = buildPayload({ phase, runId, repository, sha });

  if (process.env.GITHUB_OUTPUT) {
    const output = process.env.GITHUB_OUTPUT;
    const fs = await import("node:fs/promises");
    await fs.appendFile(output, `idempotency_key=${payload.idempotencyKey}\n`);
    await fs.appendFile(output, `scheduled_utc=${payload.schedule.utc}\n`);
    await fs.appendFile(output, `scheduled_kst=${payload.schedule.kst}\n`);
  }

  if (dryRun) {
    console.log(JSON.stringify({ dryRun: true, payload }, null, 2));
    return;
  }

  const webhookUrl = readRequiredEnv("WAITLIST_BATCH_WEBHOOK_URL");
  const webhookToken = process.env.WAITLIST_BATCH_WEBHOOK_TOKEN ?? "";

  const result = await postBatch(webhookUrl, webhookToken, payload);
  console.log(
    JSON.stringify(
      {
        dryRun: false,
        status: result.status,
        payload,
        responseBody: result.body,
      },
      null,
      2
    )
  );
}

const isCliInvocation =
  process.argv[1] != null &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isCliInvocation) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}
