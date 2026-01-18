import React, { useState, useEffect } from 'react';
import { Lobby } from './components/game/Lobby';
import { GameRoom } from './components/game/GameRoom';

function App() {
  const [error, setError] = useState<string | null>(null);
  const [room, setRoom] = useState(null);

  useEffect(() => {
    try {
      // Test if we can import the store
      import('./store/gameStore').then(({ useGameStore }) => {
        console.log('Store loaded successfully');
        // Try to use the store
        const store = useGameStore.getState();
        console.log('Store state:', store);
        setRoom(store.room);
      }).catch(err => {
        console.error('Store import error:', err);
        setError(`Store Error: ${err.message}`);
      });
    } catch (err: any) {
      console.error('App error:', err);
      setError(`App Error: ${err.message}`);
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-red-900 text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
        <p className="mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="bg-blue-600 px-4 py-2 rounded"
        >
          Reload
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {!room ? <Lobby /> : <GameRoom />}
    </div>
  );
}

export default App;
