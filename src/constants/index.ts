/**
 * Application constants and configuration
 * @author Senior Full-Stack Developer
 */

export const GAME_CONFIG = {
  MIN_PLAYERS: 3,
  POLLING_INTERVAL: 2000,
  ROOM_CODE_LENGTH: 4,
  ELIMINATION_DURATION: 5000,
} as const;

export const GAME_MODES = {
  INFILTRATOR: 'infiltrator',
  SPY: 'spy',
} as const;

export const GAME_PHASES = {
  LOBBY: 'lobby',
  SELECTING: 'selecting',
  VOTING: 'voting',
  ENDED: 'ended',
} as const;

export const PLAYER_ROLES = {
  CITIZEN: 'citizen',
  INFILTRATOR: 'infiltrator',
  SPY: 'spy',
  AGENT: 'agent',
} as const;

export const WINNERS = {
  CITIZENS: 'citizens',
  SPECIAL: 'special',
} as const;

export const AVATAR_COLORS = [
  '#ef4444', // Red
  '#3b82f6', // Blue
  '#22c55e', // Green
  '#eab308', // Yellow
  '#f97316', // Orange
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#64748b', // Slate
] as const;

export const AVATAR_DARK_COLORS = {
  '#ef4444': '#991b1b',
  '#3b82f6': '#1e40af',
  '#22c55e': '#166534',
  '#eab308': '#854d0e',
  '#f97316': '#9a3412',
  '#a855f7': '#6b21a8',
  '#ec4899': '#9d174d',
  '#06b6d4': '#155e75',
  '#84cc16': '#3f6212',
  '#64748b': '#334155',
} as const;