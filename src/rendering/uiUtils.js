/**
 * uiUtils.js - UI Utility Functions for Cell Collection
 * 
 * This file provides shared utility functions specifically for UI manipulation 
 * and interaction within the application.
 * 
 * Key functionality:
 * - Game mode management (retrieving player mode from UI)
 * - Scoring mechanism management (retrieval and descriptions from UI)
 * - UI updates (title formatting and updates)
 * - Game state feedback (winner messaging)
 * 
 * Relationships with other files:
 * - main.js: Uses these utilities to interact with the DOM and manage UI state.
 */

// Display a message based on the scores
export function displayWinnerMessage(scores, playerMode) { // Added playerMode arg
    // We could optionally replace alert with a custom modal in the future
    // for better styling, but for now we'll leave alert in place
    if (scores[0] > scores[1]) {
        alert("Congratulations! Player 1 wins! 🎉");
    } else if (scores[0] < scores[1]) {
        // if (getPlayerMode() == "ai") { // Use passed playerMode
        if (playerMode === "ai") {
            alert("The AI player won this round. Try again 🤖");
        } else {
            alert("Congratulations! Player 2 wins! 🎉");
        }
    } else {
        alert("It's a tie. Great game by both players! 🏆");
    }            
}

// Get player mode: "ai" or "user" from the UI
export function getPlayerModeFromUI() {
    // Get value directly from the dropdown
    const playerModeDropdown = document.getElementById("player-mode");
    return playerModeDropdown ? playerModeDropdown.value : 'ai'; // Default to 'ai' if not found
}

// Get the current scoring mechanism from the UI
export function getScoringMechanismFromUI() {
    const scoringSelect = document.getElementById("scoring-mechanism");
    // Default to cell-multiplication to match HTML default
    return scoringSelect ? scoringSelect.value : 'cell-multiplication'; 
}

// Get description for a scoring mechanism
export function getScoringDescription(mechanism) {
    const descriptions = {
        'cell-connection': 'Product of the number of directed edges (connections)',
        // Duplicate key was present, ensure it's correct or removed
        'cell-multiplication': 'Product of the size (number of cells) of the connected components',
        'cell-extension': 'Product of the number of undirected edges (extensions)',
    };
    
    return descriptions[mechanism] || 'Unknown scoring mechanism';
}

// Format scoring mechanism name in title case for display 
export function formatScoringMechanismTitle(mechanism) {
    if (!mechanism) return ''; // Handle potential undefined/null
    const formatted = mechanism.replace('-', ' ').split(' ');
    return formatted.map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Update navbar title with current scoring mechanism
export function updateNavbarTitle(mechanism) { // Accept mechanism as arg
    // const mechanism = getScoringMechanismFromUI(); // Don't read directly, use passed value
    const formattedTitle = formatScoringMechanismTitle(mechanism);
    const navbarTitle = document.querySelector('.navbar-title');
    
    if (navbarTitle) {
        navbarTitle.textContent = formattedTitle;
    }
    
}

// --- Functions for managing UI element state --- 

export function updateUndoButtons(historyLength) {
    const disabled = historyLength <= 1;
    d3.select("#undo").property("disabled", disabled);
    d3.select("#undo-mobile").property("disabled", disabled);
}

export function syncDropdowns(elementId, value) {
    const playerModeDropdown = document.getElementById("player-mode");
    const playerModeMobile = document.getElementById("player-mode-mobile");
    const scoringSelect = document.getElementById("scoring-mechanism");
    const scoringSelectMobile = document.getElementById("scoring-mechanism-mobile");

    if (elementId === 'player-mode' || elementId === 'player-mode-mobile') {
        if (playerModeDropdown) playerModeDropdown.value = value;
        if (playerModeMobile) playerModeMobile.value = value;
    } else if (elementId === 'scoring-mechanism' || elementId === 'scoring-mechanism-mobile') {
        if (scoringSelect) scoringSelect.value = value;
        if (scoringSelectMobile) scoringSelectMobile.value = value;
    }
}

export function closeMobileMenu() {
    const gameSettingsPanel = document.getElementById('game-settings-panel');
    const gameSettingsMenu = document.getElementById('game-settings-menu');
    if (gameSettingsPanel && gameSettingsMenu) { 
        gameSettingsPanel.classList.remove('active');
        gameSettingsMenu.classList.remove('active');
    }
} 