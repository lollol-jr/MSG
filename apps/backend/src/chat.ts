import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./prisma.js";
import { RoomType } from "@repo/shared";

const CreateRoomSchema = z.object({
  type: RoomType,
  title: z.string().optional(),
  memberUserIds: z.array(z.string()).optional(),
});

const SendMessageSchema = z.object({
  roomId: z.string(),
  kind: z.enum(["TEXT", "LINK", "FILE", "SYSTEM"]).default("TEXT"),
  text: z.string().optional(),
});

export async function registerChat(app: FastifyInstance, wsHub: any) {
  app.post(
    "/rooms",
    { preHandler: [(app as any).authenticate] },
    async (req: any) => {
      const userId = req.user.sub as string;
      const body = CreateRoomSchema.parse(req.body ?? {});

      const room = await prisma.room.create({
        data: {
          type: body.type,
          title: body.title,
          members: {
            create: [
              { userId, role: "ADMIN" },
              ...(body.memberUserIds ?? [])
                .filter((id) => id !== userId)
                .map((id) => ({ userId: id, role: "MEMBER" as const })),
            ],
          },
        },
        include: { members: true },
      });

      return { room };
    },
  );

  app.get(
    "/rooms",
    { preHandler: [(app as any).authenticate] },
    async (req: any) => {
      const userId = req.user.sub as string;
      const rooms = await prisma.room.findMany({
        where: { members: { some: { userId } } },
        orderBy: { updatedAt: "desc" },
        include: { members: true, agents: { include: { agentInstance: true } } },
      });
      return { rooms };
    },
  );

  app.get(
    "/rooms/:id/messages",
    { preHandler: [(app as any).authenticate] },
    async (req: any) => {
      const userId = req.user.sub as string;
      const roomId = req.params.id as string;

      const member = await prisma.roomMember.findUnique({
        where: { roomId_userId: { roomId, userId } },
      });
      if (!member) return { messages: [] };

      const messages = await prisma.message.findMany({
        where: { roomId },
        orderBy: { createdAt: "asc" },
        take: 50,
      });

      return {
        messages: messages.map((m) => ({
          ...m,
          createdAt: m.createdAt.toISOString(),
        })),
      };
    },
  );

  app.post(
    "/messages",
    { preHandler: [(app as any).authenticate] },
    async (req: any) => {
      const userId = req.user.sub as string;
      const body = SendMessageSchema.parse(req.body ?? {});

      const member = await prisma.roomMember.findUnique({
        where: { roomId_userId: { roomId: body.roomId, userId } },
      });
      if (!member) throw new Error("not member");

      const msg = await prisma.message.create({
        data: {
          roomId: body.roomId,
          senderId: userId,
          senderType: "HUMAN",
          kind: body.kind,
          text: body.text,
        },
      });

      wsHub.broadcastRoom(body.roomId, {
        event: "message.new",
        data: {
          id: msg.id,
          roomId: msg.roomId,
          senderId: msg.senderId,
          senderType: msg.senderType,
          kind: msg.kind,
          text: msg.text,
          createdAt: msg.createdAt.toISOString(),
        },
      });

      return { message: msg };
    },
  );
}
