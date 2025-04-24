/**
 * Board.js - Game Board Implementation for Cell Collection
 * 
 * This file implements the core game mechanics and visual representation of the game board.
 * It manages the grid, cell placement, scoring calculations, and visual rendering.
 * 
 * The Board class is responsible for:
 * - Rendering the game grid and cells
 * - Handling cell placement and extensions between cells
 * - Implementing scoring mechanisms (imported from the scoring/ directory)
 * - Tracking occupied cells using an integer-based grid system
 * - Visualizing connections between cells with lines, circles, or connection counts
 */

import { getScoringMechanism } from "../utils.js";
import { 
    getMultiplicationScore, 
    getConnectionScore, 
    getExtensionScore 
} from "./scoring/index.js";

export class Board {

    constructor(gridSize, cellSize, playerColors, clickHandler) {
        this.gridSize = gridSize;
        this.cellSize = cellSize;
        this.playerColors = playerColors;
        this.annotationColor = "#555555";
        this.clickHandler = clickHandler;
        
        // Grid dimensions in integer units
        this.gridWidth = Math.floor(gridSize / cellSize); 
        this.gridHeight = Math.floor(gridSize / cellSize);
        
        // Initialize empty occupied cells using integer grid positions
        this.occupiedCells = [{}, {}];
        
        // Create the SVG with viewBox (already done in index.html)
        this.svg = d3.select("#board");
        
        this.gridGroup = this.svg.append("g");
        this.cellsGroup = this.svg.append("g");
        this.linesGroup = this.svg.append("g");  // Always visible, no toggle

        // Initialize board with percentage-based cells
        for (let gridX = 0; gridX < this.gridWidth; gridX++) {
            for (let gridY = 0; gridY < this.gridHeight; gridY++) {
                // Convert grid position to pixel coordinates for rendering
                const pixelX = gridX * this.cellSize;
                const pixelY = gridY * this.cellSize;
                
                this.gridGroup.append("rect")
                    .attr("class", "grid-cell")
                    .attr("x", pixelX)
                    .attr("y", pixelY)
                    .attr("width", this.cellSize * 0.99)  // Larger cells with less space between them
                    .attr("height", this.cellSize * 0.99)
                    .attr("data-grid-x", gridX)  // Store grid coordinates as data attributes
                    .attr("data-grid-y", gridY)
                    .on("click", this.clickHandler);
            }
        }
    }

    // Convert grid position to pixel coordinates (for rendering)
    gridToPixel(gridX, gridY) {
        return {
            x: gridX * this.cellSize,
            y: gridY * this.cellSize
        };
    }

    // Convert pixel coordinates to grid position (for logic)
    pixelToGrid(pixelX, pixelY) {
        return {
            x: Math.round(pixelX / this.cellSize),
            y: Math.round(pixelY / this.cellSize)
        };
    }

    // Create a grid position key for the occupiedCells map
    createPositionKey(gridX, gridY) {
        return `${gridX}-${gridY}`;
    }

    // Parse a position key into grid coordinates
    parsePositionKey(key) {
        return key.split('-').map(Number);
    }

    // Get adjacent positions for a grid cell
    getAdjacentPositions(gridX, gridY) {
        return [
            [gridX + 1, gridY], // right
            [gridX - 1, gridY], // left
            [gridX, gridY + 1], // down
            [gridX, gridY - 1]  // up
        ];
    }

