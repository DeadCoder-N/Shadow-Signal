import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Avatar } from './Avatar';
import { Player } from '../../store/gameStore';

interface EliminationSequenceProps {
  player: Player;
  onComplete: () => void;
}

export const EliminationSequence: React.FC<EliminationSequenceProps> = ({ player, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 5000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden font-mono">
      {/* Stars Background */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      
      {/* Stars Animation (CSS) */}
      <div className="absolute inset-0 opacity-50">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 3 + 'px',
              height: Math.random() * 3 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animation: `twinkle ${Math.random() * 3 + 1}s infinite`
            }}
          />
        ))}
      </div>

      {/* Flying Avatar */}
      <motion.div
        initial={{ x: '-50vw', y: '20vh', rotate: -45 }}
        animate={{ x: '150vw', y: '-20vh', rotate: 45 }}
        transition={{ duration: 5, ease: "linear" }}
        className="absolute"
      >
        <Avatar name={player.name} size={200} isDead={false} />
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="text-center z-10 space-y-4 bg-black/50 p-8 rounded-xl backdrop-blur-sm border border-white/10"
      >
        <h2 className={`text-4xl md:text-6xl font-black uppercase tracking-tighter ${player.role === 'infiltrator' ? 'text-red-500' : 'text-white'}`}>
          {player.name} was Ejected
        </h2>
        <p className="text-xl text-neutral-400 font-bold tracking-widest">
          {player.role === 'infiltrator' 
            ? 'THEY WERE THE INFILTRATOR' 
            : 'THEY WERE NOT THE INFILTRATOR'}
        </p>
      </motion.div>
    </div>
  );
};
