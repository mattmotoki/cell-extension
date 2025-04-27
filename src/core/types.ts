/**
 * src/core/types.ts - Core Type Definitions
 *
 * Central repository of shared TypeScript types and interfaces for the core logic.
 * Provides a single source of truth for data structures used across the core modules
 * (game, ai, scoring, state).
 */

// ==================================
// Fundamental Types
// ==================================

// Represents a player index (0 for Player 1, 1 for Player 2)
export type PlayerIndex = 0 | 1;

// Represents grid coordinates
export interface Coordinates {
  gridX: number;
  gridY: number;
}

// Board dimensions (interface for width/height representation)
export interface BoardSize {
  width: number;
  height: number;
}

// Board size options (string literal type for settings)
export type BoardSizeOption = '4' | '6' | '10' | '16';

// Represents the state of occupied cells for both players
// Using a Record for efficient lookups (maps string key "x-y" to boolean)
export type OccupiedCellsMap = Record<string, boolean>;
export type OccupiedCells = [OccupiedCellsMap, OccupiedCellsMap]; // Index 0 for Player 0, Index 1 for Player 1

// Direction enum for cell connections and extensions
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

// Direction vectors (used in some logic, e.g., scoring, connections)
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

// Represents a connected component as an array of position keys ("x-y")
export type Component = string[];

// ==================================
// Game State & History
// ==================================

// Represents the logical state of the game board
export interface BoardState {
  occupiedCells: OccupiedCells;
  gridWidth: number;
  gridHeight: number;
}

// Represents the current progress of the game
export type GameProgress = 'pregame' | 'playing' | 'waiting' | 'over'; // 'waiting' used for AI thinking time

// Represents a single entry in the game history for undo
export interface HistoryEntry {
  boardState: BoardState;
  scores: [number, number];
  currentPlayer: PlayerIndex;
  progress: GameProgress; // Store progress to handle undo correctly during AI move
}

// Represents the complete state slice managed by gameSlice.ts
export interface GameState {
  boardState: BoardState;
  scores: [number, number];
  currentPlayer: PlayerIndex;
  progress: GameProgress;
  scoreHistory1: number[]; // History for Player 1 score chart
  scoreHistory2: number[]; // History for Player 2 score chart
  scoringMechanism: ScoringMechanism; // Current scoring mechanism
  history: HistoryEntry[]; // Undo history stack
}

// ==================================
// Game Settings
// ==================================

export type PlayerMode = 'ai' | 'user'; // 'ai' for Human vs AI, 'user' for Human vs Human
export type FirstPlayer = 'human' | 'ai'; // Who goes first
export type ScoringMechanism = 'cell-multiplication' | 'cell-connection' | 'cell-extension';
export type AIDifficulty = 'easy' | 'hard'; // AI difficulty levels

// Represents the game settings slice managed by settingsSlice.ts
export interface GameSettings {
  playerMode: PlayerMode;
  firstPlayer: FirstPlayer;
  scoringMechanism: ScoringMechanism;
  aiDifficulty: AIDifficulty;
  boardSize: BoardSizeOption; // Use the string option type for settings
}

// ==================================
// AI Specific Types
// ==================================

// AI Evaluation scores from evaluateBoard function
export interface EvaluationScores {
  playerScore: number;
  opponentScore: number;
  totalScore: number; // Often player score - opponent score + heuristics
}

// Potential weights for different AI strategies (example, might not be used directly in state)
export interface DifficultyWeights {
  territorial: number;
  greedy: number;
  strategic: number;
  minimax: number;
}

// Different move calculation strategies the AI might employ
export enum MoveStrategy {
  RANDOM = 'random',
  GREEDY = 'greedy',
  TERRITORIAL = 'territorial',
  MINIMAX = 'minimax',
  HYBRID = 'hybrid' // Potentially a mix based on game phase
}

// Settings specific to the Minimax algorithm
export interface MinimaxSettings {
  maxDepth: number;
  useAlphaBeta: boolean;
  evaluationTimeoutMs?: number; // Optional timeout
}

