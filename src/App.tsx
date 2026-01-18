import React from 'react';
import { useGameStore } from './store/gameStore';
import { Lobby } from './components/game/Lobby';
import { GameRoom } from './components/game/GameRoom';

function App() {
  const { room } = useGameStore();

  return (
    <div className="min-h-screen bg-gray-900">
      {!room ? <Lobby /> : <GameRoom />}
    </div>
  );
}

export default App;
