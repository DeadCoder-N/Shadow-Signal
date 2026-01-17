import React from 'react';
import { motion } from 'framer-motion';

const COLORS = [
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
];

const DARKEN = {
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
};

export const Avatar = ({ name, isDead, isSpeaking, size = 64 }: { name: string, isDead?: number | boolean, isSpeaking?: boolean, size?: number }) => {
  // Deterministic color based on name
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % COLORS.length;
  const color = COLORS[colorIndex];
  const darkColor = DARKEN[color as keyof typeof DARKEN] || '#000';

  return (
    <div style={{ width: size, height: size }} className="relative">
      <motion.svg
        viewBox="0 0 100 100"
        animate={isSpeaking ? { scale: [1, 1.05, 1], y: [0, -2, 0] } : {}}
        transition={{ repeat: Infinity, duration: 0.2 }}
        className="w-full h-full drop-shadow-lg"
      >
        {isDead ? (
          // GHOST VARIANT
          <g opacity={0.7}>
            <path
              d="M20,50 Q20,20 50,20 Q80,20 80,50 L80,80 Q80,90 70,85 Q60,80 50,85 Q40,90 30,85 Q20,80 20,80 Z"
              fill={color}
            />
            <circle cx="40" cy="40" r="5" fill="black" opacity="0.5" />
            <circle cx="60" cy="40" r="5" fill="black" opacity="0.5" />
            <ellipse cx="50" cy="85" rx="20" ry="5" fill="black" opacity="0.2" />
          </g>
        ) : (
          // ALIVE VARIANT
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
        )}
      </motion.svg>
      
      {/* Speaking Indicator */}
      {isSpeaking && !isDead && (
        <motion.div
          className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-sm"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          <div className="w-2 h-2 bg-emerald-500 rounded-full" />
        </motion.div>
      )}
    </div>
  );
};
