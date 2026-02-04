import { prisma } from "./prisma.js";

const socketsByUser = new Map<string, Set<WebSocket>>();

export const wsHub = {
  add(userId: string, socket: WebSocket) {
    if (!socketsByUser.has(userId)) socketsByUser.set(userId, new Set());
    socketsByUser.get(userId)!.add(socket);
  },
  remove(userId: string, socket: WebSocket) {
    socketsByUser.get(userId)?.delete(socket);
  },
  sendToUser(userId: string, payload: any) {
    const set = socketsByUser.get(userId);
    if (!set) return;
    const msg = JSON.stringify(payload);
    for (const s of set) s.send(msg);
  },
  async broadcastRoom(roomId: string, payload: any) {
    const members = await prisma.roomMember.findMany({
      where: { roomId },
    });
    for (const m of members) this.sendToUser(m.userId, payload);
  },
};
