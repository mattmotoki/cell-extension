export class Player {
    constructor() {
        this.score = 0;
        this.move_history = [];
        this.score_history = [];
        this.connectedComponents = [];
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
        super(playerID);
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
        if (this.moveCount < 5) {
            // Play completely randomly for the first 4 moves
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
        if (!board.occupiedCells) {
            board.occupiedCells = [{}, {}];
        }
        if (!board.occupiedCells[playerIndex]) {
            board.occupiedCells[playerIndex] = {};
        }
        if (!board.occupiedCells[opponentIndex]) {
            board.occupiedCells[opponentIndex] = {};
        }
        
        // Check if the cell is occupied by opponent
        if (board.occupiedCells[opponentIndex][`${cell.x}-${cell.y}`]) {
            return -1000; // Invalid move
        }
        
        // Save the current board state
        const tempBoard = JSON.parse(JSON.stringify(board.occupiedCells));
        
        // Simulate the move
        board.occupiedCells[playerIndex][`${cell.x}-${cell.y}`] = true;
        
        // Calculate total score after the move
        let finalScore;
        if (scoringMechanism === 'cell-multiplication') {
            finalScore = board.getMultiplicationScore(playerIndex);
        } else {
            finalScore = board.getConnectionScore(playerIndex); 
        }
        
        // Restore the board
        board.occupiedCells = tempBoard;
        
        return finalScore;
    }
}

export class HumanPlayer extends Player {

    constructor() {
        super();
    }


}