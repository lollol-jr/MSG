import { API_BASE } from "./config";
import { getToken } from "./storage";

async function headers() {
  const token = await getToken();
  return {
    "content-type": "application/json",
    ...(token ? { authorization: `Bearer ${token}` } : {}),
  };
}

export async function devLogin(email: string) {
  const res = await fetch(`${API_BASE}/auth/dev-login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function listRooms() {
  const res = await fetch(`${API_BASE}/rooms`, { headers: await headers() });
  return res.json();
}

export async function createRoom(type: string, title?: string) {
  const res = await fetch(`${API_BASE}/rooms`, {
    method: "POST",
    headers: await headers(),
    body: JSON.stringify({ type, title, memberUserIds: [] }),
  });
  return res.json();
}

export async function listMessages(roomId: string) {
  const res = await fetch(`${API_BASE}/rooms/${roomId}/messages`, {
    headers: await headers(),
  });
  return res.json();
}

export async function sendMessage(roomId: string, text: string) {
  const res = await fetch(`${API_BASE}/messages`, {
    method: "POST",
    headers: await headers(),
    body: JSON.stringify({ roomId, kind: "TEXT", text }),
  });
  return res.json();
}

export async function createAgent(name: string, provider: string) {
  const res = await fetch(`${API_BASE}/agents`, {
    method: "POST",
    headers: await headers(),
    body: JSON.stringify({ name, provider }),
  });
  return res.json();
}

export async function listAgents() {
  const res = await fetch(`${API_BASE}/agents`, {
    headers: await headers(),
  });
  return res.json();
}

export async function createPairingCode() {
  const token = await getToken();
  const res = await fetch(`${API_BASE}/pairing/create`, {
    method: "POST",
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
  return res.json();
}

export async function inviteAgentToRoom(roomId: string, agentId: string) {
  const res = await fetch(`${API_BASE}/rooms/${roomId}/agents/${agentId}/invite`, {
    method: "POST",
    headers: await headers(),
  });
  return res.json();
}
