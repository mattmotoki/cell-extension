/**
 * multiplication.js - Cell-Multiplication Scoring Mechanism
 * 
 * This file implements the Cell-Multiplication scoring mechanism, which
 * calculates scores as the product of component sizes (number of cells in each connected group).
 */

/**
 * Calculate the score for Cell-Multiplication scoring mechanism
 * 
 * @param {Object} board - The board instance with component information
 * @param {number} playerIndex - The index of the player (0 or 1)
 * @returns {number} - The calculated score
 */
export function getMultiplicationScore(board, playerIndex) {
    const components = board.getConnectedComponents(playerIndex);
    
    // If no components, score is 0
    if (components.length === 0) return 0;
    
    // Calculate product of component sizes
    return components.reduce((product, component) => product * component.length, 1);
} 