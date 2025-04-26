/**
 * src/core/game/index.ts - Game Logic Module Exports
 * 
 * Explicitly exports game logic functions and types from GameBoardLogic.
 * Ensures tree-shaking and clear documentation.
 * 
 * Serves as the public API for the game logic module.
 */

// Explicitly export all functions from GameBoardLogic.ts
export {
  // Helper Functions
  createPositionKey,
  parsePositionKey,
  isValidCoordinate,
  isCellOccupiedByPlayer,
  isCellOccupied,
  
  // Board Initialization & State
  createInitialBoardState,
  
  // Cell Placement
  placeCell,
  
  // Neighbor and Component Logic
  getAdjacentPositions,
  getAdjacentPlayerCells,
  getConnectedComponents,
  
  // Availability and Scoring
  getAvailableCells,
  getTotalCellCount,
  isGameOver,
  
  // Scoring
  calculateScore
} from './GameBoardLogic';

// Properly export types
export type { ScoringMechanismId } from './GameBoardLogic'; 