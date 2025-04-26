/**
 * src/core/ai/index.ts - AI Module Exports
 * 
 * Explicitly exports AI logic components (getAIMove, evaluateBoard).
 * Provides a clean interface to AI functionality, encapsulating implementation details.
 */

// Export main AI function used by the application
export { getAIMove } from './aiLogic';

// Export board evaluation function (used internally by minimax but may be useful elsewhere)
export { evaluateBoard } from './evaluateBoard';