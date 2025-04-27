import {
  selectBoardState,
  selectCurrentPlayer,
  selectScores,
  selectGameProgress,
  selectGameHistory,
  selectCanUndo,
  selectIsGameOver,
} from '@core';
import type { RootState } from '@core';

describe('Game selectors', () => {
  // Create a mock state for testing selectors
  const mockState: RootState = {
    game: {
      boardState: {
        gridWidth: 6,
        gridHeight: 6,
        occupiedCells: [
          { 
            '0,0': { gridX: 0, gridY: 0 },
            '2,2': { gridX: 2, gridY: 2 },
            '4,4': { gridX: 4, gridY: 4 }
          }, 
          { 
            '1,1': { gridX: 1, gridY: 1 },
            '3,3': { gridX: 3, gridY: 3 }
          }
        ]
      },
      history: [
        {
          boardState: {
            gridWidth: 6,
            gridHeight: 6,
            occupiedCells: [{}, {}]
          },
          currentPlayer: 0,
          scores: [0, 0],
          progress: 'pregame'
        },
        {
          boardState: {
            gridWidth: 6,
            gridHeight: 6,
            occupiedCells: [
              { '0,0': { gridX: 0, gridY: 0 } }, 
              {}
            ]
          },
          currentPlayer: 1,
          scores: [1, 0],
          progress: 'playing'
        },
        {
          boardState: {
            gridWidth: 6,
            gridHeight: 6,
            occupiedCells: [
              { '0,0': { gridX: 0, gridY: 0 } }, 
              { '1,1': { gridX: 1, gridY: 1 } }
            ]
          },
          currentPlayer: 0,
          scores: [1, 1],
          progress: 'playing'
        }
      ],
      currentPlayer: 1,
      scores: [3, 2],
      progress: 'playing',
      scoreHistory1: [0, 1, 1, 2, 3],
      scoreHistory2: [0, 0, 1, 1, 2],
      scoringMechanism: 'cell-extension'
    },
    settings: {
      boardSize: 6,
      playerMode: 'human',
      firstPlayer: 0,
      scoringMechanism: 'cell-extension',
      aiDifficulty: 'medium',
    }
  };

  const emptyState: RootState = {
    game: {
      boardState: {
        gridWidth: 6,
        gridHeight: 6,
        occupiedCells: [{}, {}]
      },
      history: [
        {
          boardState: {
            gridWidth: 6,
            gridHeight: 6,
            occupiedCells: [{}, {}]
          },
          currentPlayer: 0,
          scores: [0, 0],
          progress: 'pregame'
        }
      ],
      currentPlayer: 0,
      scores: [0, 0],
      progress: 'pregame',
      scoreHistory1: [0],
      scoreHistory2: [0],
      scoringMechanism: 'cell-extension'
    },
    settings: {
      boardSize: 6,
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

  it('selectGameProgress should return the game progress', () => {
    expect(selectGameProgress(mockState)).toBe('playing');
  });

  it('selectGameHistory should return the game history', () => {
    expect(selectGameHistory(mockState)).toEqual(mockState.game.history);
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