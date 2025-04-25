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

import { evaluateBoard } from './evaluateBoard.js';
import logger from '../../utils/logger.js';

// Create a module-specific logger
const log = logger.createLogger('AIPlayer');

export class Player {
    constructor(playerID) {
        this.score = 0;
        this.move_history = [];
        this.score_history = [];
        this.connectedComponents = [];
        this.playerID = playerID; // Store the playerID
    }

    getScore() {
        return this.score;
    }

    incrementScore(amount) {
        this.score += amount;
    }

    addMove(move) {
        this.move_history.push(move);
    }

    reset() {
        this.score = 0;
        this.move_history = [];
        this.score_history = [];
    }
}

export class AIPlayer extends Player {
    constructor(playerID) {
        super(playerID); // Correctly pass playerID to parent class
        // Track move count for strategy adjustment
        this.moveCount = 0;
    }

    getMove(gameBoardLogic, scoringMechanism) {
        log.info(`AI (Player ${this.playerID + 1}) calculating move #${this.moveCount + 1}...`);
        this.moveCount++;
        
        // Use minimax or a simpler strategy based on available cells
        const availableCells = gameBoardLogic.getAvailableCells();

        if (availableCells.length === 0) {
            log.warn("AI: No available cells found.");
            return null; // No possible moves
        }

        // --- Minimax Implementation (Simplified) ---
        let bestScore = -Infinity;
        let bestMove = null;
        const depth = 2; // Adjust depth for difficulty (e.g., 2 for easy, 4 for medium)

        for (let cell of availableCells) {
            // Create a hypothetical next state
            const tempLogic = new gameBoardLogic.constructor(gameBoardLogic.gridWidth, gameBoardLogic.gridHeight);
            tempLogic.setState(gameBoardLogic.getState()); // Copy current state
            
            // Simulate the move
            if (tempLogic.placeCell(cell.gridX, cell.gridY, this.playerID)) {
                // Evaluate the board state after this move using minimax
                let score = this.minimax(tempLogic, depth, false, -Infinity, Infinity, scoringMechanism);
                 log.debug(` AI testing move (${cell.gridX}, ${cell.gridY}): Score = ${score}`);
                
                // Update best move if this one is better
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = cell; // Store the cell object {gridX, gridY}
                }
            } else {
                 log.warn(` AI simulation failed for move (${cell.gridX}, ${cell.gridY}) - Should not happen if availableCells is correct`);
            }
        }

        if (bestMove) {
            log.info(`AI Best Move Chosen: (${bestMove.gridX}, ${bestMove.gridY}), Score: ${bestScore}`);
            // Return the chosen cell coordinates
            return { gridX: bestMove.gridX, gridY: bestMove.gridY }; 
        } else {
            log.error("AI: Minimax failed to find a best move. Falling back to random.");
            // Fallback to random move if minimax fails (shouldn't happen ideally)
             const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
            return { gridX: randomCell.gridX, gridY: randomCell.gridY };
        }
    }

    // Minimax with Alpha-Beta Pruning
    minimax(boardLogic, depth, isMaximizingPlayer, alpha, beta, scoringMechanism) {
        if (depth === 0 || boardLogic.getAvailableCells().length <= 1) { // Terminal state or depth limit
            return evaluateBoard(boardLogic, this.playerID, scoringMechanism);
        }

        const availableCells = boardLogic.getAvailableCells();
        const currentPlayer = isMaximizingPlayer ? this.playerID : (this.playerID + 1) % 2;

        if (isMaximizingPlayer) {
            let maxEval = -Infinity;
            for (let cell of availableCells) {
                 const childLogic = new boardLogic.constructor(boardLogic.gridWidth, boardLogic.gridHeight);
                 childLogic.setState(boardLogic.getState());
                 if (childLogic.placeCell(cell.gridX, cell.gridY, currentPlayer)) {
                    let evaluation = this.minimax(childLogic, depth - 1, false, alpha, beta, scoringMechanism);
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
                const childLogic = new boardLogic.constructor(boardLogic.gridWidth, boardLogic.gridHeight);
                childLogic.setState(boardLogic.getState());
                 if (childLogic.placeCell(cell.gridX, cell.gridY, currentPlayer)) {
                    let evaluation = this.minimax(childLogic, depth - 1, true, alpha, beta, scoringMechanism);
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
}

export class HumanPlayer extends Player {
    constructor(playerID) {
        super(playerID);
    }
}