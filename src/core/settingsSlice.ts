import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameSettings } from './types';

const initialState: GameSettings = {
  playerMode: 'ai',
  firstPlayer: 'human',
  scoringMechanism: 'cell-multiplication',
  aiDifficulty: 'easy',
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