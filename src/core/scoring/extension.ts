/**
 * src/logic/board/scoring/extension.ts
 * 
 * Cell-Extension Scoring Mechanism (pure function)
 */

import { BoardState, PlayerIndex } from "../types";
import { getConnectedComponents, getAdjacentPositions, createPositionKey, parsePositionKey } from "../game/GameBoardLogic";

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