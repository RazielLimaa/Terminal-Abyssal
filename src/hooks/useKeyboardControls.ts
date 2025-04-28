
import { useEffect, useState } from 'react';

interface KeyControls {
  forward: boolean;
  backward: boolean;
  turnLeft: boolean;
  turnRight: boolean;
  strafeLeft: boolean;
  strafeRight: boolean;
  interact: boolean;
}

export function useKeyboardControls() {
  const [keysPressed, setKeysPressed] = useState<KeyControls>({
    forward: false,
    backward: false,
    turnLeft: false,
    turnRight: false,
    strafeLeft: false,
    strafeRight: false,
    interact: false
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // Ignore key repeat
      
      switch (e.key) {
        case 'w':
        case 'ArrowUp':
          setKeysPressed(prev => ({ ...prev, forward: true }));
          break;
        case 's':
        case 'ArrowDown':
          setKeysPressed(prev => ({ ...prev, backward: true }));
          break;
        case 'a':
          setKeysPressed(prev => ({ ...prev, strafeLeft: true }));
          break;
        case 'd':
          setKeysPressed(prev => ({ ...prev, strafeRight: true }));
          break;
        case 'ArrowLeft':
          setKeysPressed(prev => ({ ...prev, turnLeft: true }));
          break;
        case 'ArrowRight':
          setKeysPressed(prev => ({ ...prev, turnRight: true }));
          break;
        case ' ':
        case 'e':
        case 'Enter':
          setKeysPressed(prev => ({ ...prev, interact: true }));
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'w':
        case 'ArrowUp':
          setKeysPressed(prev => ({ ...prev, forward: false }));
          break;
        case 's':
        case 'ArrowDown':
          setKeysPressed(prev => ({ ...prev, backward: false }));
          break;
        case 'a':
          setKeysPressed(prev => ({ ...prev, strafeLeft: false }));
          break;
        case 'd':
          setKeysPressed(prev => ({ ...prev, strafeRight: false }));
          break;
        case 'ArrowLeft':
          setKeysPressed(prev => ({ ...prev, turnLeft: false }));
          break;
        case 'ArrowRight':
          setKeysPressed(prev => ({ ...prev, turnRight: false }));
          break;
        case ' ':
        case 'e':
        case 'Enter':
          setKeysPressed(prev => ({ ...prev, interact: false }));
          break;
      }
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return { keysPressed };
}
