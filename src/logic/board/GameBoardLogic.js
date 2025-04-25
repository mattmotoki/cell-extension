/**
 * GameBoardLogic.js - Core Game Logic for the Board
 * 
 * Manages the game state (occupied cells), placement rules, 
 * connection calculations, and scoring logic independent of rendering.
 * This class handles the low-level board operations like cell placement,
 * connection detection, and component analysis.
 * 
 * Relationships:
 * - Imports scoring functions from "./scoring/index.js"
 * - Used by Game.js to handle the logical aspects of the game board
 * - Provides board state data for AIPlayer to make decisions
 * - Indirectly connects with BoardRenderer through Game.js
 * 
 * Revision Log:
 * - Added logger implementation for verbosity control
 * 
 * Note: This revision log should be updated whenever this file is modified.
 */

import { 
    getMultiplicationScore, 
    getConnectionScore, 
    getExtensionScore 
} from "./scoring/index.js"; // Keep scoring logic linked for now
import logger from '../../utils/logger.js';

// Create a module-specific logger
const log = logger.createLogger('GameBoardLogic');

export class GameBoardLogic {

    constructor(gridWidth, gridHeight) {
        this.gridWidth = gridWidth;
        this.gridHeight = gridHeight;
        this.occupiedCells = [{}, {}]; // Player 0 and Player 1
        this.reset();
    }

    // --- State Management ---

    reset() {
        this.occupiedCells = [{}, {}];
        log.debug("GameBoardLogic reset complete.");
    }

    getState() {
        // Deep copy occupiedCells to avoid mutation issues
        const occupiedCellsState = [
            JSON.parse(JSON.stringify(this.occupiedCells[0])),
            JSON.parse(JSON.stringify(this.occupiedCells[1]))
        ];
        return {
            occupiedCells: occupiedCellsState,
            gridWidth: this.gridWidth,
            gridHeight: this.gridHeight // Include dimensions if needed elsewhere
        };
    }

    setState(state) {
        if (!state || !state.occupiedCells || state.occupiedCells.length !== 2) {
            log.error("Invalid state provided to GameBoardLogic.setState");
            this.reset(); // Reset to a safe state
            return;
        }
        // Restore occupiedCells from the state (using deep copy)
        this.occupiedCells = [
            JSON.parse(JSON.stringify(state.occupiedCells[0])),
            JSON.parse(JSON.stringify(state.occupiedCells[1]))
        ];
        // Restore dimensions if they were part of the state
        this.gridWidth = state.gridWidth ?? this.gridWidth; 
        this.gridHeight = state.gridHeight ?? this.gridHeight;
        log.debug("GameBoardLogic state restored.");
    }

    // --- Cell Placement and Validation ---

    createPositionKey(gridX, gridY) {
        return `${gridX}-${gridY}`;
    }

    parsePositionKey(key) {
        return key.split('-').map(Number);
    }
    
    isValidCoordinate(gridX, gridY) {
        return gridX >= 0 && gridX < this.gridWidth && gridY >= 0 && gridY < this.gridHeight;
    }

    isCellOccupied(gridX, gridY) {
        const posKey = this.createPositionKey(gridX, gridY);
        return !!this.occupiedCells[0][posKey] || !!this.occupiedCells[1][posKey];
    }
    
    isCellOccupiedByPlayer(gridX, gridY, playerIndex) {
        const posKey = this.createPositionKey(gridX, gridY);
        return !!this.occupiedCells[playerIndex]?.[posKey];
    }

    // Attempts to place a cell for the currentPlayer at gridX, gridY
    // Returns true if successful, false otherwise
    placeCell(gridX, gridY, currentPlayer) {
        if (!this.isValidCoordinate(gridX, gridY)) {
            log.warn(`Attempted to place cell at invalid coordinates: (${gridX}, ${gridY})`);
            return false;
        }

        const opponent = (currentPlayer + 1) % 2;
        const posKey = this.createPositionKey(gridX, gridY);

        // Check if cell is occupied by opponent
        if (this.isCellOccupiedByPlayer(gridX, gridY, opponent)) {
            log.debug(`Cell (${gridX}, ${gridY}) is occupied by opponent.`);
            return false; // Cannot place on opponent's cell
        }
        
        // Check if cell is already occupied by the current player (shouldn't happen with valid clicks)
        if (this.isCellOccupiedByPlayer(gridX, gridY, currentPlayer)) {
            log.debug(`Cell (${gridX}, ${gridY}) is already occupied by player ${currentPlayer}.`);
            return false; 
        }

        // Cell is available or occupiable by extension
        this.occupiedCells[currentPlayer][posKey] = true; 
        log.debug(`Cell placed successfully by Player ${currentPlayer + 1} at (${gridX}, ${gridY})`);
        return true; // Successfully placed
    }

