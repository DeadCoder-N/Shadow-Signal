/**
 * Lobby component for game room creation and joining
 * @author Senior Full-Stack Developer
 */

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  ShieldAlert, 
  Eye, 
  Terminal, 
  ArrowRight, 
  Activity 
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { Avatar } from './Avatar';
import { GAME_MODES } from '../../constants';
import type { GameMode } from '../../types';

const ROOM_CODE_MAX_LENGTH = 4;

export const Lobby: React.FC = () => {
  const [name, setName] = useState<string>('');
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [mode, setMode] = useState<GameMode>('create');
  const { createRoom, joinRoom } = useGameStore();

  const handleCreateRoom = useCallback(async (gameMode: string) => {
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      await createRoom(gameMode, name.trim());
    } catch (error) {
      console.error('Failed to create room:', error);
    } finally {
      setLoading(false);
    }
  }, [name, createRoom]);

  const handleJoinRoom = useCallback(async () => {
    if (!name.trim() || !code.trim()) return;
    
    setLoading(true);
    try {
      await joinRoom(code.toUpperCase().trim(), name.trim());
    } catch (error) {
      console.error('Failed to join room:', error);
    } finally {
      setLoading(false);
    }
  }, [name, code, joinRoom]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  }, []);

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase();
    if (value.length <= ROOM_CODE_MAX_LENGTH) {
      setCode(value);
    }
  }, []);

  const isCreateDisabled = loading || !name.trim();
  const isJoinDisabled = loading || !name.trim() || !code.trim();

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-mono relative overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-6 sm:space-y-8 relative z-10"
      >
        <LobbyHeader />
        <LobbyCard 
          name={name}
          code={code}
          mode={mode}
          loading={loading}
          isCreateDisabled={isCreateDisabled}
          isJoinDisabled={isJoinDisabled}
          onNameChange={handleNameChange}
          onCodeChange={handleCodeChange}
          onModeChange={setMode}
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
        />
      </motion.div>
    </div>
  );
};

/**
 * Lobby header with title and status
 */
const LobbyHeader: React.FC = () => (
  <div className="text-center space-y-3 sm:space-y-4">
    <div className="inline-flex items-center gap-2 text-emerald-500 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 rounded-full text-xs tracking-widest uppercase">
      <Activity className="w-3 h-3 animate-pulse" />
      <span className="hidden sm:inline">Secure Connection Established</span>
      <span className="sm:hidden">Connected</span>
    </div>
    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500">
      SHADOW<br className="sm:hidden" />
      <span className="hidden sm:inline"><br /></span>
      SIGNAL
    </h1>
    <p className="text-neutral-400 text-xs sm:text-sm tracking-widest uppercase">
      Social Deduction Protocol v2.0
    </p>
  </div>
);

/**
 * Main lobby card interface
 */
interface LobbyCardProps {
  name: string;
  code: string;
  mode: GameMode;
  loading: boolean;
  isCreateDisabled: boolean;
  isJoinDisabled: boolean;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onModeChange: (mode: GameMode) => void;
  onCreateRoom: (gameMode: string) => void;
  onJoinRoom: () => void;
}

const LobbyCard: React.FC<LobbyCardProps> = ({
  name,
  code,
  mode,
  loading,
  isCreateDisabled,
  isJoinDisabled,
  onNameChange,
  onCodeChange,
  onModeChange,
  onCreateRoom,
  onJoinRoom
}) => (
  <div className="bg-black/40 backdrop-blur-xl border border-neutral-800 p-1 rounded-2xl shadow-2xl">
    <div className="bg-neutral-900/50 rounded-xl p-4 sm:p-6 space-y-4 sm:space-y-6 border border-white/5">
      <IdentityInput name={name} onChange={onNameChange} />
      <ModeSelector mode={mode} onModeChange={onModeChange} />
      <div className="min-h-[180px] sm:min-h-[200px]">
        {mode === 'create' ? (
          <CreateModeContent 
            loading={loading}
            disabled={isCreateDisabled}
            onCreateRoom={onCreateRoom}
          />
        ) : (
          <JoinModeContent 
            code={code}
            loading={loading}
            disabled={isJoinDisabled}
            onCodeChange={onCodeChange}
            onJoinRoom={onJoinRoom}
          />
        )}
      </div>
    </div>
  </div>
);

/**
 * Identity input with avatar preview
 */
interface IdentityInputProps {
  name: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const IdentityInput: React.FC<IdentityInputProps> = ({ name, onChange }) => (
  <div className="flex items-center gap-3 sm:gap-4">
    <div className="shrink-0">
      <Avatar name={name || '?'} size={50} />
    </div>
    <div className="space-y-2 flex-1 min-w-0">
      <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">
        Agent Identity
      </label>
      <div className="relative group">
        <User className="absolute left-3 sm:left-4 top-3 sm:top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-neutral-500 group-focus-within:text-emerald-500 transition-colors" />
        <input 
          value={name}
          onChange={onChange}
          placeholder="ENTER CODENAME"
          maxLength={20}
          className="w-full bg-black/50 border border-neutral-800 rounded-lg p-2.5 sm:p-3 pl-10 sm:pl-12 text-sm sm:text-base text-white placeholder:text-neutral-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-bold tracking-wider"
        />
      </div>
    </div>
  </div>
);

/**
 * Mode selector tabs
 */
interface ModeSelectorProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
}

