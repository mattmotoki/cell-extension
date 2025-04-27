/**
 * AIPlayer.js - AI Player Implementation for Cell Collection Game
 * 
 * This file implements the player base class and AI opponent for the game.
 * 
 * Key components:
 * - Player: Base class with core player functionality
 * - AIPlayer: AI opponent that evaluates and selects moves using minimax algorithm
 * - HumanPlayer: Simple representation of a human player
 * 
 * The AI uses different strategies based on:
 * - Current scoring mechanism (adapts evaluation for each scoring type)
 * - Game progress (tracks move count for strategy adjustment)
 * - Board state (evaluates potential moves by simulating their outcome)
 * 
 * Relationships:
 * - Imports evaluateBoard from './evaluateBoard.js'
 * - Used by Game.js to handle AI opponent moves
 * - Works with GameBoardLogic to evaluate positions and simulate moves
 * 
 * Revision Log:
 * - Added logger implementation for verbosity control
 * 
 * Note: This revision log should be updated whenever this file is modified.
 */

import { 
    BoardState, 
    Coordinates, 
    GameState, 
    GameSettings, 
    PlayerIndex, 
    ScoringMechanismId 
} from '../../types';
import { 
    getAvailableCells, 
    getTotalCellCount, 
    placeCell, 
    calculateScore,
    getAdjacentPositions,
    isValidCoordinate,
    isCellOccupiedByPlayer,
    isCellOccupied,
    createPositionKey
} from '../board/GameBoardLogic';
import { evaluateBoard } from './evaluateBoard';

// Create a module-specific logger
// const log = logger.createLogger('AIPlayer');

// REMOVE Player class definition
// export class Player {
// ... (entire class removed) ...
// }

// REMOVE AIPlayer class definition (logic moved to functions)
// export class AIPlayer extends Player {
// ... (entire class removed) ...
// }

// REMOVE HumanPlayer class definition
// export class HumanPlayer extends Player {
// ... (entire class removed) ...
// }

// Keep the exported functions: getAIMove, getTerritorialMove, getGreedyMove, getMinimaxMove, minimax

/**
 * Calculates the AI's next move based on the game state and settings.
 * @param gameState The current game state.
 * @param settings The current game settings (especially aiDifficulty).
 * @returns The coordinates of the chosen move, or null if no move is possible.
 */
export function getAIMove(gameState: GameState, settings: GameSettings): Coordinates | null {
    const aiPlayerIndex = 1; // Assuming AI is always player 1
    const { boardState, scoringMechanism } = gameState;
    const { aiDifficulty } = settings;
    
    console.log(`AI START: Player ${aiPlayerIndex + 1}, Difficulty ${aiDifficulty}, ScoringMech: ${scoringMechanism}`);
    console.log(`Current board state: ${boardState.gridWidth}x${boardState.gridHeight} with ${Object.keys(boardState.occupiedCells[0]).length} cells (P1) and ${Object.keys(boardState.occupiedCells[1]).length} cells (P2)`);
    
    const availableCells = getAvailableCells(boardState);
    
    // Simple move count based on history (excluding initial state)
    const moveCount = gameState.history.length -1; 
    const totalCells = getTotalCellCount(boardState);
    const gameProgress = moveCount / totalCells;

    console.log(`AI calculating move #${moveCount + 1}. Game progress: ${(gameProgress * 100).toFixed(1)}%. Available cells: ${availableCells.length}`);

    if (availableCells.length === 0) {
        console.warn("AI: No available cells found. Game should be over.");
        return null; // No possible moves
    }

    // Safety check - do a deep validation of available cells
    const validatedCells = availableCells.filter(cell => {
        if (cell.gridX === undefined || cell.gridY === undefined ||
            isNaN(cell.gridX) || isNaN(cell.gridY)) {
            console.error(`AI: Invalid cell coordinates: ${JSON.stringify(cell)}`);
            return false;
        }
        
        const posKey = createPositionKey(cell.gridX, cell.gridY);
        if (boardState.occupiedCells[0][posKey] || boardState.occupiedCells[1][posKey]) {
            console.error(`AI: Cell already occupied: ${JSON.stringify(cell)}`);
            return false;
        }
        
        return true;
    });
    
    if (validatedCells.length === 0) {
        console.error("AI: All available cells failed validation! Returning null.");
        return null;
    }
    
    let bestMove: Coordinates | null = null;

    try {
        if (aiDifficulty === 'easy') {
            console.log("AI: Using easy difficulty strategy");
            if (gameProgress < 0.25) {
                bestMove = getTerritorialMove(boardState, validatedCells, aiPlayerIndex);
            } else {
                bestMove = getGreedyMove(boardState, validatedCells, aiPlayerIndex, scoringMechanism);
            }
        } else { // Hard AI
            console.log("AI: Using hard difficulty (minimax) strategy");
            bestMove = getMinimaxMove(boardState, validatedCells, aiPlayerIndex, scoringMechanism);
        }
        
        if (!bestMove) {
            throw new Error("AI strategy returned null despite available cells");
        }
    } catch (error) {
        console.error("AI calculation error:", error);
        console.trace("AI calculation stack trace");
    }

    // Fallback to random move if strategy fails
    if (!bestMove) {
        console.warn(`AI (${aiDifficulty}) strategy failed or errored. Falling back to random move.`);
        const randomIndex = Math.floor(Math.random() * validatedCells.length);
        bestMove = validatedCells[randomIndex];
        console.log(`AI random fallback move: (${bestMove.gridX}, ${bestMove.gridY})`);
    }

    // Final validation of selected move
    if (!bestMove || bestMove.gridX === undefined || bestMove.gridY === undefined || 
        isNaN(bestMove.gridX) || isNaN(bestMove.gridY)) {
        console.error(`AI final move is invalid: ${JSON.stringify(bestMove)}. Generating emergency random move.`);
        
        // Emergency fallback
        if (validatedCells.length > 0) {
            bestMove = validatedCells[0];
        } else {
            console.error("AI: Critical failure - no valid cells available despite earlier checks");
            return null;
        }
    }

    console.log(`AI COMPLETE: Selected move at (${bestMove.gridX}, ${bestMove.gridY})`);
    return bestMove;
}