    // Get connected components for a player using grid positions
    getConnectedComponents(playerIndex) {
        const components = [];
        const visited = {};
        
        // Safety check to ensure occupiedCells[playerIndex] exists
        if (!this.occupiedCells[playerIndex]) {
            this.occupiedCells[playerIndex] = {};
        }
        
        const cells = Object.keys(this.occupiedCells[playerIndex]);
        
        // Skip if no cells for this player
        if (cells.length === 0) return [];
        
        // For each cell that belongs to the player
        for (let cellKey of cells) {
            // Skip if already visited
            if (visited[cellKey]) continue;
            
            // Start a new component
            const component = [];
            const stack = [cellKey];
            
            // DFS to find connected cells
            while (stack.length > 0) {
                const currentCellKey = stack.pop();
                
                // Skip if already visited
                if (visited[currentCellKey]) continue;
                
                // Mark as visited and add to component
                visited[currentCellKey] = true;
                component.push(currentCellKey);
                
                // Get coordinates of current cell
                const [currentX, currentY] = this.parsePositionKey(currentCellKey);
                
                // Find all cells that belong to this player
                for (let neighborKey of cells) {
                    // Skip if already visited or if it's the current cell
                    if (visited[neighborKey] || neighborKey === currentCellKey) continue;
                    
                    const [neighborX, neighborY] = this.parsePositionKey(neighborKey);
                    
                    // Check if cells are adjacent on the grid (Manhattan distance of 1)
                    const isNeighbor = 
                        (Math.abs(neighborX - currentX) === 1 && neighborY === currentY) ||
                        (Math.abs(neighborY - currentY) === 1 && neighborX === currentX);
                    
                    // If they're neighbors, add to stack
                    if (isNeighbor) {
                        stack.push(neighborKey);
                    }
                }
            }
            
            // Add component to components list
            if (component.length > 0) {
                components.push(component);
            }
        }
        
        return components;
    }
    
    // Method to get the current state of the board
    getState() {
        // Deep copy occupiedCells to avoid mutation issues
        const occupiedCellsState = [
            JSON.parse(JSON.stringify(this.occupiedCells[0])),
            JSON.parse(JSON.stringify(this.occupiedCells[1]))
        ];
        return {
            occupiedCells: occupiedCellsState
        };
    }

