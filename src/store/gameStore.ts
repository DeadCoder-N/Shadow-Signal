import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../game/api';

export interface Player {
  id: number;
  name: string;
  role: string | null;
  word: string | null;
  clue?: string;
  isAlive: number;
  votes: number;
  isHost: number;
}

export interface Room {
  id: number;
  code: string;
  status: string;
  mode: string;
  currentTurnPlayerId: number | null;
  options: string | null;
  phaseStartTime?: number;
  lobbyStartTime?: number;
}

interface GameState {
  room: Room | null;
  players: Player[];
  me: Player | null;
  pollingInterval: any;
  
  createRoom: (mode: string, name: string) => Promise<void>;
  joinRoom: (code: string, name: string) => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  startGame: () => Promise<void>;
  submitClue: (clue: string) => Promise<void>;
  vote: (targetId: number) => Promise<void>;
  eliminate: () => Promise<void>;
  leaveRoom: () => void;
  forcePhaseAdvance: () => Promise<void>;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      room: null,
      players: [],
      me: null,
      pollingInterval: null,

      createRoom: async (mode, name) => {
        const { room } = await api.createRoom(mode);
        const { player } = await api.joinRoom(room.code, name);
        set({ room, me: player, players: [player] });
        get().startPolling();
      },

      joinRoom: async (code, name) => {
        const { player, room } = await api.joinRoom(code, name);
        set({ room, me: player });
        get().startPolling();
      },

      startPolling: () => {
        const interval = setInterval(async () => {
          const { room, me } = get();
          if (!room) return;
          
          try {
            const data = await api.getRoom(room.code);
            // Update me if role changed
            let newMe = me;
            if (me) {
              const foundMe = data.players.find((p: Player) => p.id === me.id);
              if (foundMe) newMe = foundMe;
            }
            
            set({ room: data.room, players: data.players, me: newMe });
          } catch (e) {
            console.error("Polling error", e);
          }
        }, 2000);
        set({ pollingInterval: interval });
      },

      stopPolling: () => {
        const { pollingInterval } = get();
        if (pollingInterval) clearInterval(pollingInterval);
        set({ pollingInterval: null });
      },

      startGame: async () => {
        const { room } = get();
        if (!room) return;
        await api.startGame(room.code);
      },

      submitClue: async (clue) => {
        const { room, me } = get();
        if (!room || !me) return;
        await api.submitClue(room.code, me.id, clue);
        // Optimistic update
        set(state => ({
          me: { ...state.me!, clue },
          players: state.players.map(p => p.id === me.id ? { ...p, clue } : p)
        }));
      },

      vote: async (targetId) => {
        const { room } = get();
        if (!room) return;
        await api.vote(room.code, targetId);
      },

      eliminate: async () => {
        const { room } = get();
        if (!room) return;
        await api.eliminate(room.code);
      },

      leaveRoom: () => {
        get().stopPolling();
        set({ room: null, players: [], me: null });
      },

      forcePhaseAdvance: async () => {
        const { room } = get();
        if (!room) return;
        try {
          const res = await api.forcePhaseAdvance(room.code);
          if (res.success) {
            console.log('Phase advanced to:', res.newStatus);
          }
        } catch (error) {
          console.error('Phase advance failed:', error);
        }
      }
    }),
    {
      name: 'shadow-signal-storage',
    }
  )
);
