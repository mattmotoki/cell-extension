/**
 * src/hooks/useGameLogic.ts
 * 
 * Custom hook to manage the game state and logic using useReducer.
 */

import { useReducer, useCallback, useEffect } from 'react';
import { 
    BoardState, 
    GameState, 
    PlayerIndex, 
    GameProgress, 
    HistoryEntry, 
    GameSettings, 
    Coordinates,
    ScoringMechanismId
} from '../types';
import {
    createInitialBoardState,
    placeCell,
    calculateScore,
    getAvailableCells,
    getTotalCellCount
} from '../logic/board/GameBoardLogic';
// AIPlayer logic will be integrated later
// import { getAIMove } from '../logic/ai/AIPlayer'; 
import { getAIMove } from '../logic/ai/aiLogic';

// --- Action Types ---

type Action = 
    | { type: 'PLACE_MOVE'; payload: Coordinates }
    | { type: 'UNDO_MOVE' }
    | { type: 'RESET_GAME'; payload: GameSettings }
    | { type: 'INTERNAL_APPLY_STATE'; payload: Partial<GameState> } // For applying state after AI move or undo
    | { type: 'SET_PROGRESS'; payload: GameProgress } // To manage AI thinking state
    // Add AI_MOVE action later

// --- Helper Functions ---

function isGameOver(boardState: BoardState): boolean {
    return getAvailableCells(boardState).length === 0;
}

function createHistoryEntry(gameState: GameState): HistoryEntry {
    return {
        boardState: JSON.parse(JSON.stringify(gameState.boardState)), // Deep copy
        scores: [...gameState.scores],
        currentPlayer: gameState.currentPlayer,
        progress: gameState.progress, 
    };
}

// --- Reducer ---

