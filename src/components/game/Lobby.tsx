import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { motion } from 'framer-motion';
import { User, ShieldAlert, Eye, Terminal, ArrowRight, Activity } from 'lucide-react';
import { Avatar } from './Avatar';

export const Lobby = () => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const { createRoom, joinRoom } = useGameStore();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'create' | 'join'>('create');

  const handleCreate = async (gameMode: string) => {
    if (!name) return;
    setLoading(true);
    try {
      await createRoom(gameMode, name);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleJoin = async () => {
    if (!name || !code) return;
    setLoading(true);
    try {
      await joinRoom(code.toUpperCase(), name);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white flex flex-col items-center justify-center p-4 font-mono relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1a1a1a_1px,transparent_1px),linear-gradient(to_bottom,#1a1a1a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 relative z-10"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 text-emerald-500 border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 rounded-full text-xs tracking-widest uppercase">
            <Activity className="w-3 h-3 animate-pulse" />
            Secure Connection Established
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-500">
            SHADOW<br/>SIGNAL
          </h1>
          <p className="text-neutral-400 text-sm tracking-widest uppercase">
            Social Deduction Protocol v2.0
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-black/40 backdrop-blur-xl border border-neutral-800 p-1 rounded-2xl shadow-2xl">
          <div className="bg-neutral-900/50 rounded-xl p-6 space-y-6 border border-white/5">
            
            {/* Identity Input with Avatar Preview */}
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                <Avatar name={name || '?'} size={60} />
              </div>
              <div className="space-y-2 flex-1">
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">Agent Identity</label>
                <div className="relative group">
                  <User className="absolute left-4 top-3.5 w-5 h-5 text-neutral-500 group-focus-within:text-emerald-500 transition-colors" />
                  <input 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ENTER CODENAME"
                    className="w-full bg-black/50 border border-neutral-800 rounded-lg p-3 pl-12 text-white placeholder:text-neutral-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-bold tracking-wider"
                  />
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="grid grid-cols-2 gap-1 bg-black/50 p-1 rounded-lg">
              <button 
                onClick={() => setMode('create')}
                className={`py-2 text-xs font-bold tracking-widest rounded transition-all ${mode === 'create' ? 'bg-neutral-800 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                NEW MISSION
              </button>
              <button 
                onClick={() => setMode('join')}
                className={`py-2 text-xs font-bold tracking-widest rounded transition-all ${mode === 'join' ? 'bg-neutral-800 text-white shadow-lg' : 'text-neutral-500 hover:text-neutral-300'}`}
              >
                JOIN SQUAD
              </button>
            </div>

            {/* Content */}
            <div className="min-h-[200px]">
              {mode === 'create' ? (
                <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <button 
                    onClick={() => handleCreate('infiltrator')}
                    disabled={loading || !name}
                    className="group relative bg-neutral-950 border border-neutral-800 p-4 rounded-xl hover:border-emerald-500/50 hover:bg-emerald-950/10 transition-all text-left overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-emerald-400 mb-1 flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4" /> INFILTRATOR
                        </div>
                        <div className="text-xs text-neutral-400">1 Imposter vs Citizens. No word knowledge.</div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-neutral-700 group-hover:text-emerald-500 transition-colors" />
                    </div>
                  </button>

                  <button 
                    onClick={() => handleCreate('spy')}
                    disabled={loading || !name}
                    className="group relative bg-neutral-950 border border-neutral-800 p-4 rounded-xl hover:border-amber-500/50 hover:bg-amber-950/10 transition-all text-left overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-500/0 via-amber-500/5 to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-amber-400 mb-1 flex items-center gap-2">
                          <Eye className="w-4 h-4" /> SPY MODE
                        </div>
                        <div className="text-xs text-neutral-400">1 Spy vs Agents. Similar words.</div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-neutral-700 group-hover:text-amber-500 transition-colors" />
                    </div>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-neutral-500 ml-1">Mission Code</label>
                    <div className="relative group">
                      <Terminal className="absolute left-4 top-3.5 w-5 h-5 text-neutral-500 group-focus-within:text-emerald-500 transition-colors" />
                      <input 
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="XXXX"
                        maxLength={4}
                        className="w-full bg-black/50 border border-neutral-800 rounded-lg p-3 pl-12 text-white placeholder:text-neutral-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-bold tracking-widest uppercase"
                      />
                    </div>
                  </div>
                  <button 
                    onClick={handleJoin}
                    disabled={loading || !name || !code}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-bold py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? <Activity className="w-5 h-5 animate-spin" /> : 'INITIATE UPLINK'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
