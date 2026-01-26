import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';

interface TimerProps {
  duration: number;
  onComplete: () => void;
  phase: 'lobby' | 'selecting' | 'voting';
  isActive: boolean;
  phaseStartTime?: number;
}

export const Timer: React.FC<TimerProps> = ({ duration, onComplete, phase, isActive, phaseStartTime }) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [currentPhase, setCurrentPhase] = useState(phase);

  useEffect(() => {
    if (!isActive) return;
    
    // Reset timer when phase changes
    if (currentPhase !== phase) {
      setCurrentPhase(phase);
    }
    
    const updateTimer = () => {
      if (phaseStartTime) {
        // Calculate time based on server phase start time
        const elapsed = Math.floor((Date.now() - phaseStartTime) / 1000);
        const remaining = Math.max(0, duration - elapsed);
        setTimeLeft(remaining);
        
        if (remaining <= 0) {
          onComplete();
        }
      } else {
        // Fallback to client-side countdown
        setTimeLeft(prev => {
          if (prev <= 1) {
            onComplete();
            return 0;
          }
          return prev - 1;
        });
      }
    };
    
    // Update immediately
    updateTimer();
    
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [duration, onComplete, isActive, phase, phaseStartTime]);

  if (!isActive) return null;

  const progress = (timeLeft / duration) * 100;
  const isUrgent = timeLeft <= 10;
  const isCritical = timeLeft <= 5;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const getTimerColor = () => {
    if (isCritical) return 'red';
    if (isUrgent) return 'amber';
    if (phase === 'lobby') return 'blue';
    return phase === 'selecting' ? 'emerald' : 'blue';
  };

  const color = getTimerColor();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`fixed top-4 right-4 z-50 bg-black/80 backdrop-blur-md border rounded-xl p-4 min-w-[200px] ${
        isCritical ? 'border-red-500 animate-pulse shadow-red-500/50 shadow-lg' : 
        isUrgent ? 'border-amber-500 animate-pulse' : 
        `border-${color}-500`
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        {isCritical ? (
          <AlertTriangle className="w-5 h-5 text-red-500 animate-bounce" />
        ) : isUrgent ? (
          <AlertTriangle className="w-5 h-5 text-amber-500" />
        ) : (
          <Clock className={`w-5 h-5 text-${color}-500`} />
        )}
        <div>
          <p className={`text-xs uppercase tracking-widest ${
            isCritical ? 'text-red-400' : 
            isUrgent ? 'text-amber-400' : 
            'text-neutral-400'
          }`}>
            {phase === 'lobby' ? 'AUTO-START' : phase === 'selecting' ? 'CLUE SELECTION' : 'DISCUSSION TIME'}
          </p>
          <p className={`text-2xl font-black tabular-nums ${
            isCritical ? 'text-red-500' : 
            isUrgent ? 'text-amber-500' : 
            'text-white'
          }`}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </p>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-neutral-800 rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-full rounded-full transition-colors ${
            isCritical ? 'bg-red-500' : 
            isUrgent ? 'bg-amber-500' : 
            `bg-${color}-500`
          }`}
          style={{ width: `${progress}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      {isCritical && (
        <p className="text-[10px] text-red-400 uppercase tracking-widest mt-2 text-center animate-pulse font-bold">
          ⚠️ CRITICAL TIME!
        </p>
      )}
      {isUrgent && !isCritical && (
        <p className="text-[10px] text-amber-400 uppercase tracking-widest mt-2 text-center animate-pulse">
          TIME RUNNING OUT!
        </p>
      )}
    </motion.div>
  );
};