// --- Easy AI Strategies ---

function getTerritorialMove(boardState: BoardState, availableCells: Coordinates[], aiPlayerIndex: PlayerIndex): Coordinates | null {
    console.debug("AI (Easy): Using territorial strategy (valuing open spaces).");
    let bestMove: Coordinates | null = null;
    let maxValue = -Infinity;
    const opponentID = (aiPlayerIndex + 1) % 2 as PlayerIndex;
    const { gridWidth, gridHeight, occupiedCells } = boardState;

    for (const cell of availableCells) {
        const adjacentPositionsCoords = getAdjacentPositions(cell.gridX, cell.gridY, gridWidth, gridHeight);
        
        // Add diagonal positions
        const diagonalPositions: [number, number][] = [
            [cell.gridX - 1, cell.gridY - 1], [cell.gridX + 1, cell.gridY - 1],
            [cell.gridX - 1, cell.gridY + 1], [cell.gridX + 1, cell.gridY + 1]
        ].filter(([x, y]) => isValidCoordinate(x, y, gridWidth, gridHeight)) as [number, number][];
        
        const allAdjacentPositions = [
            ...adjacentPositionsCoords.map(c => [c.gridX, c.gridY]),
            ...diagonalPositions
        ];
        
        let value = Math.random() * 0.1; // Small random factor for tie-breaking
        for (const [adjX, adjY] of allAdjacentPositions) {
            if (isCellOccupiedByPlayer(occupiedCells, opponentID, adjX, adjY)) {
                value -= 1; // Opponent-neighbor
            } else if (isCellOccupiedByPlayer(occupiedCells, aiPlayerIndex, adjX, adjY)) {
                value -= 2; // Self-neighbor
            } else { // Empty cell
                value += 3; // Open neighbor
            }
        }

        if (value > maxValue) {
            maxValue = value;
            bestMove = cell;
        } 
    }
    
    console.log(`AI (Easy) Territorial Move: (${bestMove?.gridX}, ${bestMove?.gridY}) with space value ${maxValue.toFixed(2)}.`);
    return bestMove; // Can be null if availableCells was empty initially (handled in getAIMove)
}

