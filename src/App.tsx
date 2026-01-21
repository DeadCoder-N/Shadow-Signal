/**
 * Main application component
 * @author Senior Full-Stack Developer
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Lobby } from './components/game/Lobby';
import { GameRoom } from './components/game/GameRoom';
import { useGameStore } from './store/gameStore';

interface AppError {
  message: string;
  type: 'store' | 'app';
}

const App: React.FC = () => {
  const [error, setError] = useState<AppError | null>(null);
  const { room } = useGameStore();

  const handleStoreInitialization = useCallback(async () => {
    try {
      // Dynamic import for better code splitting
      const { useGameStore } = await import('./store/gameStore');
      const store = useGameStore.getState();
      
      // Validate store initialization
      if (typeof store.createRoom !== 'function') {
        throw new Error('Store not properly initialized');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError({ 
        message: `Store Error: ${errorMessage}`, 
        type: 'store' 
      });
    }
  }, []);

  useEffect(() => {
    handleStoreInitialization();
  }, [handleStoreInitialization]);

  const handleReload = useCallback(() => {
    window.location.reload();
  }, []);

  if (error) {
    return <ErrorScreen error={error} onReload={handleReload} />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {!room ? <Lobby /> : <GameRoom />}
    </div>
  );
};

/**
 * Error screen component
 */
interface ErrorScreenProps {
  error: AppError;
  onReload: () => void;
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ error, onReload }) => (
  <div className="min-h-screen bg-red-900 text-white p-4 sm:p-8 flex items-center justify-center">
    <div className="max-w-md w-full space-y-4 text-center">
      <h1 className="text-2xl font-bold mb-4">System Error</h1>
      <div className="bg-red-800/50 p-4 rounded-lg border border-red-700">
        <p className="text-sm font-mono break-words">{error.message}</p>
      </div>
      <button 
        onClick={onReload}
        className="w-full bg-blue-600 hover:bg-blue-500 px-4 py-3 rounded-lg font-bold transition-colors"
      >
        Reload Application
      </button>
    </div>
  </div>
);

export default App;