    // Method to set the board state and redraw
    setState(state) {
        console.log("Board setState called with state:", state ? "valid state" : "invalid state");
        
        if (!state || !state.occupiedCells) {
            console.error("Invalid state provided to board.setState");
            return;
        }
        
        // Restore occupiedCells from the state (using deep copy)
        this.occupiedCells = [
            JSON.parse(JSON.stringify(state.occupiedCells[0])),
            JSON.parse(JSON.stringify(state.occupiedCells[1]))
        ];

        // Clear ALL existing visual elements
        this.cellsGroup.selectAll("*").remove();
        this.linesGroup.selectAll("*").remove();
        
        // First, redraw all cells
        for (let playerIndex = 0; playerIndex < 2; playerIndex++) {
            const playerCells = this.occupiedCells[playerIndex];
            for (const posKey in playerCells) {
                if (playerCells.hasOwnProperty(posKey)) {
                    const [gridX, gridY] = this.parsePositionKey(posKey);
                    const {x: pixelX, y: pixelY} = this.gridToPixel(gridX, gridY);
                    
                    // Redraw the cell (rectangle)
                    this.cellsGroup.append("rect")
                        .attr("class", `rectangle${playerIndex+1}`)
                        .attr("x", pixelX)
                        .attr("y", pixelY)
                        .attr("width", this.cellSize * 0.99)
                        .attr("height", this.cellSize * 0.99)
                        .attr("fill", this.playerColors[playerIndex])
                        .attr("rx", this.cellSize/5)
                        .attr("ry", this.cellSize/5)
                        .attr("data-grid-x", gridX)
                        .attr("data-grid-y", gridY);
                }
            }
        }
        
        const currentScoring = getScoringMechanism();
        const showConnectionCount = currentScoring === 'cell-connection';
                
        // Then, redraw all connections (lines and annotations)
        for (let playerIndex = 0; playerIndex < 2; playerIndex++) {
            const playerCells = this.occupiedCells[playerIndex];
            for (const posKey in playerCells) {
                if (playerCells.hasOwnProperty(posKey)) {
                    const [gridX, gridY] = this.parsePositionKey(posKey);
                    const {x: pixelX, y: pixelY} = this.gridToPixel(gridX, gridY);
                    
                    // Add visual indicators for single cells
                    if (this.countConnections(gridX, gridY, playerIndex) === 0 && showConnectionCount) {
                        // Calculate cell center for isolated cells
                        const x_mid = pixelX + this.cellSize / 2;
                        const y_mid = pixelY + this.cellSize / 2;
                        
                        // Add circle background
                        this.linesGroup.append("circle")
                            .attr("cx", x_mid)
                            .attr("cy", y_mid)
                            .attr("r", 3)
                            .attr("fill", this.playerColors[playerIndex])
                            .attr("class", "number-background");
                        
                        // Add "1" text
                        this.linesGroup.append("text")
                            .attr("x", x_mid)
                            .attr("y", y_mid)
                            .attr("text-anchor", "middle")
                            .attr("dominant-baseline", "central")
                            .attr("font-size", "2.5")
                            .attr("font-weight", "600")
                            .attr("fill", this.annotationColor)
                            .attr("class", "connection-number")
                            .text("1");
                    }
                    
                    // Redraw lines/connections to adjacent cells of the same player
                    const adjacentPositions = this.getAdjacentPositions(gridX, gridY);
                    for (let [adjX, adjY] of adjacentPositions) {
                        const adjKey = this.createPositionKey(adjX, adjY);
                        if (this.occupiedCells[playerIndex][adjKey]) {
                            // Ensure lines are drawn only once (e.g., from lower to higher key)
                            if (posKey < adjKey) {
                                const {x: adjPixelX, y: adjPixelY} = this.gridToPixel(adjX, adjY);
                                const x1 = pixelX + this.cellSize / 2;
                                const y1 = pixelY + this.cellSize / 2;
                                const x2 = adjPixelX + this.cellSize / 2;
                                const y2 = adjPixelY + this.cellSize / 2;
                                
                                // Add the connecting line
                                this.linesGroup.append("line")
                                    .attr("x1", x1)
                                    .attr("y1", y1)
                                    .attr("x2", x2)
                                    .attr("y2", y2)
                                    .attr("stroke", this.playerColors[playerIndex])
                                    .attr("stroke-width", this.cellSize * 0.1)
                                    .attr("opacity", 0.6);
                                    
                                if (showConnectionCount) {
                                    // Add connection count indicators
                                    const count1 = this.countConnections(gridX, gridY, playerIndex);
                                    const count2 = this.countConnections(adjX, adjY, playerIndex);
                                    
                                    // Add background circles and connection counts for both cells
                                    this.linesGroup.append("circle")
                                        .attr("cx", x1)
                                        .attr("cy", y1)
                                        .attr("r", 3)
                                        .attr("fill", this.playerColors[playerIndex])
                                        .attr("class", "number-background");
                                        
                                    this.linesGroup.append("circle")
                                        .attr("cx", x2)
                                        .attr("cy", y2)
                                        .attr("r", 3)
                                        .attr("fill", this.playerColors[playerIndex])
                                        .attr("class", "number-background");
                                    
                                    this.linesGroup.append("text")
                                        .attr("x", x1)
                                        .attr("y", y1)
                                        .attr("text-anchor", "middle")
                                        .attr("dominant-baseline", "central")
                                        .attr("font-size", "2.5")
                                        .attr("font-weight", "600")
                                        .attr("fill", this.annotationColor)
                                        .attr("class", "connection-number")
                                        .text(count1);
                                        
                                    this.linesGroup.append("text")
                                        .attr("x", x2)
                                        .attr("y", y2)
                                        .attr("text-anchor", "middle")
                                        .attr("dominant-baseline", "central")
                                        .attr("font-size", "2.5")
                                        .attr("font-weight", "600")
                                        .attr("fill", this.annotationColor)
                                        .attr("class", "connection-number")
                                        .text(count2);
                                } else {
                                    // Add small circles for other scoring mechanisms
                                    this.linesGroup.append("circle")
                                        .attr("cx", x1)
                                        .attr("cy", y1)
                                        .attr("r", 0.7)
                                        .attr("fill", this.annotationColor);
                                    this.linesGroup.append("circle")
                                        .attr("cx", x2)
                                        .attr("cy", y2)
                                        .attr("r", 0.7)
                                        .attr("fill", this.annotationColor);
                                }
                            }
                        }
                    }
                }
            }
        }
        
        console.log("Board state restored successfully");
    }

    // Wrapper methods for scoring mechanisms
    getMultiplicationScore(playerIndex) {
        return getMultiplicationScore(this, playerIndex);
    }
    
    getConnectionScore(playerIndex) {
        return getConnectionScore(this, playerIndex);
    }
    
    getExtensionScore(playerIndex) {
        return getExtensionScore(this, playerIndex);
    }
    
