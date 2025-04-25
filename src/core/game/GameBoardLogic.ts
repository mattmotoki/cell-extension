/**
 * src/logic/board/GameBoardLogic.ts
 * 
 * Pure functions for managing the game board state and logic.
 */

import { 
    getMultiplicationScore, 
    getConnectionScore, 
    getExtensionScore 
} from "../scoring"; // Corrected path
import { BoardState, Coordinates, OccupiedCells, PlayerIndex, Component } from "../types"; // Corrected path
// Assuming logger might be adapted or removed for React context
// import logger from '../../utils/logger.js';
// const log = logger.createLogger('GameBoardLogic');

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
    return !!occupiedCells[playerIndex]?.[posKey];
}

export function isCellOccupied(occupiedCells: OccupiedCells, gridX: number, gridY: number): boolean {
    const posKey = createPositionKey(gridX, gridY);
    return !!occupiedCells[0]?.[posKey] || !!occupiedCells[1]?.[posKey];
}

// --- Board Initialization & State ---

export function createInitialBoardState(gridWidth: number, gridHeight: number): BoardState {
    return {
        occupiedCells: [{}, {}],
        gridWidth: gridWidth,
        gridHeight: gridHeight,
    };
}

// --- Cell Placement ---

/**
 * Attempts to place a cell for the currentPlayer at gridX, gridY.
 * Returns the new BoardState if successful, otherwise null.
 */
export function placeCell(boardState: BoardState, currentPlayer: PlayerIndex, gridX: number, gridY: number): BoardState | null {
    const { occupiedCells, gridWidth, gridHeight } = boardState;

    if (!isValidCoordinate(gridX, gridY, gridWidth, gridHeight)) {
        console.warn(`Attempted to place cell at invalid coordinates: (${gridX}, ${gridY})`);
        return null;
    }

    const opponent = (currentPlayer + 1) % 2 as PlayerIndex;
    const posKey = createPositionKey(gridX, gridY);

    // Check if cell is occupied by opponent
    if (isCellOccupiedByPlayer(occupiedCells, opponent, gridX, gridY)) {
        console.debug(`Cell (${gridX}, ${gridY}) is occupied by opponent.`);
        return null; // Cannot place on opponent's cell
    }
    
    // Check if cell is already occupied by the current player (shouldn't happen with valid clicks)
    if (isCellOccupiedByPlayer(occupiedCells, currentPlayer, gridX, gridY)) {
        console.debug(`Cell (${gridX}, ${gridY}) is already occupied by player ${currentPlayer}.`);
        return null; 
    }

    // Create a deep copy of the occupied cells to avoid mutation
    const newOccupiedCells = JSON.parse(JSON.stringify(occupiedCells)) as OccupiedCells;
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
    const adjacentPositions = getAdjacentPositions(gridX, gridY, gridWidth, gridHeight);
    const neighbors: Coordinates[] = [];
    for (let { gridX: adjX, gridY: adjY } of adjacentPositions) {
        const adjKey = createPositionKey(adjX, adjY);
        if (occupiedCells[playerIndex]?.[adjKey]) {
            neighbors.push({ gridX: adjX, gridY: adjY });
        }
    }
    return neighbors;
}

export function getConnectedComponents(boardState: BoardState, playerIndex: PlayerIndex): Component[] {
    const { occupiedCells } = boardState;
    const components: Component[] = [];
    const visited: Record<string, boolean> = {};
    const playerCellsMap = occupiedCells[playerIndex];

    if (!playerCellsMap) return []; // No cells for this player

    const cells = Object.keys(playerCellsMap);
    if (cells.length === 0) return [];

    for (let cellKey of cells) {
        if (visited[cellKey]) continue;

        const component: Component = [];
        const stack: string[] = [cellKey];
        visited[cellKey] = true; // Mark the starting cell as visited

        while (stack.length > 0) {
            const currentCellKey = stack.pop()!;
            component.push(currentCellKey); // Add to current component

            const [currentX, currentY] = parsePositionKey(currentCellKey);
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
        components.push(component); // Add the found component to the list
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

// Type for scoring mechanism identifiers
export type ScoringMechanismId = 'cell-multiplication' | 'cell-connection' | 'cell-extension';

// Wrapper method for scoring mechanisms
// It now takes boardState instead of the GameBoardLogic instance
export function calculateScore(boardState: BoardState, playerIndex: PlayerIndex, mechanism: ScoringMechanismId): number {
    switch(mechanism) {
        case 'cell-multiplication':
            return getMultiplicationScore(boardState, playerIndex);
        case 'cell-connection':
            return getConnectionScore(boardState, playerIndex);
        case 'cell-extension':
            return getExtensionScore(boardState, playerIndex);
        default:
            console.warn(`Unknown scoring mechanism: ${mechanism}. Defaulting to 0.`);
            return 0; 
    }
}
