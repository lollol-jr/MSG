import { spawn } from "node:child_process";

export async function runClaude(prompt: string, mcpConfig?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const args = ["-p", prompt];

    // Add MCP config if provided
    if (mcpConfig) {
      args.push("--mcp-config", mcpConfig);
    }

    const child = spawn("claude", args, {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let out = "";
    let err = "";

    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      reject(new Error("claude timeout (120s)"));
    }, 120_000);

    child.stdout.on("data", (d: Buffer) => (out += d.toString()));
    child.stderr.on("data", (d: Buffer) => (err += d.toString()));

    child.on("close", (code: number | null) => {
      clearTimeout(timer);
      if (code === 0) resolve(out.trim());
      else reject(new Error(`claude failed (code ${code}): ${err}`));
    });
  });
}
