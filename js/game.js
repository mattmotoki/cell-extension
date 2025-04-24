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

import { getPlayerMode, displayWinnerMessage, getScoringMechanism, getScoringDescription } from "./utils.js";
import { ScoreBreakdown, ScoreChartRenderer } from "./scoring.js"; // Import ScoreChartRenderer
import { GameBoardLogic, BoardRenderer } from "./board/index.js"; // Import new board classes
import { AIPlayer } from "./ai.js";

export class Game {

    constructor(gridSize, cellSize, playerColors, initialPlayer, initialScores, initialProgress) {
        // Core game settings
        this.gridSize = gridSize; // Used for renderer
        this.cellSize = cellSize; // Used for renderer
        this.playerColors = playerColors;

        // Grid dimensions for logic
        const gridWidth = Math.floor(gridSize / cellSize);
        const gridHeight = Math.floor(gridSize / cellSize);

        // Game Logic Instance
        this.gameBoardLogic = new GameBoardLogic(gridWidth, gridHeight);

        // Renderer Instances
        this.boardRenderer = new BoardRenderer(gridSize, cellSize, playerColors, this.handleBoardClick.bind(this));
        this.scoreBreakdown = new ScoreBreakdown(playerColors);
        this.scoreChartRenderer = new ScoreChartRenderer(playerColors, gridSize);
        
        // AI Opponent
        this.opponent = new AIPlayer(1); // AI is player 1 (index 1)

        // Game State Variables
        this.currentPlayer = initialPlayer;
        this.scores = [...initialScores]; // Ensure copy
        this.progress = initialProgress;
        this.scoringMechanism = getScoringMechanism();
        
        // Score History (managed by Game class now)
        this.scoreHistory1 = [initialScores[0]]; 
        this.scoreHistory2 = [initialScores[1]];
        
        // Game History for Undo
        this.history = [];

        // Initial setup
        this.initializeGame();
    }

    initializeGame() {
        console.log("Initializing Game...");
        // Reset logic and renderers
        this.gameBoardLogic.reset();
        this.boardRenderer.reset();
        this.scoreBreakdown.reset(this.currentPlayer);
        this.scoreChartRenderer.reset(); 

        // Set initial tooltip and scores
        this.updateScoreTooltip();
        this.updateScoreBreakdown(); // Initial score display
        this.updateScoreChart(); // Initial chart display
        
        // Store initial state for undo
        this.storeInitialState();
        
        console.log("Game Initialized. Player:", this.currentPlayer + 1);
        // Trigger AI move if it starts
        if (getPlayerMode() === "ai" && this.currentPlayer === 1) {
             console.log("AI starts, scheduling move...");
             setTimeout(() => this.handleOpponentMove(), 600);
        }
    }

    // --- UI Update Helpers ---

    updateScoreBreakdown() {
        const mechanism = getScoringMechanism();
        // Get components directly from logic
        const components0 = this.gameBoardLogic.getConnectedComponents(0);
        const components1 = this.gameBoardLogic.getConnectedComponents(1);
        
        this.scoreBreakdown.update(this.currentPlayer, this.scores, components0, components1);
    }
    
    updateScoreTooltip() {
        const mechanism = getScoringMechanism();
        const description = getScoringDescription(mechanism);
        d3.select("#player-scores").attr("title", `Scoring: ${description}`);
        d3.select("#score-breakdown").attr("title", `Scoring: ${description}`);
    }

    updateScoreChart() {
        // Pass current score history to the renderer
        this.scoreChartRenderer.update(this.currentPlayer, this.scores, this.scoreHistory1, this.scoreHistory2);
    }
    
    updateBoardVisualization() {
        // Render the board based on the current logic state
        const boardState = this.gameBoardLogic.getState();
        this.boardRenderer.render(boardState);
    }

    // --- Game Flow Handlers ---

    // Renamed from handleCellClick, receives grid coordinates
    handleBoardClick(gridX, gridY) {
        console.log(`Board clicked at grid coordinates: (${gridX}, ${gridY})`);
        if (this.progress !== "playing") {
            console.log("Ignoring click: Game not in playing state.");
            return; // Ignore clicks if game is over or AI is thinking
        }

        // Store state *before* attempting the move
        this.storeState();
        
        // Attempt to place the cell using game logic
        const placed = this.gameBoardLogic.placeCell(gridX, gridY, this.currentPlayer);

        if (placed) {
            console.log("Cell placed successfully by logic.");
            // If placement is valid according to logic:
            // 1. Update score
            this.updateScore(); 
            
            // 2. Update score history
            this.scoreHistory1.push(this.scores[0]);
            this.scoreHistory2.push(this.scores[1]);

            // 3. Switch player
            this.currentPlayer = (this.currentPlayer + 1) % 2;

            // 4. Update UI (score breakdown, tooltip, score chart, board visuals)
            this.updateScoreBreakdown();
            this.updateScoreTooltip();
            this.updateScoreChart();
            this.updateBoardVisualization(); // Update board visuals *after* successful placement
            
            // 5. Check for game over
            if (this.isGameOver()) {
                this.endGame();
            } else if (getPlayerMode() === "ai" && this.currentPlayer === 1) {
                 // 6. Trigger AI move if applicable
                this.progress = "waiting"; // Set progress to waiting
                console.log("Player move complete. Scheduling AI move...");
                setTimeout(() => this.handleOpponentMove(), 500);
            } else {
                 console.log(`Player ${this.currentPlayer + 1}'s turn.`);
            }
        } else {
            console.log("Invalid move attempt.");
            // If move was invalid, remove the state we optimistically stored
            this.history.pop(); 
            // Maybe provide feedback to the user here (e.g., visual cue)
        }
    }
    
