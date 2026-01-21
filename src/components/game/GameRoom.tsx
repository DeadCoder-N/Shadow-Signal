/**
 * Game room component - Main game interface
 * @author Senior Full-Stack Developer
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../../store/gameStore';
import { Avatar } from './Avatar';
import { WaitingRoom } from './WaitingRoom';
import { EliminationSequence } from './EliminationSequence';
import { GAME_CONFIG, GAME_PHASES, PLAYER_ROLES } from '../../constants';
import { copyToClipboard, isPlayerHost, isPlayerAlive, canStartGame } from '../../utils';
import type { Player } from '../../types';
import {
  Copy,
  LogOut,
  Skull,
  Crown,
  Fingerprint,
  ShieldAlert,
  Clock
} from 'lucide-react';

export const GameRoom: React.FC = () => {
  const { room, players, me, startGame, submitClue, vote, eliminate, restartGame, leaveRoom } = useGameStore();
  const [revealed, setRevealed] = useState<boolean>(false);
  const [eliminatedPlayer, setEliminatedPlayer] = useState<Player | null>(null);
  const prevPlayersRef = useRef<Player[]>(players);

  // Early return if no room or player data
  if (!room || !me) {
    return null;
  }

  const gameState = {
    isHost: isPlayerHost(me),
    isLobby: room.status === GAME_PHASES.LOBBY,
    isSelecting: room.status === GAME_PHASES.SELECTING,
    isVoting: room.status === GAME_PHASES.VOTING,
    isEnded: room.status === GAME_PHASES.ENDED,
    isDead: !isPlayerAlive(me),
    options: room.options ? JSON.parse(room.options) : [],
  };

  const { isHost, isLobby, isSelecting, isVoting, isEnded, isDead, options } = gameState;
  const isGameActive = isSelecting || isVoting;

  // Show waiting room after game ends
  if (isEnded) {
    return (
      <WaitingRoom
        room={room}
        players={players}
        me={me}
        onStartNewGame={restartGame}
        onLeaveRoom={leaveRoom}
      />
    );
  }

  // Detect elimination
  useEffect(() => {
    const newlyEliminated = players.find(player => {
      const previousState = prevPlayersRef.current.find(p => p.id === player.id);
      return !isPlayerAlive(player) && previousState && isPlayerAlive(previousState);
    });

    if (newlyEliminated) {
      setEliminatedPlayer(newlyEliminated);
    }

    prevPlayersRef.current = players;
  }, [players]);

  const handleCopyCode = useCallback(async () => {
    await copyToClipboard(room.code);
  }, [room.code]);

  const handleVote = useCallback((targetId: number) => {
    if (isDead || !isVoting) return;
    vote(targetId);
  }, [isDead, isVoting, vote]);

  const handleEliminate = useCallback(() => {
    if (isHost && isVoting) {
      eliminate();
    }
  }, [isHost, isVoting, eliminate]);

  const handleStartGame = useCallback(() => {
    if (canStartGame(players, GAME_CONFIG.MIN_PLAYERS)) {
      startGame();
    }
  }, [players, startGame]);

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-mono flex flex-col relative overflow-hidden">
      <EliminationOverlay 
        eliminatedPlayer={eliminatedPlayer}
        onComplete={() => setEliminatedPlayer(null)}
      />
      
      <GameHeader 
        room={room}
        isGameActive={isGameActive}
        onCopyCode={handleCopyCode}
        onLeaveRoom={leaveRoom}
      />

      <main className="flex-1 relative z-10 p-3 sm:p-4 lg:p-6 flex flex-col items-center max-w-7xl mx-auto w-full">
        {isLobby && (
          <LobbyView 
            players={players}
            isHost={isHost}
            onStartGame={handleStartGame}
          />
        )}

        {(isGameActive) && (
          <GameView 
            me={me}
            room={room}
            players={players}
            gameState={gameState}
            revealed={revealed}
            onRevealToggle={() => setRevealed(!revealed)}
            onSubmitClue={submitClue}
            onVote={handleVote}
            onEliminate={handleEliminate}
            onLeaveRoom={leaveRoom}
          />
        )}
      </main>
    </div>
  );
};

/**
 * Elimination sequence overlay
 */
