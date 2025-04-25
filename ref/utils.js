/**
 * utils.js - Utility Functions for Cell Collection
 * 
 * This file provides shared utility functions used throughout the application.
 * 
 * Key functionality:
 * - Game mode management (retrieving player mode)
 * - Scoring mechanism management (retrieval and descriptions)
 * - UI utilities (title formatting and updates)
 * - Game state utilities (winner determination and messaging)
 * - Array utilities (shuffle)
 * 
 * These utilities provide a central location for common functionality
 * that is needed across multiple components, promoting code reuse and
 * consistent behavior throughout the application.
 * 
 * Relationships with other files:
 * - game.js: Uses these utilities for scoring, player modes, and UI
 * - scoring.js: Uses scoring mechanism information
 * - board.js: Uses scoring mechanism detection
 */

// shuffle list
export function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle
    while (0 !== currentIndex) {

        // Pick a remaining element
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}


// Display a message based on the scores
export function displayWinnerMessage(scores) {
    // We could optionally replace alert with a custom modal in the future
    // for better styling, but for now we'll leave alert in place
    if (scores[0] > scores[1]) {
        alert("Congratulations! Player 1 wins! 🎉");
    } else if (scores[0] < scores[1]) {
        if (getPlayerMode() == "ai") {
            alert("The AI player won this round. Try again 🤖");
        } else {
            alert("Congratulations! Player 2 wins! 🎉");
        }
    } else {
        alert("It's a tie. Great game by both players! 🏆");
    }            
}

// Get player mode: "ai" or "user"
export function getPlayerMode() {
    // Get value directly from the dropdown
    const playerModeDropdown = document.getElementById("player-mode");
    return playerModeDropdown ? playerModeDropdown.value : 'ai'; // Default to 'ai' if not found
}

// Get the current scoring mechanism
export function getScoringMechanism() {
    const scoringSelect = document.getElementById("scoring-mechanism");
    return scoringSelect ? scoringSelect.value : 'cell-connection'; // Default to cell-connection
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
    const formatted = mechanism.replace('-', ' ').split(' ');
    return formatted.map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
}

// Update navbar title with current scoring mechanism
export function updateNavbarTitle() {
    const mechanism = getScoringMechanism();
    const formattedTitle = formatScoringMechanismTitle(mechanism);
    const navbarTitle = document.querySelector('.navbar-title');
    
    if (navbarTitle) {
        navbarTitle.textContent = formattedTitle;
    }
    
}
