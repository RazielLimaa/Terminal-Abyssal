
export type GameState = 'menu' | 'playing' | 'paused' | 'gameover';

export interface Position {
  x: number;
  y: number;
}

export interface Entity extends Position {
  id: string;
  type: 'enemy' | 'item' | 'door';
  symbol: string;
  health?: number;
  damage?: number;
  state?: string;
}

export interface Player {
  position: Position;
  direction: number; // angle in radians
  health: number;
  maxHealth: number;
  weapon: string;
  damage: number;
  inventory: string[];
}

export interface Level {
  map: number[][];
  entities: Entity[];
  width: number;
  height: number;
  visited: boolean[][];
}

export interface GameData {
  player: Player;
  level: Level;
  floor: number;
  seed: number;
}