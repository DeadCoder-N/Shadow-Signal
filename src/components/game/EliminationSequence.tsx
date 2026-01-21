/**
 * Elimination sequence animation component
 * @author Senior Full-Stack Developer
 */

import React, { useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Avatar } from './Avatar';
import { GAME_CONFIG, PLAYER_ROLES } from '../../constants';
import type { EliminationSequenceProps } from '../../types';

export const EliminationSequence: React.FC<EliminationSequenceProps> = ({ 
  player, 
  onComplete 
}) => {
  const handleComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const timer = setTimeout(handleComplete, GAME_CONFIG.ELIMINATION_DURATION);
    return () => clearTimeout(timer);
  }, [handleComplete]);

  const isInfiltrator = player.role === PLAYER_ROLES.INFILTRATOR || player.role === PLAYER_ROLES.SPY;
  const resultText = isInfiltrator 
    ? 'THEY WERE THE INFILTRATOR' 
    : 'THEY WERE NOT THE INFILTRATOR';
  const titleColor = isInfiltrator ? 'text-red-500' : 'text-white';

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden font-mono px-4">
      <EliminationBackground />
      <FlyingAvatar playerName={player.name} />
      <EliminationText 
        playerName={player.name}
        resultText={resultText}
        titleColor={titleColor}
      />
    </div>
  );
};

/**
 * Background with subtle effects
 */
const EliminationBackground: React.FC = () => (
  <div className="absolute inset-0">
    <div className="absolute inset-0 bg-gradient-to-b from-neutral-900/20 via-black to-black" />
  </div>
);

/**
 * Flying avatar animation
 */
interface FlyingAvatarProps {
  playerName: string;
}

const FlyingAvatar: React.FC<FlyingAvatarProps> = ({ playerName }) => (
  <motion.div
    initial={{ x: '-50vw', y: '20vh', rotate: -45 }}
    animate={{ x: '150vw', y: '-20vh', rotate: 45 }}
    transition={{ duration: 5, ease: "linear" }}
    className="absolute"
  >
    <Avatar name={playerName} size={150} isDead={false} />
  </motion.div>
);

/**
 * Elimination result text
 */
interface EliminationTextProps {
  playerName: string;
  resultText: string;
  titleColor: string;
}

const EliminationText: React.FC<EliminationTextProps> = ({ 
  playerName, 
  resultText, 
  titleColor 
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay: 1.5, duration: 0.5 }}
    className="text-center z-10 space-y-3 sm:space-y-4 bg-black/50 p-6 sm:p-8 rounded-xl backdrop-blur-sm border border-white/10 max-w-lg mx-auto"
  >
    <h2 className={`text-3xl sm:text-4xl md:text-6xl font-black uppercase tracking-tighter ${titleColor}`}>
      <span className="block sm:inline">{playerName}</span>
      <span className="block sm:inline sm:ml-2">was Ejected</span>
    </h2>
    <p className="text-lg sm:text-xl text-neutral-400 font-bold tracking-widest">
      {resultText}
    </p>
  </motion.div>
);
