/**
 * src/core/ai/selectors.ts
 * 
 * Selectors for accessing the AI state slice.
 */
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../rootReducer'; // Adjust path as necessary
import { AIState } from '../types';

// Select the AI slice from the root state (assuming it's mounted as 'ai')
const selectAISlice = (state: RootState) => state.ai;

// Selectors for specific AI state properties
export const selectIsAIThinking = createSelector(
    [selectAISlice],
    (aiState: AIState) => aiState.isThinking
);

export const selectLastAICalculation = createSelector(
    [selectAISlice],
    (aiState: AIState) => aiState.lastCalculationResult
);

// Add more selectors as needed 