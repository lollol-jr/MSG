import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import { mkdtempSync } from "node:fs";
import { join } from "node:path";

export async function runClaude(prompt: string, mcpConfig?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const wrappedPrompt = `Answer briefly in the same language as the user. Keep it under 3 sentences.\n\nUser: ${prompt}`;
    const args = ["-p", wrappedPrompt, "--model", "haiku", "--max-turns", "1", "--no-session-persistence"];

    if (mcpConfig) {
      args.push("--mcp-config", mcpConfig);
    }

    const cwd = mkdtempSync(join(tmpdir(), "msg-agent-"));

    const child = spawn("claude", args, {
      stdio: ["ignore", "pipe", "pipe"],
      cwd,
    });

    let out = "";
    let err = "";

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("claude timeout (60s)"));
    }, 60_000);

    child.stdout.on("data", (d: Buffer) => (out += d.toString()));
    child.stderr.on("data", (d: Buffer) => (err += d.toString()));

    child.on("close", (code: number | null) => {
      clearTimeout(timer);
      if (code === 0) resolve(out.trim());
      else reject(new Error(`claude failed (code ${code}): ${err}`));
    });
  });
}
