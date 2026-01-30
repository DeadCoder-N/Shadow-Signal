import { supaApi } from './supaApi';

// Central API surface used by the app, backed by Supabase
export const api = {
  createRoom: async (mode: string) => {
    return supaApi.createRoom(mode);
  },

  joinRoom: async (code: string, name: string, color?: string) => {
    return supaApi.joinRoom(code, name, color);
  },

  getRoom: async (code: string) => {
    return supaApi.getRoom(code);
  },

  startGame: async (code: string) => {
    return supaApi.startGame(code);
  },

  submitClue: async (code: string, playerId: number, clue: string) => {
    return supaApi.submitClue(code, playerId, clue);
  },

  vote: async (code: string, targetPlayerId: number) => {
    return supaApi.vote(code, targetPlayerId);
  },

  eliminate: async (code: string) => {
    return supaApi.eliminate(code);
  },

  forcePhaseAdvance: async (code: string) => {
    return supaApi.forcePhaseAdvance(code);
  },

  restartGame: async (code: string) => {
    return supaApi.restartGame(code);
  },

  updatePlayerColor: async (playerId: number, color: string) => {
    return supaApi.updatePlayerColor(playerId, color);
  },
};
