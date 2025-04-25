/**
 * Game.js - Game Controller for Cell Collection
 * 
 * This file implements the main game controller that orchestrates gameplay logic.
 * 
 * The Game class is responsible for:
 * - Managing the game state (scores, current player, game progress)
 * - Handling player interactions and turn management
 * - Coordinating between the board, AI, and scoring mechanisms
 * - Implementing scoring mechanism switching
 * - Managing the game lifecycle (initialization, reset, game over)
 * - Providing undo functionality and history management
 * 
 * Relationships:
 * - Imports GameBoardLogic from "./board/index.js"
 * - Imports AIPlayer from "./ai/AIPlayer.js"
 * - Communicates with main.js to provide game state and receive player input
 * - Provides state data for rendering components
 * 
 * Revision Log:
 * - Added logger implementation for verbosity control
 * 
 * Note: This revision log should be updated whenever this file is modified.
 */

import { GameBoardLogic } from "./board/index.js"; // Correct relative path
import { AIPlayer } from "./ai/AIPlayer.js"; // Correct relative path
import logger from '../utils/logger.js';

// Create a module-specific logger
const log = logger.createLogger('Game');

export class Game {

    constructor(gridWidth, gridHeight, playerColors, initialPlayer, initialScores, initialProgress, initialScoringMechanism) {
        // Core game settings REMOVED gridSize, cellSize as they are rendering concerns
        this.playerColors = playerColors; // Keep colors if needed for logic (e.g. player ID association)

        // Game Logic Instance
        this.gameBoardLogic = new GameBoardLogic(gridWidth, gridHeight);

        // AI Opponent
        this.opponent = new AIPlayer(1, 'easy'); // AI is player 1 (index 1), default to easy difficulty

        // Game State Variables
        this.currentPlayer = initialPlayer;
        this.scores = [...initialScores]; // Ensure copy
        this.progress = initialProgress; // "playing", "waiting", "over"
        this.scoringMechanism = initialScoringMechanism; // Set from constructor

        // Score History (managed by Game class now)
        this.scoreHistory1 = [initialScores[0]];
        this.scoreHistory2 = [initialScores[1]];

        // Game History for Undo
        this.history = [];
        
        // Flag to indicate state change for renderer
        this.stateChanged = true; 

        // Initial setup
        this.initializeGame();
    }
    
    // Method for external listener (renderer) to check if state changed
    hasStateChanged() {
        if (this.stateChanged) {
            this.stateChanged = false; // Reset flag after check
            return true;
        }
        return false;
    }
    
    // Get current game state for rendering
    getCurrentState() {
        return {
            boardLogicState: this.gameBoardLogic.getState(),
            scores: [...this.scores],
            currentPlayer: this.currentPlayer,
            progress: this.progress,
            scoreHistory1: [...this.scoreHistory1],
            scoreHistory2: [...this.scoreHistory2],
            scoringMechanism: this.scoringMechanism, // Renderer might need this for context
            historyLength: this.history.length,
            // Add any other relevant state needed by the renderer
        };
    }


    initializeGame() {
        log.info("Initializing Game Logic...");
        // Reset logic 
        this.gameBoardLogic.reset();
        // REMOVED renderer resets (boardRenderer, scoreBreakdown, scoreChartRenderer)

        // Reset internal state
        this.scores = [0, 0];
        this.currentPlayer = 0; // Player 0 starts by default, reset might change this
        this.progress = "playing";
        this.scoreHistory1 = [0];
        this.scoreHistory2 = [0];
        // this.scoringMechanism = getScoringMechanism(); // Update mechanism - NO, keep the one passed to reset or constructor
        
        // REMOVED UI updates (tooltip, score breakdown, chart)

        // Store initial state for undo
        this.storeInitialState();
        
        this.stateChanged = true; // Indicate state change
        log.info("Game Logic Initialized. Player:", this.currentPlayer + 1);

        // // Trigger AI move if it starts - LOGIC ONLY, Game loop/main will handle timeout
        // if (getPlayerMode() === "ai" && this.currentPlayer === 1) {
        //      console.log("AI starts, needs move..."); // Just log, main.js triggers
        // }
    }

    // --- UI Update Helpers --- REMOVED ---
    // updateScoreBreakdown() 
    // updateScoreTooltip()
    // updateScoreChart()
    // updateBoardVisualization()

    // --- Game Flow Handlers ---

