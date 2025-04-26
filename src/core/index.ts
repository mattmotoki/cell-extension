/**
 * src/core/index.ts - Core Module Exports
 * 
 * Main entry point for the core game logic and state management.
 * Re-exports essential components from subdirectories for a clean API.
 * 
 * Key exports:
 * - Game logic functions, AI functionality, Scoring mechanisms
 * - Shared type definitions, Redux store, and settings actions
 * 
 * Provides a clean module boundary between core logic and UI.
 */

// Re-export core types
export * from './types';

// Re-export game logic - exclude ScoringMechanismId to avoid collision
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
} from './game';

// Re-export AI functionality
export * from './ai';

// Re-export scoring mechanisms
export * from './scoring';

// Re-export Redux store
export { store } from './store';
export type { RootState, AppDispatch } from './store';

// Re-export settings actions
export { 
  updateSetting,
  setAllSettings
} from './settingsSlice'; 