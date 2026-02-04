import { z } from "zod";

export const ParticipantType = z.enum(["HUMAN", "AGENT"]);
export type ParticipantType = z.infer<typeof ParticipantType>;

export const AgentProvider = z.enum(["CLAUDE_CLI", "OPENAI", "OLLAMA"]);
export type AgentProvider = z.infer<typeof AgentProvider>;

export const RoomType = z.enum(["DM", "GROUP", "SHARED", "AGENTS_ONLY"]);
export type RoomType = z.infer<typeof RoomType>;

export const MessageKind = z.enum(["TEXT", "LINK", "FILE", "SYSTEM"]);
export type MessageKind = z.infer<typeof MessageKind>;

export const WsEvent = z.enum([
  "room.join",
  "room.leave",
  "message.send",
  "message.new",
  "agent.invoke",
  "agent.result",
  "gateway.hello",
  "gateway.job",
]);
export type WsEvent = z.infer<typeof WsEvent>;

export const MessageSchema = z.object({
  id: z.string(),
  roomId: z.string(),
  senderId: z.string(),
  senderType: ParticipantType,
  kind: MessageKind,
  text: z.string().optional(),
  createdAt: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;

export const WsEnvelopeSchema = z.object({
  event: WsEvent,
  data: z.unknown(),
});
export type WsEnvelope = z.infer<typeof WsEnvelopeSchema>;
