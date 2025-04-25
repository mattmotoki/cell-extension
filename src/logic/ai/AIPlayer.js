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
    constructor(playerID, difficulty = 'hard') { // Default to hard
        super(playerID); // Correctly pass playerID to parent class
        this.moveCount = 0;
        this.difficulty = difficulty; 
        log.info(`AI Player ${this.playerID + 1} initialized with difficulty: ${this.difficulty}`);
    }

    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        log.info(`AI Player ${this.playerID + 1} difficulty set to: ${this.difficulty}`);
    }

    getMove(gameBoardLogic, scoringMechanism) {
        log.info(`AI (Player ${this.playerID + 1}, Difficulty: ${this.difficulty}) calculating move #${this.moveCount + 1}...`);
        this.moveCount++;
        
        const availableCells = gameBoardLogic.getAvailableCells();
        const totalCells = gameBoardLogic.getTotalCellCount();
        const gameProgress = this.moveCount / totalCells;

        if (availableCells.length === 0) {
            log.warn("AI: No available cells found.");
            return null; // No possible moves
        }

        if (this.difficulty === 'easy'){
            if (gameProgress < 0.25) {
                // Easy AI: Early game - Territorial strategy (most open spaces)
                return this.getTerritorialMove(gameBoardLogic, availableCells);
            } else {
                // Easy AI: Mid/Late game - Greedy strategy (best immediate score)
                return this.getGreedyMove(gameBoardLogic, availableCells, scoringMechanism);
            }
        } else {
            // Hard AI: Use Minimax
            return this.getMinimaxMove(gameBoardLogic, availableCells, scoringMechanism);
        }
    }

    // --- Easy AI Strategies ---

    getTerritorialMove(gameBoardLogic, availableCells) {
        log.debug("AI (Easy): Using territorial strategy (valuing open spaces).");
        let bestMove = null;
        let maxValue = -Infinity;
        const opponentID = (this.playerID + 1) % 2;

        for (const cell of availableCells) {
            // Get orthogonal adjacent positions (right, left, down, up)
            const adjacentPositions = gameBoardLogic.getAdjacentPositions(cell.gridX, cell.gridY);
            
            // Add diagonal positions
            const diagonalPositions = [
                [cell.gridX - 1, cell.gridY - 1], // top-left
                [cell.gridX + 1, cell.gridY - 1], // top-right
                [cell.gridX - 1, cell.gridY + 1], // bottom-left
                [cell.gridX + 1, cell.gridY + 1]  // bottom-right
            ].filter(([x, y]) => gameBoardLogic.isValidCoordinate(x, y)); // Filter out invalid coordinates
            
            // Combine orthogonal and diagonal positions
            const allAdjacentPositions = [...adjacentPositions, ...diagonalPositions];
            
            // Evaluate each adjacent position
            let value = Math.random();
            for (const [adjX, adjY] of allAdjacentPositions) {
                if (gameBoardLogic.isCellOccupiedByPlayer(adjX, adjY, opponentID)) {
                    value -= 1; // Opponent-neighbor
                } else if (gameBoardLogic.isCellOccupiedByPlayer(adjX, adjY, this.playerID)) {
                    value -= 2; // Self-neighbor
                } else {
                    value += 3; // Open neighbor
                }
            }

            if (value > maxValue) {
                maxValue = value;
                bestMove = cell;
            } 
        }
        
        if (bestMove) {
            log.info(`AI (Easy) Territorial Move: (${bestMove.gridX}, ${bestMove.gridY}) with space value of ${maxValue.toFixed(2)}.`);
            return { gridX: bestMove.gridX, gridY: bestMove.gridY };
        } else {
            log.error("AI (Easy) Territorial strategy failed. Falling back to random.");
            const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
            return { gridX: randomCell.gridX, gridY: randomCell.gridY };
        }
    }

    getGreedyMove(gameBoardLogic, availableCells, scoringMechanism) {
        log.debug("AI (Easy): Using greedy strategy (best immediate score).");
        let bestMove = null;
        let bestScoreIncrease = -Infinity;

        const currentScore = gameBoardLogic.calculateScore(this.playerID, scoringMechanism);

        for (const cell of availableCells) {
            const tempLogic = new gameBoardLogic.constructor(gameBoardLogic.gridWidth, gameBoardLogic.gridHeight);
            tempLogic.setState(gameBoardLogic.getState());
            if (tempLogic.placeCell(cell.gridX, cell.gridY, this.playerID)) {
                const newScore = tempLogic.calculateScore(this.playerID, scoringMechanism);
                const scoreIncrease = newScore - currentScore;
                 log.debug(` AI (Easy) testing greedy move (${cell.gridX}, ${cell.gridY}): Score Increase = ${scoreIncrease}`);

                if (scoreIncrease > bestScoreIncrease) {
                    bestScoreIncrease = scoreIncrease;
                    bestMove = cell;
                } else if (scoreIncrease === bestScoreIncrease && Math.random() < 0.5) {
                    // Randomly break ties
                    bestMove = cell;
                }
            } else {
                log.warn(` AI (Easy) greedy simulation failed for move (${cell.gridX}, ${cell.gridY})`);
            }
        }

        if (bestMove) {
            log.info(`AI (Easy) Greedy Move: (${bestMove.gridX}, ${bestMove.gridY}), Score Increase: ${bestScoreIncrease}`);
            return { gridX: bestMove.gridX, gridY: bestMove.gridY };
        } else {
            log.error("AI (Easy) Greedy strategy failed. Falling back to random.");
            const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
            return { gridX: randomCell.gridX, gridY: randomCell.gridY };
        }
    }

    // --- Hard AI Strategy ---

    getMinimaxMove(gameBoardLogic, availableCells, scoringMechanism) {
        log.debug("AI (Hard): Using Minimax strategy.");
        let bestScore = -Infinity;
        let bestMove = null;
        const depth = 2; // Minimax depth for Hard AI

        for (let cell of availableCells) {
            // Create a hypothetical next state
            const tempLogic = new gameBoardLogic.constructor(gameBoardLogic.gridWidth, gameBoardLogic.gridHeight);
            tempLogic.setState(gameBoardLogic.getState()); // Copy current state
            
            // Simulate the move
            if (tempLogic.placeCell(cell.gridX, cell.gridY, this.playerID)) {
                // Evaluate the board state after this move using minimax
                let score = this.minimax(tempLogic, depth, false, -Infinity, Infinity, scoringMechanism);
                 log.debug(` AI (Hard) testing minimax move (${cell.gridX}, ${cell.gridY}): Score = ${score}`);
                
                // Update best move if this one is better
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = cell; // Store the cell object {gridX, gridY}
                }
            } else {
                 log.warn(` AI (Hard) minimax simulation failed for move (${cell.gridX}, ${cell.gridY})`);
            }
        }

        if (bestMove) {
            log.info(`AI (Hard) Minimax Move: (${bestMove.gridX}, ${bestMove.gridY}), Score: ${bestScore}`);
            return { gridX: bestMove.gridX, gridY: bestMove.gridY }; 
        } else {
            log.error("AI (Hard): Minimax failed to find a best move. Falling back to random.");
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