import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import GameBoard from '@web/components/GameBoard';
import { placeMove } from '@core';
import { renderWithProviders, createTestBoardState, addCellToBoard } from '../../../setup/testUtils';

// Mock the Redux dispatch
jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useDispatch: () => jest.fn().mockImplementation((action) => action),
}));

describe('GameBoard Component', () => {
  // Set up mock state for testing with the correct board structure
  const emptyBoardState = createTestBoardState(5, 5);
  let boardWithMoves = emptyBoardState;
  
  // Place player 0's move at (1,1)
  boardWithMoves = addCellToBoard(boardWithMoves, 0, 1, 1);
  // Place player 1's move at (2,2)
  boardWithMoves = addCellToBoard(boardWithMoves, 1, 2, 2);

  const preloadedState = {
    game: {
      boardState: boardWithMoves,
      history: [
        {
          boardState: emptyBoardState,
          currentPlayer: 0,
          scores: [0, 0],
          progress: 'pregame'
        },
        {
          boardState: addCellToBoard(emptyBoardState, 0, 1, 1), 
          currentPlayer: 1,
          scores: [1, 0],
          progress: 'playing'
        },
        {
          boardState: boardWithMoves,
          currentPlayer: 0,
          scores: [1, 1],
          progress: 'playing'
        }
      ],
      currentPlayer: 0,
      scores: [1, 1],
      progress: 'playing',
      scoreHistory1: [0, 1, 1],
      scoreHistory2: [0, 0, 1],
      scoringMechanism: 'cell-extension'
    },
    settings: {
      boardSize: '5',
      playerMode: 'user',
      firstPlayer: 'human',
      scoringMechanism: 'cell-extension',
      aiDifficulty: 'medium',
    }
  };

  it('renders the game board with correct number of cells', () => {
    renderWithProviders(<GameBoard />, { preloadedState });
    
    // With a 5x5 board, we should have 25 cells
    const cells = screen.getAllByTestId(/cell-/);
    expect(cells).toHaveLength(25);
  });

  it('displays player tokens on the board correctly', () => {
    renderWithProviders(<GameBoard />, { preloadedState });
    
    // Check that player 0's token is rendered
    const player0Cell = screen.getByTestId('cell-1-1');
    expect(player0Cell).toHaveClass('player-0');
    
    // Check that player 1's token is rendered
    const player1Cell = screen.getByTestId('cell-2-2');
    expect(player1Cell).toHaveClass('player-1');
  });

  it('handles cell click correctly when cell is empty', () => {
    const { store } = renderWithProviders(<GameBoard />, { preloadedState });
    
    // Spy on store dispatch
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    
    // Click on an empty cell
    const emptyCell = screen.getByTestId('cell-0-0');
    fireEvent.click(emptyCell);
    
    // Verify that placeMove action was dispatched with correct coordinates
    expect(dispatchSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: expect.stringContaining('game/placeMove'),
        payload: expect.objectContaining({
          coords: { gridX: 0, gridY: 0 },
        }),
      })
    );
  });

  it('does not dispatch action when clicking on an occupied cell', () => {
    const { store } = renderWithProviders(<GameBoard />, { preloadedState });
    
    // Spy on store dispatch
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    
    // Click on an occupied cell (player 0's cell)
    const occupiedCell = screen.getByTestId('cell-1-1');
    fireEvent.click(occupiedCell);
    
    // Verify that no action was dispatched
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('does not allow moves when game is not in playing state', () => {
    const nonPlayingState = {
      ...preloadedState,
      game: {
        ...preloadedState.game,
        progress: 'waiting',
      },
    };
    
    const { store } = renderWithProviders(<GameBoard />, { preloadedState: nonPlayingState });
    
    // Spy on store dispatch
    const dispatchSpy = jest.spyOn(store, 'dispatch');
    
    // Click on an empty cell
    const emptyCell = screen.getByTestId('cell-0-0');
    fireEvent.click(emptyCell);
    
    // Verify that no action was dispatched due to game not being in playing state
    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('applies correct visual styling based on game state', () => {
    renderWithProviders(<GameBoard />, { preloadedState });
    
    // The board container should have the game's progress state as a class
    const boardContainer = screen.getByTestId('game-board');
    expect(boardContainer).toHaveClass('playing');
    
    // Test with different game progress state
    const waitingState = {
      ...preloadedState,
      game: {
        ...preloadedState.game,
        progress: 'waiting',
      },
    };
    
    renderWithProviders(<GameBoard />, { preloadedState: waitingState });
    const updatedBoardContainer = screen.getByTestId('game-board');
    expect(updatedBoardContainer).toHaveClass('waiting');
  });
}); 