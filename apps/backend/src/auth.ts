import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./prisma.js";

const DevLoginSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).optional(),
});

export async function registerAuth(app: FastifyInstance) {
  app.post("/auth/dev-login", async (req, reply) => {
    const body = DevLoginSchema.parse(req.body ?? {});
    const email = body.email ?? `${crypto.randomUUID()}@dev.local`;
    const user = await prisma.user.upsert({
      where: { email },
      create: { email, name: body.name ?? "Dev User" },
      update: { name: body.name ?? undefined },
    });

    const token = await reply.jwtSign({ sub: user.id });
    return {
      accessToken: token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  });

  app.get(
    "/me",
    { preHandler: [(app as any).authenticate] },
    async (req: any) => {
      const userId = req.user.sub as string;
      const user = await prisma.user.findUnique({ where: { id: userId } });
      return { user };
    },
  );
}
