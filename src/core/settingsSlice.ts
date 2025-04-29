/**
 * src/core/settingsSlice.ts - Game Settings Redux Slice
 * 
 * Redux Toolkit slice managing game settings state.
 * Defines structure and updates for options like difficulty, board size, etc.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameSettings } from './types';

const initialState: GameSettings = {
  playerMode: 'ai',
  firstPlayer: 'human',
  scoringMechanism: 'cell-multiplication',
  aiDifficulty: 'medium',
  boardSize: '6',
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateSetting: <K extends keyof GameSettings>(state: GameSettings, action: PayloadAction<{ key: K; value: GameSettings[K] }>) => {
      const { key, value } = action.payload;
      state[key] = value;
    },
    setAllSettings: (state, action: PayloadAction<GameSettings>) => {
      // Replace the entire settings object - useful for reset
      return action.payload;
    }
  },
});

export const { updateSetting, setAllSettings } = settingsSlice.actions;
export default settingsSlice.reducer; 