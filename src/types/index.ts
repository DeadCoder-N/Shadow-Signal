/**
 * Core type definitions for Shadow Signal game
 * @author Senior Full-Stack Developer
 */

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
  status: 'lobby' | 'selecting' | 'voting' | 'ended';
  mode: 'infiltrator' | 'spy';
  currentTurnPlayerId: number | null;
  options: string | null;
  winner?: 'citizens' | 'special';
}

export interface GameState {
  room: Room | null;
  players: Player[];
  me: Player | null;
  pollingInterval: NodeJS.Timeout | null;
}

export interface GameActions {
  createRoom: (mode: string, name: string) => Promise<void>;
  joinRoom: (code: string, name: string) => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
  startGame: () => Promise<void>;
  submitClue: (clue: string) => Promise<void>;
  vote: (targetId: number) => Promise<void>;
  eliminate: () => Promise<void>;
  restartGame: () => Promise<void>;
  leaveRoom: () => void;
}

export type GameStore = GameState & GameActions;

export interface AvatarProps {
  name: string;
  isDead?: number | boolean;
  isSpeaking?: boolean;
  size?: number;
}

export interface EliminationSequenceProps {
  player: Player;
  onComplete: () => void;
}

export type GameMode = 'create' | 'join';
export type GamePhase = 'lobby' | 'selecting' | 'voting' | 'ended';