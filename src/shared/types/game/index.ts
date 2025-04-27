/**
 * src/shared/types/game/index.ts
 * 
 * Core game TypeScript types and interfaces for the Cell Extension game.
 * These define the fundamental structures of the game board, cells, players, and moves.
 */

// Players in the game (1 or 2)
export enum PlayerIndex {
  PLAYER_1 = 1,
  PLAYER_2 = 2
}

// Represents a position on the game board
export interface Coordinates {
  x: number;
  y: number;
}

// Board dimensions
export interface BoardSize {
  width: number;
  height: number;
}

// Maps coordinates to player who occupies them
export type OccupiedCells = Record<string, PlayerIndex>;

// Direction for cell connections and extensions
export enum Direction {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right',
  UP_LEFT = 'up-left',
  UP_RIGHT = 'up-right',
  DOWN_LEFT = 'down-left',
  DOWN_RIGHT = 'down-right'
}

// Represents a cell connection between two points
export interface CellConnection {
  from: Coordinates;
  to: Coordinates;
  player: PlayerIndex;
}

// Represents a potential extension from an existing cell
export interface CellExtension {
  from: Coordinates;
  direction: Direction;
  player: PlayerIndex;
}

// Serializes coordinates for storage in maps/objects
export function serializeCoordinates(coords: Coordinates): string {
  return `${coords.x},${coords.y}`;
}

// Deserializes string back to coordinates
export function deserializeCoordinates(serialized: string): Coordinates {
  const [x, y] = serialized.split(',').map(Number);
  return { x, y };
}

// Gets the coordinates of adjacent cells in all directions
export function getAdjacentCoordinates(coord: Coordinates): Record<Direction, Coordinates> {
  const result: Record<string, Coordinates> = {
    [Direction.UP]: { x: coord.x, y: coord.y - 1 },
    [Direction.DOWN]: { x: coord.x, y: coord.y + 1 },
    [Direction.LEFT]: { x: coord.x - 1, y: coord.y },
    [Direction.RIGHT]: { x: coord.x + 1, y: coord.y },
    [Direction.UP_LEFT]: { x: coord.x - 1, y: coord.y - 1 },
    [Direction.UP_RIGHT]: { x: coord.x + 1, y: coord.y - 1 },
    [Direction.DOWN_LEFT]: { x: coord.x - 1, y: coord.y + 1 },
    [Direction.DOWN_RIGHT]: { x: coord.x + 1, y: coord.y + 1 }
  };
  return result as Record<Direction, Coordinates>;
}

// Check if coordinates are within board boundaries
export function isWithinBounds(coords: Coordinates, boardSize: BoardSize): boolean {
  return (
    coords.x >= 0 && 
    coords.x < boardSize.width && 
    coords.y >= 0 && 
    coords.y < boardSize.height
  );
}

// Check if two coordinates are adjacent
export function areCoordinatesAdjacent(a: Coordinates, b: Coordinates): boolean {
  const xDiff = Math.abs(a.x - b.x);
  const yDiff = Math.abs(a.y - b.y);
  return (xDiff <= 1 && yDiff <= 1) && !(xDiff === 0 && yDiff === 0);
}

// Get the opposite player
export function getOpponent(player: PlayerIndex): PlayerIndex {
  return player === PlayerIndex.PLAYER_1 ? PlayerIndex.PLAYER_2 : PlayerIndex.PLAYER_1;
}

// Possible scoring mechanisms in the game
export type ScoringMechanism = 'cell-multiplication' | 'cell-connection' | 'cell-extension';

// Possible AI difficulty levels
export type AIDifficulty = 'easy' | 'medium' | 'hard';

// Player modes (human vs. human, human vs. AI, or AI vs. AI)
export type PlayerMode = 'human-vs-human' | 'human-vs-ai' | 'ai-vs-ai';

// First player types
export type FirstPlayer = 'human' | 'ai';

// Board size options
export type BoardSizeOption = '4' | '6' | '10' | '16';

// Represents a move in the game
export interface GameMove {
  coordinates: Coordinates;
  player: PlayerIndex;
  timestamp?: number;
  isPossibleMove?: boolean;
}

// Represents a cell on the game board
export interface Cell {
  coordinates: Coordinates;
  occupiedBy?: PlayerIndex;
  isLatestMove?: boolean;
  isPossibleMove?: boolean;
}

// Represents the score for each player
export interface GameScore {
  [PlayerIndex.PLAYER_1]: number;
  [PlayerIndex.PLAYER_2]: number;
}

// Define PlayerScores for exports required by other modules
export type PlayerScores = [number, number];

// Define Move type for exports required by other modules
export type Move = {
  coordinates: Coordinates;
  player: PlayerIndex;
  timestamp: number;
};

// Direction vectors for checking connections (horizontal, vertical, diagonal)
export type DirectionVector = [number, number];
export const DIRECTIONS: DirectionVector[] = [
  [-1, 0],  // Up
  [1, 0],   // Down
  [0, -1],  // Left
  [0, 1],   // Right
  [-1, -1], // Up-Left
  [-1, 1],  // Up-Right
  [1, -1],  // Down-Left
  [1, 1]    // Down-Right
]; 