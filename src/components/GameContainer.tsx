
import { useEffect, useState, useRef } from 'react';
import { useKeyboardControls } from '../hooks/useKeyboardControls';
import { initGame, movePlayer, turnPlayer, moveEnemies, playerInteract, isGameOver } from '../utils/gameEngine';
import { GameData } from '../types/game';
import AsciiView from './AsciiView';
import Minimap from './Minimap';
import HUD from './HUD';

interface GameContainerProps {
  seed: number;
  onGameOver: () => void;
}

const GameContainer: React.FC<GameContainerProps> = ({ seed, onGameOver }) => {
  const [game, setGame] = useState<GameData>(() => initGame(seed));
  const [fps, setFps] = useState<number>(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(Date.now());
  const gameTickRef = useRef<number | null>(null);
  const tickCountRef = useRef(0);
  
  // Initialize the game
  useEffect(() => {
    setGame(initGame(seed));
  }, [seed]);
  
  // Game loop
  useEffect(() => {
    const gameTick = () => {
      tickCountRef.current += 1;
      
      // Update FPS every second
      if (tickCountRef.current % 10 === 0) {
        const now = Date.now();
        const elapsed = now - lastTimeRef.current;
        const currentFps = Math.round((10 * 1000) / elapsed);
        setFps(currentFps);
        lastTimeRef.current = now;
        frameCountRef.current = 0;
      }
      
      // Move enemies every 5 ticks (slower update rate)
      if (tickCountRef.current % 5 === 0) {
        setGame(prevGame => moveEnemies(prevGame));
      }
      
      // Check for game over
      if (isGameOver(game)) {
        onGameOver();
        return;
      }
      
      gameTickRef.current = requestAnimationFrame(gameTick);
    };
    
    // Start the game loop
    gameTickRef.current = requestAnimationFrame(gameTick);
    
    // Clean up
    return () => {
      if (gameTickRef.current !== null) {
        cancelAnimationFrame(gameTickRef.current);
      }
    };
  }, [game, onGameOver]);
  
  // Keyboard controls
  const { keysPressed } = useKeyboardControls();
  
  useEffect(() => {
    // Handle movement based on keys pressed
    let updatedGame = { ...game };
    
    if (keysPressed.forward) {
      updatedGame = movePlayer(updatedGame, true);
    }
    if (keysPressed.backward) {
      updatedGame = movePlayer(updatedGame, false);
    }
    if (keysPressed.strafeLeft) {
      updatedGame = movePlayer(updatedGame, false, true);
    }
    if (keysPressed.strafeRight) {
      updatedGame = movePlayer(updatedGame, true, true);
    }
    if (keysPressed.turnLeft) {
      updatedGame = turnPlayer(updatedGame, false);
    }
    if (keysPressed.turnRight) {
      updatedGame = turnPlayer(updatedGame, true);
    }
    if (keysPressed.interact) {
      updatedGame = playerInteract(updatedGame);
      
      // Reset the interact key to prevent continuous interaction
      keysPressed.interact = false;
    }
    
    setGame(updatedGame);
  }, [keysPressed]);
  
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-grow flex relative">
        <AsciiView game={game} />
        <div className="absolute bottom-0 right-0 m-4">
          <Minimap game={game} />
        </div>
      </div>
      <HUD game={game} fps={fps} />
    </div>
  );
};

export default GameContainer;
