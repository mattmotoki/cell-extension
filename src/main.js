/**
 * main.js - Main Application Entry Point for Cell Collection Game
 * 
 * Initializes the game logic, rendering components, UI controls, 
 * and orchestrates the main game loop.
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
    syncDropdowns,
    closeMobileMenu
} from './rendering/uiUtils.js';

// --- Configuration ---
const gridDimension = 100; // Logical size for viewBox used by renderers
const cellsPerRow = 6;
const cellDimension = gridDimension / cellsPerRow; // Cell size in logical units
const playerColors = ["#00FF00", "#1E90FF"];
const gridWidth = cellsPerRow; // Logical grid width for GameBoardLogic
const gridHeight = cellsPerRow; // Logical grid height for GameBoardLogic
const aiMoveDelay = 500; // ms delay before AI calculates move
const gameOverMessageDelayAI = 1350; // ms delay for game over message in AI mode
const gameOverMessageDelayUser = 1000; // ms delay for game over message in User mode

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
    console.log("Initializing Application...");

    // Read initial UI settings
    playerMode = getPlayerModeFromUI();
    scoringMechanism = getScoringMechanismFromUI();

    // --- SVG Setup ---
    d3.select("#board")
        .attr("viewBox", `0 0 ${gridDimension} ${gridDimension}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
    
    // Ensure score chart is correctly initialized
    if (!d3.select("#score-chart-container").node()) {
        console.warn("#score-chart-container not found, chart might not render correctly. Adding a fallback container.");
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
    scoreChartRenderer = new ScoreChartRenderer(playerColors /*, gridDimension */); // Pass config if needed

    // --- UI Control Setup ---
    setupEventListeners();

    // --- Initial Render ---
    updateUI(); // Perform initial render based on game state
    updateNavbarTitle(scoringMechanism);

    // --- Start Game Loop ---
    startGameLoop();

    console.log("Application Initialized.");
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
            console.log("Main loop: AI's turn, scheduling move...");
            isAIRunning = true; 
            game.progress = 'waiting'; // Set logic state to waiting
            // Update UI immediately to show AI is thinking (optional)
            // e.g., show spinner, disable board clicks 
            updateUI(); 
            
            setTimeout(() => {
                console.time("AI Move Calculation");
                const aiMove = game.requestAIMove(); // Synchronous calculation
                console.timeEnd("AI Move Calculation");
                isAIRunning = false;
                if (aiMove) {
                    console.log("Main loop: AI move successful.");
                    // State changed flag will be set within game.requestAIMove()
                } else {
                    console.log("Main loop: AI move failed or game ended.");
                    // State might have changed (e.g., progress set to 'over' or 'playing')
                }
                // The next gameTick will pick up the state change and update UI
            }, aiMoveDelay);
        }
        
        // 3. Check for Game Over state to display message
        if (currentState.progress === 'over') {
            // Ensure message is displayed only once
            if (!game.gameOverMessageShown) { 
                console.log("Main loop: Game over detected.");
                const waitTime = playerMode === 'ai' ? gameOverMessageDelayAI : gameOverMessageDelayUser;
                setTimeout(() => {
                    const finalState = game.getCurrentState(); // Get latest scores
                    displayWinnerMessage(finalState.scores, playerMode);
                 }, waitTime); 
                 game.gameOverMessageShown = true; // Set flag
            }
            // Optionally stop the game loop here if desired
            // cancelAnimationFrame(animationFrameId);
            // return;
        }

        // 4. Schedule next tick
        animationFrameId = requestAnimationFrame(gameTick);
    }

    // Start the loop
    animationFrameId = requestAnimationFrame(gameTick);
    console.log("Game loop started.");
}

// --- UI Update Function ---
function updateUI() {
    console.log("Updating UI...");
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

    // Update Undo Button State
    updateUndoButtons(currentState.historyLength || game.history.length); // Pass history length
    
    // Update Navbar Title (optional, could be done only on mechanism change)
    // updateNavbarTitle(currentState.scoringMechanism);
    
    // Potentially update cursor or show AI thinking indicator
    const isWaiting = currentState.progress === 'waiting' || isAIRunning;
    d3.select("body").classed("waiting", isWaiting); // Add/remove a class for styling

}

// --- Event Handlers ---
function handleBoardClick(gridX, gridY) {
    if (!game || game.getCurrentState().progress !== 'playing') return; // Ignore clicks if not playing
    if (playerMode === 'ai' && game.getCurrentState().currentPlayer !== 0) return; // Ignore clicks if AI's turn
    
    console.log(`UI: Board clicked at (${gridX}, ${gridY})`);
    const moveSuccessful = game.handlePlayerMove(gridX, gridY);
    
    // if (moveSuccessful) {
    //     // State change will be picked up by game loop
    // }
}