interface EliminationOverlayProps {
  eliminatedPlayer: Player | null;
  onComplete: () => void;
}

const EliminationOverlay: React.FC<EliminationOverlayProps> = ({ 
  eliminatedPlayer, 
  onComplete 
}) => (
  <AnimatePresence>
    {eliminatedPlayer && (
      <EliminationSequence 
        player={eliminatedPlayer} 
        onComplete={onComplete} 
      />
    )}
  </AnimatePresence>
);

/**
 * Game header with room info and controls
 */
interface GameHeaderProps {
  room: any;
  isGameActive: boolean;
  onCopyCode: () => void;
  onLeaveRoom: () => void;
}

const GameHeader: React.FC<GameHeaderProps> = ({ 
  room, 
  isGameActive, 
  onCopyCode, 
  onLeaveRoom 
}) => (
  <header className="relative z-10 flex justify-between items-center p-3 sm:p-4 border-b border-white/5 bg-black/20 backdrop-blur-md">
    <div className="flex items-center gap-2 sm:gap-4">
      <div className="flex flex-col">
        <h1 className="text-lg sm:text-xl font-black tracking-tighter text-white">
          SHADOW SIGNAL
        </h1>
        <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-neutral-500 uppercase tracking-widest">
          <span className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${
            isGameActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
          }`} />
          <span className="hidden xs:inline">{room.status.toUpperCase()} PHASE</span>
          <span className="xs:hidden">{room.status.toUpperCase()}</span>
        </div>
      </div>
      <button 
        onClick={onCopyCode}
        className="flex items-center gap-1 sm:gap-2 bg-white/5 hover:bg-white/10 px-2 sm:px-3 py-1 sm:py-1.5 rounded border border-white/10 transition-colors group"
      >
        <span className="font-bold tracking-widest text-emerald-400 group-hover:text-emerald-300 text-sm sm:text-base">
          {room.code}
        </span>
        <Copy className="w-3 h-3 text-neutral-500" />
      </button>
    </div>
    <button 
      onClick={onLeaveRoom} 
      className="text-neutral-500 hover:text-red-500 transition-colors p-1"
    >
      <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
    </button>
  </header>
);

/**
 * Lobby view for waiting players
 */
interface LobbyViewProps {
  players: Player[];
  isHost: boolean;
  onStartGame: () => void;
}

const LobbyView: React.FC<LobbyViewProps> = ({ players, isHost, onStartGame }) => {
  const canStart = canStartGame(players, GAME_CONFIG.MIN_PLAYERS);

  return (
    <div className="w-full max-w-5xl mt-4 sm:mt-8 space-y-6 sm:space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
          WAITING FOR AGENTS
        </h2>
        <p className="text-neutral-500 uppercase tracking-widest text-xs">
          {players.length} Connected // Min {GAME_CONFIG.MIN_PLAYERS} Required
        </p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
        {players.map(player => (
          <PlayerCard key={player.id} player={player} size={80} />
        ))}
      </div>

      {isHost && (
        <div className="flex justify-center pt-4 sm:pt-8">
          <button 
            onClick={onStartGame}
            disabled={!canStart}
            className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-8 sm:px-12 py-3 sm:py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_50px_rgba(16,185,129,0.4)] transition-all transform hover:-translate-y-1 text-sm sm:text-base"
          >
            INITIATE MISSION
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * Player card component
 */
interface PlayerCardProps {
  player: Player;
  size?: number;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, size = 100 }) => (
  <motion.div 
    initial={{ scale: 0.9, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    className="flex flex-col items-center gap-2 sm:gap-3 relative group"
  >
    <Avatar name={player.name} size={size} />
    <span className="font-bold truncate w-full text-center text-xs sm:text-sm bg-neutral-900/50 px-2 sm:px-3 py-1 rounded-full border border-white/10">
      {player.name}
    </span>
    {isPlayerHost(player) && (
      <span className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 text-[8px] sm:text-[10px] bg-emerald-500 text-black font-bold px-1.5 sm:px-2 py-0.5 rounded-full">
        HOST
      </span>
    )}
  </motion.div>
);

/**
 * Main game view
 */
interface GameViewProps {
  me: Player;
  room: any;
  players: Player[];
  gameState: any;
  revealed: boolean;
  onRevealToggle: () => void;
  onSubmitClue: (clue: string) => void;
  onVote: (targetId: number) => void;
  onEliminate: () => void;
  onLeaveRoom: () => void;
}

const GameView: React.FC<GameViewProps> = ({ 
  me, 
  room, 
  players, 
  gameState, 
  revealed, 
  onRevealToggle, 
  onSubmitClue, 
  onVote, 
  onEliminate, 
  onLeaveRoom 
}) => {
  const { isSelecting, isVoting, isDead, options, isHost } = gameState;

  return (
    <div className="w-full h-full flex flex-col gap-4 sm:gap-6 lg:gap-8">
      <RoleCard 
        me={me}
        revealed={revealed}
        onToggle={onRevealToggle}
      />

      {isSelecting && !isDead && (
        <ClueSelection 
          me={me}
          options={options}
          onSubmitClue={onSubmitClue}
        />
      )}

      <PlayersGrid 
        players={players}
        me={me}
        isVoting={isVoting}
        onVote={onVote}
      />

      {isHost && isVoting && (
        <HostControls onEliminate={onEliminate} />
      )}
    </div>
  );
};

/**
 * Role card component
 */
interface RoleCardProps {
  me: Player;
  revealed: boolean;
  onToggle: () => void;
}

const RoleCard: React.FC<RoleCardProps> = ({ me, revealed, onToggle }) => {
  const isEvil = me.role === PLAYER_ROLES.INFILTRATOR || me.role === PLAYER_ROLES.SPY;

  return (
    <div className="flex justify-center">
      <motion.div 
        className="relative w-full max-w-md cursor-pointer"
        onClick={onToggle}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <AnimatePresence mode='wait'>
          {!revealed ? (
            <motion.div 
              key="hidden"
              initial={{ rotateX: 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-neutral-900 border border-neutral-800 p-3 sm:p-4 rounded-xl flex items-center justify-between gap-3 sm:gap-4 shadow-2xl"
            >
              <div className="flex items-center gap-3 sm:gap-4">
                <Fingerprint className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-500" />
                <div>
                  <h3 className="font-bold text-neutral-300 text-sm sm:text-base">
                    IDENTITY CLASSIFIED
                  </h3>
                  <p className="text-[9px] sm:text-[10px] text-neutral-500">
                    TAP TO DECRYPT
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="revealed"
              initial={{ rotateX: 90, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              exit={{ rotateX: -90, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-3 sm:p-4 rounded-xl flex items-center justify-between gap-3 sm:gap-4 shadow-2xl border ${
                isEvil 
                  ? 'bg-red-950/30 border-red-500/50' 
                  : 'bg-emerald-950/30 border-emerald-500/50'
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                {me.role === PLAYER_ROLES.INFILTRATOR ? (
                  <ShieldAlert className="w-6 h-6 sm:w-8 sm:h-8 text-red-500" />
                ) : (
                  <Fingerprint className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" />
                )}
                <div>
                  <h3 className={`font-black uppercase text-sm sm:text-base ${
                    isEvil ? 'text-red-500' : 'text-emerald-500'
                  }`}>
                    {me.role}
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-white tracking-wider">
                    {me.word || "UNKNOWN"}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

/**
 * Clue selection interface
 */
interface ClueSelectionProps {
  me: Player;
  options: string[];
  onSubmitClue: (clue: string) => void;
}

const ClueSelection: React.FC<ClueSelectionProps> = ({ me, options, onSubmitClue }) => (
  <div className="flex flex-col items-center justify-center py-4 sm:py-8 space-y-3 sm:space-y-4 w-full max-w-2xl mx-auto">
    <div className="flex items-center gap-2 text-emerald-400 animate-pulse">
      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
      <span className="font-bold tracking-widest text-sm sm:text-base">
        SELECT CLUE DATA
      </span>
    </div>
    
    {!me.clue ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
        {options.map((option: string) => (
          <button
            key={option}
            onClick={() => onSubmitClue(option)}
            className="bg-neutral-900 border border-neutral-700 hover:border-emerald-500 hover:bg-emerald-900/20 p-4 sm:p-6 rounded-xl text-lg sm:text-xl font-bold transition-all uppercase tracking-wider shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-1"
          >
            {option}
          </button>
        ))}
      </div>
    ) : (
      <div className="bg-neutral-900/50 border border-emerald-500/30 px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-center">
        <p className="text-xs text-neutral-500 uppercase mb-1">DATA UPLOADED</p>
        <p className="text-xl sm:text-2xl font-black text-emerald-400 tracking-widest">
          {me.clue}
        </p>
        <p className="text-[10px] text-neutral-600 mt-2">WAITING FOR SQUAD...</p>
      </div>
    )}
  </div>
);

/**
 * Players grid for voting
 */
interface PlayersGridProps {
  players: Player[];
  me: Player;
  isVoting: boolean;
  onVote: (targetId: number) => void;
}

const PlayersGrid: React.FC<PlayersGridProps> = ({ players, me, isVoting, onVote }) => (
  <div className="flex-1 flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 w-full">
      {players.map(player => (
        <PlayerVoteCard 
          key={player.id}
          player={player}
          me={me}
          isVoting={isVoting}
          onVote={onVote}
        />
      ))}
    </div>
  </div>
);

/**
 * Individual player vote card
 */
interface PlayerVoteCardProps {
  player: Player;
  me: Player;
  isVoting: boolean;
  onVote: (targetId: number) => void;
}

const PlayerVoteCard: React.FC<PlayerVoteCardProps> = ({ player, me, isVoting, onVote }) => {
  const isMe = player.id === me.id;
  const isDeadPlayer = !isPlayerAlive(player);
  const canVote = !isDeadPlayer && !isMe && isVoting;

  return (
    <motion.div 
      onClick={() => canVote && onVote(player.id)}
      whileHover={canVote ? { scale: 1.05 } : {}}
      className={`relative p-2 sm:p-4 rounded-xl transition-all duration-300 flex flex-col items-center gap-2 ${
        isDeadPlayer ? 'opacity-50 grayscale' : canVote ? 'cursor-pointer' : ''
      }`}
    >
      {/* Clue Bubble */}
      {isVoting && player.clue && (
        <motion.div 
          initial={{ scale: 0, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="absolute -top-6 sm:-top-8 bg-white text-black font-bold px-2 sm:px-3 py-1 rounded-lg shadow-lg z-20 text-xs sm:text-sm uppercase tracking-wider border-2 border-emerald-500"
        >
          {player.clue}
          <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-b-2 border-r-2 border-emerald-500" />
        </motion.div>
      )}

      {/* Avatar with vote count */}
      <div className="relative">
        <Avatar 
          name={player.name} 
          size={60}
          isDead={isDeadPlayer} 
        />
        
        {player.votes > 0 && (
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 bg-red-600 text-white text-xs font-bold w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center border-2 border-black z-10"
          >
            {player.votes}
          </motion.div>
        )}

        {/* Vote overlay */}
        {canVote && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-20">
            <div className="bg-red-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shadow-lg transform translate-y-6 sm:translate-y-8">
              VOTE
            </div>
          </div>
        )}
      </div>

      {/* Name */}
      <div className="text-center">
        <span className={`font-bold text-xs sm:text-sm px-2 py-0.5 rounded ${
          isMe ? 'bg-emerald-900/50 text-emerald-400' : 'bg-neutral-900/50 text-white'
        }`}>
          {player.name}
        </span>
        {isDeadPlayer && (
          <p className="text-[9px] sm:text-[10px] text-red-500 font-bold uppercase mt-1">
            ELIMINATED
          </p>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Host elimination controls
 */
interface HostControlsProps {
  onEliminate: () => void;
}

const HostControls: React.FC<HostControlsProps> = ({ onEliminate }) => (
  <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
    <button 
      onClick={onEliminate}
      className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg flex items-center gap-2 border-2 sm:border-4 border-red-800 animate-pulse text-sm sm:text-base"
    >
      <Skull className="w-4 h-4 sm:w-5 sm:h-5" />
      <span className="hidden sm:inline">EJECT SUSPECT</span>
      <span className="sm:hidden">EJECT</span>
    </button>
  </div>
);


