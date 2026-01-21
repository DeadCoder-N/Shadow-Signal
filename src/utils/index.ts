/**
 * Utility functions for Shadow Signal game
 * @author Senior Full-Stack Developer
 */

import { AVATAR_COLORS, AVATAR_DARK_COLORS } from '../constants';
import type { Player } from '../types';

/**
 * Generate deterministic color for avatar based on name
 */
export const getAvatarColor = (name: string): string => {
  const colorIndex = name
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[colorIndex];
};

/**
 * Get dark variant of avatar color
 */
export const getAvatarDarkColor = (color: string): string => {
  return AVATAR_DARK_COLORS[color as keyof typeof AVATAR_DARK_COLORS] || '#000';
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
  }
};

/**
 * Format room code for display
 */
export const formatRoomCode = (code: string): string => {
  return code.toUpperCase();
};

/**
 * Check if player is host
 */
export const isPlayerHost = (player: Player): boolean => {
  return player.isHost === 1;
};

/**
 * Check if player is alive
 */
export const isPlayerAlive = (player: Player): boolean => {
  return player.isAlive === 1;
};

/**
 * Check if player is dead
 */
export const isPlayerDead = (player: Player): boolean => {
  return player.isAlive === 0;
};

/**
 * Get alive players from list
 */
export const getAlivePlayers = (players: Player[]): Player[] => {
  return players.filter(isPlayerAlive);
};

/**
 * Get dead players from list
 */
export const getDeadPlayers = (players: Player[]): Player[] => {
  return players.filter(isPlayerDead);
};

/**
 * Check if all alive players have submitted clues
 */
export const allPlayersSubmittedClues = (players: Player[]): boolean => {
  const alivePlayers = getAlivePlayers(players);
  return alivePlayers.every(player => player.clue && player.clue.length > 0);
};

/**
 * Find player with most votes
 */
export const getPlayerWithMostVotes = (players: Player[]): Player | null => {
  let maxVotes = -1;
  let targetPlayer: Player | null = null;
  
  players.forEach(player => {
    const votes = player.votes || 0;
    if (votes > maxVotes) {
      maxVotes = votes;
      targetPlayer = player;
    }
  });
  
  return targetPlayer;
};

/**
 * Check if game can start
 */
export const canStartGame = (players: Player[], minPlayers: number = 3): boolean => {
  return players.length >= minPlayers;
};

/**
 * Debounce function for performance optimization
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};