function getGreedyMove(
    boardState: BoardState, 
    availableCells: Coordinates[], 
    aiPlayerIndex: PlayerIndex, 
    scoringMechanism: ScoringMechanismId
): Coordinates | null {
    console.debug("AI (Easy): Using greedy strategy (best immediate score).");
    let bestMove: Coordinates | null = null;
    let bestScoreIncrease = -Infinity;

    const currentScore = calculateScore(boardState, aiPlayerIndex, scoringMechanism);

    for (const cell of availableCells) {
        const nextBoardState = placeCell(boardState, aiPlayerIndex, cell.gridX, cell.gridY);
        if (nextBoardState) {
            const newScore = calculateScore(nextBoardState, aiPlayerIndex, scoringMechanism);
            const scoreIncrease = newScore - currentScore;
            // console.debug(` AI (Easy) testing greedy move (${cell.gridX}, ${cell.gridY}): Score Increase = ${scoreIncrease}`);

            if (scoreIncrease > bestScoreIncrease) {
                bestScoreIncrease = scoreIncrease;
                bestMove = cell;
            } else if (scoreIncrease === bestScoreIncrease && Math.random() < 0.5) {
                bestMove = cell; // Randomly break ties
            }
        } else {
             console.warn(` AI (Easy) greedy simulation failed for move (${cell.gridX}, ${cell.gridY}) - likely occupied?`);
        }
    }

    console.log(`AI (Easy) Greedy Move: (${bestMove?.gridX}, ${bestMove?.gridY}), Score Increase: ${bestScoreIncrease}`);
    return bestMove;
}

// --- Hard AI Strategy (Minimax) ---

const MINIMAX_DEPTH = 2; // Adjust depth as needed for performance/strength

function getMinimaxMove(
    boardState: BoardState, 
    availableCells: Coordinates[], 
    aiPlayerIndex: PlayerIndex, 
    scoringMechanism: ScoringMechanismId
): Coordinates | null {
    console.debug("AI (Hard): Using Minimax strategy.");
    let bestScore = -Infinity;
    let bestMove: Coordinates | null = null;
    
    for (let cell of availableCells) {
        const nextBoardState = placeCell(boardState, aiPlayerIndex, cell.gridX, cell.gridY);
        if (nextBoardState) {
            // Opponent's turn (minimizing player)
            let score = minimax(nextBoardState, MINIMAX_DEPTH, false, -Infinity, Infinity, aiPlayerIndex, scoringMechanism);
            // console.debug(` AI (Hard) testing minimax move (${cell.gridX}, ${cell.gridY}): Score = ${score}`);
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = cell;
            } else if (score === bestScore && Math.random() < 0.5) {
                 bestMove = cell; // Randomly break ties
            }
        } else {
             console.warn(` AI (Hard) minimax simulation failed for move (${cell.gridX}, ${cell.gridY})`);
        }
    }

    console.log(`AI (Hard) Minimax Move: (${bestMove?.gridX}, ${bestMove?.gridY}), Eval Score: ${bestScore}`);
    return bestMove;
}

// Minimax with Alpha-Beta Pruning
function minimax(
    boardState: BoardState, 
    depth: number, 
    isMaximizingPlayer: boolean, 
    alpha: number, 
    beta: number, 
    aiPlayerIndex: PlayerIndex, // Pass the original AI player index for evaluation
    scoringMechanism: ScoringMechanismId
): number {
    
    const availableCells = getAvailableCells(boardState);
    if (depth === 0 || availableCells.length === 0) { // Terminal state or depth limit
        return evaluateBoard(boardState, aiPlayerIndex, scoringMechanism);
    }

    const currentPlayer = isMaximizingPlayer ? aiPlayerIndex : (aiPlayerIndex + 1) % 2 as PlayerIndex;

    if (isMaximizingPlayer) {
        let maxEval = -Infinity;
        for (let cell of availableCells) {
             const childBoardState = placeCell(boardState, currentPlayer, cell.gridX, cell.gridY);
             if (childBoardState) {
                let evaluation = minimax(childBoardState, depth - 1, false, alpha, beta, aiPlayerIndex, scoringMechanism);
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) {
                    break; // Beta cutoff
                }
             } 
        }
        return maxEval;
    } else { // Minimizing player (opponent)
        let minEval = Infinity;
        for (let cell of availableCells) {
             const childBoardState = placeCell(boardState, currentPlayer, cell.gridX, cell.gridY);
             if (childBoardState) {
                 let evaluation = minimax(childBoardState, depth - 1, true, alpha, beta, aiPlayerIndex, scoringMechanism);
                 minEval = Math.min(minEval, evaluation);
                 beta = Math.min(beta, evaluation);
                 if (beta <= alpha) {
                     break; // Alpha cutoff
                 }
             }
        }
        return minEval;
    }
}