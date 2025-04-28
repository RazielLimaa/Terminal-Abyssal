
import { useEffect, useState } from 'react';
import GameContainer from './components/GameContainer';
import GameMenu from './components/GameMenu';
import { GameState } from './types/game';

const App = () => {
  const [gameState, setGameState] = useState<GameState>('menu');
  const [seed, setSeed] = useState<number>(Math.floor(Math.random() * 1000000));

  const startGame = () => {
    setSeed(Math.floor(Math.random() * 1000000));
    setGameState('playing');
  };

  const returnToMenu = () => {
    setGameState('menu');
  };

  // Prevent scrolling with arrow keys
  useEffect(() => {
    const preventDefaultForArrows = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', preventDefaultForArrows);
    return () => {
      window.removeEventListener('keydown', preventDefaultForArrows);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-green-500 font-mono">
      {gameState === 'menu' ? (
        <GameMenu onStartGame={startGame} />
      ) : (
        <GameContainer seed={seed} onGameOver={returnToMenu} />
      )}
    </div>
  );
};

export default App;
