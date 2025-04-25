/**
 * index.js - Main Entry Point for the Board Logic Module
 * 
 * This file re-exports all components from the board directory,
 * allowing imports to be made from the top level board module.
 * This pattern simplifies imports and decouples component dependencies.
 * 
 * Relationships:
 * - Exports GameBoardLogic for use by Game.js and other components
 * - Serves as the public API for the board logic module
 * 
 * Revision Log:
 * 
 * Note: This revision log should be updated whenever this file is modified.
 */

// Export all functions from GameBoardLogic.ts
export * from './GameBoardLogic'; 

// We could also explicitly list them if preferred:
// export {
//   createInitialBoardState,
//   placeCell,
//   // ... other functions
// } from './GameBoardLogic'; 