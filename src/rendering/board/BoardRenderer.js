/**
 * BoardRenderer.js - D3-based Renderer for the Game Board
 * 
 * Visualizes the game state provided by GameBoardLogic using D3.js.
 * Handles user clicks and forwards them as grid coordinates to the main game logic.
 * Responsible for drawing cells, connections, and visual annotations based on scoring mechanism.
 * 
 * Relationships:
 * - Instantiated by main.js as the visual representation of the game board
 * - Receives game state data from Game.js
 * - Forwards user interactions to Game.js through click handlers
 * - Works with D3.js for SVG manipulation and rendering
 * 
 * Revision Log:
 * - Added logger implementation for verbosity control
 * 
 * Note: This revision log should be updated whenever this file is modified.
 */

// import { getScoringMechanism } from "../utils.js"; // Remove direct dependency on utils
import logger from '../../utils/logger.js';

// Create a module-specific logger
const log = logger.createLogger('BoardRenderer');

export class BoardRenderer {

    constructor(gridSize, cellSize, playerColors, externalClickHandler) {
        this.gridSize = gridSize;
        this.cellSize = cellSize;
        this.playerColors = playerColors;
        this.annotationColor = "#555555";
        this.externalClickHandler = externalClickHandler; // Renamed for clarity
        
        // Grid dimensions (needed for rendering calculations)
        this.gridWidth = Math.floor(gridSize / cellSize); 
        this.gridHeight = Math.floor(gridSize / cellSize);
        
        // Reference to the main SVG element
        this.svg = d3.select("#board");
        
        // Set the viewBox to scale the coordinate system to the SVG element
        // The coordinate system goes from (0,0) to (gridSize, gridSize)
        this.svg.attr("viewBox", `0 0 ${this.gridSize} ${this.gridSize}`)
                .attr("preserveAspectRatio", "xMidYMid meet"); // Ensure aspect ratio is maintained and centered
        
        // D3 groups for organizing elements
        this.gridGroup = this.svg.append("g").attr("id", "grid-group");
        this.cellsGroup = this.svg.append("g").attr("id", "cells-group");
        this.linesGroup = this.svg.append("g").attr("id", "lines-group");

        // Initialize the static grid background
        this.drawGridBackground();
    }

    // --- Grid and Coordinate Conversion ---
    
    drawGridBackground() {
        this.gridGroup.selectAll(".grid-cell").remove(); // Clear previous grid if any
        for (let gridX = 0; gridX < this.gridWidth; gridX++) {
            for (let gridY = 0; gridY < this.gridHeight; gridY++) {
                const pixelX = gridX * this.cellSize;
                const pixelY = gridY * this.cellSize;
                
                this.gridGroup.append("rect")
                    .attr("class", "grid-cell")
                    .attr("x", pixelX)
                    .attr("y", pixelY)
                    .attr("width", this.cellSize * 0.99)
                    .attr("height", this.cellSize * 0.99)
                    .attr("data-grid-x", gridX) // Store grid coordinates
                    .attr("data-grid-y", gridY)
                    .on("click", (event) => this.handleInternalClick(event)); // Internal handler
            }
        }
    }

    // Internal click handler to process D3 event and call external handler
    handleInternalClick(event) {
        const cellElement = event.target;
        const gridX = parseInt(d3.select(cellElement).attr("data-grid-x"));
        const gridY = parseInt(d3.select(cellElement).attr("data-grid-y"));
        
        if (!isNaN(gridX) && !isNaN(gridY)) {
             // Pass grid coordinates to the external handler (Game class)
            this.externalClickHandler(gridX, gridY);
        } else {
            log.error("Failed to get grid coordinates from clicked cell");
        }
    }

    gridToPixel(gridX, gridY) {
        return {
            x: gridX * this.cellSize,
            y: gridY * this.cellSize
        };
    }

    // --- Rendering Logic ---

