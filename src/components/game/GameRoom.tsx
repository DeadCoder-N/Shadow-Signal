import React, { useState, useEffect, useRef } from 'react';
import { useGameStore, Player } from '../../store/gameStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, LogOut, Eye, EyeOff, Skull, Crown, Fingerprint, Target, ShieldAlert, Clock } from 'lucide-react';
import { Avatar } from './Avatar';
import { EliminationSequence } from './EliminationSequence';

export const GameRoom = () => {
  const { room, players, me, startGame, submitClue, vote, eliminate, leaveRoom } = useGameStore();
  const [revealed, setRevealed] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [eliminatedPlayer, setEliminatedPlayer] = useState<Player | null>(null);
  const prevPlayersRef = useRef<Player[]>(players);
  
  if (!room || !me) return null;

  const isHost = me.isHost === 1;
  const isLobby = room.status === 'lobby';
  const isSelecting = room.status === 'selecting';
  const isVoting = room.status === 'voting';
  const isEnded = room.status === 'ended';
  const isGameActive = isSelecting || isVoting;
  const isDead = me.isAlive === 0;

  // Parse options if available
  const options = room.options ? JSON.parse(room.options) : [];

  // Detect Elimination
  useEffect(() => {
    const newlyDead = players.find(p => {
      const prev = prevPlayersRef.current.find(pp => pp.id === p.id);
      return p.isAlive === 0 && prev?.isAlive === 1;
    });

    if (newlyDead) {
      setEliminatedPlayer(newlyDead);
    }

    prevPlayersRef.current = players;
  }, [players]);

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
  };

  const handleVote = (targetId: number) => {
    if (isDead || !isVoting) return;
    vote(targetId);
  };

  const handleEliminate = () => {
    if (isHost && isVoting) {
      eliminate();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white font-mono flex flex-col relative overflow-hidden">
      {/* Elimination Cutscene */}
      <AnimatePresence>
        {eliminatedPlayer && (
          <EliminationSequence 
            player={eliminatedPlayer} 
            onComplete={() => setEliminatedPlayer(null)} 
          />
        )}
      </AnimatePresence>

      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900/50 via-neutral-950 to-neutral-950 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      
      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-4 border-b border-white/5 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter text-white">SHADOW SIGNAL</h1>
            <div className="flex items-center gap-2 text-[10px] text-neutral-500 uppercase tracking-widest">
              <span className={`w-2 h-2 rounded-full ${isGameActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              {room.status.toUpperCase()} PHASE
            </div>
          </div>
          <button 
            onClick={copyCode}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded border border-white/10 transition-colors group"
          >
            <span className="font-bold tracking-widest text-emerald-400 group-hover:text-emerald-300">{room.code}</span>
            <Copy className="w-3 h-3 text-neutral-500" />
          </button>
        </div>
        <button onClick={leaveRoom} className="text-neutral-500 hover:text-red-500 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 p-4 flex flex-col items-center max-w-6xl mx-auto w-full">
        
        {/* LOBBY VIEW */}
        {isLobby && (
          <div className="w-full max-w-4xl mt-8 space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold tracking-tight">WAITING FOR AGENTS</h2>
              <p className="text-neutral-500 uppercase tracking-widest text-xs">
                {players.length} Connected // Min 3 Required
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {players.map(p => (
                <motion.div 
                  key={p.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-3 relative group"
                >
                  <Avatar name={p.name} size={100} />
                  <span className="font-bold truncate w-full text-center text-sm bg-neutral-900/50 px-3 py-1 rounded-full border border-white/10">
                    {p.name}
                  </span>
                  {p.isHost === 1 && (
                    <span className="absolute -top-2 -right-2 text-[10px] bg-emerald-500 text-black font-bold px-2 py-0.5 rounded-full">
                      HOST
                    </span>
                  )}
                </motion.div>
              ))}
            </div>

            {isHost && (
              <div className="flex justify-center pt-8">
                <button 
                  onClick={() => startGame()}
                  disabled={players.length < 3}
                  className="bg-emerald-600 hover:bg-emerald-500 text-black font-bold px-12 py-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:shadow-[0_0_50px_rgba(16,185,129,0.4)] transition-all transform hover:-translate-y-1"
                >
                  INITIATE MISSION
                </button>
              </div>
            )}
          </div>
        )}

        {/* GAME VIEW */}
        {(isGameActive || isEnded) && (
          <div className="w-full h-full flex flex-col gap-8">
            
            {/* Role Card (Top) */}
            <div className="flex justify-center">
              <motion.div 
                className="relative w-full max-w-md cursor-pointer perspective-1000"
                onClick={() => setRevealed(!revealed)}
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
                      className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl flex items-center justify-between gap-4 shadow-2xl relative overflow-hidden"
                    >
                      <div className="flex items-center gap-4">
                        <Fingerprint className="w-8 h-8 text-neutral-500" />
                        <div>
                          <h3 className="font-bold text-neutral-300">IDENTITY CLASSIFIED</h3>
                          <p className="text-[10px] text-neutral-500">TAP TO DECRYPT</p>
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
                      className={`
                        p-4 rounded-xl flex items-center justify-between gap-4 shadow-2xl relative overflow-hidden border
                        ${me.role === 'infiltrator' || me.role === 'spy' 
                          ? 'bg-red-950/30 border-red-500/50' 
                          : 'bg-emerald-950/30 border-emerald-500/50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-4">
                        {me.role === 'infiltrator' ? <ShieldAlert className="w-8 h-8 text-red-500" /> : <Fingerprint className="w-8 h-8 text-emerald-500" />}
                        <div>
                          <h3 className={`font-black uppercase ${me.role === 'infiltrator' || me.role === 'spy' ? 'text-red-500' : 'text-emerald-500'}`}>
                            {me.role}
                          </h3>
                          <p className="text-sm font-bold text-white tracking-wider">
                            {me.word || "UNKNOWN"}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* SELECTING PHASE UI (MCQ) */}
            {isSelecting && !isDead && (
              <div className="flex flex-col items-center justify-center py-8 space-y-4 w-full max-w-2xl mx-auto">
                <div className="flex items-center gap-2 text-emerald-400 animate-pulse">
                  <Clock className="w-5 h-5" />
                  <span className="font-bold tracking-widest">SELECT CLUE DATA</span>
                </div>
                
                {!me.clue ? (
                  <div className="grid grid-cols-2 gap-4 w-full">
                    {options.map((opt: string) => (
                      <button
                        key={opt}
                        onClick={() => submitClue(opt)}
                        className="bg-neutral-900 border border-neutral-700 hover:border-emerald-500 hover:bg-emerald-900/20 p-6 rounded-xl text-xl font-bold transition-all uppercase tracking-wider shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-1"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="bg-neutral-900/50 border border-emerald-500/30 px-8 py-4 rounded-xl text-center">
                    <p className="text-xs text-neutral-500 uppercase mb-1">DATA UPLOADED</p>
                    <p className="text-2xl font-black text-emerald-400 tracking-widest">{me.clue}</p>
                    <p className="text-[10px] text-neutral-600 mt-2">WAITING FOR SQUAD...</p>
                  </div>
                )}
              </div>
            )}

            {/* Players Grid / Table */}
            <div className="flex-1 flex items-center justify-center min-h-[400px]">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
                {players.map(p => {
                  const isMe = p.id === me.id;
                  const isTarget = selectedPlayer === p.id;
                  const isDeadPlayer = p.isAlive === 0;
                  
                  return (
                    <motion.div 
                      key={p.id}
                      onClick={() => !isDeadPlayer && !isMe && isVoting && handleVote(p.id)}
                      whileHover={!isDeadPlayer && !isMe && isVoting ? { scale: 1.05 } : {}}
                      className={`
                        relative p-4 rounded-xl transition-all duration-300 flex flex-col items-center gap-2
                        ${isDeadPlayer ? 'opacity-50 grayscale' : isVoting && !isMe ? 'cursor-pointer' : ''}
                        ${isTarget ? 'bg-red-950/20 ring-2 ring-red-500 rounded-xl' : ''}
                      `}
                    >
                      {/* Clue Bubble (Only in Voting Phase) */}
                      {isVoting && p.clue && (
                        <motion.div 
                          initial={{ scale: 0, y: 20 }}
                          animate={{ scale: 1, y: 0 }}
                          className="absolute -top-8 bg-white text-black font-bold px-3 py-1 rounded-lg shadow-lg z-20 text-sm uppercase tracking-wider border-2 border-emerald-500"
                        >
                          {p.clue}
                          <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-b-2 border-r-2 border-emerald-500" />
                        </motion.div>
                      )}

                      {/* Avatar */}
                      <div className="relative">
                        <Avatar 
                          name={p.name} 
                          size={80} 
                          isDead={isDeadPlayer} 
                        />
                        
                        {/* Vote Count Badge */}
                        {p.votes > 0 && (
                          <motion.div 
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-black z-10"
                          >
                            {p.votes}
                          </motion.div>
                        )}

                        {/* Vote Action Overlay */}
                        {!isDeadPlayer && !isMe && isVoting && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity z-20">
                            <div className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg transform translate-y-8">
                              VOTE
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Name */}
                      <div className="text-center">
                        <span className={`font-bold text-sm px-2 py-0.5 rounded ${isMe ? 'bg-emerald-900/50 text-emerald-400' : 'bg-neutral-900/50 text-white'}`}>
                          {p.name}
                        </span>
                        {isDeadPlayer && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">DEAD</p>}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Host Controls */}
            {isHost && isVoting && (
              <div className="fixed bottom-24 right-4 z-50">
                <button 
                  onClick={handleEliminate}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold px-6 py-3 rounded-full shadow-lg flex items-center gap-2 border-4 border-red-800 animate-pulse"
                >
                  <Skull className="w-5 h-5" /> EJECT SUSPECT
                </button>
              </div>
            )}

            {/* Game Over Overlay */}
            {isEnded && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-neutral-900 border border-neutral-800 p-8 rounded-2xl max-w-lg w-full text-center space-y-6"
                >
                  <Crown className="w-16 h-16 text-yellow-500 mx-auto" />
                  <div>
                    <h2 className="text-4xl font-black text-white mb-2">GAME OVER</h2>
                    <p className="text-xl text-emerald-400 font-bold">
                      {room.winner === 'citizens' ? 'CITIZENS WON' : 'INFILTRATOR WON'}
                    </p>
                  </div>
                  
                  <div className="bg-black/50 p-4 rounded-xl text-left space-y-2">
                    <p className="text-xs text-neutral-500 uppercase">The Infiltrator was:</p>
                    <div className="flex items-center gap-3">
                      {players.find(p => p.role === 'infiltrator' || p.role === 'spy') && (
                        <>
                          <Avatar name={players.find(p => p.role === 'infiltrator' || p.role === 'spy')?.name || ''} size={40} />
                          <span className="font-bold text-red-400">
                            {players.find(p => p.role === 'infiltrator' || p.role === 'spy')?.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={leaveRoom}
                    className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-neutral-200 transition-colors"
                  >
                    RETURN TO LOBBY
                  </button>
                </motion.div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
