/**
 * board.js - Game Board Implementation for Cell Collection
 * 
 * This file implements the core game mechanics and visual representation of the game board.
 * It manages the grid, cell placement, scoring calculations, and visual rendering.
 * 
 * The Board class is responsible for:
 * - Rendering the game grid and cells
 * - Handling cell placement and extensions between cells
 * - Implementing scoring mechanisms (Cell-Connection, Cell-Multiplication, Cell-Extension)
 * - Tracking occupied cells using an integer-based grid system
 * - Visualizing connections between cells with lines, circles, or connection counts
 * 
 * Relationships with other files:
 * - game.js: Uses Board methods for updating the game state, calculating scores, and managing turns
 * - ai.js: Queries Board methods to evaluate potential moves and make decisions
 * - scoring.js: Visualizes scores that are calculated by Board methods
 * - utils.js: Provides utility functions like scoring mechanism detection
 * 
 * The grid uses integer positions (converted from pixel coordinates) to avoid floating-point
 * precision issues when determining cell adjacency and connections.
 */

import { getScoringMechanism } from "./utils.js";

class Cell {

    constructor(x, y, player, color) {
        this.x = x;
        this.y = y;
        this.player = player;
        this.neighbors = [];
    }

    updateNeighbors(cell) {
        if (cell.x)
        this.neighbors.push(cell);
    }

    isNeighbor(cell) {
        return this.neighbors.includes(cell);
    }

}


class ConnectedComponents {
    constructor() {
        this.components = [];
    }

    addCell(component) {
        this.components.push(component);
    }

    getComponent(x, y) {
        for (let i = 0; i < this.components.length; i++) {
            if (this.components[i].hasCell(x, y)) {
                return this.components[i];
            }
        }
        return null;
    }

    getComponents() {
        return this.components;
    }

    reset() {
        this.components = [];
    }

}


export class Board {

    constructor(gridSize, cellSize, playerColors, clickHandler) {

        this.gridSize = gridSize;
        this.cellSize = cellSize;
        this.playerColors = playerColors;
        this.lineColors = ["rgba(216, 191, 216, 0.8)", "rgba(216, 191, 216, 0.8)"];
        this.clickHandler = clickHandler;
        this.occupiedCells = [{}, {}];
        
        // Create the SVG with viewBox (already done in index.html)
        this.svg = d3.select("#board");
        
        this.gridGroup = this.svg.append("g");
        this.cellsGroup = this.svg.append("g");
        this.linesGroup = this.svg.append("g");  // Always visible, no toggle

        // Initialize board with percentage-based cells
        for (let x = 0; x < 99; x += this.cellSize) {
            for (let y = 0; y < 99; y += this.cellSize) {
                this.gridGroup.append("rect")
                    .attr("class", "grid-cell")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("width", this.cellSize * 0.99)  // Larger cells with less space between them (was 0.98)
                    .attr("height", this.cellSize * 0.99)
                    .on("click", this.clickHandler);
            }
        }
    }

