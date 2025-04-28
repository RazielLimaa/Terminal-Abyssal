import { GameData, Entity, Position } from '../types/game';
import { generateLevel, findValidStartPosition } from './mapGenerator';
import { updateVisibility } from './raycasting';
import { toast } from 'sonner';
import Prando from 'prando';

// Constants
const MOVE_SPEED = 0.15;
const TURN_SPEED = 0.1;
const MAP_SIZE = 60; // Bigger map

// Initialize a new game
export function initGame(seed: number): GameData {
  const level = generateLevel(MAP_SIZE, MAP_SIZE, seed, 1);
  const startPos = findValidStartPosition(level);
  
  const player = {
    position: { x: startPos.x, y: startPos.y },
    direction: 0,
    health: 100,
    maxHealth: 100,
    weapon: "Laser Gun",
    damage: 25, // Increased player damage
    inventory: []
  };
  
  updateVisibility(level, player.position, player.direction);
  
  return {
    player,
    level,
    floor: 1,
    seed
  };
}

// Handle player movement
export function movePlayer(
  game: GameData, 
  forward: boolean, 
  strafeRight: boolean = false
): GameData {
  const { player, level } = game;
  let { x, y } = player.position;
  const { direction } = player;
  
  // Calculate movement vector
  let dx = 0;
  let dy = 0;
  
  if (strafeRight) {
    // Strafing (perpendicular to direction)
    dx = Math.sin(direction) * MOVE_SPEED * (forward ? 1 : -1);
    dy = -Math.cos(direction) * MOVE_SPEED * (forward ? 1 : -1);
  } else {
    // Moving forward/backward
    dx = Math.cos(direction) * MOVE_SPEED * (forward ? 1 : -1);
    dy = Math.sin(direction) * MOVE_SPEED * (forward ? 1 : -1);
  }
  
  // Check collision for X movement
  const newX = x + dx;
  const mapXPos = Math.floor(newX + (dx > 0 ? 0.3 : -0.3));
  const mapYPos = Math.floor(y);
  
  if (
    mapXPos >= 0 && mapXPos < level.width &&
    mapYPos >= 0 && mapYPos < level.height &&
    level.map[mapYPos][mapXPos] === 0
  ) {
    x = newX;
  }
  
  // Check collision for Y movement
  const newY = y + dy;
  const mapXPos2 = Math.floor(x);
  const mapYPos2 = Math.floor(newY + (dy > 0 ? 0.3 : -0.3));
  
  if (
    mapXPos2 >= 0 && mapXPos2 < level.width &&
    mapYPos2 >= 0 && mapYPos2 < level.height &&
    level.map[mapYPos2][mapXPos2] === 0
  ) {
    y = newY;
  }
  
  // Update player position
  const updatedPlayer = {
    ...player,
    position: { x, y }
  };
  
  // Update visibility
  updateVisibility(level, updatedPlayer.position, updatedPlayer.direction);
  
  return { ...game, player: updatedPlayer };
}

// Handle player rotation
export function turnPlayer(game: GameData, right: boolean): GameData {
  const { player } = game;
  
  // Calculate new direction
  let direction = player.direction + (right ? TURN_SPEED : -TURN_SPEED);
  
  // Normalize direction to keep it between 0 and 2π
  direction = (direction + Math.PI * 2) % (Math.PI * 2);
  
  // Update player direction
  const updatedPlayer = {
    ...player,
    direction
  };
  
  // Update visibility
  updateVisibility(game.level, updatedPlayer.position, updatedPlayer.direction);
  
  return { ...game, player: updatedPlayer };
}

