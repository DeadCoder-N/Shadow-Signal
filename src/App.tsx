import React, { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { Lobby } from './components/game/Lobby';
import { GameRoom } from './components/game/GameRoom';

function App() {
  const { room } = useGameStore();

  // Attempt to resume session on initial load
  useEffect(() => {
    try {
      useGameStore.getState().resumeSession();
    } catch {}
  }, []);

  return (
    <>
      {!room ? <Lobby /> : <GameRoom />}
    </>
  );
}

export default App;
