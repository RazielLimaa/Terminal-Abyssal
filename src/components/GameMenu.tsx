
import { FC } from 'react';

interface GameMenuProps {
  onStartGame: () => void;
}

const GameMenu: FC<GameMenuProps> = ({ onStartGame }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black text-green-500 font-mono">
      <div className="text-center mb-8">
        <pre className="text-xs sm:text-sm md:text-base whitespace-pre leading-tight mb-4">
{`
▄▄▄█████▓▓█████  ██▀███   ███▄ ▄███▓ ██▓ ███▄    █  ▄▄▄       ██▓    
▓  ██▒ ▓▒▓█   ▀ ▓██ ▒ ██▒▓██▒▀█▀ ██▒▓██▒ ██ ▀█   █ ▒████▄    ▓██▒    
▒ ▓██░ ▒░▒███   ▓██ ░▄█ ▒▓██    ▓██░▒██▒▓██  ▀█ ██▒▒██  ▀█▄  ▒██░    
░ ▓██▓ ░ ▒▓█  ▄ ▒██▀▀█▄  ▒██    ▒██ ░██░▓██▒  ▐▌██▒░██▄▄▄▄██ ▒██░    
  ▒██▒ ░ ░▒████▒░██▓ ▒██▒▒██▒   ░██▒░██░▒██░   ▓██░ ▓█   ▓██▒░██████▒
  ▒ ░░   ░░ ▒░ ░░ ▒▓ ░▒▓░░ ▒░   ░  ░░▓  ░ ▒░   ▒ ▒  ▒▒   ▓▒█░░ ▒░▓  ░
    ░     ░ ░  ░  ░▒ ░ ▒░░  ░      ░ ▒ ░░ ░░   ░ ▒░  ▒   ▒▒ ░░ ░ ▒  ░
  ░         ░     ░░   ░ ░      ░    ▒ ░   ░   ░ ░   ░   ▒     ░ ░   
            ░  ░   ░            ░    ░           ░       ░  ░    ░  ░
                                                                     
▄▄▄       ▄▄▄▄ ▓██   ██▓  ██████   ██████ 
▒████▄    ▓█████▄▒██  ██▒▒██    ▒ ▒██    ▒ 
▒██  ▀█▄  ▒██▒ ▄██▒██ ██░░ ▓██▄   ░ ▓██▄   
░██▄▄▄▄██ ▒██░█▀  ░ ▐██▓░  ▒   ██▒  ▒   ██▒
 ▓█   ▓██▒░▓█  ▀█▓░ ██▒▓░▒██████▒▒▒██████▒▒
 ▒▒   ▓▒█░░▒▓███▀▒ ██▒▒▒ ▒ ▒▓▒ ▒ ░▒ ▒▓▒ ▒ ░
  ▒   ▒▒ ░▒░▒   ░▓██ ░▒░ ░ ░▒  ░ ░░ ░▒  ░ ░
  ░   ▒    ░    ░▒ ▒ ░░  ░  ░  ░  ░  ░  ░  
      ░  ░ ░     ░ ░           ░        ░  
               ░░ ░                        
`}
        </pre>
        <h2 className="text-xl md:text-2xl mb-2">THE INFINITE LABYRINTH</h2>
        <p className="text-green-400 mb-8">Explore the depths. Face the unknown. Escape the abyss.</p>
      </div>
      
      <button
        onClick={onStartGame}
        className="px-8 py-3 text-lg bg-green-900 border border-green-500 hover:bg-green-800 transition-colors"
      >
        &gt; BEGIN DESCENT &lt;
      </button>
      
      <div className="mt-12 max-w-md text-sm text-green-600">
        <h3 className="text-green-400 mb-2 text-center">HOW TO PLAY</h3>
        <div className="grid grid-cols-2 gap-2">
          <p>W / ↑:</p><p>Move Forward</p>
          <p>S / ↓:</p><p>Move Backward</p>
          <p>A:</p><p>Strafe Left</p>
          <p>D:</p><p>Strafe Right</p>
          <p>← / →:</p><p>Turn Left/Right</p>
          <p>Space / E:</p><p>Interact/Attack</p>
        </div>
        <p className="mt-4 text-center text-green-500">Find the exit (▣) to descend deeper into the labyrinth.</p>
        <p className="text-center text-green-500">Beware of enemies (웃/☠) in the darkness.</p>
      </div>
    </div>
  );
};

export default GameMenu;
