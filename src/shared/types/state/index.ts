/**
 * src/shared/types/state/index.ts
 * 
 * Shared state-related TypeScript types and interfaces for the Cell Extension game.
 * These types define the game state that needs to be tracked across platforms.
 */

import { 
  PlayerIndex, 
  Coordinates, 
  OccupiedCells, 
  ScoringMechanism, 
  PlayerMode, 
  FirstPlayer, 
  AIDifficulty, 
  BoardSizeOption 
} from '../game';

// Represents the logical state of the game board
export interface BoardState {
  occupiedCells: OccupiedCells;
  width: number;
  height: number;
  turn: PlayerIndex;
  scores: [number, number]; // Index 0 for Player 0, Index 1 for Player 1
  latestMove?: Coordinates;
}

// Represents the current progress of the game
export type GameProgress = 'pregame' | 'playing' | 'waiting' | 'over';

// Represents a single entry in the game history (for undo)
export interface HistoryEntry {
  boardState: BoardState;
  playerModeState: [PlayerMode, PlayerMode]; // Index 0 for Player 0, Index 1 for Player 1
}

// Represents the complete state of the game logic
export interface GameState {
  boardState: BoardState;
  gameProgress: GameProgress;
  winner: PlayerIndex | null;
  history: HistoryEntry[];
  playerModeState: [PlayerMode, PlayerMode]; // Index 0 for Player 0, Index 1 for Player 1
}

// Represents game settings
export interface GameSettings {
  playerMode: PlayerMode;
  firstPlayer: FirstPlayer;
  scoringMechanism: ScoringMechanism;
  aiDifficulty: AIDifficulty;
  boardSize: BoardSizeOption;
} 