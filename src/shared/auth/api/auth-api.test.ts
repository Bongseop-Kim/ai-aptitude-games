import { describe, expect, it, vi } from "vitest";
import { createAuthApi } from "./auth-api";

describe("auth-api", () => {
  it("calls signIn with expected endpoint and payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        accessToken: "access-1",
        refreshToken: "refresh-1",
        expiresAt: 11111,
        tokenType: "Bearer",
        serverUserId: "server-user-1",
        displayName: "New User",
      }),
    } as Response);

    const api = createAuthApi({
      baseUrl: "https://api.example.com",
      fetchImpl: fetchMock,
      authorizedRequest: vi.fn(),
    });

    await api.signIn("New User");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/auth/sign-in",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ displayName: "New User" }),
      })
    );
  });

  it("calls refresh with refresh token payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        accessToken: "access-2",
        refreshToken: "refresh-2",
        expiresAt: 22222,
        tokenType: "Bearer",
        serverUserId: "server-user-2",
      }),
    } as Response);

    const api = createAuthApi({
      baseUrl: "https://api.example.com",
      fetchImpl: fetchMock,
      authorizedRequest: vi.fn(),
    });

    await api.refresh("refresh-1");

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.example.com/api/v1/auth/refresh",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ refreshToken: "refresh-1" }),
      })
    );
  });

  it("uses authorizedRequest for me/sign-out endpoints", async () => {
    const authorizedRequestMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          userId: "server-user-3",
          displayName: "Me",
        }),
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: async () => null,
      } as Response);

    const api = createAuthApi({
      baseUrl: "https://api.example.com",
      fetchImpl: vi.fn(),
      authorizedRequest: authorizedRequestMock,
    });

    await api.getMe();
    await api.signOut();

    expect(authorizedRequestMock).toHaveBeenNthCalledWith(
      1,
      "https://api.example.com/api/v1/auth/me",
      expect.objectContaining({
        method: "GET",
      })
    );
    expect(authorizedRequestMock).toHaveBeenNthCalledWith(
      2,
      "https://api.example.com/api/v1/auth/sign-out",
      expect.objectContaining({
        method: "POST",
      })
    );
  });
});