    // game functions - check if a cell can be placed/extended
    canPlaceRectangle(pixelX, pixelY, currentPlayer) {
        // Safety check to ensure occupiedCells exists
        if (!this.occupiedCells) {
            this.occupiedCells = [{}, {}];
        }
        if (!this.occupiedCells[currentPlayer]) {
            this.occupiedCells[currentPlayer] = {};
        }
        if (!this.occupiedCells[(currentPlayer + 1) % 2]) {
            this.occupiedCells[(currentPlayer + 1) % 2] = {};
        }
        
        // Convert to grid coordinates
        const {x: gridX, y: gridY} = this.pixelToGrid(pixelX, pixelY);
        const posKey = this.createPositionKey(gridX, gridY);
        
        let neighbors = [];
        
        // Get adjacent grid positions
        const adjacentPositions = this.getAdjacentPositions(gridX, gridY);
        
        // Check for neighbors
        for (let [adjX, adjY] of adjacentPositions) {
            const adjKey = this.createPositionKey(adjX, adjY);
            
            // If adjacent cell is occupied by current player
            if (this.occupiedCells[currentPlayer][adjKey]) {
                // And target cell is not occupied by opponent
                if (!this.occupiedCells[(currentPlayer + 1) % 2][posKey]) {
                    // Return the pixel coordinates for the neighbor (for rendering)
                    const pixelCoords = this.gridToPixel(adjX, adjY);
                    neighbors.push([pixelCoords.x, pixelCoords.y]);
                }
            }
        }

        return neighbors; // Return array of all adjacent cells in pixel coordinates
    }        

    
    getAvailableCells() {
        // Safety check to ensure occupiedCells exists
        if (!this.occupiedCells) {
            this.occupiedCells = [{}, {}];
        }
        if (!this.occupiedCells[0]) {
            this.occupiedCells[0] = {};
        }
        if (!this.occupiedCells[1]) {
            this.occupiedCells[1] = {};
        }
        
        let availableCells = [];
        
        // Iterate through the grid using integer coordinates
        for (let gridX = 0; gridX < this.gridWidth; gridX++) {
            for (let gridY = 0; gridY < this.gridHeight; gridY++) {
                const posKey = this.createPositionKey(gridX, gridY);
                
                // Check if the cell is occupied by either player
                if (!this.occupiedCells[0][posKey] && !this.occupiedCells[1][posKey]) {
                    // Return pixel coordinates for rendering compatibility
                    const pixelCoords = this.gridToPixel(gridX, gridY);
                    availableCells.push({x: pixelCoords.x, y: pixelCoords.y, gridX: gridX, gridY: gridY});
                }
            }
        }
        
        return availableCells;
    }

    // Count the number of connections for a specific cell
    countConnections(gridX, gridY, playerIndex) {
        let connections = 0;
        const cellKey = this.createPositionKey(gridX, gridY);
        
        // Check if this cell exists
        if (!this.occupiedCells[playerIndex][cellKey]) {
            return 0;
        }
        
        // Check adjacent cells
        const adjacentPositions = this.getAdjacentPositions(gridX, gridY);
        
        // Count occupied adjacent cells
        for (let [adjX, adjY] of adjacentPositions) {
            const adjKey = this.createPositionKey(adjX, adjY);
            if (this.occupiedCells[playerIndex][adjKey]) {
                connections++;
            }
        }
        
        return connections;
    }

    drawRectangle(pixelX, pixelY, neighbors, player) {
        // extend cells
        let n_extensions = 0;
        for (let i = 0; i < neighbors.length; i++) {
            let neighbor = neighbors[i];
            if (pixelX > neighbor[0]) {  // right
                this.extendCell(neighbor[0], pixelY, neighbor[0], pixelY, this.cellSize * 2, this.cellSize, player);
            } else if (pixelX < neighbor[0]) {  // left
                this.extendCell(neighbor[0], pixelY, pixelX, pixelY, this.cellSize * 2, this.cellSize, player);
            } else if (pixelY > neighbor[1]) {  // down
                this.extendCell(pixelX, neighbor[1], pixelX, neighbor[1], this.cellSize, this.cellSize * 2, player);
            } else if (pixelY < neighbor[1]) {  // up
                this.extendCell(pixelX, neighbor[1], pixelX, pixelY, this.cellSize, this.cellSize * 2, player);
            }    
            n_extensions++;
        }

        // If there are no neighbors, draw a new rectangle
        if (neighbors.length === 0) {
            this.expandCell(pixelX, pixelY, this.cellSize, this.cellSize, player);
        }

        return n_extensions;
    }

