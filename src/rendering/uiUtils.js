/**
 * uiUtils.js - UI Utility Functions for Cell Collection Game
 * 
 * This file provides shared utility functions specifically for UI manipulation 
 * and interaction within the application's front-end.
 * 
 * Key functionality:
 * - Game mode management (retrieving player mode from UI)
 * - Scoring mechanism management (retrieval and descriptions)
 * - UI updates (title formatting, button state management)
 * - Game state feedback (winner messaging)
 * - Mobile menu handling
 * 
 * Relationships:
 * - Imported by main.js for DOM interaction and UI state management
 * - Provides UI utility functions for all rendering components
 * - Maintains synchronization between mobile and desktop UI elements
 * - Accesses DOM elements to read user settings
 * 
 * Revision Log:
 * 
 * Note: This revision log should be updated whenever this file is modified.
 */

// Display a message based on the scores
export function displayWinnerMessage(scores, playerMode) {
    // We could optionally replace alert with a custom modal in the future
    // for better styling, but for now we'll leave alert in place
    if (scores[0] > scores[1]) {
        alert("Congratulations! Player 1 wins! 🎉");
    } else if (scores[0] < scores[1]) {
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

// Get the board size from the UI
export function getBoardSizeFromUI() {
    const boardSizeSelect = document.getElementById("board-size");
    // Default to 6 to match HTML default
    return boardSizeSelect ? parseInt(boardSizeSelect.value, 10) : 6;
}

// Get AI difficulty setting from UI
export function getAIDifficultyFromUI() {
    const difficultySelect = document.getElementById('ai-difficulty');
    return difficultySelect ? difficultySelect.value : 'easy'; // Default to 'easy' if not found
}

// Get first player setting from UI
export function getFirstPlayerFromUI() {
    const firstPlayerSelect = document.getElementById('first-player');
    return firstPlayerSelect ? firstPlayerSelect.value : 'human'; // Default to 'human' if not found
}

// Get description for a scoring mechanism
export function getScoringDescription(mechanism) {
    const descriptions = {
        'cell-connection': 'Product of the number of directed edges (connections)',
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
export function updateNavbarTitle(mechanism) {
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
}

export function closeMobileMenu() {
    const gameSettingsPanel = document.getElementById('game-settings-panel');
    const gameSettingsMenu = document.getElementById('game-settings-menu');
    if (gameSettingsPanel && gameSettingsMenu) { 
        gameSettingsPanel.classList.remove('active');
        gameSettingsMenu.classList.remove('active');
    }
} 