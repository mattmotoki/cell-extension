/**
 * src/core/ai/aiSlice.ts
 * 
 * Redux slice for managing AI-related state (e.g., thinking status).
 */
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AIState, AICalculationResult } from '../types';

const initialState: AIState = {
  isThinking: false,
  lastCalculationResult: undefined,
};

const aiSlice = createSlice({
  name: 'ai',
  initialState,
  reducers: {
    setAIThinking: (state, action: PayloadAction<boolean>) => {
      state.isThinking = action.payload;
      if (action.payload) {
        // Optionally clear last result when starting
        state.lastCalculationResult = undefined;
      }
    },
    setLastCalculation: (state, action: PayloadAction<AICalculationResult>) => {
      state.lastCalculationResult = action.payload;
      state.isThinking = false; // Assume thinking stops when result is set
    },
  },
});

export const { setAIThinking, setLastCalculation } = aiSlice.actions;
export default aiSlice.reducer; 