    // Helper function to draw a new cell
    expandCell(x_start, y_start, width, height, player) {
        this.cellsGroup.append("rect")
            .attr("class", `rectangle${player}`)
            .attr("x", x_start + width/2)
            .attr("y", y_start + height/2)
            .attr("width", 0)
            .attr("height", 0)
            .attr("fill", this.playerColors[player - 1])
            .transition()
            .duration(1000)
            .attr("x", x_start)
            .attr("y", y_start)
            .attr("rx", this.cellSize/5)
            .attr("ry", this.cellSize/5)
            .attr("width", width)
            .attr("height", height)
            .on("end", () => {
                const currentScoring = getScoringMechanism();
                const showConnectionCount = currentScoring === 'cell-connection';
                
                // For single cells in cell-connection mode, add a "1" indicator
                if (showConnectionCount) {
                    // Calculate cell center
                    const x_mid = x_start + width / 2;
                    const y_mid = y_start + height / 2;
                    
                    // Add circle background
                    this.linesGroup.append("circle")
                        .attr("cx", x_mid)
                        .attr("cy", y_mid)
                        .attr("r", 3)  // Slightly larger than original (2) but constant size
                        .attr("fill", this.playerColors[player - 1])
                        .attr("class", "number-background");
                    
                    // Add "1" text
                    this.linesGroup.append("text")
                        .attr("x", x_mid)
                        .attr("y", y_mid)
                        .attr("text-anchor", "middle")
                        .attr("dominant-baseline", "central")
                        .attr("font-size", "2.5")
                        .attr("font-weight", "600")
                        .attr("fill", this.annotationColor)
                        .attr("class", "connection-number")
                        .text("1");
                }
            });
    }

