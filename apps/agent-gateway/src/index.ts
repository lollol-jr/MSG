import WebSocket from "ws";
import readline from "node:readline";
import { runClaude } from "./claudeCli.js";

const BACKEND = process.env.BACKEND ?? "ws://localhost:4000/ws-gateway";

async function askPairingCode(): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const code = await new Promise<string>((res) =>
    rl.question("Enter pairing code: ", res),
  );
  rl.close();
  return code.trim();
}

async function main() {
  const pairing = await askPairingCode();
  const ws = new WebSocket(`${BACKEND}?pairing=${pairing}`);

  ws.on("open", () => console.log("[gateway] connected to backend"));
  ws.on("close", () => console.log("[gateway] disconnected"));
  ws.on("error", (e) => console.error("[gateway] error:", e.message));

  ws.on("message", async (buf) => {
    try {
      const msg = JSON.parse(buf.toString());
      console.log("[gateway] received:", msg.type);

      if (msg.type === "gateway.hello") {
        console.log("[gateway] authenticated as user:", msg.userId);
      }

      if (msg.type === "agent.job") {
        const { jobId, roomId, prompt } = msg;
        console.log(`[gateway] job ${jobId}: "${prompt}"`);

        let text = "";
        try {
          text = await runClaude(prompt);
          console.log(`[gateway] job ${jobId} completed (${text.length} chars)`);
        } catch (e: any) {
          text = `Agent error: ${e.message}`;
          console.error(`[gateway] job ${jobId} failed:`, e.message);
        }

        ws.send(
          JSON.stringify({ type: "agent.result", jobId, roomId, text }),
        );
      }
    } catch {}
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