    // Main render method - takes the current board logic state
    render(boardLogicState) {
        log.debug("BoardRenderer rendering...");
        if (!boardLogicState || !boardLogicState.occupiedCells) {
            log.error("Invalid state provided to BoardRenderer.render");
            return;
        }

        // Clear dynamic elements (cells and lines/annotations)
        this.cellsGroup.selectAll("*").remove();
        this.linesGroup.selectAll("*").remove();

        const occupied = boardLogicState.occupiedCells;
        const showConnectionCount = boardLogicState.scoringMechanism === 'cell-connection';

        // 1. Render all occupied cells
        for (let playerIndex = 0; playerIndex < 2; playerIndex++) {
            const playerCells = occupied[playerIndex];
            for (const posKey in playerCells) {
                if (playerCells.hasOwnProperty(posKey)) {
                    const [gridX, gridY] = posKey.split('-').map(Number);
                    const { x: pixelX, y: pixelY } = this.gridToPixel(gridX, gridY);
                    this.drawCell(pixelX, pixelY, playerIndex);
                }
            }
        }

        // 2. Render connections and annotations (lines, numbers, circles)
        const processedEdges = new Set(); // To avoid drawing lines twice
        for (let playerIndex = 0; playerIndex < 2; playerIndex++) {
            const playerCells = occupied[playerIndex];
            for (const posKey in playerCells) {
                if (playerCells.hasOwnProperty(posKey)) {
                    const [gridX, gridY] = posKey.split('-').map(Number);
                    const { x: pixelX, y: pixelY } = this.gridToPixel(gridX, gridY);
                    const xMid = pixelX + this.cellSize / 2;
                    const yMid = pixelY + this.cellSize / 2;

                    // Get adjacent cells occupied by the *same* player
                    const neighbors = this.getAdjacentOccupiedCells(gridX, gridY, playerIndex, occupied, boardLogicState.gridWidth, boardLogicState.gridHeight);

                    // Render connection count for isolated cells in 'cell-connection' mode
                    if (neighbors.length === 0 && showConnectionCount) {
                        this.drawConnectionAnnotation(xMid, yMid, 1, playerIndex);
                    }

                    // Render lines and annotations between connected cells
                    for (const neighbor of neighbors) {
                        const adjKey = `${neighbor.gridX}-${neighbor.gridY}`;
                        const edgeKey = posKey < adjKey ? `${posKey}-${adjKey}` : `${adjKey}-${posKey}`;

                        if (!processedEdges.has(edgeKey)) {
                            const { x: adjPixelX, y: adjPixelY } = this.gridToPixel(neighbor.gridX, neighbor.gridY);
                            const adjXMid = adjPixelX + this.cellSize / 2;
                            const adjYMid = adjPixelY + this.cellSize / 2;
                            
                            // Draw the connecting line
                            this.drawConnectionLine(xMid, yMid, adjXMid, adjYMid, playerIndex);

                            if (showConnectionCount) {
                                // Calculate connection counts locally within the renderer
                                const count1 = this.countOccupiedNeighbors(gridX, gridY, playerIndex, occupied, boardLogicState.gridWidth, boardLogicState.gridHeight);
                                const count2 = this.countOccupiedNeighbors(neighbor.gridX, neighbor.gridY, playerIndex, occupied, boardLogicState.gridWidth, boardLogicState.gridHeight);
                                
                                this.drawConnectionAnnotation(xMid, yMid, count1 ?? 1, playerIndex);
                                this.drawConnectionAnnotation(adjXMid, adjYMid, count2 ?? 1, playerIndex);
                            } else {
                                // Draw simple circles for other scoring mechanisms
                                this.drawSimpleConnectionMarker(xMid, yMid);
                                this.drawSimpleConnectionMarker(adjXMid, adjYMid);
                            }
                            processedEdges.add(edgeKey);
                        }
                    }
                }
            }
        }
        log.debug("BoardRenderer render complete.");
    }
    
    // Helper to get adjacent occupied cells based on provided state
    getAdjacentOccupiedCells(gridX, gridY, playerIndex, occupiedCellsState, gridWidth, gridHeight) {
        const neighbors = [];
        const potentialNeighbors = [
            [gridX + 1, gridY], [gridX - 1, gridY],
            [gridX, gridY + 1], [gridX, gridY - 1]
        ];
        for (const [adjX, adjY] of potentialNeighbors) {
             if (adjX >= 0 && adjX < gridWidth && adjY >= 0 && adjY < gridHeight) {
                const adjKey = `${adjX}-${adjY}`;
                if (occupiedCellsState[playerIndex]?.[adjKey]) {
                    neighbors.push({ gridX: adjX, gridY: adjY });
                }
            }
        }
        return neighbors;
    }
    
