import { createEdgeSpark } from "@edgespark/client";

// Use the staging URL for now (in production this would be auto-handled)
const WORKER_URL = "https://staging--k0kvgktv0xc7frcvs5ac.youbase.cloud";
export const client = createEdgeSpark({ baseUrl: WORKER_URL });

export const api = {
  createRoom: async (mode: string) => {
    const res = await client.api.fetch("/api/public/rooms", {
      method: "POST",
      body: JSON.stringify({ mode }),
    });
    return res.json();
  },
  joinRoom: async (code: string, name: string) => {
    const res = await client.api.fetch(`/api/public/rooms/${code}/join`, {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    return res.json();
  },
  getRoom: async (code: string) => {
    const res = await client.api.fetch(`/api/public/rooms/${code}`);
    return res.json();
  },
  startGame: async (code: string) => {
    const res = await client.api.fetch(`/api/public/rooms/${code}/start`, {
      method: "POST",
    });
    return res.json();
  },
  submitClue: async (code: string, playerId: number, clue: string) => {
    const res = await client.api.fetch(`/api/public/rooms/${code}/clue`, {
      method: "POST",
      body: JSON.stringify({ playerId, clue }),
    });
    return res.json();
  },
  vote: async (code: string, targetPlayerId: number) => {
    const res = await client.api.fetch(`/api/public/rooms/${code}/vote`, {
      method: "POST",
      body: JSON.stringify({ targetPlayerId }),
    });
    return res.json();
  },
  eliminate: async (code: string) => {
    const res = await client.api.fetch(`/api/public/rooms/${code}/eliminate`, {
      method: "POST",
    });
    return res.json();
  },
  forcePhaseAdvance: async (code: string) => {
    const res = await client.api.fetch(`/api/public/rooms/${code}/advance`, {
      method: "POST",
    });
    return res.json();
  }
};
