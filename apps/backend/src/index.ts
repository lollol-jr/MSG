import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import websocket from "@fastify/websocket";
import { registerAuth } from "./auth.js";
import { registerWs } from "./ws.js";
import { registerChat } from "./chat.js";
import { wsHub } from "./wsHub.js";

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

await registerAuth(app);
await registerWs(app);
await registerChat(app, wsHub);

app.get("/health", async () => ({ ok: true }));

const PORT = Number(process.env.PORT ?? 4000);
await app.listen({ port: PORT, host: "0.0.0.0" });
