/**
 * src/core/scoring/index.ts - Scoring Mechanisms Module
 * 
 * Exports the different scoring calculation functions:
 * - getMultiplicationScore
 * - getConnectionScore
 * - getExtensionScore
 * 
 * Centralizes access to scoring implementations.
 */

// Explicitly export all scoring mechanism functions
export { getMultiplicationScore } from './multiplication';
export { getConnectionScore } from './connection';
export { getExtensionScore } from './extension'; 