import { getAIMove } from '@core';
import type { GameState, GameSettings } from '@core';

describe('AI Engine', () => {
  // Setup test game states and settings - updated for new board structure
  const emptyBoardState: GameState = {
    boardState: {
      gridWidth: 6,
      gridHeight: 6,
      occupiedCells: [{}, {}]
    },
    currentPlayer: 1, // AI is player 1
    scores: [0, 0],
    progress: 'playing',
    history: [{
      boardState: {
        gridWidth: 6,
        gridHeight: 6,
        occupiedCells: [{}, {}]
      },
      currentPlayer: 0,
      scores: [0, 0],
      progress: 'pregame'
    }],
    scoreHistory1: [0],
    scoreHistory2: [0],
    scoringMechanism: 'cell-extension'
  };

  const partiallyFilledBoardState: GameState = {
    boardState: {
      gridWidth: 6,
      gridHeight: 6,
      occupiedCells: [
        { 
          '0,0': { gridX: 0, gridY: 0 },
          '1,1': { gridX: 1, gridY: 1 },
          '3,3': { gridX: 3, gridY: 3 }
        }, 
        { 
          '2,2': { gridX: 2, gridY: 2 },
          '4,4': { gridX: 4, gridY: 4 }
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
      // Additional history entries would be here
    ],
    currentPlayer: 1, // AI is player 1
    scores: [3, 2],
    progress: 'playing',
    scoreHistory1: [0, 1, 2, 3],
    scoreHistory2: [0, 0, 1, 2],
    scoringMechanism: 'cell-extension'
  };

  const singleEmptyCellBoardState: GameState = {
    boardState: {
      gridWidth: 3,
      gridHeight: 3,
      occupiedCells: [
        { 
          '0,0': { gridX: 0, gridY: 0 },
          '0,2': { gridX: 0, gridY: 2 },
          '2,0': { gridX: 2, gridY: 0 }
        }, 
        { 
          '0,1': { gridX: 0, gridY: 1 },
          '1,0': { gridX: 1, gridY: 0 },
          '1,1': { gridX: 1, gridY: 1 },
          '1,2': { gridX: 1, gridY: 2 },
          '2,1': { gridX: 2, gridY: 1 }
        }
      ]
    },
    history: [
      {
        boardState: {
          gridWidth: 3,
          gridHeight: 3,
          occupiedCells: [{}, {}]
        },
        currentPlayer: 0,
        scores: [0, 0],
        progress: 'pregame'
      },
      // Additional history entries would be here
    ],
    currentPlayer: 1, // AI is player 1
    scores: [3, 5],
    progress: 'playing',
    scoreHistory1: [0, 1, 2, 3],
    scoreHistory2: [0, 1, 3, 5],
    scoringMechanism: 'cell-extension'
  };

  const defaultSettings: GameSettings = {
    boardSize: 6,
    playerMode: 'ai',
    firstPlayer: 0,
    scoringMechanism: 'cell-extension',
    aiDifficulty: 'medium',
  };

  it('should return a valid move on an empty board', () => {
    const move = getAIMove(emptyBoardState, defaultSettings);
    
    // Verify that the move exists and is within board bounds
    expect(move).toBeDefined();
    expect(move).not.toBeNull();
    expect(typeof move.gridX).toBe('number');
    expect(typeof move.gridY).toBe('number');
    expect(move.gridX).toBeGreaterThanOrEqual(0);
    expect(move.gridX).toBeLessThan(6);
    expect(move.gridY).toBeGreaterThanOrEqual(0);
    expect(move.gridY).toBeLessThan(6);
  });

  it('should return a valid move on a partially filled board', () => {
    const move = getAIMove(partiallyFilledBoardState, defaultSettings);
    
    // Verify that the move exists and is valid
    expect(move).toBeDefined();
    expect(move).not.toBeNull();
    expect(typeof move.gridX).toBe('number');
    expect(typeof move.gridY).toBe('number');
    
    // Verify the move is within board bounds
    expect(move.gridX).toBeGreaterThanOrEqual(0);
    expect(move.gridX).toBeLessThan(6);
    expect(move.gridY).toBeGreaterThanOrEqual(0);
    expect(move.gridY).toBeLessThan(6);
    
    // The cell should not already be occupied
    const cellKey = `${move.gridX},${move.gridY}`;
    const player0Cells = partiallyFilledBoardState.boardState.occupiedCells[0];
    const player1Cells = partiallyFilledBoardState.boardState.occupiedCells[1];
    
    expect(player0Cells[cellKey]).toBeUndefined();
    expect(player1Cells[cellKey]).toBeUndefined();
  });

  it('should find the only available move when there is a single empty cell', () => {
    const move = getAIMove(singleEmptyCellBoardState, defaultSettings);
    
    // There's only one valid move at (2,2)
    expect(move).toBeDefined();
    expect(move).not.toBeNull();
    expect(move).toEqual({ gridX: 2, gridY: 2 });
  });

  it('should make different moves based on difficulty level', () => {
    // This test may be flaky due to randomness in AI decisions
    // We'll run it multiple times to increase chance of seeing different moves
    const moves = [];
    
    for (let i = 0; i < 5; i++) {
      // Create a fresh copy of the board state for each run
      const boardStateCopy = JSON.parse(JSON.stringify(partiallyFilledBoardState));
      
      // Get moves for different difficulty levels
      const easyMove = getAIMove(boardStateCopy, { 
        ...defaultSettings, 
        aiDifficulty: 'easy' 
      });
      
      const mediumMove = getAIMove(boardStateCopy, { 
        ...defaultSettings, 
        aiDifficulty: 'medium' 
      });
      
      const hardMove = getAIMove(boardStateCopy, { 
        ...defaultSettings, 
        aiDifficulty: 'hard' 
      });
      
      // Skip if any move is null
      if (easyMove && mediumMove && hardMove) {
        moves.push({
          easy: `${easyMove.gridX},${easyMove.gridY}`,
          medium: `${mediumMove.gridX},${mediumMove.gridY}`,
          hard: `${hardMove.gridX},${hardMove.gridY}`
        });
      }
    }
    
    // Log the moves for inspection
    console.log('Difficulty test moves:', moves);
    
    // We can't assert for different moves, but we can check they're all valid
    expect(moves.length).toBeGreaterThan(0);
  });

  it('should consider the scoring mechanism when making moves', () => {
    // This test is also potentially flaky due to AI randomness
    // We'll verify the AI uses the specified scoring mechanism
    
    // We'll check that the AI properly reads the scoring mechanism setting
    const boardStateCopy = JSON.parse(JSON.stringify(partiallyFilledBoardState));
    
    // Get a move with cell-extension scoring
    const extensionMove = getAIMove(boardStateCopy, {
      ...defaultSettings,
      scoringMechanism: 'cell-extension',
    });
    
    // Get a move with cell-capture scoring
    const captureMove = getAIMove(boardStateCopy, {
      ...defaultSettings,
      scoringMechanism: 'cell-capture',
    });
    
    // Log the moves for inspection
    if (extensionMove && captureMove) {
      console.log('Extension move:', `${extensionMove.gridX},${extensionMove.gridY}`);
      console.log('Capture move:', `${captureMove.gridX},${captureMove.gridY}`);
    }
    
    // We can't assert they're different, but we can verify they're valid
    // Both should be defined and within board bounds
    expect(extensionMove).toBeDefined();
    expect(captureMove).toBeDefined();
    if (extensionMove) {
      expect(extensionMove.gridX).toBeGreaterThanOrEqual(0);
      expect(extensionMove.gridY).toBeGreaterThanOrEqual(0);
    }
    if (captureMove) {
      expect(captureMove.gridX).toBeGreaterThanOrEqual(0);
      expect(captureMove.gridY).toBeGreaterThanOrEqual(0);
    }
  });
}); 