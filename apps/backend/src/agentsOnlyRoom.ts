import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./prisma.js";

const CreateAgentsRoomSchema = z.object({
  title: z.string().min(1),
  agentInstanceIds: z.array(z.string()).min(1),
  topic: z.string().optional(),
  maxTurns: z.number().int().min(1).max(50).default(10),
});

const StartConversationSchema = z.object({
  topic: z.string().min(1),
  maxTurns: z.number().int().min(1).max(50).default(10),
});

export async function registerAgentsOnlyRoom(app: FastifyInstance) {
  // Create AGENTS_ONLY room
  app.post("/rooms/agents-only", { preHandler: [(app as any).authenticate] }, async (req: any) => {
    const userId = req.user.sub as string;
    const body = CreateAgentsRoomSchema.parse(req.body ?? {});

    const room = await prisma.room.create({
      data: {
        type: "AGENTS_ONLY",
        title: body.title,
        members: {
          create: [{ userId, role: "ADMIN" }]
        },
        agents: {
          create: body.agentInstanceIds.map((agentInstanceId) => ({ agentInstanceId })),
        },
      },
      include: {
        members: true,
        agents: { include: { agentInstance: true } }
      },
    });

    return { room };
  });

  // Start agent conversation in AGENTS_ONLY room
  app.post("/rooms/:id/agents/start", { preHandler: [(app as any).authenticate] }, async (req: any) => {
    const userId = req.user.sub as string;
    const roomId = req.params.id as string;
    const body = StartConversationSchema.parse(req.body ?? {});

    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: true,
        agents: { include: { agentInstance: true } }
      },
    });

    if (!room || room.type !== "AGENTS_ONLY") {
      throw new Error("not agents-only room");
    }

    const member = room.members.find((m) => m.userId === userId);
    if (!member) {
      throw new Error("not member");
    }

    // Create system message with topic
    const systemMsg = await prisma.message.create({
      data: {
        roomId,
        senderType: "SYSTEM",
        kind: "SYSTEM",
        text: `Agent conversation started. Topic: "${body.topic}" (max ${body.maxTurns} turns)`,
      },
    });

    // Broadcast the system message to room
    (app as any).wsHub?.broadcastRoom(roomId, {
      event: "message.new",
      data: {
        ...systemMsg,
        createdAt: systemMsg.createdAt.toISOString()
      },
    });

    // Invoke first agent with the topic
    const firstAgent = room.agents[0];
    if (firstAgent) {
      const gh = (app as any).gatewayHub;
      const socket = gh?.get(userId);
      if (socket) {
        socket.send(JSON.stringify({
          type: "agent.job",
          jobId: crypto.randomUUID(),
          roomId,
          prompt: body.topic,
          agentId: firstAgent.agentInstanceId,
          maxTurns: body.maxTurns,
        }));
      }
    }

    return { started: true, topic: body.topic, maxTurns: body.maxTurns };
  });
}
