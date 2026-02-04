import { FastifyInstance } from "fastify";
import { WsEnvelopeSchema } from "@repo/shared";
import { wsHub } from "./wsHub.js";

export async function registerWs(app: FastifyInstance) {
  app.get("/ws", { websocket: true }, (conn, req) => {
    const url = new URL(req.url ?? "", "http://localhost");
    const token = url.searchParams.get("token");
    if (!token) return conn.close();

    try {
      const decoded: any = (app as any).jwt.verify(token);
      const userId = decoded.sub as string;

      wsHub.add(userId, conn);

      conn.onmessage = (m) => {
        try {
          const raw = JSON.parse(m.data.toString());
          WsEnvelopeSchema.parse(raw);
        } catch {
          conn.send(
            JSON.stringify({
              event: "message.new",
              data: { kind: "SYSTEM", text: "bad payload" },
            }),
          );
        }
      };

      conn.onclose = () => wsHub.remove(userId, conn);
    } catch {
      conn.close();
    }
  });
}
