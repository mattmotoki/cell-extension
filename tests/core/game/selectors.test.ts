import {
  selectBoardState,
  selectCurrentPlayer,
  selectScores,
  selectProgress,
  selectMoveHistory,
  selectCanUndo,
  selectIsGameOver,
} from '@core';
import type { RootState } from '@core';

describe('Game selectors', () => {
  // Create a mock state for testing selectors
  const mockState: RootState = {
    game: {
      boardState: [
        [0, null, null, null, null],
        [null, 1, null, null, null],
        [null, null, 0, null, null],
        [null, null, null, 1, null],
        [null, null, null, null, 0],
      ],
      moveHistory: [
        { gridX: 0, gridY: 0, player: 0 },
        { gridX: 1, gridY: 1, player: 1 },
        { gridX: 2, gridY: 2, player: 0 },
        { gridX: 3, gridY: 3, player: 1 },
        { gridX: 4, gridY: 4, player: 0 },
      ],
      currentPlayer: 1,
      scores: [3, 2],
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

  const emptyState: RootState = {
    game: {
      boardState: Array(5).fill(Array(5).fill(null)),
      moveHistory: [],
      currentPlayer: 0,
      scores: [0, 0],
      progress: 'pregame',
    },
    settings: {
      boardSize: 5,
      playerMode: 'human',
      firstPlayer: 0,
      scoringMechanism: 'cell-extension',
      aiDifficulty: 'medium',
    }
  };

  it('selectBoardState should return the board state', () => {
    expect(selectBoardState(mockState)).toEqual(mockState.game.boardState);
  });

  it('selectCurrentPlayer should return the current player', () => {
    expect(selectCurrentPlayer(mockState)).toBe(1);
  });

  it('selectScores should return the scores', () => {
    expect(selectScores(mockState)).toEqual([3, 2]);
  });

  it('selectProgress should return the game progress', () => {
    expect(selectProgress(mockState)).toBe('playing');
  });

  it('selectMoveHistory should return the move history', () => {
    expect(selectMoveHistory(mockState)).toEqual(mockState.game.moveHistory);
  });

  it('selectCanUndo should return true when there are moves to undo', () => {
    expect(selectCanUndo(mockState)).toBe(true);
  });

  it('selectCanUndo should return false when there are no moves to undo', () => {
    expect(selectCanUndo(emptyState)).toBe(false);
  });

  it('selectIsGameOver should return true when progress is "over"', () => {
    const gameOverState = {
      ...mockState,
      game: {
        ...mockState.game,
        progress: 'over',
      },
    };
    expect(selectIsGameOver(gameOverState)).toBe(true);
  });

  it('selectIsGameOver should return false when progress is not "over"', () => {
    expect(selectIsGameOver(mockState)).toBe(false);
  });
}); 