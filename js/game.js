import {getPlayerMode, displayWinnerMessage, getScoringMechanism, getScoringDescription} from "./utils.js";
import {ScoreChart, ScoreDisplay} from "./scoring.js";
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
        this.scoreDisplay = new ScoreDisplay(currentPlayer, playerColors);
        this.scoreChart = new ScoreChart(playerColors, gridSize);
        this.board = new Board(gridSize, cellSize, this.playerColors, this.handleCellClick.bind(this));
        this.opponent = new AIPlayer();
        
        // Add a tooltip to the score display with scoring mechanism description
        this.updateScoreTooltip();
    }
    
    updateScoreTooltip() {
        // Get current scoring mechanism and its description
        const mechanism = getScoringMechanism();
        const description = getScoringDescription(mechanism);
        
        // Add tooltip to score display
        d3.select("#score-display")
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
            this.scoreDisplay.update(this.currentPlayer, this.scores);

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
                // Current implementation - score is number of connections
                this.scores[this.currentPlayer] += n_extensions;
                break;
            case 'cell-multiplication':
                // Calculate multiplication-based score (product of connected component sizes)
                this.scores[0] = this.board.getMultiplicationScore(0);
                this.scores[1] = this.board.getMultiplicationScore(1);
                break;
            // Future implementations would go here
            default:
                // Default to cell-connection
                this.scores[this.currentPlayer] += n_extensions;
        }
        
        // Update the score chart
        this.scoreChart.update(this.currentPlayer, this.scores);
    }

    handleOpponentMove() {
            
        // Get opponent's move
        let cell = this.opponent.getMove(this.currentPlayer, this.board);
        if (cell === undefined) {return;}
        let x = cell.x;
        let y = cell.y;

        let n_extensions = this.board.update(x, y, this.currentPlayer);

        // Update score based on the selected scoring mechanism
        this.updateScore(n_extensions);
        
        // Change players
        this.currentPlayer = (this.currentPlayer + 1) % 2;               
        this.scoreDisplay.update(this.currentPlayer, this.scores);
        this.progress = "playing";
    }


    reset() {
        // reset variables
        this.scores = [0, 0];
        this.progress = "playing";
        
        // Update the scoring mechanism from UI
        this.scoringMechanism = getScoringMechanism();
        this.updateScoreTooltip();

        // change first player
        if (this.board.getAvailableCells().length == (this.gridSize/this.cellSize)**2) {
            this.currentPlayer = (this.currentPlayer + 1) % 2;
        }
        
        // reset board
        this.board.reset(this.playerColors);

        // reset score display and chart
        this.scoreDisplay.reset(this.currentPlayer);
        this.scoreChart.reset();

        if ((getPlayerMode() === "ai") && (this.currentPlayer === 1)) {
            setTimeout(this.handleOpponentMove.bind(this), 600);
        }
    }       
} 