// Handle player interaction (shooting or using portal)
export function playerInteract(game: GameData): GameData {
  const { player, level } = game;
  
  // Calculate ray direction (where player is looking)
  const dirX = Math.cos(player.direction);
  const dirY = Math.sin(player.direction);
  let hitX = player.position.x;
  let hitY = player.position.y;
  const maxRange = 10;
  
  // Cast ray to find target
  for (let dist = 0; dist < maxRange; dist += 0.1) {
    hitX += dirX * 0.1;
    hitY += dirY * 0.1;
    const mapX = Math.floor(hitX);
    const mapY = Math.floor(hitY);
    
    // Check for wall hit
    if (level.map[mapY][mapX] > 0) break;
    
    // Check for entity hit
    const hitEntity = level.entities.find(e => 
      Math.floor(e.x) === mapX && 
      Math.floor(e.y) === mapY
    );
    
    if (hitEntity) {
      if (hitEntity.type === 'enemy') {
        // Apply damage to enemy
        const updatedEntities = level.entities.map(e => {
          if (e.id === hitEntity.id && e.health) {
            const newHealth = e.health - player.damage;
            if (newHealth <= 0) {
              return null; // Enemy defeated
            }
            return { ...e, health: newHealth };
          }
          return e;
        }).filter((e): e is Entity => e !== null);
        
        // Update game state with modified entities
        return {
          ...game,
          level: {
            ...level,
            entities: updatedEntities
          }
        };
      } else if (hitEntity.type === 'door') {
        // Check if it's a portal and handle floor transition
        const nextFloor = game.floor + 1;
        if (nextFloor > 5) {
          // Player has won!
          toast.success("Congratulations! You've escaped the Terminal Abyss!");
          return game;
        }
        
        // Generate next floor
        const nextLevel = generateLevel(MAP_SIZE, MAP_SIZE, game.seed, nextFloor);
        const startPos = findValidStartPosition(nextLevel);
        
        // Move to next floor
        toast.success(`Entering floor ${nextFloor}...`);
        return {
          ...game,
          player: {
            ...player,
            position: startPos,
            health: Math.min(player.maxHealth, player.health + 20) // Heal between floors
          },
          level: nextLevel,
          floor: nextFloor
        };
      }
    }
  }
  
  return game;
}

// Check if game is over (player dead)
export function isGameOver(game: GameData): boolean {
  return game.player.health <= 0;
}

// Get entities near player for displaying in HUD
export function getNearbyEntities(game: GameData): Entity[] {
  const { player, level } = game;
  const px = Math.floor(player.position.x);
  const py = Math.floor(player.position.y);
  
  return level.entities.filter(entity => 
    Math.abs(Math.floor(entity.x) - px) <= 1 && 
    Math.abs(Math.floor(entity.y) - py) <= 1
  );
}

// Check if the player can see an entity
export function canSeeEntity(game: GameData, entity: Entity): boolean {
  const { player, level } = game;
  const dx = entity.x - player.position.x;
  const dy = entity.y - player.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance > 10) return false;
  
  const angle = Math.atan2(dy, dx);
  const result = castRay(level, player.position, angle, distance + 0.5);
  
  return result.distance >= distance - 0.5;
}

// Cast a single ray (simplified version for checks)
function castRay(level: any, position: Position, angle: number, maxDist: number): { distance: number } {
  const dirX = Math.cos(angle);
  const dirY = Math.sin(angle);
  let distance = 0;
  
  while (distance < maxDist) {
    distance += 0.1;
    const mapX = Math.floor(position.x + dirX * distance);
    const mapY = Math.floor(position.y + dirY * distance);
    
    if (
      mapX < 0 || mapX >= level.width || 
      mapY < 0 || mapY >= level.height || 
      level.map[mapY][mapX] > 0
    ) {
      return { distance };
    }
  }
  
  return { distance: maxDist };
}