function gameReducer(state: GameState, action: Action): GameState {
    switch (action.type) {
        case 'PLACE_MOVE': {
            // Allow move if playing OR if waiting (AI is dispatching its calculated move)
            if (state.progress !== 'playing' && state.progress !== 'waiting') { 
                console.warn(`Cannot place move: game progress is ${state.progress}`);
                return state; 
            }
            
            const { gridX, gridY } = action.payload;
            
            // Determine player making the move based on progress
            // If 'waiting', it's the AI (Player 1), otherwise it's the currentPlayer from state
            const playerMakingMove = state.progress === 'waiting' ? 1 : state.currentPlayer;
            console.log(`Reducer: Placing move for player ${playerMakingMove} at (${gridX}, ${gridY}) (Progress: ${state.progress})`);
            
            const newBoardState = placeCell(state.boardState, playerMakingMove, gridX, gridY);

            if (!newBoardState) {
                console.warn(`Reducer: Invalid move attempted at (${gridX}, ${gridY}) for player ${playerMakingMove}`);
                // If AI move failed validation here (shouldn't happen often due to pre-checks),
                // reset progress to playing so human can try again or AI effect can retry?
                 return state.progress === 'waiting' ? { ...state, progress: 'playing' } : state;
            }

            // Valid move, calculate new state
            const historyEntry = createHistoryEntry(state);
            const newHistory = [...state.history, historyEntry];

            const score1 = calculateScore(newBoardState, 0, state.scoringMechanism);
            const score2 = calculateScore(newBoardState, 1, state.scoringMechanism);
            const newScores: [number, number] = [score1, score2];
            console.log(`Reducer: New scores: ${newScores[0]} - ${newScores[1]}`);

            const nextPlayer = (playerMakingMove + 1) % 2 as PlayerIndex;
            const gameOver = isGameOver(newBoardState);
            // Always set progress back to 'playing' after a successful move, unless game is over
            const newProgress: GameProgress = gameOver ? 'over' : 'playing'; 
            console.log(`Reducer: State after move: nextPlayer=${nextPlayer}, gameOver=${gameOver}, newProgress=${newProgress}`);

            return {
                ...state,
                boardState: newBoardState,
                scores: newScores,
                currentPlayer: nextPlayer,
                progress: newProgress,
                scoreHistory1: [...state.scoreHistory1, newScores[0]],
                scoreHistory2: [...state.scoreHistory2, newScores[1]],
                history: newHistory,
            };
        }

        case 'UNDO_MOVE': {
            if (state.history.length === 0) return state; // Cannot undo initial state

            const previousHistoryEntry = state.history[state.history.length - 1];
            const newHistory = state.history.slice(0, -1);

            // Recalculate score histories based on the truncated main history
            const newScoreHistory1 = [0];
            const newScoreHistory2 = [0];
            newHistory.forEach(entry => {
                newScoreHistory1.push(entry.scores[0]);
                newScoreHistory2.push(entry.scores[1]);
            });
            newScoreHistory1.push(previousHistoryEntry.scores[0]); // Add score from the state we are restoring to
            newScoreHistory2.push(previousHistoryEntry.scores[1]);

            return {
                ...state,
                boardState: JSON.parse(JSON.stringify(previousHistoryEntry.boardState)), // Restore deep copy
                scores: [...previousHistoryEntry.scores],
                currentPlayer: previousHistoryEntry.currentPlayer,
                progress: previousHistoryEntry.progress, // Restore progress (important if undoing during AI wait)
                history: newHistory,
                scoreHistory1: newScoreHistory1,
                scoreHistory2: newScoreHistory2,
            };
        }
        
        case 'RESET_GAME': {
            const settings = action.payload;
            const boardSizeNum = parseInt(settings.boardSize, 10);
            const initialBoardState = createInitialBoardState(boardSizeNum, boardSizeNum);
            const initialPlayer = settings.firstPlayer === 'human' ? 0 : 1;
            const initialScores: [number, number] = [0, 0];

            // Create initial history entry for potential immediate undo
            const initialEntry: HistoryEntry = {
                boardState: JSON.parse(JSON.stringify(initialBoardState)),
                scores: [...initialScores],
                currentPlayer: initialPlayer,
                progress: 'playing',
            };

            return {
                boardState: initialBoardState,
                scores: initialScores,
                currentPlayer: initialPlayer,
                progress: 'playing',
                scoreHistory1: [initialScores[0]],
                scoreHistory2: [initialScores[1]],
                scoringMechanism: settings.scoringMechanism,
                history: [initialEntry], // Start history with the initial state
            };
        }

        case 'INTERNAL_APPLY_STATE': { // Used internally after async ops like AI
             return { ...state, ...action.payload };
        }
        
        case 'SET_PROGRESS': {
            return { ...state, progress: action.payload };
        }

        default: 
            return state;
    }
}

// --- Custom Hook ---

