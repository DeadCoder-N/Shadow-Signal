import { create } from 'zustand';
import { api } from '../game/api';

// Local session persistence keys
const LS_ROOM = 'shadow-signal.roomCode';
const LS_PLAYER_ID = 'shadow-signal.playerId';
const LS_PLAYER_NAME = 'shadow-signal.playerName';
const LS_PLAYER_COLORS = 'shadow-signal.playerColors';

// Color management utilities
const getStoredColors = (): Record<string, string> => {
  try {
    const stored = localStorage.getItem(LS_PLAYER_COLORS);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const setStoredColor = (playerName: string, color: string) => {
  try {
    const colors = getStoredColors();
    colors[playerName] = color;
    localStorage.setItem(LS_PLAYER_COLORS, JSON.stringify(colors));
  } catch {}
};

export interface Player {
  id: number;
  name: string;
  role: string | null;
  word: string | null;
  clue?: string;
  color?: string | null;
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
  playerColors: Record<string, string>;
  pollingInterval: any;
  error: string | null;
  isLoading: boolean;
  
  createRoom: (mode: string, name: string, color?: string) => Promise<void>;
  joinRoom: (code: string, name: string, color?: string) => Promise<void>;
  resumeSession: () => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  startGame: () => Promise<void>;
  submitClue: (clue: string) => Promise<void>;
  vote: (targetId: number) => Promise<void>;
  eliminate: () => Promise<void>;
  leaveRoom: () => void;
  forcePhaseAdvance: () => Promise<void>;
  restartGame: () => Promise<void>;
  clearError: () => void;
  setPlayerColor: (playerName: string, color: string) => void;
  getPlayerColor: (playerName: string) => string | undefined;
}

export const useGameStore = create<GameState>()(
    (set, get) => ({
      room: null,
      players: [],
      me: null,
      playerColors: getStoredColors(),
      pollingInterval: null,
      error: null,
      isLoading: false,

      clearError: () => set({ error: null }),

      setPlayerColor: (playerName: string, color: string) => {
        setStoredColor(playerName, color);
        set(state => ({
          playerColors: { ...state.playerColors, [playerName]: color }
        }));
        
        // Update backend if we have a current player
        const { me } = get();
        if (me && me.name === playerName) {
          api.updatePlayerColor(me.id, color).catch(console.error);
        }
      },

      getPlayerColor: (playerName: string) => {
        return get().playerColors[playerName];
      },

      createRoom: async (mode, name, color) => {
        set({ isLoading: true, error: null });
        try {
          console.log(`🏠 Creating room with mode: ${mode}`);
          const { room } = await api.createRoom(mode);
          console.log(`✅ Room created: ${room.code}`);
          
          console.log(`🚪 Host joining room: ${room.code} as ${name}`);
          const { player } = await api.joinRoom(room.code, name, color);
          console.log(`✅ Host successfully joined room`);
          
          // Persist session locally
          try {
            localStorage.setItem(LS_ROOM, room.code);
            localStorage.setItem(LS_PLAYER_ID, String(player.id));
            localStorage.setItem(LS_PLAYER_NAME, player.name);
          } catch {}

          set({ room, me: player, players: [player], isLoading: false });
          get().startPolling();
        } catch (error) {
          console.error('❌ Create room failed:', error);
          const message = error instanceof Error ? error.message : 'Failed to create room';
          set({ error: message, isLoading: false });
          throw error;
        }
      },

      joinRoom: async (code, name, color) => {
        set({ isLoading: true, error: null });
        try {
          console.log(`🚪 Joining room: ${code} as ${name}`);
          const { player, room } = await api.joinRoom(code, name, color);
          console.log(`✅ Successfully joined room: ${room.code}`);

          // Persist session locally
          try {
            localStorage.setItem(LS_ROOM, room.code);
            localStorage.setItem(LS_PLAYER_ID, String(player.id));
            localStorage.setItem(LS_PLAYER_NAME, player.name);
          } catch {}

          set({ room, me: player, isLoading: false });
          get().startPolling();
        } catch (error) {
          console.error('❌ Join room failed:', error);
          const message = error instanceof Error ? error.message : 'Failed to join room';
          set({ error: message, isLoading: false });
          throw error;
        }
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
        set({ isLoading: true, error: null });
        try {
          await api.startGame(room.code);
          set({ isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to start game';
          set({ error: message, isLoading: false });
          throw error;
        }
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
        // Clear local session
        try {
          localStorage.removeItem(LS_ROOM);
          localStorage.removeItem(LS_PLAYER_ID);
          localStorage.removeItem(LS_PLAYER_NAME);
        } catch {}
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
      },

      restartGame: async () => {
        const { room, me } = get();
        if (!room) return;
        try {
          const data = await api.restartGame(room.code);
          // Preserve current player (me) by id from returned players
          const newMe = me && (data.players as Player[]).find(p => p.id === me.id) || null;
          set({ room: data.room, players: data.players, me: newMe });
        } catch (error) {
          console.error('Restart game failed:', error);
        }
      },

      // Attempt to resume session from localStorage
      resumeSession: async () => {
        try {
          const code = localStorage.getItem(LS_ROOM);
          const idStr = localStorage.getItem(LS_PLAYER_ID);
          if (!code || !idStr) return;
          const playerId = parseInt(idStr, 10);
          const data = await api.getRoom(code);
          const me = (data.players as Player[]).find(p => p.id === playerId) || null;
          if (!me) {
            // Stale session; clear
            localStorage.removeItem(LS_ROOM);
            localStorage.removeItem(LS_PLAYER_ID);
            localStorage.removeItem(LS_PLAYER_NAME);
            return;
          }
          set({ room: data.room, players: data.players, me });
          get().startPolling();
        } catch (e) {
          // Any error => clear session
          localStorage.removeItem(LS_ROOM);
          localStorage.removeItem(LS_PLAYER_ID);
          localStorage.removeItem(LS_PLAYER_NAME);
        }
      }
    })
);
