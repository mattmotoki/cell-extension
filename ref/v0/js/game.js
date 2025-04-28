import {getPlayerMode, displayWinnerMessage} from "./utils.js";
import {Board} from "./board.js";
import {AIPlayer} from "./ai.js";


export class Game {

    constructor(gridSize, cellSize, playerColors, currentPlayer, scores, progress, scoreChart) {
        this.gridSize = gridSize;
        this.cellSize = cellSize;
        this.playerColors = playerColors;
        this.currentPlayer = currentPlayer;
        this.scores = scores;
        this.progress = progress;
        this.scoreChart = scoreChart;
        this.scoreDisplay = d3.select("#score-display");
        this.scoreDisplay.text("Scores: Player 1: 0, Player 2: 0");
        this.board = new Board(gridSize, cellSize, this.playerColors, this.handleCellClick.bind(this));
        this.connectionsVisible = false;
        this.opponent = new AIPlayer();
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

            // Update score
            this.scores[this.currentPlayer] += n_extensions;
            this.scoreChart.update(this.playerColors, this.scores);
            this.scoreDisplay.text(`Scores: Player 1: ${this.scores[0]}, Player 2: ${this.scores[1]}`);

            // Change players
            this.currentPlayer = (this.currentPlayer + 1) % 2;               

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
                var waitTime = 1350; // this.currentPlayer === 1 ? 1000 : 1350
            } else {
                var waitTime = 1000;
            }
            console.log(waitTime);
            setTimeout(displayWinnerMessage, waitTime, this.scores=this.scores);
        }        
    }


    handleOpponentMove() {
            
        // Get opponent's move
        let cell = this.opponent.getMove(this.currentPlayer, this.board);
        if (cell === undefined) {return;}
        let x = cell.x;
        let y = cell.y;

        let n_extensions = this.board.update(x, y, this.currentPlayer);

        // Update score
        this.scores[this.currentPlayer] += n_extensions;
        this.scoreChart.update(this.playerColors, this.scores);
        this.scoreDisplay.text(`Scores: Player 1: ${this.scores[0]}, Player 2: ${this.scores[1]}`);

        // Change players
        this.currentPlayer = (this.currentPlayer + 1) % 2;               
        this.progress = "playing";
        
    }


    reset() {

        // reset variables
        this.scores = [0, 0];
        this.progress = "playing";

        // change first player
        if (this.board.getAvailableCells().length == (this.gridSize/this.cellSize)**2) {
            this.currentPlayer = (this.currentPlayer + 1) % 2;
        }
        
        // reset board
        this.board.reset(this.playerColors);

        // reset score display
        this.scoreDisplay.text(`Scores: Player 1: ${this.scores[0]}, Player 2: ${this.scores[1]}`);
        this.scoreChart.reset(this.playerColors, this.scores);

        if ((getPlayerMode() == "ai") && (this.currentPlayer == 1)) {
            this.handleOpponentMove()
        }

    }       
    
    toggleConnections() {
        this.connectionsVisible = !this.connectionsVisible;
        this.board.linesGroup.style("display", this.connectionsVisible ? "block" : "none");
    }
    
} 

