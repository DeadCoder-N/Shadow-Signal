/**
 * Avatar component for player representation
 * @author Senior Full-Stack Developer
 */

import React from 'react';
import { motion } from 'framer-motion';
import { getAvatarColor, getAvatarDarkColor } from '../../utils';
import type { AvatarProps } from '../../types';

const DEFAULT_SIZE = 64;

export const Avatar: React.FC<AvatarProps> = ({ 
  name, 
  isDead = false, 
  isSpeaking = false, 
  size = DEFAULT_SIZE 
}) => {
  const color = getAvatarColor(name);
  const darkColor = getAvatarDarkColor(color);
  const isDeadState = Boolean(isDead);

  const speakingAnimation = {
    scale: [1, 1.05, 1],
    y: [0, -2, 0]
  };

  const speakingTransition = {
    repeat: Infinity,
    duration: 0.2
  };

  return (
    <div 
      className="relative flex-shrink-0" 
      style={{ width: size, height: size }}
    >
      <motion.svg
        viewBox="0 0 100 100"
        animate={isSpeaking && !isDeadState ? speakingAnimation : {}}
        transition={isSpeaking && !isDeadState ? speakingTransition : {}}
        className="w-full h-full drop-shadow-lg"
        role="img"
        aria-label={`Avatar for ${name}${isDeadState ? ' (eliminated)' : ''}`}
      >
        {isDeadState ? (
          <GhostAvatar color={color} />
        ) : (
          <AliveAvatar color={color} darkColor={darkColor} />
        )}
      </motion.svg>
    </div>
  );
};

/**
 * Ghost variant for eliminated players
 */
const GhostAvatar: React.FC<{ color: string }> = ({ color }) => (
  <g opacity={0.7}>
    <path
      d="M20,50 Q20,20 50,20 Q80,20 80,50 L80,80 Q80,90 70,85 Q60,80 50,85 Q40,90 30,85 Q20,80 20,80 Z"
      fill={color}
    />
    <circle cx="40" cy="40" r="5" fill="black" opacity="0.5" />
    <circle cx="60" cy="40" r="5" fill="black" opacity="0.5" />
    <ellipse cx="50" cy="85" rx="20" ry="5" fill="black" opacity="0.2" />
  </g>
);

/**
 * Alive variant for active players
 */
const AliveAvatar: React.FC<{ color: string; darkColor: string }> = ({ 
  color, 
  darkColor 
}) => (
  <g>
    {/* Backpack */}
    <rect x="10" y="35" width="20" height="40" rx="8" fill={darkColor} />
    
    {/* Legs */}
    <rect x="30" y="70" width="15" height="25" rx="6" fill={darkColor} />
    <rect x="55" y="70" width="15" height="25" rx="6" fill={darkColor} />
    
    {/* Body */}
    <rect x="25" y="20" width="50" height="65" rx="25" fill={color} />
    
    {/* Visor */}
    <rect x="45" y="35" width="35" height="20" rx="10" fill="#aed9e0" />
    <rect x="50" y="38" width="20" height="5" rx="2" fill="white" opacity="0.5" />
  </g>
);
