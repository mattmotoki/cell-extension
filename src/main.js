/**
 * main.js - Main Application Entry Point for Cell Collection Game
 * 
 * Initializes the game logic, rendering components, UI controls, 
 * and orchestrates the main game loop. This file serves as the central
 * controller connecting all parts of the application.
 * 
 * Relationships:
 * - Imports and initializes Game from ./logic/Game.js
 * - Imports and initializes BoardRenderer from ./rendering/board/BoardRenderer.js
 * - Imports score visualization components from ./rendering/scoring/ScoreDisplay.js
 * - Imports UI utility functions from ./rendering/uiUtils.js
 * 
 * Revision Log:
 * - Added logger implementation for verbosity control
 * 
 * Note: This revision log should be updated whenever this file is modified.
 */

import { Game } from './logic/Game.js';
import { BoardRenderer } from './rendering/board/BoardRenderer.js';
import { ScoreBreakdown, ScoreChartRenderer } from './rendering/scoring/ScoreDisplay.js';
import { 
    getPlayerModeFromUI, 
    getScoringMechanismFromUI, 
    getScoringDescription, 
    displayWinnerMessage, 
    updateNavbarTitle, 
    updateUndoButtons,
    closeMobileMenu,
    getBoardSizeFromUI
} from './rendering/uiUtils.js';
import logger from './utils/logger.js';

// Create a module-specific logger
const log = logger.createLogger('Main');

// --- Configuration ---
const gridDimension = 100; // Logical size for viewBox used by renderers
let cellsPerRow = 6; // Default value, will be updated from UI
let cellDimension = gridDimension / cellsPerRow; // Cell size in logical units
const playerColors = ["#00FF00", "#1E90FF"];
let gridWidth = cellsPerRow; // Logical grid width for GameBoardLogic
let gridHeight = cellsPerRow; // Logical grid height for GameBoardLogic
const aiMoveDelay = 0; // ms delay before AI calculates move
const gameOverMessageDelay = 500; // ms delay for game over message

// --- Global State (managed by main.js) ---
let game = null;
let boardRenderer = null;
let scoreBreakdown = null;
let scoreChartRenderer = null;
let playerMode = 'ai'; // Default player mode
let scoringMechanism = 'cell-multiplication'; // Default scoring mechanism
let isAIRunning = false; // Flag to prevent concurrent AI calculations
let animationFrameId = null; // ID for the animation frame loop