    // Helper to count occupied neighbors based on provided state
    countOccupiedNeighbors(gridX, gridY, playerIndex, occupiedCellsState, gridWidth, gridHeight) {
        return this.getAdjacentOccupiedCells(gridX, gridY, playerIndex, occupiedCellsState, gridWidth, gridHeight).length;
    }

    // --- Drawing Helpers ---

    drawCell(pixelX, pixelY, playerIndex) {
        this.cellsGroup.append("rect")
            .attr("class", `player-${playerIndex}-cell`)
            .attr("x", pixelX)
            .attr("y", pixelY)
            .attr("width", this.cellSize * 0.99)
            .attr("height", this.cellSize * 0.99)
            .attr("fill", this.playerColors[playerIndex])
            .attr("rx", this.cellSize / 5)
            .attr("ry", this.cellSize / 5);
    }

    drawConnectionLine(x1, y1, x2, y2, playerIndex) {
        this.linesGroup.append("line")
            .attr("class", `player-${playerIndex}-connection`)
            .attr("x1", x1)
            .attr("y1", y1)
            .attr("x2", x2)
            .attr("y2", y2)
            .attr("stroke", "black")
            .attr("stroke-width", this.cellSize * 0.01);
    }

    drawConnectionAnnotation(xMid, yMid, count, playerIndex) {
        // Background circle
        this.linesGroup.append("circle")
            .attr("class", "number-background")
            .attr("cx", xMid)
            .attr("cy", yMid)
            .attr("r", 3)
            .attr("fill", this.playerColors[playerIndex]);
        // Connection count text
        this.linesGroup.append("text")
            .attr("class", "connection-number")
            .attr("x", xMid)
            .attr("y", yMid)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central")
            .attr("font-size", "2.5")
            .attr("font-weight", "600")
            .attr("fill", this.annotationColor)
            .text(count);
    }
    
    drawSimpleConnectionMarker(xMid, yMid) {
        this.linesGroup.append("circle")
            .attr("class", "simple-marker")
            .attr("cx", xMid)
            .attr("cy", yMid)
            .attr("r", 0.7)
            .attr("fill", this.annotationColor);
    }

    // --- Reset --- 
    reset() {
        log.debug("BoardRenderer resetting visuals...");
        // Clear dynamic elements
        this.cellsGroup.selectAll("*").remove();
        this.linesGroup.selectAll("*").remove();
        // Static grid background is usually kept, but redraw if needed
        // this.drawGridBackground(); 
        log.debug("BoardRenderer reset complete.");
    }
    
    // --- Animation Placeholders (Optional) ---
    // These would need more complex state diffing or instructions from Game class
    
    animateCellPlacement(gridX, gridY, playerIndex) {
        // Placeholder for expansion animation
        const { x: pixelX, y: pixelY } = this.gridToPixel(gridX, gridY);
        log.debug(`Animating cell placement for Player ${playerIndex + 1} at (${gridX}, ${gridY})`);
        this.drawCell(pixelX, pixelY, playerIndex); // Simple draw for now
    }
    
    animateConnection(fromGridX, fromGridY, toGridX, toGridY, playerIndex) {
        // Placeholder for line drawing animation
         const { x: pixelX1, y: pixelY1 } = this.gridToPixel(fromGridX, fromGridY);
         const { x: pixelX2, y: pixelY2 } = this.gridToPixel(toGridX, toGridY);
         log.debug(`Animating connection for Player ${playerIndex + 1} from (${fromGridX}, ${fromGridY}) to (${toGridX}, ${toGridY})`);
         this.drawConnectionLine(pixelX1 + this.cellSize / 2, pixelY1 + this.cellSize / 2, 
                                 pixelX2 + this.cellSize / 2, pixelY2 + this.cellSize / 2, 
                                 playerIndex);
    }
} 