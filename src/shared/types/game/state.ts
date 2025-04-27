/**
 * src/shared/types/game/state.ts
 * 
 * Game state-related TypeScript types and interfaces for the Cell Extension game.
 * These define the structure of the game state, settings, and history.
 */

import { 
  PlayerIndex, 
  Coordinates, 
  AIDifficulty, 
  PlayerMode, 
  BoardSizeOption, 
  Move, 
  OccupiedCells, 
  PlayerScores,
  ScoringMechanism
} from './index';

// Game status states
export type GameStatus = 'waiting' | 'playing' | 'paused' | 'over';

// Game winner can be a player or a draw
export type GameWinner = PlayerIndex | 'draw' | null;

// Board configuration
export interface BoardConfig {
  rows: number;
  cols: number;
  size: BoardSizeOption;
}

// Game settings
export interface GameSettings {
  boardConfig: BoardConfig;
  playerMode: PlayerMode;
  aiDifficulty: AIDifficulty;
  scoringMechanism: ScoringMechanism;
  aiDelay: number;
  showPossibleMoves: boolean;
  allowUndo: boolean;
}

// Game state
export interface GameState {
  status: GameStatus;
  currentPlayer: PlayerIndex;
  winner: GameWinner;
  occupiedCells: OccupiedCells;
  moves: Move[];
  scores: PlayerScores;
  isAIThinking: boolean;
  possibleMoves: Coordinates[];
}

// Full game data representation
export interface GameData {
  settings: GameSettings;
  state: GameState;
}

// Action types for updating game state
export enum GameActionType {
  INITIALIZE_GAME = 'INITIALIZE_GAME',
  MAKE_MOVE = 'MAKE_MOVE',
  UNDO_MOVE = 'UNDO_MOVE',
  SET_AI_THINKING = 'SET_AI_THINKING',
  SET_GAME_STATUS = 'SET_GAME_STATUS',
  SET_WINNER = 'SET_WINNER',
  UPDATE_SETTINGS = 'UPDATE_SETTINGS',
  RESET_GAME = 'RESET_GAME'
}

// Player statistics
export interface PlayerStats {
  wins: number;
  losses: number;
  draws: number;
  highestScore: number;
  totalMoves: number;
  averageMovesPerGame: number;
}

// Game history item
export interface GameHistoryItem {
  id: string;
  date: Date;
  settings: GameSettings;
  winner: GameWinner;
  finalScores: PlayerScores;
  totalMoves: number;
  duration: number; // in seconds
} 