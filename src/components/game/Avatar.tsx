import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Deterministic color palette
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

const DARKEN: Record<string, string> = {
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

export const Avatar = ({ name, isDead, isSpeaking, size = 64, color: externalColor, onColorChange }: { name: string, isDead?: number | boolean, isSpeaking?: boolean, size?: number, color?: string, onColorChange?: (color: string) => void }) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  
  // Use external color, or fallback to deterministic color based on name
  const defaultColorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % COLORS.length;
  const color = externalColor || COLORS[defaultColorIndex];
  const darkColor = DARKEN[color] || '#000';
  
  const handleColorSelect = (newColor: string) => {
    setShowColorPicker(false);
    onColorChange?.(newColor);
  };

  // Among Us crewmate silhouette
  return (
    <div style={{ width: size, height: size }} className="relative">
      <motion.svg
        viewBox="0 0 100 100"
        animate={isSpeaking ? { scale: [1, 1.05, 1], y: [0, -2, 0] } : {}}
        transition={{ repeat: Infinity, duration: 0.2 }}
        className="w-full h-full drop-shadow-lg cursor-pointer"
        onClick={() => !isDead && setShowColorPicker(!showColorPicker)}
      >
        {isDead ? (
          // DEAD VARIANT: modern grayscale with glitch effect
          <g>
            {/* Main body with gradient */}
            <defs>
              <linearGradient id="deadGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4a4a4a" />
                <stop offset="100%" stopColor="#2a2a2a" />
              </linearGradient>
              <filter id="glitch">
                <feColorMatrix values="1 0 0 0 0  0 0.8 0 0 0  0 0 0.8 0 0  0 0 0 1 0" />
              </filter>
            </defs>
            {/* Main body (rounded capsule) */}
            <path d="M28 38 Q28 18 50 18 Q72 18 72 38 L72 62 Q72 82 50 82 Q28 82 28 62 Z" fill="url(#deadGradient)" stroke="#1a1a1a" strokeWidth="1.5" />
            {/* Tech backpack */}
            <rect x="70" y="42" width="10" height="18" rx="5" fill="#333" />
            <rect x="72" y="45" width="6" height="3" rx="1" fill="#555" />
            <rect x="72" y="52" width="6" height="3" rx="1" fill="#555" />
            {/* Modern visor */}
            <ellipse cx="50" cy="36" rx="20" ry="14" fill="#1a1a1a" stroke="#333" strokeWidth="1" />
            {/* Glitch lines */}
            <rect x="35" y="34" width="30" height="1" fill="#dc2626" opacity="0.7" />
            <rect x="32" y="38" width="36" height="1" fill="#dc2626" opacity="0.5" />
            {/* Modern legs */}
            <rect x="38" y="80" width="10" height="14" rx="5" fill="#333" />
            <rect x="52" y="80" width="10" height="14" rx="5" fill="#333" />
            {/* X mark with glow */}
            <line x1="30" y1="30" x2="70" y2="70" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" filter="url(#glitch)" />
            <line x1="70" y1="30" x2="30" y2="70" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" filter="url(#glitch)" />
            {/* Soft shadow */}
            <ellipse cx="50" cy="95" rx="18" ry="3" fill="#000" opacity="0.2" />
          </g>
        ) : (
          // ALIVE VARIANT: modern sleek design
          <g>
            <defs>
              <linearGradient id={`bodyGradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={color} />
                <stop offset="100%" stopColor={darkColor} />
              </linearGradient>
              <linearGradient id="visorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e0f2fe" />
                <stop offset="100%" stopColor="#81d4fa" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/> 
                </feMerge>
              </filter>
            </defs>
            {/* Main body with modern gradient */}
            <path d="M28 38 Q28 18 50 18 Q72 18 72 38 L72 62 Q72 82 50 82 Q28 82 28 62 Z" fill={`url(#bodyGradient-${color})`} stroke={darkColor} strokeWidth="1.5" />
            {/* Body highlight */}
            <path d="M32 38 Q32 22 50 22 Q68 22 68 38 L68 45" fill="none" stroke="#ffffff" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
            {/* Tech backpack with details */}
            <rect x="70" y="42" width="10" height="18" rx="5" fill={darkColor} />
            <rect x="72" y="45" width="6" height="3" rx="1" fill={color} opacity="0.8" />
            <rect x="72" y="52" width="6" height="3" rx="1" fill={color} opacity="0.6" />
            <circle cx="75" cy="58" r="1" fill={color} opacity="0.9" />
            {/* Modern visor with gradient */}
            <ellipse cx="50" cy="36" rx="20" ry="14" fill="url(#visorGradient)" stroke="#0277bd" strokeWidth="1" />
            {/* Visor reflection with modern shape */}
            <ellipse cx="44" cy="32" rx="10" ry="8" fill="#ffffff" opacity="0.7" />
            <ellipse cx="42" cy="30" rx="4" ry="3" fill="#ffffff" opacity="0.9" />
            {/* Inner visor glow */}
            <ellipse cx="50" cy="36" rx="16" ry="10" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.4" />
            {/* Modern legs with tech details */}
            <rect x="38" y="80" width="10" height="14" rx="5" fill={darkColor} />
            <rect x="52" y="80" width="10" height="14" rx="5" fill={darkColor} />
            <rect x="40" y="85" width="6" height="2" rx="1" fill={color} opacity="0.6" />
            <rect x="54" y="85" width="6" height="2" rx="1" fill={color} opacity="0.6" />
            {/* Soft shadow with blur */}
            <ellipse cx="50" cy="95" rx="18" ry="3" fill="#000" opacity="0.15" />
          </g>
        )}
      </motion.svg>

      {/* Speaking Indicator - Enhanced */}
      {isSpeaking && !isDead && (
        <motion.div
          className="absolute -top-1 -right-1 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full p-1.5 shadow-lg"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 0.8 }}
        >
          <div className="w-2 h-2 bg-white rounded-full" />
        </motion.div>
      )}
      
      {/* Color Picker */}
      <AnimatePresence>
        {showColorPicker && !isDead && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-xl border border-gray-200 p-4 z-50 min-w-[200px]"
          >
            <div className="text-xs font-medium text-gray-600 mb-3 text-center">Choose Color</div>
            <div className="grid grid-cols-5 gap-3">
              {COLORS.map((colorOption) => (
                <button
                  key={colorOption}
                  onClick={() => handleColorSelect(colorOption)}
                  className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-all duration-200 shadow-sm ${
                    color === colorOption ? 'border-gray-800 ring-2 ring-gray-300' : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: colorOption }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