// Move enemies in the game
export function moveEnemies(game: GameData): GameData {
  const { level, player, seed, floor } = game;
  const rng = new Prando(seed + floor + Date.now());
  
  const updatedEntities = level.entities.map(entity => {
    if (entity.type !== 'enemy') return entity;
    
    // Calculate distance to player
    const dx = player.position.x - entity.x;
    const dy = player.position.y - entity.y;
    const distSquared = dx * dx + dy * dy;
    
    // Enemy behavior based on distance
    if (distSquared < 25) { // Within ~5 units
      // Chase player
      entity.state = 'chase';
      
      // Simple pathfinding: move toward player if possible
      const moveX = Math.sign(dx) * (rng.next() < 0.8 ? 1 : 0); // 80% chance to move in player direction
      const moveY = Math.sign(dy) * (rng.next() < 0.8 ? 1 : 0);
      
      // Try to move in X direction
      const newX = entity.x + moveX;
      if (
        moveX !== 0 &&
        newX >= 0 && newX < level.width &&
        level.map[entity.y][newX] === 0 &&
        !level.entities.some(e => e !== entity && e.x === newX && e.y === entity.y)
      ) {
        entity.x = newX;
      }
      
      // Try to move in Y direction
      const newY = entity.y + moveY;
      if (
        moveY !== 0 &&
        newY >= 0 && newY < level.height &&
        level.map[newY][entity.x] === 0 &&
        !level.entities.some(e => e !== entity && e.x === entity.x && e.y === newY)
      ) {
        entity.y = newY;
      }
      
      // Attack if next to player
      if (distSquared < 2) { // If adjacent
        // Simple attack: 50% chance to hit
        if (rng.next() < 0.5) {
          // Damage player
          player.health -= entity.damage || 5;
        }
      }
    } else if (distSquared < 100) { // Within ~10 units
      // Wander randomly but with bias toward player
      entity.state = 'alert';
      
      if (rng.next() < 0.4) { // Only move 40% of the time for slower enemies
        const moveX = Math.sign(dx) * (rng.next() < 0.6 ? 1 : 0) || (rng.next() < 0.3 ? (rng.next() < 0.5 ? 1 : -1) : 0);
        const moveY = Math.sign(dy) * (rng.next() < 0.6 ? 1 : 0) || (rng.next() < 0.3 ? (rng.next() < 0.5 ? 1 : -1) : 0);
        
        // Try to move in X direction
        const newX = entity.x + moveX;
        if (
          moveX !== 0 &&
          newX >= 0 && newX < level.width &&
          level.map[entity.y][newX] === 0 &&
          !level.entities.some(e => e !== entity && e.x === newX && e.y === entity.y)
        ) {
          entity.x = newX;
        }
        
        // Try to move in Y direction
        const newY = entity.y + moveY;
        if (
          moveY !== 0 &&
          newY >= 0 && newY < level.height &&
          level.map[newY][entity.x] === 0 &&
          !level.entities.some(e => e !== entity && e.x === entity.x && e.y === newY)
        ) {
          entity.y = newY;
        }
      }
    } else {
      // Idle or random movement
      entity.state = 'idle';
      
      if (rng.next() < 0.2) { // 20% chance to move randomly
        const moveX = rng.next() < 0.33 ? -1 : rng.next() < 0.5 ? 1 : 0;
        const moveY = rng.next() < 0.33 ? -1 : rng.next() < 0.5 ? 1 : 0;
        
        // Try to move in X direction
        const newX = entity.x + moveX;
        if (
          moveX !== 0 &&
          newX >= 0 && newX < level.width &&
          level.map[entity.y][newX] === 0 &&
          !level.entities.some(e => e !== entity && e.x === newX && e.y === entity.y)
        ) {
          entity.x = newX;
        }
        
        // Try to move in Y direction
        const newY = entity.y + moveY;
        if (
          moveY !== 0 &&
          newY >= 0 && newY < level.height &&
          level.map[newY][entity.x] === 0 &&
          !level.entities.some(e => e !== entity && e.x === entity.x && e.y === newY)
        ) {
          entity.y = newY;
        }
      }
    }
    
    if (entity.type === 'enemy') {
        entity.damage = 2 + Math.floor(game.floor * 0.5); // Reduced base damage
      }
    
    return entity;
  });
  
  return {
    ...game,
    level: {
      ...level,
      entities: updatedEntities
    },
    player: {
      ...player
    }
  };
}