    // Get connected components for a player
    getConnectedComponents(playerIndex) {
        const components = [];
        const visited = {};
        
        // Safety check to ensure occupiedCells[playerIndex] exists
        if (!this.occupiedCells[playerIndex]) {
            this.occupiedCells[playerIndex] = {};
        }
        
        const cells = Object.keys(this.occupiedCells[playerIndex]);
        const tolerance = 0.01; // Add tolerance for floating point comparison
        
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
                const [currentX, currentY] = currentCellKey.split('-').map(parseFloat);
                
                // Find all cells that belong to this player
                for (let neighborKey of cells) {
                    // Skip if already visited or if it's the current cell
                    if (visited[neighborKey] || neighborKey === currentCellKey) continue;
                    
                    const [neighborX, neighborY] = neighborKey.split('-').map(parseFloat);
                    
                    // Check if cells are neighbors (using tolerance for floating point)
                    const isHorizontalNeighbor = 
                        Math.abs(Math.abs(neighborX - currentX) - 1) < tolerance && 
                        Math.abs(neighborY - currentY) < tolerance;
                    
                    const isVerticalNeighbor = 
                        Math.abs(neighborX - currentX) < tolerance && 
                        Math.abs(Math.abs(neighborY - currentY) - 1) < tolerance;
                    
                    // If they're neighbors, add to stack
                    if (isHorizontalNeighbor || isVerticalNeighbor) {
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
    
    // Calculate the score for Cell-Multiplication scoring mechanism
    getMultiplicationScore(playerIndex) {
        const components = this.getConnectedComponents(playerIndex);
        
        // If no components, score is 0
        if (components.length === 0) return 0;
        
        // Calculate product of component sizes
        return components.reduce((product, component) => product * component.length, 1);
    }
    
    // Calculate the score for Cell-Connection scoring mechanism
    getConnectionScore(playerIndex) {
        // Get all occupied cells for this player
        const cells = Object.keys(this.occupiedCells[playerIndex] || {});
        
        // Count the number of connections (edges) between cells
        let connections = 0;
        
        // For each cell, check connections to other cells
        for (let cellKey of cells) {
            const [x, y] = cellKey.split('-').map(Number);

            // Check adjacent cells
            const adjacentPositions = [
                [x + 1, y], // right
                [x - 1, y], // left
                [x, y + 1], // down
                [x, y - 1]  // up
            ];
            
            // For each adjacent position, check if it's occupied by the same player
            for (let [adjX, adjY] of adjacentPositions) {
                const adjKey = `${adjX}-${adjY}`;
                if (this.occupiedCells[playerIndex][adjKey]) {
                    connections++;
                }
            }
        }
        
        // The score is the number of connections
        return connections;
    }

    // Helper method to convert floating point coordinates to integer position
    toPositionKey(x, y) {
        // Convert floating point coordinates to integer grid coordinates
        const gridX = Math.round(x / this.cellSize);
        const gridY = Math.round(y / this.cellSize);
        return `${gridX}-${gridY}`;
    }

    // Helper method to convert integer position back to floating point coordinates
    fromPositionKey(key) {
        const [gridX, gridY] = key.split('-').map(Number);
        return {
            x: gridX * this.cellSize,
            y: gridY * this.cellSize
        };
    }

    // game functions
    canPlaceRectangle(x, y, currentPlayer) {
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
        
        // Convert to integer position
        const posKey = this.toPositionKey(x, y);
        const [gridX, gridY] = posKey.split('-').map(Number);
        
        let neighbors = [];
        
        // Get adjacent cell positions
        const adjacentPositions = [
            [gridX + 1, gridY], // right
            [gridX - 1, gridY], // left
            [gridX, gridY + 1], // down
            [gridX, gridY - 1]  // up
        ];
        
        // Check for neighbors
        for (let [adjX, adjY] of adjacentPositions) {
            const adjKey = `${adjX}-${adjY}`;
            
            // If adjacent cell is occupied by current player
            if (this.occupiedCells[currentPlayer][adjKey]) {
                // And target cell is not occupied by opponent
                if (!this.occupiedCells[(currentPlayer + 1) % 2][posKey]) {
                    // Add the actual coordinates for compatibility with existing code
                    const coords = this.fromPositionKey(adjKey);
                    neighbors.push([coords.x, coords.y]);
                }
            }
        }

        return neighbors; // Return array of all adjacent cells
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
        this.svg.selectAll(".grid-cell").each((d, i, nodes) => {
            let cell = d3.select(nodes[i]);
            let x = parseFloat(cell.attr("x"));
            let y = parseFloat(cell.attr("y"));
            
            // Convert to integer position key for consistent checking
            const posKey = this.toPositionKey(x, y);
            
            // Check if the cell is occupied by either player
            if (!this.occupiedCells[0][posKey] && !this.occupiedCells[1][posKey]) {
                // Return the original coordinates for rendering compatibility, but ensure they're exact multiples
                // of the cell size to avoid floating point issues
                const roundedX = Math.round(x / this.cellSize) * this.cellSize;
                const roundedY = Math.round(y / this.cellSize) * this.cellSize;
                availableCells.push({x: roundedX, y: roundedY});
            }
        });        
        return availableCells;
    }


    drawRectangle(x, y, neighbors, player) {

        // extend cells
        let n_extensions = 0;
        for (let i = 0; i < neighbors.length; i++) {
            let neighbor = neighbors[i];
            if (x > neighbor[0]) {  // right
                this.extendCell(neighbor[0], y, neighbor[0], y, this.cellSize * 2, this.cellSize, player);
            } else if (x < neighbor[0]) {  // left
                this.extendCell(neighbor[0], y, x, y, this.cellSize * 2, this.cellSize, player);
            } else if (y > neighbor[1]) {  // down
                this.extendCell(x, neighbor[1], x, neighbor[1], this.cellSize, this.cellSize * 2, player);
            } else if (y < neighbor[1]) {  // up
                this.extendCell(x, neighbor[1], x, y, this.cellSize, this.cellSize * 2, player);
            }    
            n_extensions++;
        }

        // If there are no neighbors, draw a new rectangle
        if (neighbors.length === 0) {
            this.expandCell(x, y, this.cellSize, this.cellSize, player);
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
            .attr("height", height);
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
                        .attr("stroke", this.lineColors[player - 1])
                        .attr("stroke-width", 0.3);
                    
                    if (showConnectionCount) {
                        // For first cell, get its position key and count connections
                        const pos1Key = this.toPositionKey(x_end, y_start);
                        const [x1, y1] = pos1Key.split('-').map(Number);
                        const count1 = this.countConnections(x1, y1, player - 1);
                        
                        // For second cell, get its position key and count connections
                        const pos2Key = this.toPositionKey(x_end + this.cellSize, y_start);
                        const [x2, y2] = pos2Key.split('-').map(Number);
                        const count2 = this.countConnections(x2, y2, player - 1);
                        
                        // Add text showing connection counts
                        this.linesGroup.append("circle")
                            .attr("cx", x_end + this.cellSize / 2)
                            .attr("cy", y_mid)
                            .attr("r", 2)
                            .attr("fill", this.playerColors[player - 1])
                            .attr("class", "number-background");
                            
                        this.linesGroup.append("circle")
                            .attr("cx", x_end + 3*this.cellSize / 2)
                            .attr("cy", y_mid)
                            .attr("r", 2)
                            .attr("fill", this.playerColors[player - 1])
                            .attr("class", "number-background");
                        
                        this.linesGroup.append("text")
                            .attr("x", x_end + this.cellSize / 2)
                            .attr("y", y_mid)
                            .attr("text-anchor", "middle")
                            .attr("dominant-baseline", "central")
                            .attr("font-size", "3")
                            .attr("fill", this.lineColors[player - 1])
                            .attr("class", "connection-number")
                            .text(count1);
                            
                        this.linesGroup.append("text")
                            .attr("x", x_end + 3*this.cellSize / 2)
                            .attr("y", y_mid)
                            .attr("text-anchor", "middle")
                            .attr("dominant-baseline", "central")
                            .attr("font-size", "3")
                            .attr("fill", this.lineColors[player - 1])
                            .attr("class", "connection-number")
                            .text(count2);
                    } else {
                        // Show circles for other scoring mechanisms
                        this.linesGroup.append("circle")
                            .attr("cx", x_end + this.cellSize / 2)
                            .attr("cy", y_mid)
                            .attr("r", 0.7)
                            .attr("fill", this.lineColors[player - 1]);
                        this.linesGroup.append("circle")
                            .attr("cx", x_end + 3*this.cellSize / 2)
                            .attr("cy", y_mid)
                            .attr("r", 0.7)
                            .attr("fill", this.lineColors[player - 1]);
                    }
                } else if (height === 2*this.cellSize) {  // vertical extension
                    let x_mid = x_start + this.cellSize / 2;
                    
                    // Always add the connecting line
                    this.linesGroup.append("line")
                        .attr("x1", x_mid)
                        .attr("y1", y_end + this.cellSize / 2)
                        .attr("x2", x_mid)
                        .attr("y2", y_end + 3*this.cellSize / 2)
                        .attr("stroke", this.lineColors[player - 1])
                        .attr("stroke-width", 0.3);
                    
                    if (showConnectionCount) {
                        // For first cell, get its position key and count connections
                        const pos1Key = this.toPositionKey(x_start, y_end);
                        const [x1, y1] = pos1Key.split('-').map(Number);
                        const count1 = this.countConnections(x1, y1, player - 1);
                        
                        // For second cell, get its position key and count connections
                        const pos2Key = this.toPositionKey(x_start, y_end + this.cellSize);
                        const [x2, y2] = pos2Key.split('-').map(Number);
                        const count2 = this.countConnections(x2, y2, player - 1);
                        
                        // Add text showing connection counts
                        this.linesGroup.append("circle")
                            .attr("cx", x_mid)
                            .attr("cy", y_end + this.cellSize / 2)
                            .attr("r", 2)
                            .attr("fill", this.playerColors[player - 1])
                            .attr("class", "number-background");
                            
                        this.linesGroup.append("circle")
                            .attr("cx", x_mid)
                            .attr("cy", y_end + 3*this.cellSize / 2)
                            .attr("r", 2)
                            .attr("fill", this.playerColors[player - 1])
                            .attr("class", "number-background");
                        
                        this.linesGroup.append("text")
                            .attr("x", x_mid)
                            .attr("y", y_end + this.cellSize / 2)
                            .attr("text-anchor", "middle")
                            .attr("dominant-baseline", "central")
                            .attr("font-size", "3")
                            .attr("fill", this.lineColors[player - 1])
                            .attr("class", "connection-number")
                            .text(count1);
                            
                        this.linesGroup.append("text")
                            .attr("x", x_mid)
                            .attr("y", y_end + 3*this.cellSize / 2)
                            .attr("text-anchor", "middle")
                            .attr("dominant-baseline", "central")
                            .attr("font-size", "3")
                            .attr("fill", this.lineColors[player - 1])
                            .attr("class", "connection-number")
                            .text(count2);
                    } else {
                        // Show circles for other scoring mechanisms
                        this.linesGroup.append("circle")
                            .attr("cx", x_mid)
                            .attr("cy", y_end + this.cellSize / 2)
                            .attr("r", 0.7)
                            .attr("fill", this.lineColors[player - 1]);
                        this.linesGroup.append("circle")
                            .attr("cx", x_mid)
                            .attr("cy", y_end + 3*this.cellSize / 2)
                            .attr("r", 0.7)
                            .attr("fill", this.lineColors[player - 1]);
                    }
                }
            });            
    }
    
    // Count the number of connections (undirected edges) for a specific cell
    countConnections(gridX, gridY, playerIndex) {
        let connections = 0;
        const cellKey = `${gridX}-${gridY}`;
        
        // Check if this cell exists
        if (!this.occupiedCells[playerIndex][cellKey]) {
            return 0;
        }
        
        // Check adjacent cells
        const adjacentPositions = [
            [gridX + 1, gridY], // right
            [gridX - 1, gridY], // left
            [gridX, gridY + 1], // down
            [gridX, gridY - 1]  // up
        ];
        
        // Count occupied adjacent cells
        for (let [adjX, adjY] of adjacentPositions) {
            const adjKey = `${adjX}-${adjY}`;
            if (this.occupiedCells[playerIndex][adjKey]) {
                connections++;
            }
        }
        
        return connections;
    }

    update(x, y, currentPlayer) {
        // Ensure x and y are finite numbers
        if (!Number.isFinite(x) || !Number.isFinite(y)) {
            console.error("Invalid coordinates for update:", x, y);
            return -1;
        }
        
        // Ensure coordinates are multiples of cellSize
        const roundedX = Math.round(x / this.cellSize) * this.cellSize;
        const roundedY = Math.round(y / this.cellSize) * this.cellSize;
        
        // Convert to integer position
        const posKey = this.toPositionKey(roundedX, roundedY);

        // Check if cell is not occupied by the other player
        let n_extensions = 0;
        if (!this.occupiedCells[(currentPlayer + 1) % 2][posKey]) {

            // check if there are neighbors to extend
            let neighbors = this.canPlaceRectangle(roundedX, roundedY, currentPlayer);
            if (neighbors.length > 0) {
                n_extensions = this.drawRectangle(roundedX, roundedY, neighbors, currentPlayer + 1);
                this.occupiedCells[currentPlayer][posKey] = true;

            // otherwise draw new cell
            } else {
                n_extensions = this.drawRectangle(roundedX, roundedY, [], currentPlayer + 1);
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