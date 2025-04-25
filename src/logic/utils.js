/**
 * utils.js - Core Logic Utility Functions for Cell Collection Game
 * 
 * This file provides shared utility functions used within the game logic.
 * It contains pure utility functions that have no dependencies on other game components.
 * 
 * Key functionality:
 * - Array utilities (shuffle) for randomizing element order
 * 
 * Relationships:
 * - Used by Game.js and AIPlayer.js for randomization operations
 * - Independent of rendering and UI components
 * - Provides pure functions that don't modify application state
 * 
 * Revision Log:
 * 
 * Note: This revision log should be updated whenever this file is modified.
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

// Add any other purely logical utility functions here if needed 