// --- Initialization ---
function initializeApp() {
    log.info("Initializing Application...");

    // Read initial UI settings
    playerMode = getPlayerModeFromUI();
    scoringMechanism = getScoringMechanismFromUI();
    
    // Set board size based on UI selection
    cellsPerRow = getBoardSizeFromUI();
    cellDimension = gridDimension / cellsPerRow;
    gridWidth = cellsPerRow;
    gridHeight = cellsPerRow;

    // --- SVG Setup ---
    d3.select("#board")
        .attr("viewBox", `0 0 ${gridDimension} ${gridDimension}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
    
    // Ensure score chart is correctly initialized
    if (!d3.select("#score-chart-container").node()) {
        log.warn("#score-chart-container not found, chart might not render correctly. Adding a fallback container.");
        // Create a container if missing
        d3.select("#game .game-content-wrapper")
            .append("div")
            .attr("id", "score-chart-container")
            .append("svg")
            .attr("id", "score-chart")
            .attr("viewBox", `0 0 100 25`)
            .attr("preserveAspectRatio", "xMidYMid meet");
    } else {
        // Ensure the chart SVG has correct attributes
        let scoreChart = d3.select("#score-chart");
        if (!scoreChart.node()) {
            // If SVG doesn't exist in container, add it
            scoreChart = d3.select("#score-chart-container")
                .append("svg")
                .attr("id", "score-chart");
        }
        // Set or update viewBox
        scoreChart
            .attr("viewBox", `0 0 100 25`)
            .attr("preserveAspectRatio", "xMidYMid meet");
    }

    // --- Logic Initialization ---
    // Pass grid dimensions, colors, initial player (0), scores ([0,0]), progress ('playing'), and mechanism
    game = new Game(gridWidth, gridHeight, playerColors, 0, [0, 0], 'playing', scoringMechanism);

    // --- Renderer Initialization ---
    // Pass size, colors, and the click handler function
    boardRenderer = new BoardRenderer(gridDimension, cellDimension, playerColors, handleBoardClick);
    scoreBreakdown = new ScoreBreakdown(playerColors);
    scoreChartRenderer = new ScoreChartRenderer(playerColors);

    // --- UI Control Setup ---
    setupEventListeners();

    // --- Initial Render ---
    updateUI(); // Perform initial render based on game state
    updateNavbarTitle(scoringMechanism);

    // --- Start Game Loop ---
    startGameLoop();

    log.info("Application Initialized.");
}

// --- Game Loop ---
function startGameLoop() {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }

    function gameTick() {
        // 1. Check for Game State Changes from Logic
        if (game.hasStateChanged()) {
            updateUI();
        }

        // 2. Check if AI needs to move
        const currentState = game.getCurrentState();
        if (playerMode === 'ai' && currentState.currentPlayer === 1 && currentState.progress === 'playing' && !isAIRunning) {
            log.debug("Main loop: AI's turn, scheduling move...");
            isAIRunning = true; 
            game.progress = 'waiting'; // Set logic state to waiting
            // Update UI immediately to show AI is thinking (optional)
            updateUI(); 
            
            setTimeout(() => {
                log.debug("Starting AI Move Calculation");
                const startTime = performance.now();
                const aiMove = game.requestAIMove(); // Synchronous calculation
                const endTime = performance.now();
                log.debug(`AI Move Calculation took ${(endTime - startTime).toFixed(2)}ms`);
                isAIRunning = false;
                if (aiMove) {
                    log.debug("Main loop: AI move successful.");
                    // State changed flag will be set within game.requestAIMove()
                } else {
                    log.debug("Main loop: AI move failed or game ended.");
                    // State might have changed (e.g., progress set to 'over' or 'playing')
                }
                // The next gameTick will pick up the state change and update UI
            }, aiMoveDelay);
        }
        
        // 3. Check for Game Over state to display message
        if (currentState.progress === 'over') {
            // Ensure message is displayed only once
            if (!game.gameOverMessageShown) { 
                log.info("Main loop: Game over detected.");
                setTimeout(() => {
                    const finalState = game.getCurrentState(); // Get latest scores
                    displayWinnerMessage(finalState.scores, playerMode);
                 }, gameOverMessageDelay); 
                 game.gameOverMessageShown = true; // Set flag
            }
        }

        // 4. Schedule next tick
        animationFrameId = requestAnimationFrame(gameTick);
    }

    // Start the loop
    animationFrameId = requestAnimationFrame(gameTick);
    log.debug("Game loop started.");
}

// --- UI Update Function ---
function updateUI() {
    log.trace("Updating UI...");
    const currentState = game.getCurrentState();

    // Update Board
    boardRenderer.render(currentState.boardLogicState);

    // Update Score Displays
    const components0 = game.gameBoardLogic.getConnectedComponents(0); // Get components needed by breakdown
    const components1 = game.gameBoardLogic.getConnectedComponents(1);
    scoreBreakdown.update(currentState.currentPlayer, currentState.scores, components0, components1, currentState.scoringMechanism);
    scoreChartRenderer.update(currentState.currentPlayer, currentState.scores, currentState.scoreHistory1, currentState.scoreHistory2);

    // Update Tooltips (based on current mechanism)
    const description = getScoringDescription(currentState.scoringMechanism);
    d3.select("#player-scores").attr("title", `Scoring: ${description}`);
    d3.select("#score-breakdown").attr("title", `Scoring: ${description}`);
    
    // Update settings menu tooltip - add this
    const scoringTitle = document.querySelector(".settings-group:last-child");
    if (scoringTitle) {
        scoringTitle.setAttribute("title", `Scoring: ${description}`);
    }

    // Update Undo Button State
    updateUndoButtons(currentState.historyLength || game.history.length); // Pass history length
    
    // Potentially update cursor or show AI thinking indicator
    const isWaiting = currentState.progress === 'waiting' || isAIRunning;
    d3.select("body").classed("waiting", isWaiting); // Add/remove a class for styling
}

// --- Event Handlers ---
function handleBoardClick(gridX, gridY) {
    if (!game || game.getCurrentState().progress !== 'playing') return; // Ignore clicks if not playing
    if (playerMode === 'ai' && game.getCurrentState().currentPlayer !== 0) return; // Ignore clicks if AI's turn
    
    log.debug(`UI: Board clicked at (${gridX}, ${gridY})`);
    game.handlePlayerMove(gridX, gridY);
}

function handleResetClick() {
    log.info("UI: Reset button clicked.");
    // Read current settings from UI to pass to logic reset
    playerMode = getPlayerModeFromUI();
    scoringMechanism = getScoringMechanismFromUI();
    
    // Update board size
    cellsPerRow = getBoardSizeFromUI();
    cellDimension = gridDimension / cellsPerRow;
    gridWidth = cellsPerRow;
    gridHeight = cellsPerRow;
    
    // Create a new game with the updated board size
    game = new Game(gridWidth, gridHeight, playerColors, 0, [0, 0], 'playing', scoringMechanism);
    game.gameOverMessageShown = false; // Reset message flag
    
    // Reset renderers explicitly with new cell size
    boardRenderer = new BoardRenderer(gridDimension, cellDimension, playerColors, handleBoardClick);
    scoreBreakdown.reset(game.getCurrentState().currentPlayer, scoringMechanism);
    scoreChartRenderer.reset();
    
    updateNavbarTitle(scoringMechanism);
    // Trigger immediate UI update and restart game loop if stopped
    updateUI();
    startGameLoop(); // Restart loop in case it was stopped on game over
}

function handleUndoClick() {
    log.info("UI: Undo button clicked.");
    if (game.getCurrentState().progress === 'over') return; // Can't undo after game over

    if (playerMode === 'ai') {
        game.undoAIMove(); // Use the double-undo for AI mode
    } else {
        game.undo();
    }
}

function handlePlayerModeChange(event) {
    const newMode = event.target.value;
    log.info(`UI: Player Mode changed to ${newMode}`);
    playerMode = newMode;
    handleResetClick(); // Reset the game when mode changes
}

function handleScoringChange(event) {
    const newMechanism = event.target.value;
    // Basic check for disabled options (if any)
    if (event.target.options[event.target.selectedIndex].disabled) {
        alert("This scoring mechanism is not yet implemented.");
        event.target.value = scoringMechanism; // Revert UI
        return;
    }
    log.info(`UI: Scoring Mechanism changed to ${newMechanism}`);
    scoringMechanism = newMechanism;
    updateNavbarTitle(newMechanism);
    handleResetClick(); // Reset the game when scoring changes
}

function handleBoardSizeChange(event) {
    const newSize = parseInt(event.target.value, 10);
    log.info(`UI: Board Size changed to ${newSize}x${newSize}`);
    handleResetClick(); // Reset the game with the new board size
}

// --- Setup Event Listeners ---
function setupEventListeners() {
    // Reset Button
    d3.select("#reset").on("click", handleResetClick);

    // Undo Button
    d3.select("#undo").on("click", handleUndoClick);

    // Settings Toggle (new UI element)
    const settingsToggle = document.getElementById("settings-toggle");
    const settingsMenu = document.querySelector(".settings-menu");
    
    if (settingsToggle && settingsMenu) {
        // Add click handler to toggle the menu manually (in addition to hover)
        settingsToggle.addEventListener("click", function(e) {
            e.stopPropagation();
            const isVisible = settingsMenu.style.display === "block";
            settingsMenu.style.display = isVisible ? "none" : "block";
        });
        
        // Close when clicking elsewhere
        document.addEventListener("click", function(e) {
            if (!settingsMenu.contains(e.target) && e.target !== settingsToggle) {
                settingsMenu.style.display = "none";
            }
        });
    }

    // Player Mode Dropdown
    const playerModeDropdown = document.getElementById("player-mode");
    if (playerModeDropdown) playerModeDropdown.addEventListener("change", handlePlayerModeChange);
    
    // Scoring Mechanism Dropdown
    const scoringSelect = document.getElementById("scoring-mechanism");
    if (scoringSelect) scoringSelect.addEventListener("change", handleScoringChange);
    
    // Board Size Dropdown
    const boardSizeSelect = document.getElementById("board-size");
    if (boardSizeSelect) boardSizeSelect.addEventListener("change", handleBoardSizeChange);
    
    // Add tooltips to scoring options (can remain here)
    if (scoringSelect) {
        scoringSelect.querySelectorAll("option").forEach(option => {
            const title = option.getAttribute("title");
            if (title) option.setAttribute("title", title);
        });
    }

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    const handleScroll = () => {
        if (navbar) {
            navbar.classList.toggle('scrolled', window.scrollY > 10);
        }
    }
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    // Add a log level selector to the settings menu
    addLogLevelControls();
}

// Add log level controls to the settings menu
function addLogLevelControls() {
    const settingsMenu = document.querySelector(".settings-menu");
    if (!settingsMenu) return;

    // Create a new settings group for log level
    const logLevelGroup = document.createElement('div');
    logLevelGroup.className = 'settings-group';
    logLevelGroup.innerHTML = `
        <div class="settings-header">Log Level</div>
        <div class="settings-content">
            <select id="log-level">
                <option value="NONE">None</option>
                <option value="ERROR">Error</option>
                <option value="WARN">Warning</option>
                <option value="INFO" selected>Info</option>
                <option value="DEBUG">Debug</option>
                <option value="TRACE">Trace</option>
            </select>
        </div>
    `;

    // Append to settings menu
    settingsMenu.appendChild(logLevelGroup);

    // Add event listener
    const logLevelSelect = document.getElementById('log-level');
    if (logLevelSelect) {
        // Set initial value based on current log level
        const currentLevel = logger.getLogLevelName(logger.getLogLevel());
        logLevelSelect.value = currentLevel;

        logLevelSelect.addEventListener('change', function() {
            const level = this.value;
            logger.setLogLevel(logger.LogLevel[level]);
            log.info(`Log level changed to ${level}`);
        });
    }
}

// --- Run Application ---
initializeApp(); 