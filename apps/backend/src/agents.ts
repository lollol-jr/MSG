import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./prisma.js";
import { AgentProvider } from "@repo/shared";

const CreateAgentSchema = z.object({
  name: z.string().min(1),
  provider: AgentProvider,
  meta: z.record(z.any()).optional(),
});

export async function registerAgents(app: FastifyInstance) {
  app.post(
    "/agents",
    { preHandler: [(app as any).authenticate] },
    async (req: any) => {
      const userId = req.user.sub as string;
      const body = CreateAgentSchema.parse(req.body ?? {});
      const agent = await prisma.agentInstance.create({
        data: {
          userId,
          name: body.name,
          provider: body.provider,
          meta: body.meta ?? undefined,
        },
      });
      return { agent };
    },
  );

  app.get(
    "/agents",
    { preHandler: [(app as any).authenticate] },
    async (req: any) => {
      const userId = req.user.sub as string;
      const agents = await prisma.agentInstance.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      return { agents };
    },
  );

  app.post(
    "/rooms/:id/agents/:agentId/invite",
    { preHandler: [(app as any).authenticate] },
    async (req: any) => {
      const userId = req.user.sub as string;
      const roomId = req.params.id as string;
      const agentId = req.params.agentId as string;

      const member = await prisma.roomMember.findUnique({
        where: { roomId_userId: { roomId, userId } },
      });
      if (!member) throw new Error("not member");

      const agent = await prisma.agentInstance.findFirst({
        where: { id: agentId, userId },
      });
      if (!agent) throw new Error("agent not found");

      const ra = await prisma.roomAgent.upsert({
        where: { roomId_agentInstanceId: { roomId, agentInstanceId: agentId } },
        create: { roomId, agentInstanceId: agentId },
        update: {},
      });

      return { roomAgent: ra };
    },
  );
}
