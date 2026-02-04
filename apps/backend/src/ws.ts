import { FastifyInstance } from "fastify";
import { WsEnvelopeSchema } from "@repo/shared";

const clientsByUser = new Map<string, Set<WebSocket>>();

export async function registerWs(app: FastifyInstance) {
  app.get("/ws", { websocket: true }, (conn, req) => {
    const url = new URL(req.url ?? "", "http://localhost");
    const token = url.searchParams.get("token");
    if (!token) return conn.socket.close();

    try {
      const decoded: any = (app as any).jwt.verify(token);
      const userId = decoded.sub as string;

      if (!clientsByUser.has(userId)) clientsByUser.set(userId, new Set());
      clientsByUser.get(userId)!.add(conn.socket);

      conn.socket.onmessage = (m) => {
        try {
          const raw = JSON.parse(m.data.toString());
          const env = WsEnvelopeSchema.parse(raw);
          conn.socket.send(
            JSON.stringify({ event: env.event, data: env.data }),
          );
        } catch {
          conn.socket.send(
            JSON.stringify({
              event: "message.new",
              data: { kind: "SYSTEM", text: "bad payload" },
            }),
          );
        }
      };

      conn.socket.onclose = () => {
        clientsByUser.get(userId)?.delete(conn.socket);
      };
    } catch {
      conn.socket.close();
    }
  });
}