export function useGameLogic(initialSettings: GameSettings) {
    
    const boardSizeNum = parseInt(initialSettings.boardSize, 10);
    const initialBoardState = createInitialBoardState(boardSizeNum, boardSizeNum);
    const initialPlayer = initialSettings.firstPlayer === 'human' ? 0 : 1;
    const initialScores: [number, number] = [0, 0];
    const initialProgress: GameProgress = 'playing';

    const initialHistoryEntry: HistoryEntry = {
        boardState: JSON.parse(JSON.stringify(initialBoardState)),
        scores: [...initialScores],
        currentPlayer: initialPlayer,
        progress: initialProgress,
    };

    const initialState: GameState = {
        boardState: initialBoardState,
        scores: initialScores,
        currentPlayer: initialPlayer,
        progress: initialProgress,
        scoreHistory1: [initialScores[0]],
        scoreHistory2: [initialScores[1]],
        scoringMechanism: initialSettings.scoringMechanism,
        history: [initialHistoryEntry],
    };

    const [gameState, dispatch] = useReducer(gameReducer, initialState);

    // --- Action Dispatchers (memoized) ---

    const placePlayerMove = useCallback((coords: Coordinates) => {
        dispatch({ type: 'PLACE_MOVE', payload: coords });
    }, []);

    const undoMove = useCallback(() => {
        // TODO: Handle undoing AI moves more carefully if needed (e.g., undo 2 steps)
        dispatch({ type: 'UNDO_MOVE' });
    }, []);

    const resetGame = useCallback((newSettings: GameSettings) => {
        dispatch({ type: 'RESET_GAME', payload: newSettings });
    }, []);

    // --- AI Integration Effect ---
    useEffect(() => {
        // Check if it's AI's turn to move
        if (initialSettings.playerMode === 'ai' && 
            gameState.currentPlayer === 1 && // AI is player 1
            gameState.progress === 'playing') 
        {
            // --- Added Log ---
            console.log("[AI Effect] Triggered: AI's turn detected."); 
            console.log("[AI Effect] Current Settings:", initialSettings);
            console.log("[AI Effect] Current GameState:", gameState);
            
            // Set progress to waiting immediately
            // --- Added Log ---
            console.log("[AI Effect] Dispatching SET_PROGRESS -> 'waiting'");
            dispatch({ type: 'SET_PROGRESS', payload: 'waiting' });
            
            // Simulate AI thinking delay - using a slightly longer delay for better UX
            const aiDelay = 500; // ms delay 
            // --- Added Log ---
            console.log(`[AI Effect] Setting timeout for AI move calculation (${aiDelay}ms)...`);
            const timer = setTimeout(() => {
                // --- Added Log ---
                console.log("[AI Effect] Timeout Fired: Starting AI calculation.");
                try {
                    // console.log("AI calculating move..."); // Original log kept in getAIMove
                    // Pass current gameState and settings to AI logic
                    const aiStartTime = performance.now(); // --- Added Timing ---
                    const aiMove = getAIMove(gameState, initialSettings);
                    const aiEndTime = performance.now(); // --- Added Timing ---
                    // --- Added Log ---
                    console.log(`[AI Effect] getAIMove completed in ${(aiEndTime - aiStartTime).toFixed(1)}ms.`);
                    console.log("[AI Effect] AI Move result:", aiMove);
                    
                    if (aiMove) {
                        // --- Added Log ---
                        console.log("[AI Effect] AI Move successful. Dispatching PLACE_MOVE:", aiMove);
                        dispatch({ type: 'PLACE_MOVE', payload: aiMove }); 
                    } else {
                        // Handle case where AI returns null (no moves possible / error)
                        // --- Added Log ---
                        console.warn("[AI Effect] AI returned null (no move possible or error).");
                        // --- Added Log ---
                        console.log("[AI Effect] Dispatching SET_PROGRESS -> 'playing' (or 'over').");
                        
                        // Check if the game should be over
                        if (getAvailableCells(gameState.boardState).length === 0) {
                            console.log("[AI Effect] No available moves detected, setting progress to 'over'.");
                            dispatch({ type: 'SET_PROGRESS', payload: 'over' });
                        } else {
                             console.log("[AI Effect] Available moves exist, setting progress back to 'playing'.");
                             dispatch({ type: 'SET_PROGRESS', payload: 'playing' }); 
                        }
                    }
                } catch (error) {
                    // Catch any errors during AI move calculation
                    // --- Added Log ---
                    console.error("[AI Effect] Error caught during AI calculation or dispatch:", error);
                    // --- Added Log ---
                    console.log("[AI Effect] Dispatching SET_PROGRESS -> 'playing' due to error.");
                    dispatch({ type: 'SET_PROGRESS', payload: 'playing' });
                }
                // --- Added Log ---
                console.log("[AI Effect] Timeout Callback Finished.");
            }, aiDelay);

            // Cleanup timeout if effect re-runs before timeout finishes
            return () => {
                // --- Added Log ---
                console.log("[AI Effect] Cleanup: Clearing AI move timeout.");
                clearTimeout(timer);
            };
        } else {
             // --- Added Log ---
             // Log why the effect didn't run if needed for debugging
             // console.log(`[AI Effect] Skipped: playerMode=${settings.playerMode}, currentPlayer=${gameState.currentPlayer}, progress=${gameState.progress}`);
        }
    // Dependencies: trigger when player changes, progress is 'playing', or mode changes
    }, [gameState.currentPlayer, gameState.boardState, initialSettings]); // Removed gameState.progress

    return {
        gameState,
        placePlayerMove,
        undoMove,
        resetGame,
    };
} 