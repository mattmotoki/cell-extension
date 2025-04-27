/**
 * src/core/game/utils.ts - Core Game Logic Utilities
 * 
 * Contains pure functions that implement the fundamental logic of the Cell Extension game.
 * This module handles board state management, cell placement validation, connected component
 * analysis, and score calculation. It provides the foundational operations used by both
 * the UI components and the AI logic.
 * 
 * Key functionality:
 * - Board state creation and manipulation
 * - Cell placement validation and processing
 * - Connected component identification and analysis
 * - Scoring mechanism implementation
 * - Game state querying (available cells, game over detection)
 * 
 * Design approach:
 * - Pure functions that don't modify input data
 * - Immutable data patterns for state updates
 * - Type safety through TypeScript interfaces
 * - Clear separation from UI and rendering concerns
 * 
 * Relationships:
 * - Used by gameSlice.ts for game state updates
 * - Used by ai/engine.ts for move simulation and validation
 * - Imports scoring functions from ../scoring/algorithms
 * - Referenced by UI components for board rendering
 * 
 * Revision Log:
 *  
 * Note: This revision log should be updated whenever this file is modified. 
 * Do not use dates in the revision log.
 */

import { 
    getMultiplicationScore, 
    getConnectionScore, 
    getExtensionScore 
} from "../scoring/algorithms"; // Updated path
import { BoardState, Coordinates, OccupiedCells, PlayerIndex, Component, ScoringMechanism } from "../types"; // Use consolidated types

// --- Helper Functions ---

export function createPositionKey(gridX: number, gridY: number): string {
    return `${gridX}-${gridY}`;
}

export function parsePositionKey(key: string): [number, number] {
    return key.split('-').map(Number) as [number, number];
}

export function isValidCoordinate(gridX: number, gridY: number, gridWidth: number, gridHeight: number): boolean {
    return gridX >= 0 && gridX < gridWidth && gridY >= 0 && gridY < gridHeight;
}

export function isCellOccupiedByPlayer(occupiedCells: OccupiedCells, playerIndex: PlayerIndex, gridX: number, gridY: number): boolean {
    const posKey = createPositionKey(gridX, gridY);
    // Ensure playerIndex is valid (0 or 1) before accessing
    return playerIndex === 0 || playerIndex === 1 ? !!occupiedCells[playerIndex]?.[posKey] : false;
}

export function isCellOccupied(occupiedCells: OccupiedCells, gridX: number, gridY: number): boolean {
    const posKey = createPositionKey(gridX, gridY);
    // Check both player maps safely
    return (!!occupiedCells[0]?.[posKey]) || (!!occupiedCells[1]?.[posKey]);
}

// --- Board Initialization & State ---

export function createInitialBoardState(gridWidth: number, gridHeight: number): BoardState {
    return {
        occupiedCells: [{}, {}], // Initialize with empty maps for both players
        gridWidth: gridWidth,
        gridHeight: gridHeight,
    };
}

// --- Cell Placement ---

/**
 * Attempts to place a cell for the currentPlayer at gridX, gridY.
 * Returns the new BoardState if successful, otherwise null.
 * IMPORTANT: This function creates a *new* BoardState object on success.
 */
export function placeCell(boardState: BoardState, currentPlayer: PlayerIndex, gridX: number, gridY: number): BoardState | null {
    const { occupiedCells, gridWidth, gridHeight } = boardState;

    if (!isValidCoordinate(gridX, gridY, gridWidth, gridHeight)) {
        console.warn(`Attempted to place cell at invalid coordinates: (${gridX}, ${gridY})`);
        return null;
    }

    // Ensure currentPlayer is valid (0 or 1)
    if (currentPlayer !== 0 && currentPlayer !== 1) {
        console.error(`Invalid currentPlayer index: ${currentPlayer}`);
        return null;
    }

    const opponent = (currentPlayer + 1) % 2 as PlayerIndex;
    const posKey = createPositionKey(gridX, gridY);

    // Check if cell is occupied by opponent or current player
    if (isCellOccupied(occupiedCells, gridX, gridY)) {
        console.debug(`Cell (${gridX}, ${gridY}) is already occupied.`);
        return null; 
    }

    // Create a deep copy of the occupied cells to avoid mutation
    const newOccupiedCells: OccupiedCells = [
        { ...occupiedCells[0] }, 
        { ...occupiedCells[1] }
    ];
    newOccupiedCells[currentPlayer][posKey] = true; 

    console.debug(`Cell placed successfully by Player ${currentPlayer + 1} at (${gridX}, ${gridY})`);
    
    // Return the new board state
    return {
        ...boardState,
        occupiedCells: newOccupiedCells,
    };
}

// --- Neighbor and Component Logic ---

