import { FastifyInstance } from "fastify";
import { prisma } from "./prisma.js";

export async function registerPairing(app: FastifyInstance) {
  app.post(
    "/pairing/create",
    { preHandler: [(app as any).authenticate] },
    async (req: any) => {
      const userId = req.user.sub as string;
      const code = Math.random().toString(36).slice(2, 8).toUpperCase();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 10);
      await prisma.pairingCode.create({ data: { code, userId, expiresAt } });
      return { code, expiresAt: expiresAt.toISOString() };
    },
  );
}
