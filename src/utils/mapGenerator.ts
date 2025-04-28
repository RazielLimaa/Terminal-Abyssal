import { Level, Entity, Position } from '../types/game';
import Prando from 'prando';

// Direction vectors for maze generation
const DIRS = [
  [0, -1], // north
  [1, 0],  // east
  [0, 1],  // south
  [-1, 0], // west
];

export function generateLevel(width: number, height: number, seed: number, floor: number): Level {
  const rng = new Prando(seed + floor);
  
  // Initialize map with walls
  const map: number[][] = Array(height).fill(0)
    .map(() => Array(width).fill(1));
  
  // Initialize visited array for fog of war
  const visited: boolean[][] = Array(height).fill(false)
    .map(() => Array(width).fill(false));
  
  // Create a maze using randomized DFS
  const startX = 1 + Math.floor(rng.next() * (width - 2) / 2) * 2;
  const startY = 1 + Math.floor(rng.next() * (height - 2) / 2) * 2;
  
  map[startY][startX] = 0; // Set starting position to empty
  const frontier: Position[] = [{x: startX, y: startY}];
  
  while (frontier.length > 0) {
    const randomIndex = Math.floor(rng.next() * frontier.length);
    const current = frontier[randomIndex];
    frontier.splice(randomIndex, 1);
    
    const neighbors: Position[] = [];
    
    for (const [dx, dy] of DIRS) {
      const nx = current.x + dx * 2;
      const ny = current.y + dy * 2;
      
      if (nx >= 1 && nx < width - 1 && ny >= 1 && ny < height - 1 && map[ny][nx] === 1) {
        neighbors.push({x: nx, y: ny});
      }
    }
    
    if (neighbors.length > 0) {
      frontier.push(current);
      const next = neighbors[Math.floor(rng.next() * neighbors.length)];
      
      map[current.y + Math.sign(next.y - current.y)][current.x + Math.sign(next.x - current.x)] = 0;
      map[next.y][next.x] = 0;
      
      frontier.push(next);
    }
  }
  
  // Create random rooms
  const numRooms = 1 + Math.floor(rng.next() * 3) + Math.floor(floor / 2);
  for (let i = 0; i < numRooms; i++) {
    const roomWidth = 3 + Math.floor(rng.next() * 4) * 2;
    const roomHeight = 3 + Math.floor(rng.next() * 4) * 2;
    const roomX = 1 + Math.floor(rng.next() * (width - roomWidth - 2));
    const roomY = 1 + Math.floor(rng.next() * (height - roomHeight - 2));
    
    for (let y = roomY; y < roomY + roomHeight; y++) {
      for (let x = roomX; x < roomX + roomWidth; x++) {
        if (y >= 0 && y < height && x >= 0 && x < width) {
          map[y][x] = 0;
        }
      }
    }
  }
  
  const entities: Entity[] = [];
  
  // Add exit door (PERTO do jogador)
  let exitX, exitY;
  const maxDistance = 8; // máximo de distância do jogador para o portal
  let attempts = 0;
  do {
    const dx = Math.floor(rng.next() * (maxDistance * 2 + 1)) - maxDistance;
    const dy = Math.floor(rng.next() * (maxDistance * 2 + 1)) - maxDistance;
    
    exitX = startX + dx;
    exitY = startY + dy;
    
    attempts++;
    if (attempts > 50) {
      // Se não achar rápido, libera pra qualquer lugar
      exitX = 1 + Math.floor(rng.next() * (width - 2));
      exitY = 1 + Math.floor(rng.next() * (height - 2));
      break;
    }
  } while (
    exitX < 1 || exitX >= width - 1 ||
    exitY < 1 || exitY >= height - 1 ||
    map[exitY][exitX] !== 0 ||
    (exitX === startX && exitY === startY)
  );
  
  entities.push({
    id: 'exit',
    x: exitX,
    y: exitY,
    type: 'door',
    symbol: '▣',
  });
  
  // Add enemies
  const numEnemies = Math.min(5 + floor, 15);
  for (let i = 0; i < numEnemies; i++) {
    let enemyX, enemyY;
    do {
      enemyX = 1 + Math.floor(rng.next() * (width - 2));
      enemyY = 1 + Math.floor(rng.next() * (height - 2));
    } while (
      map[enemyY][enemyX] !== 0 || 
      (enemyX === startX && enemyY === startY) ||
      entities.some(e => e.x === enemyX && e.y === enemyY)
    );
    
    entities.push({
      id: `enemy-${i}`,
      x: enemyX,
      y: enemyY,
      type: 'enemy',
      symbol: rng.next() < 0.3 ? '☠' : '웃',
      health: 10 + Math.floor(rng.next() * 10) + Math.floor(floor * 1.5),
      damage: 5 + Math.floor(rng.next() * 5) + Math.floor(floor * 0.5),
      state: 'idle',
    });
  }
  
  // Add items
  const numItems = 2 + Math.floor(rng.next() * 3);
  for (let i = 0; i < numItems; i++) {
    let itemX, itemY;
    do {
      itemX = 1 + Math.floor(rng.next() * (width - 2));
      itemY = 1 + Math.floor(rng.next() * (height - 2));
    } while (
      map[itemY][itemX] !== 0 || 
      (itemX === startX && itemY === startY) ||
      entities.some(e => e.x === itemX && e.y === itemY)
    );
    
    entities.push({
      id: `item-${i}`,
      x: itemX,
      y: itemY,
      type: 'item',
      symbol: '✦',
    });
  }
  
  return {
    map,
    entities,
    width,
    height,
    visited: Array(height).fill(false).map(() => Array(width).fill(false)),
  };
}

export function findValidStartPosition(level: Level): Position {
  for (let y = 1; y < level.height - 1; y++) {
    for (let x = 1; x < level.width - 1; x++) {
      if (level.map[y][x] === 0 && !level.entities.some(e => e.x === x && e.y === y)) {
        return { x, y };
      }
    }
  }
  
  for (let y = 1; y < level.height - 1; y++) {
    for (let x = 1; x < level.width - 1; x++) {
      if (level.map[y][x] === 0) {
        return { x, y };
      }
    }
  }
  
  return { x: 1, y: 1 };
}
