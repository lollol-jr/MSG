import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import websocket from "@fastify/websocket";
import { registerAuth } from "./auth.js";
import { registerWs } from "./ws.js";
import { registerChat } from "./chat.js";
import { registerAgents } from "./agents.js";
import { registerPairing } from "./pairing.js";
import { registerGatewayWs, gatewayHub } from "./gatewayWs.js";
import { registerAgentRuntime } from "./agentRuntime.js";
import { registerSocialAuth } from "./socialAuth.js";
import { wsHub } from "./wsHub.js";
import { registerMcp } from "./mcp.js";
import { registerAgentsOnlyRoom } from "./agentsOnlyRoom.js";

const app = Fastify({ logger: true });

await app.register(cors, { origin: true, credentials: true });
await app.register(jwt, { secret: process.env.JWT_SECRET! });
await app.register(websocket);

app.decorate("authenticate", async function (req: any, reply: any) {
  try {
    await req.jwtVerify();
  } catch {
    reply.code(401).send({ error: "unauthorized" });
  }
});

(app as any).wsHub = wsHub;

await registerAuth(app);
await registerSocialAuth(app);
await registerWs(app);
await registerChat(app, wsHub);
await registerAgents(app);
await registerMcp(app);
await registerAgentsOnlyRoom(app);

const gh = gatewayHub();
(app as any).gatewayHub = gh;
await registerPairing(app);
await registerGatewayWs(app, gh);
await registerAgentRuntime(app, gh);

app.get("/health", async () => ({ ok: true }));

const PORT = Number(process.env.PORT ?? 4000);
await app.listen({ port: PORT, host: "0.0.0.0" });
