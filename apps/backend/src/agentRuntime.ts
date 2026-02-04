import { FastifyInstance } from "fastify";

export async function registerAgentRuntime(app: FastifyInstance, gh: any) {
  app.decorate(
    "invokeAgentIfNeeded",
    async function (roomId: string, userId: string, text?: string) {
      if (!text) return;
      if (!text.includes("@agent")) return;

      const socket = gh.get(userId);
      if (!socket) return;

      const jobId = crypto.randomUUID();
      socket.send(
        JSON.stringify({
          type: "agent.job",
          jobId,
          roomId,
          prompt: text.replace("@agent", "").trim(),
        }),
      );
    },
  );
}
