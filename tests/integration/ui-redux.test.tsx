import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../setup/testUtils';
import App from '../../src/App';
import { placeMove } from '@core';

describe('UI-Redux Integration Tests', () => {
  it('should update game state when a cell is clicked', () => {
    const { store } = renderWithProviders(<App />);
    
    // Initial state should have player 0 as current player
    expect(store.getState().game.currentPlayer).toBe(0);
    
    // Find an empty cell and click it (assuming board is rendered)
    const cellElement = screen.getByTestId('cell-0-0');
    fireEvent.click(cellElement);
    
    // After click, game state should be updated:
    // - Board state should show player 0's move at (0,0)
    // - Current player should switch to player 1
    // - Move should be added to history
    const gameState = store.getState().game;
    expect(gameState.boardState[0][0]).toBe(0);
    expect(gameState.currentPlayer).toBe(1);
    expect(gameState.moveHistory).toHaveLength(1);
    expect(gameState.moveHistory[0]).toEqual({ gridX: 0, gridY: 0, player: 0 });
  });

  it('should allow undo action from UI', () => {
    // Start with a game that has a move already
    const initialState = {
      game: {
        boardState: [
          [0, null, null, null, null],
          [null, null, null, null, null],
          [null, null, null, null, null],
          [null, null, null, null, null],
          [null, null, null, null, null],
        ],
        moveHistory: [{ gridX: 0, gridY: 0, player: 0 }],
        currentPlayer: 1,
        scores: [1, 0],
        progress: 'playing',
      },
      settings: {
        boardSize: 5,
        playerMode: 'human',
        firstPlayer: 0,
        scoringMechanism: 'cell-extension',
        aiDifficulty: 'medium',
      }
    };
    
    const { store } = renderWithProviders(<App />, { preloadedState: initialState });
    
    // Click the undo button
    const undoButton = screen.getByRole('button', { name: /undo/i });
    fireEvent.click(undoButton);
    
    // After undo, game state should be reset:
    // - Board state should be empty
    // - Current player should be back to player 0
    // - Move history should be empty
    const gameState = store.getState().game;
    expect(gameState.boardState[0][0]).toBeNull();
    expect(gameState.currentPlayer).toBe(0);
    expect(gameState.moveHistory).toHaveLength(0);
  });

  it('should reset the game when the reset button is clicked', () => {
    // Start with a game in progress
    const initialState = {
      game: {
        boardState: [
          [0, 1, null, null, null],
          [null, 0, null, null, null],
          [null, null, 1, null, null],
          [null, null, null, null, null],
          [null, null, null, null, null],
        ],
        moveHistory: [
          { gridX: 0, gridY: 0, player: 0 },
          { gridX: 1, gridY: 0, player: 1 },
          { gridX: 1, gridY: 1, player: 0 },
          { gridX: 2, gridY: 2, player: 1 },
        ],
        currentPlayer: 0,
        scores: [2, 2],
        progress: 'playing',
      },
      settings: {
        boardSize: 5,
        playerMode: 'human',
        firstPlayer: 0,
        scoringMechanism: 'cell-extension',
        aiDifficulty: 'medium',
      }
    };
    
    const { store } = renderWithProviders(<App />, { preloadedState: initialState });
    
    // Click the reset button
    const resetButton = screen.getByRole('button', { name: /reset/i });
    fireEvent.click(resetButton);
    
    // After reset, game state should be reset:
    // - Board state should be empty
    // - Current player should be the first player (0)
    // - Move history should be empty
    // - Scores should be reset to [0, 0]
    const gameState = store.getState().game;
    
    // Check that the board is empty
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        expect(gameState.boardState[y][x]).toBeNull();
      }
    }
    
    expect(gameState.currentPlayer).toBe(0);
    expect(gameState.moveHistory).toHaveLength(0);
    expect(gameState.scores).toEqual([0, 0]);
  });

  it('should not allow moves when game is in waiting state', () => {
    // Start with a game in 'waiting' state
    const initialState = {
      game: {
        boardState: [
          [0, 1, null, null, null],
          [null, 0, null, null, null],
          [null, null, 1, null, null],
          [null, null, null, null, null],
          [null, null, null, null, null],
        ],
        moveHistory: [
          { gridX: 0, gridY: 0, player: 0 },
          { gridX: 1, gridY: 0, player: 1 },
          { gridX: 1, gridY: 1, player: 0 },
          { gridX: 2, gridY: 2, player: 1 },
        ],
        currentPlayer: 0,
        scores: [2, 2],
        progress: 'waiting', // Game is waiting
      },
      settings: {
        boardSize: 5,
        playerMode: 'human',
        firstPlayer: 0,
        scoringMechanism: 'cell-extension',
        aiDifficulty: 'medium',
      }
    };
    
    const { store } = renderWithProviders(<App />, { preloadedState: initialState });
    const initialStateSnapshot = JSON.stringify(store.getState());
    
    // Try to click on an empty cell
    const emptyCell = screen.getByTestId('cell-2-0');
    fireEvent.click(emptyCell);
    
    // State should not change
    const currentStateSnapshot = JSON.stringify(store.getState());
    expect(currentStateSnapshot).toBe(initialStateSnapshot);
  });

  it('should update settings when settings panel is used', () => {
    const { store } = renderWithProviders(<App />);
    
    // Open settings panel
    const menuButton = screen.getByLabelText(/menu/i) || screen.getByRole('button', { name: /settings/i });
    fireEvent.click(menuButton);
    
    // Find a settings control (e.g. difficulty selector)
    const difficultySelect = screen.getByLabelText(/difficulty/i);
    fireEvent.change(difficultySelect, { target: { value: 'hard' } });
    
    // Check if the setting was updated in the store
    expect(store.getState().settings.aiDifficulty).toBe('hard');
  });

  it('should handle player mode toggle correctly', () => {
    const { store } = renderWithProviders(<App />);
    
    // Open settings panel
    const menuButton = screen.getByLabelText(/menu/i) || screen.getByRole('button', { name: /settings/i });
    fireEvent.click(menuButton);
    
    // Find player mode toggle and switch to AI
    const playerModeSelect = screen.getByLabelText(/player mode/i);
    fireEvent.change(playerModeSelect, { target: { value: 'ai' } });
    
    // Check if the setting was updated
    expect(store.getState().settings.playerMode).toBe('ai');
    
    // Game should reset after changing player mode
    const gameState = store.getState().game;
    
    // Board should be empty
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        expect(gameState.boardState[y][x]).toBeNull();
      }
    }
    
    expect(gameState.moveHistory).toHaveLength(0);
  });
}); 