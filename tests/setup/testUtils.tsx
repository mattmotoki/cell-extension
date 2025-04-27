import React, { PropsWithChildren } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import type { RootState } from '@core'
import { gameReducer, settingsReducer } from '@core'

// Create a custom render function that includes Redux provider
interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>
}

export function renderWithProviders(
  ui: React.ReactElement,
  {
    preloadedState = {},
    // Automatically create a store instance if no store was passed in
    store = configureStore({
      reducer: {
        game: gameReducer,
        settings: settingsReducer,
      },
      preloadedState,
    }),
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  function Wrapper({ children }: PropsWithChildren<{}>): JSX.Element {
    return <Provider store={store}>{children}</Provider>
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) }
}

// Mock store helper - uses actual reducers
export function createMockStore(preloadedState: Partial<RootState> = {}) {
  return configureStore({
    reducer: {
      game: gameReducer,
      settings: settingsReducer,
    },
    preloadedState,
  })
}

// Common test data - matching the current implementation's structure
export const defaultGameState = {
  boardState: {
    gridWidth: 5,
    gridHeight: 5,
    occupiedCells: [{}, {}] // Empty cells for both players
  },
  history: [{
    boardState: {
      gridWidth: 5,
      gridHeight: 5,
      occupiedCells: [{}, {}]
    },
    currentPlayer: 0,
    scores: [0, 0],
    progress: 'pregame'
  }],
  currentPlayer: 0,
  scores: [0, 0],
  progress: 'pregame',
  scoreHistory1: [0],
  scoreHistory2: [0],
  scoringMechanism: 'cell-extension'
}

export const defaultSettings = {
  boardSize: '5',
  playerMode: 'user',
  firstPlayer: 'human',
  scoringMechanism: 'cell-extension',
  aiDifficulty: 'medium',
}

// Helper to create a test board state with occupied cells
export function createTestBoardState(width = 5, height = 5, occupiedCells = [{}, {}]) {
  return {
    gridWidth: width,
    gridHeight: height,
    occupiedCells
  };
}

// Helper to add a cell to the board state for a specific player
export function addCellToBoard(boardState, player, x, y) {
  const occupiedCells = [
    { ...boardState.occupiedCells[0] },
    { ...boardState.occupiedCells[1] }
  ];
  
  const key = `${x},${y}`;
  occupiedCells[player][key] = { gridX: x, gridY: y };
  
  return {
    ...boardState,
    occupiedCells
  };
} 