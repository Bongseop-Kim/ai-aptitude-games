import { afterEach, describe, expect, it } from "vitest";
import { spawn, type ChildProcess } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { resolve } from "node:path";
import { createServer } from "node:net";

const allocatePort = (): Promise<number> =>
  new Promise((resolve, reject) => {
    const server = createServer();
    server.listen(0, () => {
      const addr = server.address();
      server.close(() => {
        if (addr && typeof addr === "object") {
          resolve(addr.port);
        } else {
          reject(new Error("allocatePort: could not determine port"));
        }
      });
    });
    server.on("error", reject);
  });

const backendScriptPath = resolve(process.cwd(), "scripts/mock-backend.mjs");

const waitForHealth = async (port: number) => {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`);
      if (response.ok) {
        return;
      }
    } catch {
      // wait for server to boot
    }

    await delay(50);
  }

  throw new Error("mock backend did not become healthy in time");
};

describe("mock-backend auth routes", () => {
  const children: ChildProcess[] = [];

  afterEach(async () => {
    await Promise.all(
      children.map(async (child) => {
        if (child.exitCode !== null || child.signalCode !== null) {
          return;
        }

        child.kill("SIGTERM");
        await new Promise<void>((resolveKill, rejectKill) => {
          const timeout = setTimeout(() => {
            child.kill("SIGKILL");
            rejectKill(new Error("child process did not exit within 1s; force-killed"));
          }, 1_000);

          child.once("exit", () => {
            clearTimeout(timeout);
            resolveKill();
          });
        });
      })
    );
    children.length = 0;
  });

  it("supports POST /api/v1/auth/sign-in", async () => {
    const port = await allocatePort();
    const stderrChunks: string[] = [];
    const child = spawn(process.execPath, [backendScriptPath], {
      env: {
        ...process.env,
        PORT: String(port),
      },
      stdio: ["ignore", "ignore", "pipe"],
    });
    children.push(child);
    child.stderr?.on("data", (chunk: Buffer | string) => {
      stderrChunks.push(chunk.toString());
    });

    try {
      await waitForHealth(port);

      const response = await fetch(`http://127.0.0.1:${port}/api/v1/auth/sign-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ displayName: "Tester" }),
      });

      expect(response.status).toBe(200);

      const payload = (await response.json()) as {
        userId?: string;
        serverUserId?: string;
        displayName?: string;
      };

      expect(payload.serverUserId).toBeTypeOf("string");
      expect(payload.displayName).toBe("Tester");
    } catch (error) {
      if (stderrChunks.length > 0) {
        console.error(stderrChunks.join(""));
      }
      throw error;
    }
  });
});
