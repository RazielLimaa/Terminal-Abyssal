import { FC } from 'react';
import { GameData } from '../types/game';

interface HUDProps {
  game: GameData;
  fps: number;
}

// Função para calcular a direção do portal
function getDirectionToExit(playerX: number, playerY: number, exitX: number, exitY: number): string {
  const dx = exitX - playerX;
  const dy = exitY - playerY;
  
  if (Math.abs(dx) > Math.abs(dy)) {
    return dx > 0 ? '→' : '←';
  } else {
    return dy > 0 ? '↓' : '↑';
  }
}

const HUD: FC<HUDProps> = ({ game, fps }) => {
  const { player, level, floor } = game;
  const healthPercentage = (player.health / player.maxHealth) * 100;
  
  let healthColor = 'bg-green-500';
  if (healthPercentage < 30) {
    healthColor = 'bg-red-500';
  } else if (healthPercentage < 70) {
    healthColor = 'bg-yellow-500';
  }

  // Encontrar a porta de saída
  const exit = level.entities.find(entity => entity.type === 'door');

  // Pegar direção para o portal (se existir)
  const directionToExit = (exit)
    ? getDirectionToExit(player.position.x, player.position.y, exit.x, exit.y)
    : null;

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

          {/* Direção para o portal */}
          {directionToExit && (
            <div className="flex flex-col">
              <span className="text-xs text-green-500">EXIT</span>
              <span className="text-2xl text-white">{directionToExit}</span>
            </div>
          )}
          
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

        {/* FPS + controles */}
        <div className="text-xs text-gray-500 text-right">
          <div>WASD/Arrows: Move</div>
          <div>E: Shoot</div>
          <div>FPS: {fps}</div>
        </div>
      </div>
    </div>
  );
};

export default HUD;
