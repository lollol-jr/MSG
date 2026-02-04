import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "./prisma.js";

const SocialLoginSchema = z.object({
  provider: z.enum(["google", "apple", "twitter"]),
  idToken: z.string().min(1),
  email: z.string().email().optional(),
  name: z.string().optional(),
});

export async function registerSocialAuth(app: FastifyInstance) {
  // Unified social login endpoint
  // Client sends provider + idToken, backend validates and returns JWT
  app.post("/auth/social", async (req, reply) => {
    const body = SocialLoginSchema.parse(req.body ?? {});

    // TODO: Validate idToken with each provider's verification endpoint
    // Google: https://oauth2.googleapis.com/tokeninfo?id_token=xxx
    // Apple: JWT verification with Apple's public keys
    // Twitter: OAuth 2.0 token validation
    //
    // For now, we trust the token and extract claims
    // This MUST be replaced with real validation before production

    let providerId: string;
    let email: string | undefined = body.email;
    let name: string | undefined = body.name;

    switch (body.provider) {
      case "google":
        // In production: verify with Google's tokeninfo endpoint
        providerId = `google_${body.idToken.slice(0, 32)}`;
        break;
      case "apple":
        // In production: verify JWT with Apple's public keys
        providerId = `apple_${body.idToken.slice(0, 32)}`;
        break;
      case "twitter":
        // In production: verify with Twitter OAuth 2.0
        providerId = `twitter_${body.idToken.slice(0, 32)}`;
        break;
    }

    const user = await prisma.user.upsert({
      where: {
        provider_providerId: {
          provider: body.provider,
          providerId,
        },
      },
      create: {
        provider: body.provider,
        providerId,
        email,
        name: name ?? `${body.provider} User`,
      },
      update: {
        email: email ?? undefined,
        name: name ?? undefined,
      },
    });

    const token = await reply.jwtSign({ sub: user.id });
    return {
      accessToken: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider,
      },
    };
  });
}