function handleResetClick() {
    console.log("UI: Reset button clicked.");
    // Read current settings from UI to pass to logic reset
    playerMode = getPlayerModeFromUI();
    scoringMechanism = getScoringMechanismFromUI();
    
    game.reset(scoringMechanism, playerMode);
    game.gameOverMessageShown = false; // Reset message flag
    
    // Reset renderers explicitly (or ensure they reset based on new state)
    scoreBreakdown.reset(game.getCurrentState().currentPlayer, scoringMechanism);
    scoreChartRenderer.reset();
    
    updateNavbarTitle(scoringMechanism);
    // Trigger immediate UI update and restart game loop if stopped
    updateUI();
    startGameLoop(); // Restart loop in case it was stopped on game over
}

function handleUndoClick() {
    console.log("UI: Undo button clicked.");
    if (game.getCurrentState().progress === 'over') return; // Can't undo after game over

    let undoSuccessful = false;
    if (playerMode === 'ai') {
        undoSuccessful = game.undoAIMove(); // Use the double-undo for AI mode
    } else {
        undoSuccessful = game.undo();
    }
    
    // if (undoSuccessful) {
    //     // State change will be picked up by game loop
    // }
}

function handlePlayerModeChange(event) {
    const newMode = event.target.value;
    const elementId = event.target.id;
    console.log(`UI: Player Mode changed to ${newMode} via ${elementId}`);
    syncDropdowns(elementId, newMode); // Sync the other dropdown
    playerMode = newMode;
    handleResetClick(); // Reset the game when mode changes
}

function handleScoringChange(event) {
    const newMechanism = event.target.value;
    const elementId = event.target.id;
    // Basic check for disabled options (if any)
    if (event.target.options[event.target.selectedIndex].disabled) {
        alert("This scoring mechanism is not yet implemented.");
        event.target.value = scoringMechanism; // Revert UI
        return;
    }
    console.log(`UI: Scoring Mechanism changed to ${newMechanism} via ${elementId}`);
    syncDropdowns(elementId, newMechanism); // Sync the other dropdown
    scoringMechanism = newMechanism;
    updateNavbarTitle(newMechanism);
    handleResetClick(); // Reset the game when scoring changes
}

// --- Setup Event Listeners ---
function setupEventListeners() {
    // Reset Button
    d3.select("#reset").on("click", handleResetClick);

    // Undo Buttons
    d3.select("#undo").on("click", handleUndoClick);
    d3.select("#undo-mobile").on("click", () => {
        handleUndoClick();
        closeMobileMenu(); 
    });

    // Player Mode Dropdowns
    const playerModeDropdown = document.getElementById("player-mode");
    const playerModeMobile = document.getElementById("player-mode-mobile");
    if (playerModeDropdown) playerModeDropdown.addEventListener("change", handlePlayerModeChange);
    if (playerModeMobile) playerModeMobile.addEventListener("change", handlePlayerModeChange);
    
    // Scoring Mechanism Dropdowns
    const scoringSelect = document.getElementById("scoring-mechanism");
    const scoringSelectMobile = document.getElementById("scoring-mechanism-mobile");
    if (scoringSelect) scoringSelect.addEventListener("change", handleScoringChange);
    if (scoringSelectMobile) scoringSelectMobile.addEventListener("change", handleScoringChange);
    
    // Add tooltips to scoring options (can remain here)
    [scoringSelect, scoringSelectMobile].forEach(select => {
        if (!select) return;
        select.querySelectorAll("option").forEach(option => {
            const title = option.getAttribute("title");
            if (title) option.setAttribute("title", title);
        });
    });
    
    // Mobile Menu Toggle
    const hamburgerBtn = document.getElementById('hamburger-menu');
    const mobileMenu = document.getElementById('mobile-menu');
    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent document click handler
            mobileMenu.classList.toggle('active');
            hamburgerBtn.classList.toggle('active');
        });
    }

    // Mobile Menu Close Button
    const closeBtn = document.getElementById('mobile-menu-close-btn');
    if (closeBtn && mobileMenu && hamburgerBtn) {
        closeBtn.addEventListener('click', closeMobileMenu);
    }
    
    // Close Mobile Menu on Outside Click
    document.addEventListener('click', function(e) {
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            if (!mobileMenu.contains(e.target) && !hamburgerBtn.contains(e.target)) {
                closeMobileMenu();
            }
        }
    });

    // Close Mobile Menu on Resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            closeMobileMenu();
        }
    });

    // Navbar Scroll Effect
    const navbar = document.querySelector('.navbar');
    const handleScroll = () => {
        if (navbar) {
            navbar.classList.toggle('scrolled', window.scrollY > 10);
        }
    }
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
}

// --- Run Application ---
initializeApp(); 