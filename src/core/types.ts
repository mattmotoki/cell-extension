/**
 * src/types.ts
 * 
 * Shared TypeScript types and interfaces for the Cell Production game.
 */

// Represents a player index (0 or 1)
export type PlayerIndex = 0 | 1;

// Represents grid coordinates
export interface Coordinates {
  gridX: number;
  gridY: number;
}

// Represents the state of occupied cells for both players
// Using a Record for efficient lookups (maps string key "x-y" to boolean)
export type OccupiedCellsMap = Record<string, boolean>;
export type OccupiedCells = [OccupiedCellsMap, OccupiedCellsMap]; // Index 0 for Player 0, Index 1 for Player 1

// Represents the logical state of the game board
export interface BoardState {
  occupiedCells: OccupiedCells;
  gridWidth: number;
  gridHeight: number;
}

// Represents a connected component as an array of position keys ("x-y")
export type Component = string[];

// Represents the current progress of the game
export type GameProgress = 'playing' | 'waiting' | 'over'; // 'waiting' for AI

// Represents a single entry in the game history for undo
export interface HistoryEntry {
  boardState: BoardState;
  scores: [number, number];
  currentPlayer: PlayerIndex;
  progress: GameProgress; // Store progress to handle undo correctly during AI move
  // Add score history if needed for undo, though recalculating might be simpler
}

// Represents the complete state of the game logic
export interface GameState {
  boardState: BoardState;
  scores: [number, number];
  currentPlayer: PlayerIndex;
  progress: GameProgress;
  scoreHistory1: number[];
  scoreHistory2: number[];
  scoringMechanism: ScoringMechanismId; // Use the type from GameBoardLogic.ts
  history: HistoryEntry[];
  // Potentially add AI difficulty, player mode if logic depends on them
}

// Define settings types directly here or import from App/GameSettingsPanel if preferred
type PlayerMode = 'ai' | 'user';
type FirstPlayer = 'human' | 'ai';
export type ScoringMechanismId = 'cell-multiplication' | 'cell-connection' | 'cell-extension';
type AiDifficulty = 'easy' | 'hard';
type BoardSize = '4' | '6' | '10' | '16';

export interface GameSettings {
  playerMode: PlayerMode;
  firstPlayer: FirstPlayer;
  scoringMechanism: ScoringMechanismId;
  aiDifficulty: AiDifficulty;
  boardSize: BoardSize;
}

// Add action types if using useReducer

// Add AI-related types if needed

// Add more types as needed (e.g., GameState, Settings, HistoryEntry) 