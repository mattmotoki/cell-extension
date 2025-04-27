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

// Mock store helper
export function createMockStore(preloadedState: Partial<RootState> = {}) {
  return configureStore({
    reducer: {
      game: gameReducer,
      settings: settingsReducer,
    },
    preloadedState,
  })
}

// Common test data
export const defaultGameState = {
  boardState: Array(5).fill(Array(5).fill(null)),
  moveHistory: [],
  currentPlayer: 0,
  scores: [0, 0],
  progress: 'pregame',
}

export const defaultSettings = {
  boardSize: 5,
  playerMode: 'human',
  firstPlayer: 0,
  scoringMechanism: 'cell-extension',
  aiDifficulty: 'medium',
} 