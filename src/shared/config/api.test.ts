import { describe, expect, it } from "vitest";
import { getApiBaseUrlFromEnv } from "./api";

describe("getApiBaseUrlFromEnv", () => {
  it("throws when the env value is missing", () => {
    expect(() => getApiBaseUrlFromEnv(undefined)).toThrow(
      "EXPO_PUBLIC_API_BASE_URL is required"
    );
  });

  it("throws when the env value is blank", () => {
    expect(() => getApiBaseUrlFromEnv("   ")).toThrow(
      "EXPO_PUBLIC_API_BASE_URL is required"
    );
  });

  it("throws when the env value is not a valid URL", () => {
    expect(() => getApiBaseUrlFromEnv("not-a-url")).toThrow(
      "must be a valid URL"
    );
  });

  it("throws when the protocol is not http/https", () => {
    expect(() => getApiBaseUrlFromEnv("ftp://example.com")).toThrow(
      "must use http or https"
    );
  });

  it("returns a normalized base URL without a trailing slash", () => {
    expect(getApiBaseUrlFromEnv(" https://api.example.com/ ")).toBe(
      "https://api.example.com"
    );
  });
});