    handleOpponentMove() {
        if (this.progress !== "waiting") {
             console.warn("handleOpponentMove called when not waiting.");
             return;
        }
        console.log("AI starting move calculation...");
        this.scoringMechanism = getScoringMechanism(); // Ensure mechanism is current
            
        // Store state *before* AI calculates and makes its move
        this.storeState(); 

        // Get AI's chosen move (expecting {gridX, gridY})
        let move = this.opponent.getMove(this.gameBoardLogic, this.scoringMechanism); // Pass logic board
        
        if (move === null) {
            console.warn("AI couldn't find a valid move.");
             // If AI cannot move, check if game should end or if it's a bug
             if (this.isGameOver()) {
                this.endGame();
             } else {
                 // Potentially an issue, allow player to move again? Or retry AI?
                 console.error("AI failed to move, but game not over. Allowing player turn.");
                 this.progress = "playing";
             }
            return;
        }
        
        console.log(`AI intends to move to: (${move.gridX}, ${move.gridY})`);
        // Attempt to place the cell using game logic
        const placed = this.gameBoardLogic.placeCell(move.gridX, move.gridY, this.currentPlayer); // AI is currentPlayer (1)

        if (placed) {
             console.log("AI move placed successfully by logic.");
            // If placement is valid:
            // 1. Update score
            this.updateScore();
            
            // 2. Update score history
            this.scoreHistory1.push(this.scores[0]);
            this.scoreHistory2.push(this.scores[1]);

            // 3. Switch player back to human (player 0)
            this.currentPlayer = (this.currentPlayer + 1) % 2;
            
             // 4. Set progress back to playing
            this.progress = "playing";
            
            // 5. Update UI
            this.updateScoreBreakdown();
            this.updateScoreTooltip();
            this.updateScoreChart();
            this.updateBoardVisualization();

            // 6. Check for game over
            if (this.isGameOver()) {
                this.endGame();
            } else {
                console.log(`AI move complete. Player ${this.currentPlayer + 1}'s turn.`);
            }
        } else {
            console.error("AI attempted invalid move! Logic prevented placement.", move);
             // If AI move was invalid according to logic, remove the stored state
             this.history.pop();
             this.progress = "playing"; // Allow player to try again or debug
             // Consider a fallback (e.g., random valid move) or error handling
             this.triggerRandomAIMove(); // Example fallback
        }
    }
    
    // Example fallback if AI fails
    triggerRandomAIMove() {
        console.warn("Attempting random fallback move for AI...");
        const available = this.gameBoardLogic.getAvailableCells();
        if (available.length > 0) {
             const randomMove = available[Math.floor(Math.random() * available.length)];
             setTimeout(() => {
                 console.log(`AI fallback: trying random move at (${randomMove.gridX}, ${randomMove.gridY})`);
                 // Re-attempt the move sequence with the random choice
                 this.storeState(); // Store before this attempt
                 const placed = this.gameBoardLogic.placeCell(randomMove.gridX, randomMove.gridY, this.currentPlayer);
                 if (placed) {
                     this.updateScore();
                     this.scoreHistory1.push(this.scores[0]);
                     this.scoreHistory2.push(this.scores[1]);
                     this.currentPlayer = (this.currentPlayer + 1) % 2;
                     this.progress = "playing";
                     this.updateScoreBreakdown();
                     this.updateScoreTooltip();
                     this.updateScoreChart();
                     this.updateBoardVisualization();
                     if (this.isGameOver()) this.endGame();
                     else console.log(`AI fallback move complete. Player ${this.currentPlayer + 1}'s turn.`);
                 } else {
                     console.error("Fallback random AI move also failed!");
                      this.history.pop(); // Remove the state stored for the fallback
                      this.progress = "playing"; // Give up for now, let player try
                 }
             }, 300);
        } else {
            console.log("No available cells for fallback AI move.");
             this.progress = "playing"; // No moves left, should be game over soon
        }
    }

    // --- Scoring and Game State ---
    
    updateScore() {
        const mechanism = getScoringMechanism();
        // Calculate scores using the logic class
        this.scores[0] = this.gameBoardLogic.calculateScore(0, mechanism);
        this.scores[1] = this.gameBoardLogic.calculateScore(1, mechanism);
        console.log(`Scores updated (${mechanism}): P1=${this.scores[0]}, P2=${this.scores[1]}`);
    }
    
