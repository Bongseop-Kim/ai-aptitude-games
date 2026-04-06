import { describe, expect, it } from "vitest";
import { resolveReturnTo } from "./resolve-return-to";

describe("resolveReturnTo", () => {
  it.each([
    { input: undefined, expected: "/" },
    { input: "", expected: "/" },
    { input: "/", expected: "/" },
    { input: ["/games/nback/play"], expected: "/games/nback/play" },
    { input: ["/setting"], expected: "/setting" },
    { input: ["/setting/profile", "/games/promise/play"], expected: "/setting/profile" },
    { input: "/pre-game/nback", expected: "/pre-game/nback" },
    { input: "/games/promise/play", expected: "/games/promise/play" },
    { input: "/setting/security", expected: "/setting/security" },
    { input: "/tabs", expected: "/tabs" },
    { input: "/tabs/home", expected: "/tabs/home" },
    { input: "/home", expected: "/home" },
    { input: "/home/overview", expected: "/home/overview" },
    { input: "/auth", expected: "/" },
    { input: "games/nback/play", expected: "/" },
    { input: "https%3A%2F%2Fevil.example", expected: "/" },
    { input: "/profile", expected: "/" },
    { input: "/settings", expected: "/" },
    { input: "/setting-malicious", expected: "/" },
    { input: "/games", expected: "/" },
    { input: "/pre-game", expected: "/" },
    { input: "/%E0%A4%A", expected: "/" },
  ])("returns $expected for $input", ({ input, expected }) => {
    expect(resolveReturnTo(input as string | string[] | undefined)).toBe(expected);
  });
});
