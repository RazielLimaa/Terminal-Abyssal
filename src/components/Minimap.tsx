
import { FC } from 'react';
import { GameData } from '../types/game';

interface MinimapProps {
  game: GameData;
}

const Minimap: FC<MinimapProps> = ({ game }) => {
  const { level, player } = game;
  
  // Calculate minimap bounds
  const centerX = Math.floor(player.position.x);
  const centerY = Math.floor(player.position.y);
  const radius = 10;
  
  // Calculate minimap view bounds
  const minX = Math.max(0, centerX - radius);
  const maxX = Math.min(level.width - 1, centerX + radius);
  const minY = Math.max(0, centerY - radius);
  const maxY = Math.min(level.height - 1, centerY + radius);
  
  // Create minimap
  const rows = [];
  for (let y = minY; y <= maxY; y++) {
    const cells = [];
    for (let x = minX; x <= maxX; x++) {
      // Determine cell content
      const isPlayer = Math.floor(player.position.x) === x && Math.floor(player.position.y) === y;
      const isWall = level.map[y][x] > 0;
      const entity = level.entities.find(e => Math.floor(e.x) === x && Math.floor(e.y) === y);
      const isVisited = level.visited[y][x];
      
      let bgColor = 'bg-gray-900';
      let textColor = 'text-gray-700';
      let content = ' ';
      
      if (!isVisited) {
        bgColor = 'bg-black';
      } else if (isPlayer) {
        bgColor = 'bg-green-700';
        textColor = 'text-white';
        
        // Represent player direction with a character
        const dir = (Math.round(player.direction / (Math.PI / 2)) + 4) % 4;
        content = ['►', '▼', '◄', '▲'][dir];
      } else if (entity) {
        if (entity.type === 'enemy') {
          bgColor = 'bg-red-900';
          textColor = 'text-red-500';
          content = entity.symbol;
        } else if (entity.type === 'item') {
          bgColor = 'bg-yellow-900';
          textColor = 'text-yellow-500';
          content = entity.symbol;
        } else if (entity.type === 'door') {
          bgColor = 'bg-blue-900';
          textColor = 'text-blue-500';
          content = entity.symbol;
        }
      } else if (isWall) {
        bgColor = 'bg-gray-700';
      } else {
        bgColor = 'bg-gray-900';
      }
      
      cells.push(
        <div
          key={`${x}-${y}`}
          className={`w-2 h-2 ${bgColor} ${textColor} flex items-center justify-center text-xs`}
          style={{ fontSize: '6px' }}
        >
          {content}
        </div>
      );
    }
    
    rows.push(
      <div key={y} className="flex">
        {cells}
      </div>
    );
  }
  
  return (
    <div className="bg-black p-1 border border-green-500">
      <div className="flex flex-col">
        {rows}
      </div>
      <div className="text-xs text-green-500 mt-1 text-center">
        Floor: {game.floor}
      </div>
    </div>
  );
};

export default Minimap;
