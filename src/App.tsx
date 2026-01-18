import React from 'react';
import { useGameStore } from './store/gameStore';
import { Lobby } from './components/game/Lobby';
import { GameRoom } from './components/game/GameRoom';

function App() {
  try {
    const { room } = useGameStore();

    return (
      <div className="min-h-screen bg-gray-900">
        {!room ? <Lobby /> : <GameRoom />}
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-red-900 text-white p-8">
        <h1>Error Loading App</h1>
        <p>{error?.toString()}</p>
      </div>
    );
  }
}

export default App;
