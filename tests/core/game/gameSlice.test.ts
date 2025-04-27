import {
  gameReducer,
  placeMove,
  undoMove,
  resetGame,
  setProgress,
  GameState
} from '@core';
import { Coordinates, GameSettings } from '@core';

describe('gameSlice reducer', () => {
  const initialState: GameState = {
    boardState: Array(5).fill(Array(5).fill(null)),
    moveHistory: [],
    currentPlayer: 0,
    scores: [0, 0],
    progress: 'pregame',
  };

  const defaultSettings: GameSettings = {
    boardSize: 5,
    playerMode: 'human',
    firstPlayer: 0,
    scoringMechanism: 'cell-extension',
    aiDifficulty: 'medium',
  };

  it('should return the initial state', () => {
    expect(gameReducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('should handle setProgress action', () => {
    const nextState = gameReducer(initialState, setProgress('playing'));
    expect(nextState.progress).toBe('playing');
  });

  it('should handle resetGame action', () => {
    // Create a non-initial state
    const modifiedState: GameState = {
      ...initialState,
      currentPlayer: 1,
      scores: [5, 3],
      moveHistory: [{ gridX: 1, gridY: 1, player: 0 }],
      progress: 'playing',
    };
    
    // Deep copy the board state and modify it
    const boardStateCopy = JSON.parse(JSON.stringify(initialState.boardState));
    boardStateCopy[1][1] = 0; // Player 0 placed a move here
    modifiedState.boardState = boardStateCopy;

    // Reset should return to initial state but respecting firstPlayer setting
    const customSettings = { ...defaultSettings, firstPlayer: 1 };
    const nextState = gameReducer(modifiedState, resetGame(customSettings));
    
    expect(nextState).toEqual({
      ...initialState,
      currentPlayer: 1, // Should be set to firstPlayer from settings
    });
  });

  it('should handle placeMove action', () => {
    const coords: Coordinates = { gridX: 2, gridY: 3 };
    const nextState = gameReducer(initialState, placeMove({ coords, settings: defaultSettings }));
    
    // Board should have the player's move at the specified coordinates
    expect(nextState.boardState[3][2]).toBe(0); // Should be current player (0)
    
    // Current player should switch to the next player
    expect(nextState.currentPlayer).toBe(1);
    
    // Move should be added to history
    expect(nextState.moveHistory).toEqual([{ gridX: 2, gridY: 3, player: 0 }]);
    
    // Scores should be updated based on scoring mechanism (would need a mock here)
    // For a proper test, we'd need to mock the scoring function or use a known test case
  });

  it('should handle undoMove action', () => {
    // Create a state with a move history
    const stateWithMoves: GameState = {
      ...initialState,
      boardState: JSON.parse(JSON.stringify(initialState.boardState)),
      currentPlayer: 1, // Player 1's turn now
      moveHistory: [{ gridX: 2, gridY: 3, player: 0 }],
      progress: 'playing',
    };
    
    // Set the board state to reflect the move history
    stateWithMoves.boardState[3][2] = 0; // Player 0's move
    
    const nextState = gameReducer(stateWithMoves, undoMove());
    
    // Board should no longer have the move
    expect(nextState.boardState[3][2]).toBeNull();
    
    // Current player should switch back to the previous player
    expect(nextState.currentPlayer).toBe(0);
    
    // Move should be removed from history
    expect(nextState.moveHistory).toEqual([]);
    
    // Scores should be updated (reset in this simple case)
    expect(nextState.scores).toEqual([0, 0]);
  });

  it('should prevent moves on occupied cells', () => {
    // Create a state with a move already placed
    const stateWithMove: GameState = {
      ...initialState,
      boardState: JSON.parse(JSON.stringify(initialState.boardState)),
      currentPlayer: 1,
      moveHistory: [{ gridX: 2, gridY: 3, player: 0 }],
      progress: 'playing',
    };
    
    // Set the board state to reflect the move history
    stateWithMove.boardState[3][2] = 0; // Player 0's move
    
    // Try to place a move on the same cell
    const nextState = gameReducer(
      stateWithMove, 
      placeMove({ coords: { gridX: 2, gridY: 3 }, settings: defaultSettings })
    );
    
    // State should remain unchanged
    expect(nextState).toEqual(stateWithMove);
  });

  it('should not allow moves when game progress is not "playing"', () => {
    const stateWithProgress: GameState = {
      ...initialState,
      progress: 'waiting', // Game is waiting, moves should be blocked
    };
    
    const nextState = gameReducer(
      stateWithProgress, 
      placeMove({ coords: { gridX: 0, gridY: 0 }, settings: defaultSettings })
    );
    
    // State should remain unchanged
    expect(nextState).toEqual(stateWithProgress);
  });
}); 