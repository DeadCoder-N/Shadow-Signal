import { createEdgeSpark } from "@edgespark/client";

// Use the staging URL for now (in production this would be auto-handled)
const WORKER_URL = "https://staging--k0kvgktv0xc7frcvs5ac.youbase.cloud";
export const client = createEdgeSpark({ baseUrl: WORKER_URL });

export const api = {
  createRoom: async (mode: string) => {
    try {
      const res = await client.api.fetch("/api/public/rooms", {
        method: "POST",
        body: JSON.stringify({ mode }),
      });
      return res.json();
    } catch (error) {
      console.error('API blocked by ad blocker or network error:', error);
      throw new Error('Connection blocked. Please disable ad blocker or check network.');
    }
  },
  joinRoom: async (code: string, name: string) => {
    try {
      const res = await client.api.fetch(`/api/public/rooms/${code}/join`, {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      return res.json();
    } catch (error) {
      console.error('API blocked by ad blocker or network error:', error);
      throw new Error('Connection blocked. Please disable ad blocker or check network.');
    }
  },
  getRoom: async (code: string) => {
    try {
      const res = await client.api.fetch(`/api/public/rooms/${code}`);
      return res.json();
    } catch (error) {
      console.error('API blocked by ad blocker or network error:', error);
      throw new Error('Connection blocked. Please disable ad blocker or check network.');
    }
  },
  startGame: async (code: string) => {
    try {
      const res = await client.api.fetch(`/api/public/rooms/${code}/start`, {
        method: "POST",
      });
      return res.json();
    } catch (error) {
      console.error('API blocked by ad blocker or network error:', error);
      throw new Error('Connection blocked. Please disable ad blocker or check network.');
    }
  },
  submitClue: async (code: string, playerId: number, clue: string) => {
    try {
      const res = await client.api.fetch(`/api/public/rooms/${code}/clue`, {
        method: "POST",
        body: JSON.stringify({ playerId, clue }),
      });
      return res.json();
    } catch (error) {
      console.error('API blocked by ad blocker or network error:', error);
      throw new Error('Connection blocked. Please disable ad blocker or check network.');
    }
  },
  vote: async (code: string, targetPlayerId: number) => {
    try {
      const res = await client.api.fetch(`/api/public/rooms/${code}/vote`, {
        method: "POST",
        body: JSON.stringify({ targetPlayerId }),
      });
      return res.json();
    } catch (error) {
      console.error('API blocked by ad blocker or network error:', error);
      throw new Error('Connection blocked. Please disable ad blocker or check network.');
    }
  },
  eliminate: async (code: string) => {
    try {
      const res = await client.api.fetch(`/api/public/rooms/${code}/eliminate`, {
        method: "POST",
      });
      return res.json();
    } catch (error) {
      console.error('API blocked by ad blocker or network error:', error);
      throw new Error('Connection blocked. Please disable ad blocker or check network.');
    }
  }
};