    isGameOver() {
        // Game is over if there are 1 or fewer available cells
        const availableCellsCount = this.gameBoardLogic.getAvailableCells().length;
        const gameOver = availableCellsCount <= 1;
        if (gameOver) {
            console.log("Game Over condition met.");
        }
        return gameOver;
    }

    endGame() {
        console.log("Ending game...");
        this.progress = "over";
        this.updateBoardVisualization(); // Final board render
        this.updateScoreBreakdown(); // Final score display
        this.updateScoreChart(); // Final chart update
        
        // Determine wait time based on player mode
        const waitTime = (getPlayerMode() === "ai") ? 1350 : 1000;
        setTimeout(() => displayWinnerMessage(this.scores), waitTime);
    }

    // --- State Management (Undo/Reset) ---
    
    storeInitialState() {
        const state = {
            boardLogicState: this.gameBoardLogic.getState(),
            scores: [...this.scores],
            currentPlayer: this.currentPlayer,
            progress: this.progress,
            scoreHistory1: [...this.scoreHistory1],
            scoreHistory2: [...this.scoreHistory2],
            lastAction: "Initial game state",
            timestamp: new Date().toISOString()
        };
        console.log("Storing initial game state");
        this.history = [state]; 
        d3.select("#undo").property("disabled", true);
        d3.select("#undo-mobile").property("disabled", true);
    }

    storeState() {
        if (this.progress === "over") return;
        
        const state = {
            boardLogicState: this.gameBoardLogic.getState(), // Get state from logic board
            scores: [...this.scores],
            currentPlayer: this.currentPlayer,
            progress: this.progress,
            scoreHistory1: [...this.scoreHistory1],
            scoreHistory2: [...this.scoreHistory2],
            lastAction: `Before Player ${this.currentPlayer + 1}'s move`, 
            timestamp: new Date().toISOString()
        };
        console.log(`Storing state: ${state.lastAction}, history length will be ${this.history.length + 1}`);
        this.history.push(state);
        d3.select("#undo").property("disabled", false);
        d3.select("#undo-mobile").property("disabled", false);
    }

    debugHistory() {
        console.log("Current history stack:");
        this.history.forEach((state, index) => {
            console.log(`[${index}] ${state.lastAction || 'Initial state'} - Player ${state.currentPlayer + 1}'s turn next, scores: [${state.scores}]`);
        });
    }

    undo() {
        console.log("Undo method called. History length:", this.history.length);
        this.debugHistory();
        
        if (this.history.length <= 1) {
            console.log("No moves to undo. At initial state.");
            return; 
        }

        const isAIMode = getPlayerMode() === "ai";
        this.history.pop(); // Pop current state
        
        // In AI mode, pop again if the resulting state is AI's turn
        if (isAIMode && this.history.length > 1 && this.history[this.history.length - 1].currentPlayer === 1) {
            console.log("AI mode: Skipping AI state and undoing to previous human player turn");
            this.history.pop();
        }
        
        const prevState = this.history[this.history.length - 1];
        console.log("Restoring to previous state:", { player: prevState.currentPlayer + 1, scores: prevState.scores });

        // Restore core state variables
        this.scores = [...prevState.scores];
        this.currentPlayer = prevState.currentPlayer;
        this.progress = prevState.progress; // Restore progress state
        
        // Restore score history from the state
        this.scoreHistory1 = [...prevState.scoreHistory1];
        this.scoreHistory2 = [...prevState.scoreHistory2];

        // Restore logic board state
        this.gameBoardLogic.setState(prevState.boardLogicState);

        // Update all UI components based on restored state
        this.updateBoardVisualization();
        this.updateScoreBreakdown();
        this.updateScoreTooltip();
        this.updateScoreChart();

        console.log("Undo complete. Player", this.currentPlayer + 1, "'s turn.");
        
        const shouldDisableUndo = this.history.length <= 1;
        d3.select("#undo").property("disabled", shouldDisableUndo);
        d3.select("#undo-mobile").property("disabled", shouldDisableUndo);
    }

    reset() {
        console.log("Resetting game...");
        // Preserve player turn *only* if it's a scoring mechanism change, otherwise toggle
        const previousMechanism = this.scoringMechanism;
        this.scoringMechanism = getScoringMechanism();
        const isScoringChange = previousMechanism !== this.scoringMechanism;
        const originalPlayer = this.currentPlayer;
        
        // Reset core state variables
        this.scores = [0, 0];
        this.progress = "playing";
        this.scoreHistory1 = [0];
        this.scoreHistory2 = [0];
        
        // Determine starting player for the new game
        if (!isScoringChange) {
            this.currentPlayer = (originalPlayer + 1) % 2; // Toggle player if not just a scoring change
        } else {
            this.currentPlayer = originalPlayer; // Keep player if only scoring changed
        }
        
        // Reset AI state (like move count)
        this.opponent.moveCount = 0;

        // Re-initialize (resets logic, renderers, stores initial state)
        this.initializeGame();
        
        console.log("Game reset complete.");
    }       
} 

