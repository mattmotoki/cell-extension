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
        
        const availableCells = board.getAvailableCells();
        if (availableCells.length === 0) return null;
        
        // Simple strategy:
        // Moves 1-4: Completely random
        // Move 5+: Completely greedy (always choose the best move)
        if (this.moveCount < 8) {
            return availableCells[Math.floor(Math.random() * availableCells.length)];
        }
        
        // After move 4, play greedily
        // Calculate scores for each available cell
        const cellScores = availableCells.map(cell => {
            return {
                cell: cell,
                score: this.calculateCellScore(cell, board, scoringMechanism)
            };
        });
        
        // Sort by score (descending)
        cellScores.sort((a, b) => b.score - a.score);
        
        // Always choose the best move
        return cellScores[0].cell;
    }
    
    calculateCellScore(cell, board, scoringMechanism) {
        const playerIndex = this.playerID;
        const opponentIndex = (playerIndex + 1) % 2;
        
        // Safety check for board.occupiedCells
        if (!board.occupiedCells) board.occupiedCells = [{}, {}];
        if (!board.occupiedCells[playerIndex]) board.occupiedCells[playerIndex] = {};
        if (!board.occupiedCells[opponentIndex]) board.occupiedCells[opponentIndex] = {};
        
        const cellKey = `${cell.x}-${cell.y}`;

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