/**
 * Waiting Room component for post-game lobby
 * @author Senior Full-Stack Developer
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Copy, 
  RefreshCw, 
  LogOut, 
  Users, 
  Activity,
  Crown
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { Avatar } from './Avatar';
import type { Player } from '../../types';

interface WaitingRoomProps {
  room: any;
  players: Player[];
  me: Player;
  onStartNewGame: () => void;
  onLeaveRoom: () => void;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({
  room,
  players,
  me,
  onStartNewGame,
  onLeaveRoom
}) => {
  const { getPlayerColor } = useGameStore();
  const copyRoomCode = () => {
    navigator.clipboard.writeText(room.code);
  };

  const isHost = me.id === room.hostId;

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 font-mono">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full space-y-6"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-emerald-500 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 rounded-full text-xs tracking-widest uppercase">
            <Activity className="w-3 h-3 animate-pulse" />
            <span>Waiting Room Active</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter">
            MISSION COMPLETE
          </h1>
          <p className="text-neutral-400 text-sm tracking-widest uppercase">
            Ready for next operation
          </p>
        </div>

        {/* Room Code Display */}
        <div className="bg-black/40 backdrop-blur-xl border border-neutral-800 p-6 rounded-2xl text-center space-y-4">
          <div className="space-y-2">
            <p className="text-xs text-neutral-500 uppercase tracking-widest">
              Room Code
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="bg-neutral-900 border border-neutral-700 px-6 py-3 rounded-xl">
                <span className="text-2xl font-black tracking-widest text-emerald-400">
                  {room.code}
                </span>
              </div>
              <button
                onClick={copyRoomCode}
                className="bg-neutral-800 hover:bg-neutral-700 p-3 rounded-xl transition-colors"
                title="Copy room code"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-neutral-600">
              Share this code with friends to join
            </p>
          </div>
        </div>

        {/* Players List */}
        <div className="bg-black/40 backdrop-blur-xl border border-neutral-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 text-neutral-300">
            <Users className="w-5 h-5" />
            <span className="font-bold">Squad Members ({players.length})</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {players.map(player => (
              <div 
                key={player.id}
                className="flex items-center gap-3 bg-neutral-900/50 p-3 rounded-xl"
              >
                <Avatar 
                  name={player.name} 
                  size={40} 
                  color={player.color || getPlayerColor(player.name)}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-sm truncate">
                      {player.name}
                    </span>
                    {player.id === room.hostId && (
                      <Crown className="w-3 h-3 text-yellow-500" />
                    )}
                  </div>
                  {player.id === me.id && (
                    <span className="text-xs text-emerald-400">You</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {isHost && (
            <button
              onClick={onStartNewGame}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-5 h-5" />
              START NEW MISSION
            </button>
          )}
          
          <button
            onClick={onLeaveRoom}
            className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            LEAVE SQUAD
          </button>
        </div>

        {!isHost && (
          <div className="text-center">
            <p className="text-xs text-neutral-500">
              Waiting for squad leader to start next mission...
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};