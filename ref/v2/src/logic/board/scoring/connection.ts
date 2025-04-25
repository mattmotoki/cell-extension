/**
 * src/logic/board/scoring/connection.ts
 * 
 * Cell-Connection Scoring Mechanism (pure function)
 */

import { BoardState, PlayerIndex } from "../../../types";
import { getConnectedComponents, getAdjacentPositions, createPositionKey, parsePositionKey } from "../GameBoardLogic";

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
            const adjacentPositions = getAdjacentPositions(gridX, gridY, gridWidth, gridHeight);
            
            for (let { gridX: adjX, gridY: adjY } of adjacentPositions) {
                const adjKey = createPositionKey(adjX, adjY);
                // If the adjacent cell is *also* in this component, count it as a connection
                if (component.includes(adjKey)) {
                    totalConnectionsInComponent++;
                }
            }
        }
        
        // If somehow a multi-cell component has 0 internal connections (shouldn't happen), treat as 1?
        // The original code returned the count directly, which could be 0. Let's stick to that.
        return totalConnectionsInComponent > 0 ? totalConnectionsInComponent : 1; // Ensure score isn't 0 for valid components
    });
    
    // Calculate the product of all component connection counts
    return componentConnectionCounts.reduce((product, count) => product * count, 1);
} 