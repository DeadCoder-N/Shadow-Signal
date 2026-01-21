/**
 * Game state management using Zustand
 * @author Senior Full-Stack Developer
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../game/api';
import { GAME_CONFIG } from '../constants';
import type { GameStore, Player, Room } from '../types';

const STORAGE_KEY = 'shadow-signal-storage';

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // State
      room: null,
      players: [],
      me: null,
      pollingInterval: null,

      // Actions
      createRoom: async (mode: string, name: string): Promise<void> => {
        try {
          const { room } = await api.createRoom(mode);
          const { player } = await api.joinRoom(room.code, name);
          
          set({ 
            room, 
            me: player, 
            players: [player] 
          });
          
          get().startPolling();
        } catch (error) {
          console.error('Failed to create room:', error);
          throw error;
        }
      },

      joinRoom: async (code: string, name: string): Promise<void> => {
        try {
          const { player, room } = await api.joinRoom(code, name);
          
          set({ 
            room, 
            me: player 
          });
          
          get().startPolling();
        } catch (error) {
          console.error('Failed to join room:', error);
          throw error;
        }
      },

      startPolling: (): void => {
        const { pollingInterval } = get();
        
        // Clear existing interval if any
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }

        const interval = setInterval(async () => {
          const { room, me } = get();
          
          if (!room) {
            get().stopPolling();
            return;
          }
          
          try {
            const data = await api.getRoom(room.code);
            
            // Update current player data if role changed
            let updatedMe = me;
            if (me) {
              const foundMe = data.players.find((p: Player) => p.id === me.id);
              if (foundMe) {
                updatedMe = foundMe;
              }
            }
            
            set({ 
              room: data.room, 
              players: data.players, 
              me: updatedMe 
            });
          } catch (error) {
            console.error('Polling error:', error);
          }
        }, GAME_CONFIG.POLLING_INTERVAL);
        
        set({ pollingInterval: interval });
      },

      stopPolling: (): void => {
        const { pollingInterval } = get();
        
        if (pollingInterval) {
          clearInterval(pollingInterval);
          set({ pollingInterval: null });
        }
      },

      startGame: async (): Promise<void> => {
        const { room } = get();
        
        if (!room) {
          throw new Error('No room available');
        }
        
        try {
          await api.startGame(room.code);
        } catch (error) {
          console.error('Failed to start game:', error);
          throw error;
        }
      },

      submitClue: async (clue: string): Promise<void> => {
        const { room, me } = get();
        
        if (!room || !me) {
          throw new Error('Room or player not available');
        }
        
        try {
          await api.submitClue(room.code, me.id, clue);
          
          // Optimistic update
          set(state => ({
            me: state.me ? { ...state.me, clue } : null,
            players: state.players.map(p => 
              p.id === me.id ? { ...p, clue } : p
            )
          }));
        } catch (error) {
          console.error('Failed to submit clue:', error);
          throw error;
        }
      },

      vote: async (targetId: number): Promise<void> => {
        const { room } = get();
        
        if (!room) {
          throw new Error('No room available');
        }
        
        try {
          await api.vote(room.code, targetId);
        } catch (error) {
          console.error('Failed to vote:', error);
          throw error;
        }
      },

      eliminate: async (): Promise<void> => {
        const { room } = get();
        
        if (!room) {
          throw new Error('No room available');
        }
        
        try {
          await api.eliminate(room.code);
        } catch (error) {
          console.error('Failed to eliminate player:', error);
          throw error;
        }
      },

      restartGame: async (): Promise<void> => {
        const { room } = get();
        
        if (!room) {
          throw new Error('No room available');
        }
        
        try {
          await api.restartGame(room.code);
        } catch (error) {
          console.error('Failed to restart game:', error);
          throw error;
        }
      },

      leaveRoom: (): void => {
        get().stopPolling();
        set({ 
          room: null, 
          players: [], 
          me: null 
        });
      }
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        // Only persist essential data, not polling interval
        room: state.room,
        me: state.me,
      }),
    }
  )
);
