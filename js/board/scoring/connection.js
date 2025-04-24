/**
 * connection.js - Cell-Connection Scoring Mechanism
 * 
 * This file implements the Cell-Connection scoring mechanism, which
 * calculates scores based on the number of connections between cells in components.
 */

/**
 * Calculate the score for Cell-Connection scoring mechanism
 * 
 * @param {Object} board - The board instance with component information
 * @param {number} playerIndex - The index of the player (0 or 1)
 * @returns {number} - The calculated score
 */
export function getConnectionScore(board, playerIndex) {
    // Get all connected components for this player
    const components = board.getConnectedComponents(playerIndex);
    
    // If no components, score is 0
    if (components.length === 0) return 0;
    
    // For each component, calculate its size as the total number of connections within it
    const componentSizes = components.map(component => {
        // If it's a single cell, the connection count is 1
        if (component.length === 1) return 1;
        
        // Count the total number of connections in the component
        let connectionCount = 0;
        
        // For each cell in the component, count its connections to other cells in the same component
        for (let cellKey of component) {
            const [gridX, gridY] = board.parsePositionKey(cellKey);
            
            // Get adjacent positions
            const adjacentPositions = board.getAdjacentPositions(gridX, gridY);
            
            // Count connections to other cells in the same component
            for (let [adjX, adjY] of adjacentPositions) {
                const adjKey = board.createPositionKey(adjX, adjY);
                
                // If the adjacent cell is in the same component
                if (component.includes(adjKey)) {
                    connectionCount++;
                }
            }
        }
        
        // Return the total number of connections in the component
        return connectionCount;
    });
    
    // Calculate the product of all component sizes
    return componentSizes.reduce((product, size) => product * size, 1);
} 