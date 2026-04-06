import { describe, expect, it, vi } from "vitest";
import { createHttpClient } from "./http-client";

describe("http-client", () => {
  it("injects bearer token when available", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
    } as Response);

    const client = createHttpClient({
      fetchImpl: fetchMock,
      getAccessToken: async () => "access-1",
      refreshAccessToken: async () => null,
      clearSession: async () => {},
    });

    await client.request("https://api.example.com/me");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/me",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer access-1",
        }),
      })
    );
  });

  it("refreshes once on 401 and retries the request", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
      } as Response);

    const refreshMock = vi.fn().mockResolvedValue("access-2");

    const client = createHttpClient({
      fetchImpl: fetchMock,
      getAccessToken: async () => "access-1",
      refreshAccessToken: refreshMock,
      clearSession: async () => {},
    });

    const response = await client.request("https://api.example.com/me");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(refreshMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenLastCalledWith(
      "https://api.example.com/me",
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer access-2",
        }),
      })
    );
  });

  it("clears session when refresh cannot provide a new token", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
    } as Response);
    const clearSessionMock = vi.fn();

    const client = createHttpClient({
      fetchImpl: fetchMock,
      getAccessToken: async () => "access-1",
      refreshAccessToken: async () => null,
      clearSession: clearSessionMock,
    });

    const response = await client.request("https://api.example.com/me");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(clearSessionMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });

  it("clears session when retry also returns 401", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response)
      .mockResolvedValueOnce({
        ok: false,
        status: 401,
      } as Response);
    const clearSessionMock = vi.fn();

    const client = createHttpClient({
      fetchImpl: fetchMock,
      getAccessToken: async () => "access-1",
      refreshAccessToken: async () => "access-2",
      clearSession: clearSessionMock,
    });

    const response = await client.request("https://api.example.com/me");

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(clearSessionMock).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(401);
  });
});
