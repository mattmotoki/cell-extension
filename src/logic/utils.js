/**
 * utils.js - Core Logic Utility Functions for Cell Collection
 * 
 * This file provides shared utility functions used within the game logic.
 * 
 * Key functionality:
 * - Array utilities (shuffle)
 * 
 * Relationships with other files:
 * - Potentially used by Game.js or AI logic components
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