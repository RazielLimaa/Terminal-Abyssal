
import { Level, Position } from '../types/game';

// The FOV in radians
const FOV = Math.PI / 3;

export interface RaycastResult {
  distance: number;
  wallType: number;
  side: number; // 0 for X-side, 1 for Y-side
}

export function castRay(
  level: Level,
  position: Position,
  angle: number,
  maxDistance: number = 20
): RaycastResult {
  // Direction vector based on angle
  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);
  
  // Current map position
  const mapX = Math.floor(position.x);
  const mapY = Math.floor(position.y);
  
  // Length of ray from one x or y-side to next x or y-side
  const deltaDistX = Math.abs(1 / dirX);
  const deltaDistY = Math.abs(1 / dirY);
  
  // Direction to step in x or y direction (either +1 or -1)
  const stepX = dirX < 0 ? -1 : 1;
  const stepY = dirY < 0 ? -1 : 1;
  
  // Distance to next x or y-side
  let sideDistX = dirX < 0 
    ? (position.x - mapX) * deltaDistX 
    : (mapX + 1 - position.x) * deltaDistX;
  let sideDistY = dirY < 0 
    ? (position.y - mapY) * deltaDistY 
    : (mapY + 1 - position.y) * deltaDistY;
  
  // Current map position for checking
  let currentMapX = mapX;
  let currentMapY = mapY;
  
  // Perform DDA (Digital Differential Analysis)
  let hit = 0;
  let side = 0;
  let distance = 0;
  
  while (hit === 0 && distance < maxDistance) {
    // Jump to next map square, either in x-direction, or in y-direction
    if (sideDistX < sideDistY) {
      sideDistX += deltaDistX;
      currentMapX += stepX;
      side = 0;
      distance = (currentMapX - position.x + (1 - stepX) / 2) / dirX;
    } else {
      sideDistY += deltaDistY;
      currentMapY += stepY;
      side = 1;
      distance = (currentMapY - position.y + (1 - stepY) / 2) / dirY;
    }
    
    // Check if ray has hit a wall
    if (
      currentMapX < 0 || currentMapX >= level.width || 
      currentMapY < 0 || currentMapY >= level.height ||
      level.map[currentMapY][currentMapX] > 0
    ) {
      hit = 1;
    }
  }
  
  // If we've reached the max distance without hitting anything, return max distance
  if (distance >= maxDistance) {
    return {
      distance: maxDistance,
      wallType: 0,
      side: side
    };
  }
  
  // Return the wall type and distance
  return {
    distance,
    wallType: currentMapX >= 0 && currentMapY >= 0 && 
              currentMapX < level.width && currentMapY < level.height ? 
              level.map[currentMapY][currentMapX] : 1,
    side
  };
}

export function getScreenColumn(
  level: Level,
  position: Position,
  angle: number,
  column: number,
  screenWidth: number,
  screenHeight: number
): string[] {
  // Calculate ray angle for this column
  const rayAngle = angle - FOV / 2 + (column / screenWidth) * FOV;
  
  // Cast the ray
  const rayResult = castRay(level, position, rayAngle);
  
  // Calculate wall height based on distance
  const lineHeight = Math.floor(screenHeight / rayResult.distance);
  
  // Calculate start and end position of wall
  let drawStart = Math.floor(-lineHeight / 2 + screenHeight / 2);
  if (drawStart < 0) drawStart = 0;
  let drawEnd = Math.floor(lineHeight / 2 + screenHeight / 2);
  if (drawEnd >= screenHeight) drawEnd = screenHeight - 1;
  
  // Create the column of characters
  const wallChars = ['█', '▓', '▒', '░', ' '];
  const columnChars: string[] = [];
  
  // Fill the column with characters
  for (let y = 0; y < screenHeight; y++) {
    if (y < drawStart) {
      // Ceiling
      columnChars.push(' ');
    } else if (y < drawEnd) {
      // Wall - choose character based on distance and side
      const charIndex = Math.min(
        Math.floor(rayResult.distance / 4),
        wallChars.length - 1
      );
      columnChars.push(rayResult.side === 0 ? wallChars[charIndex] : wallChars[Math.min(charIndex + 1, wallChars.length - 1)]);
    } else {
      // Floor
      columnChars.push('·');
    }
  }
  
  return columnChars;
}

// Render the entire view
export function renderView(
  level: Level,
  position: Position,
  angle: number,
  screenWidth: number,
  screenHeight: number
): string[][] {
  const screen: string[][] = Array(screenHeight)
    .fill(null)
    .map(() => Array(screenWidth).fill(' '));
  
  // For each column in the screen
  for (let x = 0; x < screenWidth; x++) {
    const column = getScreenColumn(level, position, angle, x, screenWidth, screenHeight);
    for (let y = 0; y < screenHeight; y++) {
      screen[y][x] = column[y];
    }
  }
  
  // Check if any entities should be rendered
  level.entities.forEach(entity => {
    // Check if entity is in front of player
    const dx = entity.x - position.x;
    const dy = entity.y - position.y;
    const entityAngle = Math.atan2(dy, dx);
    let viewAngle = entityAngle - angle;
    
    // Normalize angle
    while (viewAngle > Math.PI) viewAngle -= Math.PI * 2;
    while (viewAngle < -Math.PI) viewAngle += Math.PI * 2;
    
    // Check if entity is in view
    if (Math.abs(viewAngle) < FOV / 2) {
      // Calculate distance
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Check if entity is not behind a wall
      const rayResult = castRay(level, position, entityAngle, distance);
      if (rayResult.distance >= distance - 0.5) {
        // Calculate screen position
        const screenX = Math.floor((0.5 + viewAngle / FOV) * screenWidth);
        if (screenX >= 0 && screenX < screenWidth) {
          // Calculate height on screen
          const size = Math.floor(screenHeight / distance);
          const drawStart = Math.max(0, Math.floor(screenHeight / 2 - size / 2));
          
          // Draw entity if it's close enough
          if (distance < 10) {
            screen[drawStart][screenX] = entity.symbol;
          }
        }
      }
    }
  });
  
  return screen;
}

// Update the visited tiles based on player's position and view
export function updateVisibility(level: Level, position: Position, angle: number): void {
  // Mark the current position as visited
  const px = Math.floor(position.x);
  const py = Math.floor(position.y);
  
  if (px >= 0 && px < level.width && py >= 0 && py < level.height) {
    level.visited[py][px] = true;
  }
  
  // Cast rays to update visibility
  for (let a = angle - FOV / 2; a <= angle + FOV / 2; a += FOV / 20) {
    const dirX = Math.cos(a);
    const dirY = Math.sin(a);
    
    let mapX = px;
    let mapY = py;
    let distance = 0;
    
    // Cast ray until hit
    while (distance < 10) {
      distance += 0.5;
      mapX = Math.floor(position.x + dirX * distance);
      mapY = Math.floor(position.y + dirY * distance);
      
      // Check boundaries
      if (mapX < 0 || mapX >= level.width || mapY < 0 || mapY >= level.height) {
        break;
      }
      
      // Mark as visited
      level.visited[mapY][mapX] = true;
      
      // Stop if wall
      if (level.map[mapY][mapX] > 0) {
        break;
      }
    }
  }
}
