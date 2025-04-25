import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
    BoardState, 
    GameState, 
    PlayerIndex, 
    GameProgress, 
    HistoryEntry, 
    GameSettings, 
    Coordinates,
    ScoringMechanismId
} from '../types'; // Adjusted path
import {
    createInitialBoardState,
    placeCell,
    calculateScore,
    getAvailableCells,
    isGameOver
} from './GameBoardLogic'; // Assuming GameBoardLogic is in the same directory
import { getAIMove } from '../ai/aiLogic'; // Adjusted path

// Helper to create history entry (similar to before)
function createHistoryEntry(gameState: GameState): HistoryEntry {
    return {
        boardState: JSON.parse(JSON.stringify(gameState.boardState)), // Deep copy
        scores: [...gameState.scores],
        currentPlayer: gameState.currentPlayer,
        progress: gameState.progress, 
    };
}

const getInitialState = (settings: GameSettings): GameState => {
    const boardSizeNum = parseInt(settings.boardSize, 10);
    const initialBoardState = createInitialBoardState(boardSizeNum, boardSizeNum);
    const initialPlayer = settings.firstPlayer === 'human' ? 0 : 1;
    const initialScores: [number, number] = [0, 0];
    const initialProgress: GameProgress = 'playing';

    const initialHistoryEntry: HistoryEntry = {
        boardState: JSON.parse(JSON.stringify(initialBoardState)),
        scores: [...initialScores],
        currentPlayer: initialPlayer,
        progress: initialProgress,
    };

    return {
        boardState: initialBoardState,
        scores: initialScores,
        currentPlayer: initialPlayer,
        progress: initialProgress,
        scoreHistory1: [initialScores[0]],
        scoreHistory2: [initialScores[1]],
        scoringMechanism: settings.scoringMechanism,
        history: [initialHistoryEntry], // Start history with the initial state
    };
};

// Default settings for initial state if none provided via RESET
const defaultSettings: GameSettings = {
  playerMode: 'ai',
  firstPlayer: 'human',
  scoringMechanism: 'cell-multiplication',
  aiDifficulty: 'easy',
  boardSize: '6',
};

const initialState: GameState = getInitialState(defaultSettings);

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        placeMove: (state, action: PayloadAction<{ coords: Coordinates, settings: GameSettings }>) => {
            const { coords, settings } = action.payload;
            const { gridX, gridY } = coords;
            
            // Determine player making the move based on progress (handle AI)
            const playerMakingMove = state.progress === 'waiting' ? 1 : state.currentPlayer;
            
            // Allow move if playing OR if waiting (AI is dispatching its calculated move)
            if (state.progress !== 'playing' && state.progress !== 'waiting') { 
                console.warn(`Cannot place move: game progress is ${state.progress}`);
                return; // Exit reducer if move is not allowed
            }
            
            console.log(`Reducer: Placing move for player ${playerMakingMove} at (${gridX}, ${gridY}) (Progress: ${state.progress})`);
            console.log(`DEBUG: Current state before move - Player: ${state.currentPlayer}, Progress: ${state.progress}`);
            
            const newBoardState = placeCell(state.boardState, playerMakingMove, gridX, gridY);

            if (!newBoardState) {
                console.warn(`Reducer: Invalid move attempted at (${gridX}, ${gridY}) for player ${playerMakingMove}`);
                console.log(`DEBUG: Move validation failed, current occupiedCells:`, 
                    JSON.stringify({
                        player0: Object.keys(state.boardState.occupiedCells[0]),
                        player1: Object.keys(state.boardState.occupiedCells[1])
                    })
                );
                
                // If AI move failed validation, reset progress to playing
                if (state.progress === 'waiting') {
                    console.log(`DEBUG: Resetting progress from 'waiting' to 'playing' due to invalid AI move`);
                    state.progress = 'playing';
                }
                return; // Exit reducer on invalid move
            }

            // --- Valid Move --- 
            console.log(`DEBUG: Move validation passed, updating game state`);
            
            // Save current state to history before updating
            const historyEntry = createHistoryEntry(state);
            state.history.push(historyEntry);

            // Update board state
            state.boardState = newBoardState;

            // Calculate and update scores
            const score1 = calculateScore(state.boardState, 0, state.scoringMechanism);
            const score2 = calculateScore(state.boardState, 1, state.scoringMechanism);
            state.scores = [score1, score2];
            state.scoreHistory1.push(score1);
            state.scoreHistory2.push(score2);
            console.log(`Reducer: New scores: ${state.scores[0]} - ${state.scores[1]}`);

            // Update current player
            state.currentPlayer = (playerMakingMove + 1) % 2 as PlayerIndex;
            console.log(`DEBUG: Updated current player to ${state.currentPlayer}`);

            // Update game progress
            const gameOver = isGameOver(state.boardState);
            state.progress = gameOver ? 'over' : 'playing';
            console.log(`Reducer: State after move: nextPlayer=${state.currentPlayer}, gameOver=${gameOver}, newProgress=${state.progress}`);
        },
        undoMove: (state) => {
            if (state.history.length === 0) return; // Cannot undo initial state (or empty history)

            const previousHistoryEntry = state.history.pop(); // Remove last entry
            
            if (previousHistoryEntry) {
                // Restore state from the popped history entry
                state.boardState = previousHistoryEntry.boardState; // Already deep copied
                state.scores = previousHistoryEntry.scores;
                state.currentPlayer = previousHistoryEntry.currentPlayer;
                state.progress = previousHistoryEntry.progress; // Restore progress
                
                // Recalculate score histories (simpler than storing in history)
                state.scoreHistory1 = [0]; 
                state.scoreHistory2 = [0];
                state.history.forEach(entry => {
                    state.scoreHistory1.push(entry.scores[0]);
                    state.scoreHistory2.push(entry.scores[1]);
                });
                // Add score from the restored state
                 state.scoreHistory1.push(state.scores[0]); 
                 state.scoreHistory2.push(state.scores[1]);
            } else {
                 console.warn("Undo called with empty history?");
            }
        },
        resetGame: (state, action: PayloadAction<GameSettings>) => {
            const settings = action.payload;
            // Use getInitialState to derive the new state based on settings
            const newState = getInitialState(settings);
            // We need to return the new state object entirely here
            // Redux Toolkit allows direct mutation *or* returning a new state
            return newState;
        },
        setProgress: (state, action: PayloadAction<GameProgress>) => {
            const newProgress = action.payload;
            console.log(`DEBUG: setProgress called - Current: ${state.progress}, New: ${newProgress}`);
            
            // Prevent setting progress if game is over
            if (state.progress !== 'over') {
                state.progress = newProgress;
                console.log(`DEBUG: Progress updated to ${state.progress}`);
            } else {
                console.log(`DEBUG: Progress update rejected - game is already over`);
            }
        },
        // We might need an action to apply an AI move result if calculation is async
        // applyAIMove: (state, action: PayloadAction<Coordinates>) => { ... }
    }
});

export const {
    placeMove,
    undoMove,
    resetGame,
    setProgress
} = gameSlice.actions;

export default gameSlice.reducer; 