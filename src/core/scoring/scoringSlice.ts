/**
 * src/core/scoring/scoringSlice.ts
 * 
 * Redux slice for managing scoring-related state (if necessary).
 * Currently, scoring is calculated directly, so this might be empty
 * or used for future features like highlighting scoring components.
 */
import { createSlice } from '@reduxjs/toolkit';

// Define scoring state interface if needed
interface ScoringState {
  // Example: highlightedComponentKeys: string[] | null;
}

const initialState: ScoringState = {
  // highlightedComponentKeys: null,
};

const scoringSlice = createSlice({
  name: 'scoring',
  initialState,
  reducers: {
    // Add reducers if scoring state needs to be managed
    // Example:
    // setHighlightedComponent: (state, action: PayloadAction<string[] | null>) => {
    //   state.highlightedComponentKeys = action.payload;
    // },
  },
});

// Export actions if any
// export const { setHighlightedComponent } = scoringSlice.actions;
export default scoringSlice.reducer; 