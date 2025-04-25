/**
 * extension.js - Cell-Extension Scoring Mechanism
 * 
 * This file implements the Cell-Extension scoring mechanism, which
 * calculates scores based on the number of extensions (edges) between cells.
 */

/**
 * Calculate the score for Cell-Extension scoring mechanism
 * 
 * @param {Object} board - The board instance with component information
 * @param {number} playerIndex - The index of the player (0 or 1)
 * @returns {number} - The calculated score
 */
export function getExtensionScore(board, playerIndex) {
    // Get all connected components for this player
    const components = board.getConnectedComponents(playerIndex);
    
    // If no components, score is 0
    if (components.length === 0) return 0;
    
    // For each component, calculate its size as the sum of undirected edges (extensions)
    const componentSizes = components.map(component => {
        let extensionSum = 0;
        
        // Count unique edges within the component
        const processedEdges = new Set();
        
        // For each cell in the component
        for (let cellKey of component) {
            const [gridX, gridY] = board.parsePositionKey(cellKey);
            
            // Check adjacent positions
            const adjacentPositions = board.getAdjacentPositions(gridX, gridY);
            
            // For each adjacent position
            for (let [adjX, adjY] of adjacentPositions) {
                const adjKey = board.createPositionKey(adjX, adjY);
                
                // If the adjacent cell is in the same component
                if (component.includes(adjKey)) {
                    // Create an edge identifier (smaller key first to ensure uniqueness)
                    const edge = cellKey < adjKey 
                        ? `${cellKey}-${adjKey}` 
                        : `${adjKey}-${cellKey}`;
                    
                    // Only count each edge once
                    if (!processedEdges.has(edge)) {
                        extensionSum++;
                        processedEdges.add(edge);
                    }
                }
            }
        }
        
        // If there are no extensions (single cell), return 1
        return extensionSum > 0 ? extensionSum : 1;
    });
    
    // Calculate the product of all component sizes
    return componentSizes.reduce((product, size) => product * size, 1);
} 