    // Renamed from handleCellClick, receives grid coordinates
    handlePlayerMove(gridX, gridY) { // Renamed for clarity
        log.debug(`Logic attempting player move at: (${gridX}, ${gridY})`);
        if (this.progress !== "playing") {
            log.debug("Ignoring move: Game not in playing state.");
            return false; // Indicate move failed
        }
        
        // Allow move only if it's the human player's turn
        // (Assuming player 0 is human in AI mode, or current player in 2P mode)
        // Let main.js handle player mode check before calling this? Safer.
        // if (getPlayerMode() === "ai" && this.currentPlayer !== 0) {
        //     console.log("Ignoring move: Not human player's turn.");
        //     return false;
        // }

        // Store state *before* attempting the move
        this.storeState();

        // Attempt to place the cell using game logic
        const placed = this.gameBoardLogic.placeCell(gridX, gridY, this.currentPlayer);

        if (placed) {
            log.debug("Cell placed successfully by logic.");
            this.stateChanged = true; // Indicate state change
            // 1. Update score
            this.updateScore();

            // 2. Update score history
            this.scoreHistory1.push(this.scores[0]);
            this.scoreHistory2.push(this.scores[1]);

            // 3. Switch player
            this.currentPlayer = (this.currentPlayer + 1) % 2;

            // 4. Update UI - REMOVED 

            // 5. Check for game over
            if (this.isGameOver()) {
                this.endGame(); // Sets progress to 'over'
            } else {
                // 6. Check if AI needs to move next
                // Let main.js handle player mode check
                // if (getPlayerMode() === "ai" && this.currentPlayer === 1) {
                //     this.progress = "waiting"; // Set progress to waiting for AI
                //     console.log("Player move complete. AI needs to move.");
                // } else {
                     log.debug(`Logic: Player ${this.currentPlayer + 1}'s turn.`);
                // }
            }
            return true; // Indicate move succeeded
        } else {
            log.debug("Invalid move attempt.");
            // If move was invalid, remove the state we optimistically stored
            this.history.pop();
            return false; // Indicate move failed
        }
    }
    
    // Method for the game loop to trigger the AI calculation
    requestAIMove() {
         if (this.progress !== "waiting") { // Should be called only when waiting for AI
             log.warn("requestAIMove called when not waiting.");
             return null; // Indicate no move needed or error
         }
         log.info("AI starting move calculation...");
         // this.scoringMechanism = getScoringMechanism(); // Ensure mechanism is current - NO, use internal state

         // Store state *before* AI calculates and makes its move
         this.storeState();

         // Get AI's chosen move (expecting {gridX, gridY})
         // NOTE: This is SYNCHRONOUS now. If it takes too long, needs web worker.
         let move = this.opponent.getMove(this.gameBoardLogic, this.scoringMechanism); // Pass logic board

         if (move === null) {
             log.warn("AI couldn't find a valid move.");
             // If AI cannot move, check if game should end or if it's a bug
             if (this.isGameOver()) {
                 this.endGame();
             } else {
                 log.error("AI failed to move, but game not over.");
                 this.progress = "playing"; // Let human play again? Or flag error?
                 this.stateChanged = true;
             }
             return null; // Indicate AI failed or game ended
         }

         log.debug(`AI intends to move to: (${move.gridX}, ${move.gridY})`);
         // Attempt to place the cell using game logic
         const placed = this.gameBoardLogic.placeCell(move.gridX, move.gridY, this.currentPlayer); // AI is currentPlayer (1)

         if (placed) {
             log.debug("AI move placed successfully by logic.");
             this.stateChanged = true;
             // 1. Update score
             this.updateScore();

             // 2. Update score history
             this.scoreHistory1.push(this.scores[0]);
             this.scoreHistory2.push(this.scores[1]);

             // 3. Switch player back to human (player 0)
             this.currentPlayer = (this.currentPlayer + 1) % 2;

             // 4. Set progress back to playing
             this.progress = "playing";

             // 5. Update UI - REMOVED

             // 6. Check for game over
             if (this.isGameOver()) {
                 this.endGame();
             } else {
                 log.debug(`AI move complete. Player ${this.currentPlayer + 1}'s turn.`);
             }
             // Return the move AI made for potential rendering feedback
             return move; 
         } else {
             log.error("AI attempted invalid move! Logic prevented placement.", move);
             // If AI move was invalid according to logic, remove the stored state
             this.history.pop();
             this.progress = "playing"; // Allow player to try again or debug?
             this.stateChanged = true; 
             // Consider a fallback (e.g., random valid move) or error handling
             return this.triggerRandomAIMove(); // Example fallback returns the move made
         }
    }

