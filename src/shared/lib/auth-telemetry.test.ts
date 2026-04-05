import { beforeEach, describe, expect, it, vi } from "vitest";

const { insertValues, mockDb } = vi.hoisted(() => {
  const hoistedInsertValues = vi.fn();
  const hoistedSelectChain = {
    from: vi.fn(),
    orderBy: vi.fn(),
    limit: vi.fn(),
  };
  hoistedSelectChain.from.mockReturnValue(hoistedSelectChain);
  hoistedSelectChain.orderBy.mockReturnValue(hoistedSelectChain);
  return {
    insertValues: hoistedInsertValues,
    mockDb: {
      insert: vi.fn(() => ({
        values: hoistedInsertValues,
      })),
      select: vi.fn(() => hoistedSelectChain),
      _selectChain: hoistedSelectChain,
    },
  };
});

vi.mock("../db/client", () => ({
  db: mockDb,
}));

vi.mock("expo-constants", () => ({
  default: {
    expoConfig: {
      version: "1.2.3",
    },
  },
}));

vi.mock("react-native", () => ({
  Platform: {
    OS: "web",
  },
}));

vi.mock("../db/schema/auth-telemetry", () => ({
  authTelemetryEvents: {
    createdAt: "created_at",
  },
}));

import { emitAuthTelemetryEvent, getRecentAuthTelemetryEvents } from "./auth-telemetry";

describe("auth telemetry", () => {
  beforeEach(() => {
    mockDb.insert.mockClear();
    mockDb.select.mockClear();
    insertValues.mockReset();
    insertValues.mockResolvedValue(undefined);
    mockDb._selectChain.limit.mockReset();
    mockDb._selectChain.from.mockReturnValue(mockDb._selectChain);
    mockDb._selectChain.orderBy.mockReturnValue(mockDb._selectChain);
  });

  it("persists auth lifecycle events with canonical names", async () => {
    await emitAuthTelemetryEvent({
      eventType: "auth_signed_in",
      userId: "user-123",
      payload: {
        displayName: "Tester",
      },
    });

    expect(insertValues).toHaveBeenCalledTimes(1);
    expect(insertValues.mock.calls[0][0]).toMatchObject({
      event: "auth_signed_in",
      userId: "user-123",
      device: "web",
      appVersion: "1.2.3",
      payload: JSON.stringify({ displayName: "Tester" }),
    });
  });

  it("returns recent rows as parsed auth telemetry events", async () => {
    mockDb._selectChain.limit.mockResolvedValueOnce([
      {
        eventId: "evt-auth-1",
        event: "auth_restored",
        userId: "user-restore",
        timestamp: "2026-01-01T00:00:00.000Z",
        device: "web",
        appVersion: "1.2.3",
        payload: '{"source":"bootstrap"}',
      },
    ]);

    const rows = await getRecentAuthTelemetryEvents(1);

    expect(rows).toEqual([
      {
        eventId: "evt-auth-1",
        event: "auth_restored",
        userId: "user-restore",
        timestamp: "2026-01-01T00:00:00.000Z",
        device: "web",
        appVersion: "1.2.3",
        payload: { source: "bootstrap" },
      },
    ]);
  });
});