export function getAdjacentPositions(gridX: number, gridY: number, gridWidth: number, gridHeight: number): Coordinates[] {
    return [
        { gridX: gridX + 1, gridY: gridY }, // right
        { gridX: gridX - 1, gridY: gridY }, // left
        { gridX: gridX,     gridY: gridY + 1 }, // down
        { gridX: gridX,     gridY: gridY - 1 }  // up
    ].filter(({ gridX: x, gridY: y }) => isValidCoordinate(x, y, gridWidth, gridHeight));
}
    
// Gets adjacent cells occupied *by the specified player*
export function getAdjacentPlayerCells(boardState: BoardState, playerIndex: PlayerIndex, gridX: number, gridY: number): Coordinates[] {
    const { occupiedCells, gridWidth, gridHeight } = boardState;
    
    // Validate playerIndex
    if (playerIndex !== 0 && playerIndex !== 1) return []; 
    
    const adjacentPositions = getAdjacentPositions(gridX, gridY, gridWidth, gridHeight);
    const neighbors: Coordinates[] = [];
    const playerCellMap = occupiedCells[playerIndex];

    if (!playerCellMap) return []; // Safety check

    for (let { gridX: adjX, gridY: adjY } of adjacentPositions) {
        const adjKey = createPositionKey(adjX, adjY);
        if (playerCellMap[adjKey]) { // Check existence in the player's map
            neighbors.push({ gridX: adjX, gridY: adjY });
        }
    }
    return neighbors;
}

export function getConnectedComponents(boardState: BoardState, playerIndex: PlayerIndex): Component[] {
    const { occupiedCells } = boardState;
    
    // Validate playerIndex
    if (playerIndex !== 0 && playerIndex !== 1) return [];
    
    const components: Component[] = [];
    const visited: Record<string, boolean> = {};
    const playerCellsMap = occupiedCells[playerIndex];

    if (!playerCellsMap || Object.keys(playerCellsMap).length === 0) {
        return []; // No cells for this player or map is invalid
    }

    const cells = Object.keys(playerCellsMap);

    for (let cellKey of cells) {
        if (visited[cellKey]) continue;

        const component: Component = [];
        const stack: string[] = [cellKey];
        visited[cellKey] = true; // Mark the starting cell as visited

        while (stack.length > 0) {
            const currentCellKey = stack.pop()!;
            component.push(currentCellKey); // Add to current component

            const [currentX, currentY] = parsePositionKey(currentCellKey);
            // Pass the current board state to get neighbors
            const neighbors = getAdjacentPlayerCells(boardState, playerIndex, currentX, currentY); 

            for (let neighbor of neighbors) {
                 const neighborKey = createPositionKey(neighbor.gridX, neighbor.gridY);
                 // Check if the neighbor belongs to the player and hasn't been visited yet
                 if (playerCellsMap[neighborKey] && !visited[neighborKey]) {
                     visited[neighborKey] = true;
                     stack.push(neighborKey);
                 }
            }
        }
        if (component.length > 0) { // Only add non-empty components
             components.push(component); // Add the found component to the list
        }
    }
    return components;
}

// --- Availability and Scoring Wrappers ---

export function getAvailableCells(boardState: BoardState): Coordinates[] {
    const { occupiedCells, gridWidth, gridHeight } = boardState;
    let availableCells: Coordinates[] = [];
    for (let gridX = 0; gridX < gridWidth; gridX++) {
        for (let gridY = 0; gridY < gridHeight; gridY++) {
            if (!isCellOccupied(occupiedCells, gridX, gridY)) {
                availableCells.push({ gridX: gridX, gridY: gridY });
            }
        }
    }
    return availableCells;
}
    
export function getTotalCellCount(boardState: BoardState): number {
     return boardState.gridWidth * boardState.gridHeight;
}

// Export isGameOver function
export function isGameOver(boardState: BoardState): boolean {
    return getAvailableCells(boardState).length === 0;
}

// Wrapper method for scoring mechanisms
// It now takes boardState instead of the GameBoardLogic instance
export function calculateScore(boardState: BoardState, playerIndex: PlayerIndex, mechanism: ScoringMechanism): number {
    // Validate playerIndex
     if (playerIndex !== 0 && playerIndex !== 1) {
         console.error(`Invalid player index in calculateScore: ${playerIndex}`);
         return 0;
     }
     
    switch(mechanism) {
        case 'cell-multiplication':
            return getMultiplicationScore(boardState, playerIndex);
        case 'cell-connection':
            return getConnectionScore(boardState, playerIndex);
        case 'cell-extension':
            return getExtensionScore(boardState, playerIndex);
        default:
            // Exhaustiveness check (useful with enums/unions)
            const exhaustiveCheck: never = mechanism; 
            console.warn(`Unknown scoring mechanism: ${mechanism}. Defaulting to 0.`);
            return 0; 
    }
} 