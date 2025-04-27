/**
 * src/core/scoring/selectors.ts
 * 
 * Selectors for accessing the scoring state slice (if state is managed).
 */
import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../rootReducer'; // Adjust path as necessary

// Select the scoring slice (assuming it might be added to RootState later)
// const selectScoringSlice = (state: RootState) => state.scoring; // Uncomment if used

// Example selector if state exists:
// export const selectHighlightedComponent = createSelector(
//     [selectScoringSlice],
//     (scoringState) => scoringState.highlightedComponentKeys
// );

// Add more selectors if scoring state is implemented 