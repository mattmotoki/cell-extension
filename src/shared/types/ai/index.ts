/**
 * src/shared/types/ai/index.ts
 * 
 * AI-related TypeScript types and interfaces for the Cell Extension game.
 * These define the structure of AI evaluation functions, strategies, and move calculation.
 */

import { 
  PlayerIndex, 
  Coordinates, 
  BoardSize, 
  OccupiedCells 
} from '../game';

// AI Evaluation scores
export interface EvaluationScores {
  playerScore: number;
  opponentScore: number;
  totalScore: number;
}

// AI Difficulty weights
export interface DifficultyWeights {
  territorial: number;
  greedy: number;
  strategic: number;
  minimax: number;
}

// Different move calculation strategies
export enum MoveStrategy {
  RANDOM = 'random',
  GREEDY = 'greedy',
  TERRITORIAL = 'territorial',
  MINIMAX = 'minimax',
  HYBRID = 'hybrid'
}

// Settings for AI Minimax algorithm
export interface MinimaxSettings {
  maxDepth: number;
  useAlphaBeta: boolean;
  evaluationTimeoutMs: number;
}

// Results from the AI move calculation
export interface AICalculationResult {
  move: Coordinates | null;
  strategy: MoveStrategy;
  score: number;
  evaluationTime: number;
  nodesEvaluated?: number;
}

// Configuration for AI behavior
export interface AIConfig {
  difficultyWeights: DifficultyWeights;
  minimaxSettings: MinimaxSettings;
  randomMoveProbability: number;
  territorialThreshold: number;
  strategicThreshold: number;
}

// Function signatures for AI logic
export type BoardEvaluationFunction = (
  occupiedCells: OccupiedCells,
  boardSize: BoardSize,
  player: PlayerIndex
) => EvaluationScores;

export type MoveCalculationFunction = (
  occupiedCells: OccupiedCells,
  boardSize: BoardSize,
  player: PlayerIndex,
  availableMoves: Coordinates[]
) => AICalculationResult;

// AI performance metrics
export interface AIPerformanceMetrics {
  averageCalculationTime: number;
  strategiesUsed: Record<MoveStrategy, number>;
  winRateByStrategy: Record<MoveStrategy, number>;
  nodesEvaluatedAverage: number;
} 