    // --- handleOpponentMove() REMOVED --- (Replaced by requestAIMove)

    // Example fallback if AI fails - now SYNCHRONOUS
    triggerRandomAIMove() {
        log.warn("Attempting random fallback move for AI...");
        const available = this.gameBoardLogic.getAvailableCells();
        if (available.length > 0) {
             const randomMove = available[Math.floor(Math.random() * available.length)];
             log.debug(`AI fallback: trying random move at (${randomMove.gridX}, ${randomMove.gridY})`);
             // Re-attempt the move sequence with the random choice
             this.storeState(); // Store before this attempt
             const placed = this.gameBoardLogic.placeCell(randomMove.gridX, randomMove.gridY, this.currentPlayer);
             if (placed) {
                 this.updateScore();
                 this.scoreHistory1.push(this.scores[0]);
                 this.scoreHistory2.push(this.scores[1]);
                 this.currentPlayer = (this.currentPlayer + 1) % 2;
                 this.progress = "playing";
                 this.stateChanged = true;
                 // REMOVED UI updates
                 if (this.isGameOver()) this.endGame();
                 else log.debug(`AI fallback move complete. Player ${this.currentPlayer + 1}'s turn.`);
                 return randomMove; // Return the move made
             } else {
                 log.error("Fallback random AI move also failed!");
                 this.history.pop(); // Remove the state stored for the fallback
                 this.progress = "playing"; // Give up for now
                 this.stateChanged = true; 
                 return null; // Indicate failure
             }
             // REMOVED setTimeout
        } else {
            log.debug("No available cells for fallback AI move.");
             this.progress = "playing"; // No moves left, should be game over soon
             this.stateChanged = true; 
             return null; // Indicate no move possible
        }
    }

    // --- Scoring and Game State ---

    updateScore() {
        // Get current mechanism (could be passed in or read from state)
        const mechanism = this.scoringMechanism; 
        // Calculate scores using the logic class
        this.scores[0] = this.gameBoardLogic.calculateScore(0, mechanism);
        this.scores[1] = this.gameBoardLogic.calculateScore(1, mechanism);
        log.debug(`Logic Scores updated (${mechanism}): P1=${this.scores[0]}, P2=${this.scores[1]}`);
        this.stateChanged = true; 
    }

    isGameOver() {
        // Game is over if there are 1 or fewer available cells
        const availableCellsCount = this.gameBoardLogic.getAvailableCells().length;
        const gameOver = availableCellsCount < 1;
        if (gameOver) {
            log.debug("Game Over condition met.");
        }
        return gameOver;
    }

