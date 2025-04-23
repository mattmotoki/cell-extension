/**
 * ai.js - AI Player Implementation for Cell Collection
 * 
 * This file implements the AI opponent and player base classes for the game.
 * 
 * Key components:
 * - Player: Base class with core player functionality
 * - AIPlayer: AI opponent that evaluates and selects moves
 * - HumanPlayer: Simple representation of a human player
 * 
 * The AI uses different strategies based on:
 * - Current scoring mechanism (adapts evaluation for each scoring type)
 * - Game progress (uses random moves early, strategic moves later)
 * - Board state (evaluates potential moves by simulating their outcome)
 * 
 * Relationships with other files:
 * - game.js: Instantiates AIPlayer to handle opponent moves
 * - board.js: AI queries board methods to evaluate positions
 */

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

        // udpate connected components
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

    getMove(board, scoringMechanism) {
        this.moveCount++;
        
        // Get available cells (contains both pixel and grid coordinates)
        const availableCells = board.getAvailableCells();
        if (availableCells.length === 0) return null;
        
        // Filter out any invalid cells
        const validCells = availableCells.filter(cell => 
            Number.isFinite(cell.x) && Number.isFinite(cell.y) && 
            Number.isFinite(cell.gridX) && Number.isFinite(cell.gridY)
        );
        
        if (validCells.length === 0) {
            console.warn("No valid cells available for AI move");
            return null;
        }
        
        // Simple strategy:
        // Moves 1-7: Completely random
        // Move 8+: Completely greedy (always choose the best move)
        if (this.moveCount < 8) {
            return validCells[Math.floor(Math.random() * validCells.length)];
        }
        
        // After move 8, play greedily
        // Calculate scores for each available cell
        const cellScores = validCells.map(cell => {
            const score = this.calculateCellScore(cell, board, scoringMechanism);
            return {
                cell: cell,
                score: score
            };
        });
        
        // Filter out any invalid scores
        const validScores = cellScores.filter(item => 
            Number.isFinite(item.score)
        );
        
        if (validScores.length === 0) {
            // If no valid scores, fall back to random
            return validCells[Math.floor(Math.random() * validCells.length)];
        }
        
        // Sort by score (descending)
        validScores.sort((a, b) => b.score - a.score);
        
        // Always choose the best move
        return validScores[0].cell;
    }
    
    calculateCellScore(cell, board, scoringMechanism) {
        const playerIndex = this.playerID;
        const opponentIndex = (playerIndex + 1) % 2;
        
        // Safety check for board.occupiedCells
        if (!board.occupiedCells) board.occupiedCells = [{}, {}];
        if (!board.occupiedCells[playerIndex]) board.occupiedCells[playerIndex] = {};
        if (!board.occupiedCells[opponentIndex]) board.occupiedCells[opponentIndex] = {};
        
        // Use grid coordinates directly from cell object if available
        const gridX = cell.gridX !== undefined ? cell.gridX : board.pixelToGrid(cell.x, cell.y).x;
        const gridY = cell.gridY !== undefined ? cell.gridY : board.pixelToGrid(cell.x, cell.y).y;
        const cellKey = board.createPositionKey(gridX, gridY);

        // Check if the cell is occupied by opponent or self (invalid move)
        if (board.occupiedCells[opponentIndex][cellKey] || board.occupiedCells[playerIndex][cellKey]) {
            return -Infinity; // Invalid move
        }
        
        // For cell-extension, find the number of neighbors
        if (scoringMechanism === 'cell-extension') {
            const neighbors = board.canPlaceRectangle(cell.x, cell.y, playerIndex);
            return neighbors.length; // Score is the number of extensions
        }
        
        // For other scoring mechanisms
        // Simulate the move by adding the cell
        board.occupiedCells[playerIndex][cellKey] = true;
        
        // Calculate total score AFTER the move
        let totalScore;
        if (scoringMechanism === 'cell-multiplication') {
            totalScore = board.getMultiplicationScore(playerIndex);
        } else {
            totalScore = board.getConnectionScore(playerIndex); 
        }
        
        // Restore the board state by removing the simulated cell
        delete board.occupiedCells[playerIndex][cellKey];
        
        // Return the total score
        return totalScore;
    }
}

export class HumanPlayer extends Player {
    constructor(playerID) {
        super(playerID);
    }
}