const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, onModeChange }) => (
  <div className="grid grid-cols-2 gap-1 bg-black/50 p-1 rounded-lg">
    <button 
      onClick={() => onModeChange('create')}
      className={`py-2 text-xs font-bold tracking-widest rounded transition-all ${
        mode === 'create' 
          ? 'bg-neutral-800 text-white shadow-lg' 
          : 'text-neutral-500 hover:text-neutral-300'
      }`}
    >
      NEW MISSION
    </button>
    <button 
      onClick={() => onModeChange('join')}
      className={`py-2 text-xs font-bold tracking-widest rounded transition-all ${
        mode === 'join' 
          ? 'bg-neutral-800 text-white shadow-lg' 
          : 'text-neutral-500 hover:text-neutral-300'
      }`}
    >
      JOIN SQUAD
    </button>
  </div>
);

/**
 * Create mode content with game mode selection
 */
interface CreateModeContentProps {
  loading: boolean;
  disabled: boolean;
  onCreateRoom: (gameMode: string) => void;
}

const CreateModeContent: React.FC<CreateModeContentProps> = ({ 
  loading, 
  disabled, 
  onCreateRoom 
}) => (
  <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
    <GameModeButton
      mode={GAME_MODES.INFILTRATOR}
      title="INFILTRATOR"
      description="1 Imposter vs Citizens. No word knowledge."
      icon={<ShieldAlert className="w-4 h-4" />}
      color="emerald"
      disabled={disabled}
      onClick={() => onCreateRoom(GAME_MODES.INFILTRATOR)}
    />
    <GameModeButton
      mode={GAME_MODES.SPY}
      title="SPY MODE"
      description="1 Spy vs Agents. Similar words."
      icon={<Eye className="w-4 h-4" />}
      color="amber"
      disabled={disabled}
      onClick={() => onCreateRoom(GAME_MODES.SPY)}
    />
  </div>
);

/**
 * Join mode content with room code input
 */
interface JoinModeContentProps {
  code: string;
  loading: boolean;
  disabled: boolean;
  onCodeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onJoinRoom: () => void;
}

const JoinModeContent: React.FC<JoinModeContentProps> = ({ 
  code, 
  loading, 
  disabled, 
  onCodeChange, 
  onJoinRoom 
}) => (
  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">
        Mission Code
      </label>
      <div className="relative group">
        <Terminal className="absolute left-3 sm:left-4 top-3 sm:top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-neutral-500 group-focus-within:text-emerald-500 transition-colors" />
        <input 
          value={code}
          onChange={onCodeChange}
          placeholder="XXXX"
          maxLength={ROOM_CODE_MAX_LENGTH}
          className="w-full bg-black/50 border border-neutral-800 rounded-lg p-2.5 sm:p-3 pl-10 sm:pl-12 text-sm sm:text-base text-white placeholder:text-neutral-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-bold tracking-widest uppercase"
        />
      </div>
    </div>
    <button 
      onClick={onJoinRoom}
      disabled={disabled}
      className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-3 sm:py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
    >
      {loading ? (
        <Activity className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
      ) : (
        'INITIATE UPLINK'
      )}
    </button>
  </div>
);

/**
 * Game mode selection button
 */
interface GameModeButtonProps {
  mode: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: 'emerald' | 'amber';
  disabled: boolean;
  onClick: () => void;
}

const GameModeButton: React.FC<GameModeButtonProps> = ({ 
  title, 
  description, 
  icon, 
  color, 
  disabled, 
  onClick 
}) => {
  const colorClasses = {
    emerald: {
      border: 'hover:border-emerald-500/50',
      bg: 'hover:bg-emerald-950/10',
      text: 'text-emerald-400',
      arrow: 'group-hover:text-emerald-500'
    },
    amber: {
      border: 'hover:border-amber-500/50',
      bg: 'hover:bg-amber-950/10',
      text: 'text-amber-400',
      arrow: 'group-hover:text-amber-500'
    }
  };

  const classes = colorClasses[color];

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`group relative bg-neutral-950 border border-neutral-800 p-3 sm:p-4 rounded-xl ${classes.border} ${classes.bg} transition-all text-left overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className={`font-bold ${classes.text} mb-1 flex items-center gap-2 text-sm sm:text-base`}>
            {icon}
            <span className="truncate">{title}</span>
          </div>
          <div className="text-xs text-neutral-400 leading-relaxed">
            {description}
          </div>
        </div>
        <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 text-neutral-700 ${classes.arrow} transition-colors flex-shrink-0`} />
      </div>
    </button>
  );
};