    // Helper function to extend an existing cell
    extendCell(x_start, y_start, x_end, y_end, width, height, player) {
        this.cellsGroup.append("rect")
            .attr("class", `rectangle${player}`)
            .attr("x", x_start)
            .attr("y", y_start)
            .attr("width", width === 2*this.cellSize ? this.cellSize : width)
            .attr("height", height === 2*this.cellSize ? this.cellSize : height)
            .attr("fill", this.playerColors[player - 1])
            .attr("rx", this.cellSize/5)
            .attr("ry", this.cellSize/5)
            .transition()
            .duration(1000)
            .attr("x", x_end)
            .attr("y", y_end)
            .attr("width", width)
            .attr("height", height)
            .on("end", () => {
                const currentScoring = getScoringMechanism();
                const showConnectionCount = currentScoring === 'cell-connection';

                if (width === 2*this.cellSize) {  // horizontal extension
                    let y_mid = y_start + this.cellSize / 2;
                    
                    // Always add the connecting line
                    this.linesGroup.append("line")
                        .attr("x1", x_end + this.cellSize / 2)
                        .attr("y1", y_mid)
                        .attr("x2", x_end + 3*this.cellSize / 2)
                        .attr("y2", y_mid)
                        .attr("stroke", this.annotationColor)
                        .attr("stroke-width", 0.3);
                    
                    if (showConnectionCount) {
                        // Get grid coordinates for both cells
                        const gridY = Math.round(y_start / this.cellSize);
                        const gridX1 = Math.round(x_end / this.cellSize);
                        const gridX2 = gridX1 + 1;
                        
                        // Create position keys for both cells
                        const pos1Key = this.createPositionKey(gridX1, gridY);
                        const pos2Key = this.createPositionKey(gridX2, gridY);
                        
                        // Make sure both cells are marked as occupied temporarily for connection counting
                        const playerIndex = player - 1;
                        const wasOccupied1 = this.occupiedCells[playerIndex][pos1Key];
                        const wasOccupied2 = this.occupiedCells[playerIndex][pos2Key];
                        
                        // Mark both cells as occupied for correct connection counting
                        this.occupiedCells[playerIndex][pos1Key] = true;
                        this.occupiedCells[playerIndex][pos2Key] = true;
                        
                        // Count connections for both cells
                        const count1 = this.countConnections(gridX1, gridY, playerIndex);
                        const count2 = this.countConnections(gridX2, gridY, playerIndex);
                        
                        // Restore original state if needed (though they should remain occupied)
                        if (!wasOccupied1) {
                            this.occupiedCells[playerIndex][pos1Key] = wasOccupied1;
                        }
                        if (!wasOccupied2) {
                            this.occupiedCells[playerIndex][pos2Key] = wasOccupied2;
                        }
                        
                        // Add text showing connection counts
                        this.linesGroup.append("circle")
                            .attr("cx", x_end + this.cellSize / 2)
                            .attr("cy", y_mid)
                            .attr("r", 3)  // Changed from 2 to 3
                            .attr("fill", this.playerColors[player - 1])
                            .attr("class", "number-background");
                            
                        this.linesGroup.append("circle")
                            .attr("cx", x_end + 3*this.cellSize / 2)
                            .attr("cy", y_mid)
                            .attr("r", 3)  // Changed from 2 to 3
                            .attr("fill", this.playerColors[player - 1])
                            .attr("class", "number-background");
                        
                        this.linesGroup.append("text")
                            .attr("x", x_end + this.cellSize / 2)
                            .attr("y", y_mid)
                            .attr("text-anchor", "middle")
                            .attr("dominant-baseline", "central")
                            .attr("font-size", "2.5")
                            .attr("font-weight", "600")
                            .attr("fill", this.annotationColor)
                            .attr("class", "connection-number")
                            .text(count1);
                            
                        this.linesGroup.append("text")
                            .attr("x", x_end + 3*this.cellSize / 2)
                            .attr("y", y_mid)
                            .attr("text-anchor", "middle")
                            .attr("dominant-baseline", "central")
                            .attr("font-size", "2.5")
                            .attr("font-weight", "600")
                            .attr("fill", this.annotationColor)
                            .attr("class", "connection-number")
                            .text(count2);
                    } else {
                        // Show circles for other scoring mechanisms
                        this.linesGroup.append("circle")
                            .attr("cx", x_end + this.cellSize / 2)
                            .attr("cy", y_mid)
                            .attr("r", 0.7)
                            .attr("fill", this.annotationColor);
                        this.linesGroup.append("circle")
                            .attr("cx", x_end + 3*this.cellSize / 2)
                            .attr("cy", y_mid)
                            .attr("r", 0.7)
                            .attr("fill", this.annotationColor);
                    }
                } else if (height === 2*this.cellSize) {  // vertical extension
                    let x_mid = x_start + this.cellSize / 2;
                    
                    // Always add the connecting line
                    this.linesGroup.append("line")
                        .attr("x1", x_mid)
                        .attr("y1", y_end + this.cellSize / 2)
                        .attr("x2", x_mid)
                        .attr("y2", y_end + 3*this.cellSize / 2)
                        .attr("stroke", this.annotationColor)
                        .attr("stroke-width", 0.3);
                    
                    if (showConnectionCount) {
                        // Get grid coordinates for both cells
                        const gridX = Math.round(x_start / this.cellSize);
                        const gridY1 = Math.round(y_end / this.cellSize);
                        const gridY2 = gridY1 + 1;
                        
                        // Create position keys for both cells
                        const pos1Key = this.createPositionKey(gridX, gridY1);
                        const pos2Key = this.createPositionKey(gridX, gridY2);
                        
                        // Make sure both cells are marked as occupied temporarily for connection counting
                        const playerIndex = player - 1;
                        const wasOccupied1 = this.occupiedCells[playerIndex][pos1Key];
                        const wasOccupied2 = this.occupiedCells[playerIndex][pos2Key];
                        
                        // Mark both cells as occupied for correct connection counting
                        this.occupiedCells[playerIndex][pos1Key] = true;
                        this.occupiedCells[playerIndex][pos2Key] = true;
                        
                        // Count connections for both cells
                        const count1 = this.countConnections(gridX, gridY1, playerIndex);
                        const count2 = this.countConnections(gridX, gridY2, playerIndex);
                        
                        // Restore original state if needed (though they should remain occupied)
                        if (!wasOccupied1) {
                            this.occupiedCells[playerIndex][pos1Key] = wasOccupied1;
                        }
                        if (!wasOccupied2) {
                            this.occupiedCells[playerIndex][pos2Key] = wasOccupied2;
                        }
                        
                        // Add text showing connection counts
                        this.linesGroup.append("circle")
                            .attr("cx", x_mid)
                            .attr("cy", y_end + this.cellSize / 2)
                            .attr("r", 3)  // Changed from 2 to 3
                            .attr("fill", this.playerColors[player - 1])
                            .attr("class", "number-background");
                            
                        this.linesGroup.append("circle")
                            .attr("cx", x_mid)
                            .attr("cy", y_end + 3*this.cellSize / 2)
                            .attr("r", 3)  // Changed from 2 to 3
                            .attr("fill", this.playerColors[player - 1])
                            .attr("class", "number-background");
                        
                        this.linesGroup.append("text")
                            .attr("x", x_mid)
                            .attr("y", y_end + this.cellSize / 2)
                            .attr("text-anchor", "middle")
                            .attr("dominant-baseline", "central")
                            .attr("font-size", "2.5")
                            .attr("font-weight", "600")
                            .attr("fill", this.annotationColor)
                            .attr("class", "connection-number")
                            .text(count1);
                            
                        this.linesGroup.append("text")
                            .attr("x", x_mid)
                            .attr("y", y_end + 3*this.cellSize / 2)
                            .attr("text-anchor", "middle")
                            .attr("dominant-baseline", "central")
                            .attr("font-size", "2.5")
                            .attr("font-weight", "600")
                            .attr("fill", this.annotationColor)
                            .attr("class", "connection-number")
                            .text(count2);
                    } else {
                        // Show circles for other scoring mechanisms
                        this.linesGroup.append("circle")
                            .attr("cx", x_mid)
                            .attr("cy", y_end + this.cellSize / 2)
                            .attr("r", 0.7)
                            .attr("fill", this.annotationColor);
                        this.linesGroup.append("circle")
                            .attr("cx", x_mid)
                            .attr("cy", y_end + 3*this.cellSize / 2)
                            .attr("r", 0.7)
                            .attr("fill", this.annotationColor);
                    }
                }
            });            
    }

