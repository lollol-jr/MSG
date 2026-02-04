import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./prisma.js";

const InstallMcpSchema = z.object({
  name: z.string().min(1),
  command: z.string().min(1),
  args: z.array(z.string()).optional(),
  envVars: z.record(z.string()).optional(),
});

export async function registerMcp(app: FastifyInstance) {
  // Install MCP server
  app.post("/mcp/install", { preHandler: [(app as any).authenticate] }, async (req: any) => {
    const userId = req.user.sub as string;
    const body = InstallMcpSchema.parse(req.body ?? {});
    const mcp = await prisma.mcpServer.create({
      data: {
        userId,
        name: body.name,
        command: body.command,
        args: body.args ?? undefined,
        envVars: body.envVars ?? undefined
      },
    });
    return { mcp };
  });

  // List my MCP servers
  app.get("/mcp/list", { preHandler: [(app as any).authenticate] }, async (req: any) => {
    const userId = req.user.sub as string;
    const mcps = await prisma.mcpServer.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
    return { mcps };
  });

  // Delete MCP server
  app.delete("/mcp/:id", { preHandler: [(app as any).authenticate] }, async (req: any) => {
    const userId = req.user.sub as string;
    const id = req.params.id as string;
    const mcp = await prisma.mcpServer.findFirst({ where: { id, userId } });
    if (!mcp) throw new Error("not found");
    await prisma.mcpServer.delete({ where: { id } });
    return { deleted: true };
  });

  // Curated MCP list (pre-defined)
  app.get("/mcp/curated", async () => {
    return {
      curated: [
        {
          name: "Web Search (Brave)",
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-brave-search"],
          envKeys: ["BRAVE_API_KEY"]
        },
        {
          name: "Web Search (Tavily)",
          command: "uvx",
          args: ["--from", "git+https://github.com/tavily-ai/tavily-mcp"],
          envKeys: ["TAVILY_API_KEY"]
        },
        {
          name: "File System",
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-filesystem"],
          envKeys: []
        },
      ],
    };
  });
}