// Represents the result returned by the main AI move calculation function
export interface AICalculationResult {
  move: Coordinates | null; // The calculated move, or null if none found
  strategy?: MoveStrategy; // Strategy used (optional logging/analysis)
  score?: number; // Evaluation score of the move (optional logging/analysis)
  evaluationTime?: number; // Time taken (optional logging/analysis)
  nodesEvaluated?: number; // Nodes evaluated in search (optional logging/analysis)
}

// Represents potential configuration options for the AI
export interface AIConfig {
  difficultyWeights?: DifficultyWeights; // Optional configuration
  minimaxSettings?: MinimaxSettings; // Optional configuration
  randomMoveProbability?: number; // Optional configuration
  // Add other potential configuration parameters
}

// Function signature for a board evaluation function used by AI
export type BoardEvaluationFunction = (
  boardState: BoardState,
  playerIndex: PlayerIndex,
  scoringMechanism: ScoringMechanism
) => number; // Returns a single score relative to the playerIndex

// Function signature for the main AI move calculation logic
export type AIMoveCalculationFunction = (
  gameState: GameState, // Pass full GameState for context if needed
  settings: GameSettings
) => Coordinates | null; // Return the chosen move

// Potential metrics for tracking AI performance (example)
export interface AIPerformanceMetrics {
  averageCalculationTime: number;
  strategiesUsed: Record<MoveStrategy, number>;
  // Add other relevant metrics
}

// Placeholder for potential AI state slice if needed (e.g., tracking thinking status)
export interface AIState {
    isThinking: boolean;
    lastCalculationResult?: AICalculationResult;
}

// ==================================
// Helper Functions (Potentially move to utils later)
// ==================================

// Serializes coordinates for storage in maps/objects
export function serializeCoordinates(coords: Coordinates): string {
  // Use gridX/gridY consistent with Coordinates interface
  return `${coords.gridX}-${coords.gridY}`;
}

// Deserializes string back to coordinates
export function deserializeCoordinates(serialized: string): Coordinates {
  const [gridX, gridY] = serialized.split('-').map(Number);
  return { gridX, gridY };
}

// Gets the coordinates of adjacent cells in all directions
export function getAdjacentCoordinates(coord: Coordinates): Record<Direction, Coordinates> {
  const result: Record<string, Coordinates> = {
    [Direction.UP]: { gridX: coord.gridX, gridY: coord.gridY - 1 },
    [Direction.DOWN]: { gridX: coord.gridX, gridY: coord.gridY + 1 },
    [Direction.LEFT]: { gridX: coord.gridX - 1, gridY: coord.gridY },
    [Direction.RIGHT]: { gridX: coord.gridX + 1, gridY: coord.gridY },
    [Direction.UP_LEFT]: { gridX: coord.gridX - 1, gridY: coord.gridY - 1 },
    [Direction.UP_RIGHT]: { gridX: coord.gridX + 1, gridY: coord.gridY - 1 },
    [Direction.DOWN_LEFT]: { gridX: coord.gridX - 1, gridY: coord.gridY + 1 },
    [Direction.DOWN_RIGHT]: { gridX: coord.gridX + 1, gridY: coord.gridY + 1 }
  };
  // Use type assertion as TypeScript cannot guarantee all enum keys are present dynamically
  return result as Record<Direction, Coordinates>;
}

// Check if coordinates are within board boundaries using BoardState dimensions
export function isWithinBounds(coords: Coordinates, boardState: BoardState): boolean {
  return (
    coords.gridX >= 0 &&
    coords.gridX < boardState.gridWidth &&
    coords.gridY >= 0 &&
    coords.gridY < boardState.gridHeight
  );
}

// Check if two coordinates are adjacent (diagonals included)
export function areCoordinatesAdjacent(a: Coordinates, b: Coordinates): boolean {
  const xDiff = Math.abs(a.gridX - b.gridX);
  const yDiff = Math.abs(a.gridY - b.gridY);
  // Adjacent if diff is 0 or 1 in both axes, but not the same cell
  return (xDiff <= 1 && yDiff <= 1) && !(xDiff === 0 && yDiff === 0);
}

// Get the opposite player index
export function getOpponent(player: PlayerIndex): PlayerIndex {
  return player === 0 ? 1 : 0;
} 