    // --- Neighbor and Component Logic ---

    getAdjacentPositions(gridX, gridY) {
        return [
            [gridX + 1, gridY], // right
            [gridX - 1, gridY], // left
            [gridX, gridY + 1], // down
            [gridX, gridY - 1]  // up
        ].filter(([x, y]) => this.isValidCoordinate(x, y)); // Filter out invalid coordinates
    }
    
    // Gets all adjacent cells that are occupied (by any player)
    getAdjacentOccupiedCells(gridX, gridY) {
        const adjacentPositions = this.getAdjacentPositions(gridX, gridY);
        const neighbors = [];
        for (let [adjX, adjY] of adjacentPositions) {
            if (this.isCellOccupied(adjX, adjY)) {
                neighbors.push({ gridX: adjX, gridY: adjY });
            }
        }
        return neighbors;
    }
    
    // Gets adjacent cells occupied *by the specified player*
    getAdjacentPlayerCells(gridX, gridY, playerIndex) {
        const adjacentPositions = this.getAdjacentPositions(gridX, gridY);
        const neighbors = [];
        for (let [adjX, adjY] of adjacentPositions) {
            const adjKey = this.createPositionKey(adjX, adjY);
            if (this.occupiedCells[playerIndex]?.[adjKey]) {
                neighbors.push({ gridX: adjX, gridY: adjY });
            }
        }
        return neighbors;
    }

    getConnectedComponents(playerIndex) {
        const components = [];
        const visited = {};
        const playerCellsMap = this.occupiedCells[playerIndex];

        if (!playerCellsMap) return []; // No cells for this player

        const cells = Object.keys(playerCellsMap);
        if (cells.length === 0) return [];

        for (let cellKey of cells) {
            if (visited[cellKey]) continue;

            const component = [];
            const stack = [cellKey];
            visited[cellKey] = true; // Mark the starting cell as visited

            while (stack.length > 0) {
                const currentCellKey = stack.pop();
                component.push(currentCellKey); // Add to current component

                const [currentX, currentY] = this.parsePositionKey(currentCellKey);
                const neighbors = this.getAdjacentPlayerCells(currentX, currentY, playerIndex);

                for (let neighbor of neighbors) {
                     const neighborKey = this.createPositionKey(neighbor.gridX, neighbor.gridY);
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

    // Count the number of direct connections (adjacent player cells) for a specific cell
    countConnections(gridX, gridY, playerIndex) {
       return this.getAdjacentPlayerCells(gridX, gridY, playerIndex).length;
    }

    // --- Availability and Scoring ---

    getAvailableCells() {
        let availableCells = [];
        for (let gridX = 0; gridX < this.gridWidth; gridX++) {
            for (let gridY = 0; gridY < this.gridHeight; gridY++) {
                if (!this.isCellOccupied(gridX, gridY)) {
                    availableCells.push({ gridX: gridX, gridY: gridY });
                }
            }
        }
        return availableCells;
    }
    
    getTotalCellCount() {
         return this.gridWidth * this.gridHeight;
    }

    // Wrapper methods for scoring mechanisms - Pass 'this' (GameBoardLogic instance)
    calculateScore(playerIndex, mechanism) {
        switch(mechanism) {
            case 'cell-multiplication':
                return getMultiplicationScore(this, playerIndex);
            case 'cell-connection':
                return getConnectionScore(this, playerIndex);
            case 'cell-extension':
                return getExtensionScore(this, playerIndex);
            default:
                log.warn(`Unknown scoring mechanism: ${mechanism}. Defaulting to 0.`);
                return 0; 
        }
    }
} 