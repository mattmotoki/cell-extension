/**
 * src/core/scoring/algorithms.ts
 * 
 * Scoring Algorithm Implementations
 * Contains the pure functions for calculating scores based on different mechanisms.
 */

import { BoardState, PlayerIndex, ScoringMechanism } from "../types";
import { 
    getConnectedComponents, 
    getAdjacentPositions, 
    createPositionKey, 
    parsePositionKey,
    getAdjacentPlayerCells 
} from "../game/utils"; // Updated path

// ====================================
// Cell-Multiplication Scoring
// ====================================

/**
 * Calculate the score for Cell-Multiplication scoring mechanism.
 * Score is the product of the sizes of each connected component.
 * 
 * @param boardState The current state of the board.
 * @param playerIndex The index of the player (0 or 1).
 * @returns The calculated score.
 */
export function getMultiplicationScore(boardState: BoardState, playerIndex: PlayerIndex): number {
    const components = getConnectedComponents(boardState, playerIndex);
    
    // If no components, score is 0
    if (components.length === 0) return 0;
    
    // Calculate product of component sizes (ensure non-empty product starts at 1)
    return components.reduce((product, component) => product * component.length, 1);
}

// ====================================
// Cell-Connection Scoring
// ====================================

/**
 * Calculate the score for Cell-Connection scoring mechanism.
 * Score is the product of the "connection counts" of each component.
 * A component's connection count is the sum of connections each cell has 
 * to other cells within the same component. Single-cell components count as 1.
 * 
 * @param boardState The current state of the board.
 * @param playerIndex The index of the player (0 or 1).
 * @returns The calculated score.
 */
export function getConnectionScore(boardState: BoardState, playerIndex: PlayerIndex): number {
    const { gridWidth, gridHeight } = boardState;
    const components = getConnectedComponents(boardState, playerIndex);
    
    if (components.length === 0) return 0;
    
    const componentConnectionCounts = components.map(component => {
        // Single-cell components have a connection count of 1
        if (component.length === 1) return 1;
        
        let totalConnectionsInComponent = 0;
        
        for (let cellKey of component) {
            const [gridX, gridY] = parsePositionKey(cellKey);
            // Use getAdjacentPositions from utils
            const adjacentPositions = getAdjacentPositions(gridX, gridY, gridWidth, gridHeight); 
            
            for (let { gridX: adjX, gridY: adjY } of adjacentPositions) {
                const adjKey = createPositionKey(adjX, adjY);
                // If the adjacent cell is *also* in this component, count it as a connection
                if (component.includes(adjKey)) {
                    totalConnectionsInComponent++;
                }
            }
        }
        
        // Each connection is counted twice (once for each cell in the pair),
        // so divide by 2 for the actual connection count. 
        // Ensure score isn't 0 for valid components.
        const connectionCount = totalConnectionsInComponent / 2;
        return connectionCount > 0 ? connectionCount : 1; 
    });
    
    // Calculate the product of all component connection counts
    return componentConnectionCounts.reduce((product, count) => product * count, 1);
}

// ====================================
// Cell-Extension Scoring
// ====================================

/**
 * Calculate the score for Cell-Extension scoring mechanism.
 * Score is the product of the "extension counts" of each component.
 * A component's extension count is the number of unique edges (connections 
 * between adjacent cells) within that component. Single-cell components count as 1.
 * 
 * @param boardState The current state of the board.
 * @param playerIndex The index of the player (0 or 1).
 * @returns The calculated score.
 */
export function getExtensionScore(boardState: BoardState, playerIndex: PlayerIndex): number {
    const { gridWidth, gridHeight } = boardState;
    const components = getConnectedComponents(boardState, playerIndex);
    
    if (components.length === 0) return 0;
    
    const componentExtensionCounts = components.map(component => {
        // Single-cell components have an extension count of 1
        if (component.length === 1) return 1;
        
        let totalExtensionsInComponent = 0;
        const processedEdges = new Set<string>();
        
        for (let cellKey of component) {
            const [gridX, gridY] = parsePositionKey(cellKey);
            // Use getAdjacentPositions from utils
            const adjacentPositions = getAdjacentPositions(gridX, gridY, gridWidth, gridHeight); 
            
            for (let { gridX: adjX, gridY: adjY } of adjacentPositions) {
                const adjKey = createPositionKey(adjX, adjY);
                
                // Check if the adjacent cell is also in this component
                if (component.includes(adjKey)) {
                    // Create a unique key for the edge (order independent)
                    const edgeKey = cellKey < adjKey ? `${cellKey}<->${adjKey}` : `${adjKey}<->${cellKey}`;
                    
                    if (!processedEdges.has(edgeKey)) {
                        totalExtensionsInComponent++;
                        processedEdges.add(edgeKey);
                    }
                }
            }
        }
        
        // Ensure score isn't 0 for valid components
        return totalExtensionsInComponent > 0 ? totalExtensionsInComponent : 1; 
    });
    
    // Calculate the product of all component extension counts
    return componentExtensionCounts.reduce((product, count) => product * count, 1);
} 