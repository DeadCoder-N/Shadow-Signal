import React from 'react';
import { useGameStore } from './store/gameStore';
import { Lobby } from './components/game/Lobby';
import { GameRoom } from './components/game/GameRoom';

function App() {
  const { room } = useGameStore();

  return (
    <>
      {!room ? <Lobby /> : <GameRoom />}
    </>
  );
}

export default App;