    update(pixelX, pixelY, currentPlayer) {
        // Ensure coordinates are valid
        if (!Number.isFinite(pixelX) || !Number.isFinite(pixelY)) {
            console.error("Invalid coordinates for update:", pixelX, pixelY);
            return -1;
        }
        
        // Convert to grid coordinates
        const {x: gridX, y: gridY} = this.pixelToGrid(pixelX, pixelY);
        const posKey = this.createPositionKey(gridX, gridY);
        
        // Get pixel coordinates from grid for consistent rendering
        const pixelCoords = this.gridToPixel(gridX, gridY);

        // Check if cell is not occupied by the other player
        let n_extensions = 0;
        if (!this.occupiedCells[(currentPlayer + 1) % 2][posKey]) {

            // check if there are neighbors to extend
            let neighbors = this.canPlaceRectangle(pixelCoords.x, pixelCoords.y, currentPlayer);
            if (neighbors.length > 0) {
                n_extensions = this.drawRectangle(pixelCoords.x, pixelCoords.y, neighbors, currentPlayer + 1);
                this.occupiedCells[currentPlayer][posKey] = true;

            // otherwise draw new cell
            } else {
                n_extensions = this.drawRectangle(pixelCoords.x, pixelCoords.y, [], currentPlayer + 1);
                this.occupiedCells[currentPlayer][posKey] = true;
            }

        } else {
            n_extensions = -1;
        }

        return n_extensions;
    }

    reset(playerColors) {
        this.playerColors = playerColors;
        this.cellsGroup.selectAll(".rectangle1, .rectangle2").remove();
        this.linesGroup.selectAll("circle").remove();
        this.linesGroup.selectAll("line").remove();
        this.linesGroup.selectAll("text.connection-number").remove();
        this.linesGroup.selectAll(".number-background").remove();
        this.occupiedCells = [{}, {}];
    }
} 