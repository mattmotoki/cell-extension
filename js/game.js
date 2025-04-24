/**
 * game.js - Game Controller for Cell Collection
 * 
 * This file implements the main game controller that orchestrates gameplay.
 * 
 * The Game class is responsible for:
 * - Managing the game state (scores, current player, game progress)
 * - Handling player interactions and turn management
 * - Coordinating between the board, AI, and scoring visualization
 * - Implementing scoring mechanism switching
 * - Managing the game lifecycle (initialization, reset, game over)
 * 
 * Relationships with other files:
 * - board.js: Game uses board to manage the visual and logical game grid
 * - ai.js: Game instantiates and triggers AI opponent moves
 * - scoring.js: Game updates the score displays and breakdown
 * - utils.js: Game accesses utility functions for player modes and scoring
 */

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
        this.history = []; // Add history array
        
        // Initialize the score display
        this.updateScoreBreakdown();
        
        // Add a tooltip to the score display with scoring mechanism description
        this.updateScoreTooltip();
        
        // Store initial state for undo functionality
        this.storeInitialState();
    }

    // Helper method to update score breakdown with correct components
    updateScoreBreakdown() {
        const mechanism = getScoringMechanism();
        const components0 = this.board.getConnectedComponents(0);
        const components1 = this.board.getConnectedComponents(1);
        
        // Always pass components to scoreBreakdown
        this.scoreBreakdown.update(this.currentPlayer, this.scores, components0, components1);
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
                                
        // *** Store current state before making the move ***
        this.storeState();

        // Get the cell element and its coordinates
        let cell = d3.select(event.target);
        
        // Get pixel coordinates for rendering
        let pixelX = parseFloat(cell.attr("x"));
        let pixelY = parseFloat(cell.attr("y"));
        
        // Get grid coordinates (can also be retrieved from data attributes)
        let gridX = parseInt(cell.attr("data-grid-x"));
        let gridY = parseInt(cell.attr("data-grid-y"));

        // update board using pixel coordinates (board will convert to grid internally)
        let n_extensions = this.board.update(pixelX, pixelY, this.currentPlayer);

        if (n_extensions >= 0) {
            // Update score based on the selected scoring mechanism
            this.updateScore(n_extensions);

            // Change players
            this.currentPlayer = (this.currentPlayer + 1) % 2;               
            this.updateScoreBreakdown();

            // Get AI opponent's move
            if (getPlayerMode() === "ai") {
                this.progress = "waiting";
                // *** Store state again before AI move (in case player move was undone) ***
                // Note: AI move logic might need adjustment if undo is frequent
                // this.storeState(); // Consider if needed here or inside handleOpponentMove
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
                
                // Update score breakdown with components
                const components0Conn = this.board.getConnectedComponents(0);
                const components1Conn = this.board.getConnectedComponents(1);
                this.scoreBreakdown.update(this.currentPlayer, this.scores, components0Conn, components1Conn);
                break;
            case 'cell-multiplication':
                // Get connected components for both players
                const components0 = this.board.getConnectedComponents(0);
                const components1 = this.board.getConnectedComponents(1);
                
                // Calculate multiplication-based score (product of connected component sizes)
                this.scores[0] = this.board.getMultiplicationScore(0);
                this.scores[1] = this.board.getMultiplicationScore(1);
                
                // Update score breakdown with components
                this.scoreBreakdown.update(this.currentPlayer, this.scores, components0, components1);
                break;
            case 'cell-extension':
                // For Cell-Extension, calculate the product of extensions using board method
                this.scores[0] = this.board.getExtensionScore(0);
                this.scores[1] = this.board.getExtensionScore(1);
                
                // Update score breakdown with components
                const components0Ext = this.board.getConnectedComponents(0);
                const components1Ext = this.board.getConnectedComponents(1);
                this.scoreBreakdown.update(this.currentPlayer, this.scores, components0Ext, components1Ext);
                break;
            // Future implementations would go here
            default:
                // Default to cell-connection
                this.scores[this.currentPlayer] += n_extensions;
                const components0Def = this.board.getConnectedComponents(0);
                const components1Def = this.board.getConnectedComponents(1);
                this.scoreBreakdown.update(this.currentPlayer, this.scores, components0Def, components1Def);
        }
        
        // Update the score chart
        this.scoreChart.update(this.currentPlayer, this.scores);
    }

    handleOpponentMove() {
        // Get the current scoring mechanism instead of using potentially outdated value
        const currentScoringMechanism = getScoringMechanism();
        this.scoringMechanism = currentScoringMechanism;
            
        // *** Store current state before AI makes the move ***
        // Store state *before* AI calculates its move in case undo happens between player turn and AI turn
        this.storeState(); 

        // Get opponent's move
        let cell = this.opponent.getMove(this.board, currentScoringMechanism);
        if (cell === null) {
            console.warn("AI couldn't find a valid move");
            this.progress = "playing";
            return;
        }
        
        // The cell object now contains both pixel and grid coordinates
        let pixelX = cell.x;
        let pixelY = cell.y;
        
        // Use grid coordinates directly if available, otherwise compute them
        let gridX = cell.gridX !== undefined ? cell.gridX : null;
        let gridY = cell.gridY !== undefined ? cell.gridY : null;

        // Try to update the board with AI's move (using pixel coordinates)
        let n_extensions = this.board.update(pixelX, pixelY, this.currentPlayer);

        // Check if the move was valid and actually placed
        if (n_extensions >= 0) {
            // Update score based on the selected scoring mechanism
            this.updateScore(n_extensions);
            
            // Change players
            this.currentPlayer = (this.currentPlayer + 1) % 2;               
            this.updateScoreBreakdown();
            this.progress = "playing";
        } else {
            // Move was invalid, try again with a different move
            console.warn("AI attempted invalid move at", pixelX, pixelY, "grid:", gridX, gridY);
            
            // Find a random valid move instead
            const availableCells = this.board.getAvailableCells();
            if (availableCells.length > 0) {
                const randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];
                setTimeout(() => {
                    this.board.update(randomCell.x, randomCell.y, this.currentPlayer);
                    this.updateScore(1); // Assume at least 1 extension for the random move
                    this.currentPlayer = (this.currentPlayer + 1) % 2;
                    this.updateScoreBreakdown();
                    this.progress = "playing";
                }, 300);
            } else {
                // No moves available, end the game
                this.progress = "over";
                setTimeout(displayWinnerMessage, 1000, this.scores);
            }
        }
    }

    // Store initial state separately to ensure we have a valid start point
    storeInitialState() {
        const state = {
            boardState: this.board.getState(),
            scores: [...this.scores], // Deep copy scores
            currentPlayer: this.currentPlayer,
            progress: this.progress,
            scoreHistory1: [...this.scoreChart.scoreHistory1], 
            scoreHistory2: [...this.scoreChart.scoreHistory2],
            lastAction: "Initial game state",
            timestamp: new Date().toISOString()
        };
        
        console.log("Storing initial game state");
        this.history = [state]; // Reset history and add initial state
        
        // Enable/disable undo button based on history
        // We disable it initially since there are no moves to undo yet
        d3.select("#undo").property("disabled", true);
        d3.select("#undo-mobile").property("disabled", true);
    }

    // Method to store the current game state
    storeState() {
        // Only store state if game is playing or waiting
        if (this.progress === "over") {
            return; // Don't store state after game is over
        }
        
        const state = {
            boardState: this.board.getState(),
            scores: [...this.scores], // Deep copy scores
            currentPlayer: this.currentPlayer,
            progress: this.progress,
            scoreHistory1: [...this.scoreChart.scoreHistory1], // Store score chart history
            scoreHistory2: [...this.scoreChart.scoreHistory2],
            // Add metadata to help with debugging
            lastAction: `Before Player ${this.currentPlayer + 1}'s move`,
            timestamp: new Date().toISOString()
        };
        
        console.log(`Storing state: ${state.lastAction}, history length will be ${this.history.length + 1}`);
        this.history.push(state);
        
        // Enable undo button when moves are made
        d3.select("#undo").property("disabled", false);
        d3.select("#undo-mobile").property("disabled", false);
    }

    // Debug method to log the current state history (add after storeState method)
    debugHistory() {
        console.log("Current history stack:");
        this.history.forEach((state, index) => {
            console.log(`[${index}] ${state.lastAction || 'Initial state'} - Player ${state.currentPlayer + 1}'s turn next, scores: [${state.scores}]`);
        });
    }

    // Method to undo the last move
    undo() {
        console.log("Undo method called. History length:", this.history.length);
        
        // Debug the current history stack
        this.debugHistory();
        
        // Check if game is in progress and there's a state to go back to
        if (this.history.length <= 1) {
            console.log("No moves to undo. At initial state.");
            return; // Only initial state or no states at all
        }

        // Check if we're in AI player mode
        const isAIMode = getPlayerMode() === "ai";
        
        // Remove current state (the one we're undoing)
        this.history.pop();
        
        // In AI mode, if the current state would give us an AI's turn (player index 1),
        // we should pop one more state to get back to the human player's turn
        if (isAIMode && this.history.length > 1) {
            const nextState = this.history[this.history.length - 1];
            if (nextState.currentPlayer === 1) {
                console.log("AI mode: Skipping AI state and undoing to previous human player turn");
                this.history.pop(); // Remove one more state to skip the AI's turn
            }
        }
        
        // Get previous state (the one we're restoring to)
        const prevState = this.history[this.history.length - 1];

        console.log("Restoring to previous state:", {
            player: prevState.currentPlayer + 1,
            scores: prevState.scores,
            progress: prevState.progress
        });

        // Restore game state variables
        this.scores = [...prevState.scores]; // Use deep copy
        this.currentPlayer = prevState.currentPlayer;
        this.progress = prevState.progress;

        // Restore board state and redraw
        this.board.setState(prevState.boardState);

        // Restore score chart state and redraw
        this.scoreChart.setState(prevState.scoreHistory1, prevState.scoreHistory2);

        // Update UI elements
        this.updateScoreBreakdown(); // Update score display
        this.updateScoreTooltip();   // Update tooltip

        console.log("Undo complete. Player", this.currentPlayer + 1, "'s turn.");
        
        // Disable undo button if we're at the initial state now
        const shouldDisableUndo = this.history.length <= 1;
        d3.select("#undo").property("disabled", shouldDisableUndo);
        d3.select("#undo-mobile").property("disabled", shouldDisableUndo);
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

        // Reset history properly using the dedicated method
        this.storeInitialState();

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