    endGame() {
        log.info("Ending game logic...");
        this.progress = "over";
        this.stateChanged = true; 
        // REMOVED UI updates (board, scores, chart, winner message)
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
            scoringMechanism: this.scoringMechanism, // Store mechanism in history
            lastAction: "Initial game state",
            timestamp: new Date().toISOString()
        };
        log.debug("Storing initial game state");
        this.history = [state];
        // REMOVED UI updates (disable undo button)
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
            scoringMechanism: this.scoringMechanism, // Store mechanism in history
            lastAction: `Before Player ${this.currentPlayer + 1}'s move`,
            timestamp: new Date().toISOString()
        };
        log.trace(`Storing state: ${state.lastAction}, history length will be ${this.history.length + 1}`);
        this.history.push(state);
        this.stateChanged = true; // Storing state changes history
        // REMOVED UI updates (enable undo button)
    }

    debugHistory() {
        log.debug("Current history stack:");
        this.history.forEach((state, index) => {
            log.debug(`[${index}] ${state.lastAction || 'Initial state'} - Player ${state.currentPlayer + 1}'s turn next, scores: [${state.scores}]`);
        });
    }

    undo() {
        log.info("Undo method called. History length:", this.history.length);
        this.debugHistory();

        if (this.history.length <= 1) {
            log.debug("No moves to undo. At initial state.");
            return false; // Indicate undo failed
        }

        // Let main.js handle player mode check for double pop
        // const isAIMode = getPlayerMode() === "ai"; 
        this.history.pop(); // Pop current state

        // // In AI mode, pop again if the resulting state is AI's turn
        // if (isAIMode && this.history.length > 1 && this.history[this.history.length - 1].currentPlayer === 1) {
        //     console.log("AI mode: Skipping AI state and undoing to previous human player turn");
        //     this.history.pop();
        // }
        
        // If the previous state was the AI's turn in AI mode, pop again
        // This logic might be better placed in the main game loop handling undo
        
        // Make sure there's still a state to restore
        if (this.history.length === 0) {
             log.error("History became empty after popping, should not happen.");
             this.reset(); // Reset to a known good state
             return false;
        }

        const prevState = this.history[this.history.length - 1];
        log.debug("Restoring to previous logic state:", { player: prevState.currentPlayer + 1, scores: prevState.scores });

        // Restore core state variables
        this.scores = [...prevState.scores];
        this.currentPlayer = prevState.currentPlayer;
        this.progress = prevState.progress; // Restore progress state

        // Restore score history from the state
        this.scoreHistory1 = [...prevState.scoreHistory1];
        this.scoreHistory2 = [...prevState.scoreHistory2];

        // Restore logic board state
        this.gameBoardLogic.setState(prevState.boardLogicState);

        // Update scoring mechanism based on restored state (in case it changed?)
        // Or assume reset handles mechanism changes
        // this.scoringMechanism = getScoringMechanism(); // Re-read from UI state? Risky. Store in history?
        this.scoringMechanism = prevState.scoringMechanism; // Restore from history!

        // REMOVED UI updates

        log.debug("Undo complete. Player", this.currentPlayer + 1, "'s turn.");
        this.stateChanged = true; 
        
        // REMOVED UI updates (undo button state)
        return true; // Indicate undo succeeded
    }
    
    // Undo specifically for AI mode, popping twice
    undoAIMove() {
         log.info("Attempting AI double undo. History length:", this.history.length);
         if (this.history.length <= 1) return false;
         this.history.pop(); // Pop AI's move result state
         if (this.history.length <= 1) { // Check again after first pop
             log.debug("Only one state left after first pop, cannot double undo.");
             // We need to restore the single remaining state
             return this.undo(); // Call the single undo logic
         } else {
              log.debug("Popping player's move state before AI moved.");
              this.history.pop(); // Pop player's move state
         }
         
         // Now restore the state from the top of the stack (which should be before player's last move)
        const prevState = this.history[this.history.length - 1];
        log.debug("Restoring to state before player's last move:", { player: prevState.currentPlayer + 1, scores: prevState.scores });
        
        // Restore core state variables
        this.scores = [...prevState.scores];
        this.currentPlayer = prevState.currentPlayer;
        this.progress = prevState.progress; 
        this.scoreHistory1 = [...prevState.scoreHistory1];
        this.scoreHistory2 = [...prevState.scoreHistory2];
        this.gameBoardLogic.setState(prevState.boardLogicState);
        this.scoringMechanism = prevState.scoringMechanism; // Restore from history

        log.debug("AI double undo complete. Player", this.currentPlayer + 1, "'s turn.");
        this.stateChanged = true; 
        return true; // Indicate success
    }


    reset(newScoringMechanism, newPlayerMode) { // Accept new settings
        log.info("Resetting game logic...");
        
        const previousMechanism = this.scoringMechanism;
        const isScoringChange = previousMechanism !== newScoringMechanism;
        const originalPlayer = this.currentPlayer; // Keep track of who was playing

        // Reset core state variables
        this.scores = [0, 0];
        this.progress = "playing";
        this.scoreHistory1 = [0];
        this.scoreHistory2 = [0];
        this.scoringMechanism = newScoringMechanism; // Use the new mechanism

        // Determine starting player for the new game
        // Standard: Loser (or Player 2 on tie/scoring change) starts next game
        // Current logic: Toggle player if not scoring change, else keep player
        if (!isScoringChange) {
            // Toggle player if the scoring mechanism didn't change
             this.currentPlayer = (originalPlayer + 1) % 2; 
        } else {
            // Keep the same player if only the scoring mechanism changed
             this.currentPlayer = originalPlayer; 
        }
        // Alternative: Always start player 0? Or alternate regardless? Needs design decision.
        // Let's stick to the original toggle logic for now.

        // Reset AI state (like move count)
        this.opponent.moveCount = 0;

        // Re-initialize logic board
        this.gameBoardLogic.reset();

        // Store the new initial state
        this.storeInitialState(); // This resets history
        
        this.stateChanged = true; 
        log.info("Game logic reset complete. Starting player:", this.currentPlayer + 1);
        
        // Return the starting player for the main loop
        return this.currentPlayer; 
    }
} 

