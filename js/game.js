import {getPlayerMode, displayWinnerMessage, getScoringMechanism, getScoringDescription} from "./utils.js";
import {ScoreChart, ScoreBreakdown} from "./scoring.js";
import {Board} from "./board.js";
import {AIPlayer} from "./ai.js";


export class Game {

    constructor(gridSize, cellSize, playerColors, currentPlayer, scores, progress) {
        this.gridSize = gridSize;
        this.cellSize = cellSize;
        this.playerColors = playerColors;
        this.currentPlayer = currentPlayer;
        this.scores = scores;
        this.progress = progress;
        this.scoringMechanism = getScoringMechanism(); // Get initial scoring mechanism
        this.scoreBreakdown = new ScoreBreakdown(playerColors);
        this.scoreChart = new ScoreChart(playerColors, gridSize);
        this.board = new Board(gridSize, cellSize, this.playerColors, this.handleCellClick.bind(this));
        this.opponent = new AIPlayer(1); // Initialize with AI as player 1
        
        // Initialize the score display
        this.updateScoreBreakdown();
        
        // Add a tooltip to the score display with scoring mechanism description
        this.updateScoreTooltip();
    }

    // Helper method to update score breakdown with correct components
    updateScoreBreakdown() {
        const mechanism = getScoringMechanism();
        if (mechanism === 'cell-multiplication') {
            const components0 = this.board.getConnectedComponents(0);
            const components1 = this.board.getConnectedComponents(1);
            this.scoreBreakdown.update(this.currentPlayer, this.scores, components0, components1);
        } else {
            this.scoreBreakdown.update(this.currentPlayer, this.scores);
        }
    }
    
    updateScoreTooltip() {
        // Get current scoring mechanism and its description
        const mechanism = getScoringMechanism();
        const description = getScoringDescription(mechanism);
        
        // Add tooltip to both score display elements
        d3.select("#player-scores")
            .attr("title", `Scoring: ${description}`);
        d3.select("#score-breakdown")
            .attr("title", `Scoring: ${description}`);
    }

    handleCellClick(event) {
                
        // Check if we're waiting for opponent's move
        if (this.progress === "waiting") {return;}
                                
        let cell = d3.select(event.target);
        let x = parseFloat(cell.attr("x"));
        let y = parseFloat(cell.attr("y"));

        // update board
        let n_extensions = this.board.update(x, y, this.currentPlayer);

        if (n_extensions >= 0) {
            // Update score based on the selected scoring mechanism
            this.updateScore(n_extensions);

            // Change players
            this.currentPlayer = (this.currentPlayer + 1) % 2;               
            this.updateScoreBreakdown();

            // Get AI opponent's move
            if (getPlayerMode() === "ai") {
                this.progress = "waiting";
                setTimeout(this.handleOpponentMove.bind(this), 500);
            }
        }

        // If there are no more available cells, the game is over
        if (this.board.getAvailableCells().length <= 1) {
            this.progress = "over";
            
            if (getPlayerMode() == "ai") {
                var waitTime = 1350;
            } else {
                var waitTime = 1000;
            }
            setTimeout(displayWinnerMessage, waitTime, this.scores=this.scores);
        }
    }
    
    updateScore(n_extensions) {
        // Get current scoring mechanism
        const mechanism = getScoringMechanism();
        
        // Use the appropriate scoring mechanism
        switch(mechanism) {
            case 'cell-connection':
                // Calculate the total connection count
                const player0Connections = this.board.getConnectionScore(0);
                const player1Connections = this.board.getConnectionScore(1);
                
                // Update scores with the total connection count
                this.scores[0] = player0Connections;
                this.scores[1] = player1Connections;
                
                // Update score breakdown without components
                this.scoreBreakdown.update(this.currentPlayer, this.scores);
                break;
            case 'cell-multiplication':
                // Get connected components for both players
                const components0 = this.board.getConnectedComponents(0);
                const components1 = this.board.getConnectedComponents(1);
                
                // Calculate multiplication-based score (product of connected component sizes)
                this.scores[0] = this.board.getMultiplicationScore(0);
                this.scores[1] = this.board.getMultiplicationScore(1);
                
                // Update score breakdown
                this.scoreBreakdown.update(this.currentPlayer, this.scores, components0, components1);
                break;
            // Future implementations would go here
            default:
                // Default to cell-connection
                this.scores[this.currentPlayer] += n_extensions;
                this.scoreBreakdown.update(this.currentPlayer, this.scores);
        }
        
        // Update the score chart
        this.scoreChart.update(this.currentPlayer, this.scores);
    }

    handleOpponentMove() {
            
        // Get opponent's move
        let cell = this.opponent.getMove(this.board, this.scoringMechanism);
        if (cell === null) {return;}
        let x = cell.x;
        let y = cell.y;

        let n_extensions = this.board.update(x, y, this.currentPlayer);

        // Update score based on the selected scoring mechanism
        this.updateScore(n_extensions);
        
        // Change players
        this.currentPlayer = (this.currentPlayer + 1) % 2;               
        this.updateScoreBreakdown();
        this.progress = "playing";
    }


    reset() {
        // Store original player to preserve it during scoring mechanism changes
        const originalPlayer = this.currentPlayer;
        
        // reset variables
        this.scores = [0, 0];
        this.progress = "playing";
        
        // Get previous scoring mechanism
        const previousMechanism = this.scoringMechanism;
        
        // Update the scoring mechanism from UI
        this.scoringMechanism = getScoringMechanism();
        this.updateScoreTooltip();

        // Only change first player if this is a new game, not a scoring mechanism change
        const isNewGame = this.board.getAvailableCells().length == (this.gridSize/this.cellSize)**2;
        const isScoringChange = previousMechanism !== this.scoringMechanism;
        
        if (isNewGame && !isScoringChange) {
            this.currentPlayer = (this.currentPlayer + 1) % 2;
        } else if (isScoringChange) {
            // If scoring mechanism changed, keep the same player
            this.currentPlayer = originalPlayer;
        }
        
        // reset board
        this.board.reset(this.playerColors);

        // reset score display and chart
        this.scoreBreakdown.reset(this.currentPlayer);
        this.scoreChart.reset();
        
        // Reset the AI player's move counter
        this.opponent.moveCount = 0;
        
        // Update score breakdown after reset
        this.updateScoreBreakdown();

        if ((getPlayerMode() === "ai") && (this.currentPlayer === 1)) {
            setTimeout(this.handleOpponentMove.bind(this), 600);
        }
    }       
} 

