import { FastifyInstance } from "fastify";
import { prisma } from "./prisma.js";

const gatewayByUser = new Map<string, WebSocket>();

export function gatewayHub() {
  return {
    set(userId: string, socket: WebSocket) {
      gatewayByUser.set(userId, socket);
    },
    get(userId: string) {
      return gatewayByUser.get(userId);
    },
    remove(userId: string) {
      gatewayByUser.delete(userId);
    },
  };
}

export async function registerGatewayWs(
  app: FastifyInstance,
  gh: ReturnType<typeof gatewayHub>,
) {
  app.get("/ws-gateway", { websocket: true }, (conn, req) => {
    const url = new URL(req.url ?? "", "http://localhost");
    const pairing = url.searchParams.get("pairing");
    if (!pairing) return conn.socket.close();

    (async () => {
      const pc = await prisma.pairingCode.findUnique({
        where: { code: pairing },
      });
      if (!pc) return conn.socket.close();
      if (pc.expiresAt.getTime() < Date.now()) return conn.socket.close();

      await prisma.pairingCode.delete({ where: { code: pairing } });

      const userId = pc.userId;
      gh.set(userId, conn.socket);

      conn.socket.send(
        JSON.stringify({ type: "gateway.hello", userId }),
      );

      conn.socket.onmessage = async (m) => {
        try {
          const payload = JSON.parse(m.data.toString());
          if (payload?.type === "agent.result") {
            const msg = await prisma.message.create({
              data: {
                roomId: payload.roomId,
                senderId: userId,
                senderType: "AGENT",
                kind: "TEXT",
                text: payload.text,
              },
            });

            (app as any).wsHub.broadcastRoom(payload.roomId, {
              event: "message.new",
              data: {
                id: msg.id,
                roomId: msg.roomId,
                senderId: "AGENT",
                senderType: "AGENT",
                kind: msg.kind,
                text: msg.text,
                createdAt: msg.createdAt.toISOString(),
              },
            });
          }
        } catch {}
      };

      conn.socket.onclose = () => gh.remove(userId);
    })();
  });
}
