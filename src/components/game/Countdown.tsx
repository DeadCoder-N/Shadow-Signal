import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle } from 'lucide-react';

interface CountdownProps {
  duration: number;
  phase: 'lobby' | 'selecting' | 'voting';
  isActive: boolean;
  onComplete?: () => void;
}

export const Countdown: React.FC<CountdownProps> = ({ duration, phase, isActive, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!isActive) return;
    
    setTimeLeft(duration);
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onComplete?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, isActive, phase]);

  if (!isActive) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  const getPhaseInfo = () => {
    switch (phase) {
      case 'lobby': return { label: 'AUTO-START', color: 'blue' };
      case 'selecting': return { label: 'SELECTION', color: 'emerald' };
      case 'voting': return { label: 'VOTING', color: 'amber' };
    }
  };

  const { label, color } = getPhaseInfo();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`fixed top-4 right-4 z-50 backdrop-blur-md border rounded-xl p-4 min-w-[180px] ${
        isCritical ? 'bg-red-600/80 border-red-500 animate-pulse' : 
        isUrgent ? 'bg-amber-600/80 border-amber-500' : 
        `bg-${color}-600/80 border-${color}-500`
      }`}
    >
      <div className="flex items-center gap-3">
        {isCritical ? (
          <AlertTriangle className="w-5 h-5 text-white animate-bounce" />
        ) : (
          <Clock className="w-5 h-5 text-white" />
        )}
        <div>
          <p className="text-xs uppercase tracking-widest text-white/80">
            {label} TIME
          </p>
          <p className={`text-2xl font-black tabular-nums text-white`}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </p>
        </div>
      </div>
      
      {isCritical && (
        <p className="text-[10px] text-white uppercase tracking-widest mt-2 text-center animate-pulse font-bold">
          ⚠️ TIME'S UP!
        </p>
      )}
    </motion.div>
  );
};