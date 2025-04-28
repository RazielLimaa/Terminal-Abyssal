import { FC } from 'react';
import { GameData } from '../types/game';

interface HUDProps {
  game: GameData;
  fps: number;
}

const HUD: FC<HUDProps> = ({ game, fps }) => {
  const { player, floor } = game;
  const healthPercentage = (player.health / player.maxHealth) * 100;
  
  let healthColor = 'bg-green-500';
  if (healthPercentage < 30) {
    healthColor = 'bg-red-500';
  } else if (healthPercentage < 70) {
    healthColor = 'bg-yellow-500';
  }
  
  return (
    <div className="bg-black border-t border-green-500 p-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {/* Health bar */}
          <div className="flex flex-col">
            <span className="text-xs text-green-500">HP</span>
            <div className="w-32 h-3 bg-gray-800 overflow-hidden">
              <div 
                className={`h-full ${healthColor}`} 
                style={{ width: `${healthPercentage}%` }}
              />
            </div>
          </div>
          
          {/* Weapon info */}
          <div className="flex flex-col">
            <span className="text-xs text-green-500">WEAPON</span>
            <span className="text-sm text-white">{player.weapon} [∞]</span>
          </div>
          
          {/* Floor info */}
          <div className="flex flex-col">
            <span className="text-xs text-green-500">FLOOR</span>
            <span className="text-sm text-white">{floor}/5</span>
          </div>
          
          {/* Inventory */}
          <div className="flex flex-col">
            <span className="text-xs text-green-500">INVENTORY</span>
            <div className="flex space-x-1">
              {player.inventory.length > 0 ? (
                player.inventory.map((item, idx) => (
                  <span key={idx} className="text-yellow-500">{item}</span>
                ))
              ) : (
                <span className="text-gray-500">empty</span>
              )}
            </div>
          </div>
        </div>
        
        {/* Controls help */}
        <div className="text-xs text-gray-500">
          <div>WASD/Arrows: Move</div>
          <div>E: Shoot</div>
          <div>FPS: {fps}</div>
        </div>
      </div>
    </div>
  );
};

export default HUD;
