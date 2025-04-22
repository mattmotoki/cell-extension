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
                        Math.abs(Math.abs(neighborX - currentX) - this.cellSize) < tolerance && 
                        Math.abs(neighborY - currentY) < tolerance;
                    
                    const isVerticalNeighbor = 
                        Math.abs(neighborX - currentX) < tolerance && 
                        Math.abs(Math.abs(neighborY - currentY) - this.cellSize) < tolerance;
                    
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

    // game functions
    canPlaceRectangle(x, y, currentPlayer) {
        let neighbors = [];
        const tolerance = 0.01; // Add a small tolerance for floating point comparison

        // Check if the cell is adjacent to any occupied cell
        for (let key in this.occupiedCells[currentPlayer]) {
            let cell = key.split("-").map(parseFloat);
            
            // Use approximate equality for floating point coordinates
            const isHorizontalNeighbor = 
                Math.abs(Math.abs(cell[0] - x) - this.cellSize) < tolerance && 
                Math.abs(cell[1] - y) < tolerance;
                
            const isVerticalNeighbor = 
                Math.abs(cell[0] - x) < tolerance && 
                Math.abs(Math.abs(cell[1] - y) - this.cellSize) < tolerance;

            if (isHorizontalNeighbor || isVerticalNeighbor) {
                // Check if the other player hasn't occupied the cell
                if (!this.occupiedCells[(currentPlayer + 1) % 2][`${x}-${y}`]) {
                    neighbors.push(cell); // Cell is adjacent to an occupied cell
                }
            }
        }

        return neighbors; // Return array of all adjacent cells
    }        

    
    getAvailableCells() {
        let availableCells = [];
        this.svg.selectAll(".grid-cell").each((d, i, nodes) => {
            let cell = d3.select(nodes[i]);
            let x = parseFloat(cell.attr("x"));
            let y = parseFloat(cell.attr("y"));
            if (!this.occupiedCells[0][`${x}-${y}`] && !this.occupiedCells[1][`${x}-${y}`]) {
                availableCells.push({x: x, y: y});
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
                if (width === 2*this.cellSize) {  // horizontal extension
                    let y_mid = y_start  + this.cellSize / 2;
                    this.linesGroup.append("line")
                        .attr("x1", x_end + this.cellSize / 2)
                        .attr("y1", y_mid)
                        .attr("x2", x_end + 3*this.cellSize / 2)
                        .attr("y2", y_mid)
                        .attr("stroke", this.lineColors[player - 1])
                        .attr("stroke-width", 0.3);
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
                } else if (height === 2*this.cellSize) {  // vertical extension
                    let x_mid = x_start + this.cellSize / 2;
                    this.linesGroup.append("line")
                        .attr("x1", x_mid)
                        .attr("y1", y_end + this.cellSize / 2)
                        .attr("x2", x_mid)
                        .attr("y2", y_end + 3*this.cellSize / 2)
                        .attr("stroke", this.lineColors[player - 1])
                        .attr("stroke-width", 0.3);
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
            });            
    }
    
    update(x, y, currentPlayer) {

        // Check if cell is not occupied by the other player
        let n_extensions = 0;
        if (!this.occupiedCells[(currentPlayer + 1) % 2][`${x}-${y}`]) {

            // check if there are neighbors to extend
            let neighbors = this.canPlaceRectangle(x, y, currentPlayer);
            if (neighbors.length > 0) {
                n_extensions = this.drawRectangle(x, y, neighbors, currentPlayer + 1);
                this.occupiedCells[currentPlayer][`${x}-${y}`] = true;

            // otherwise draw new cell
            } else {
                n_extensions = this.drawRectangle(x, y, [], currentPlayer + 1);
                this.occupiedCells[currentPlayer][`${x}-${y}`] = true;
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
        this.occupiedCells = [{}, {}];
    }

}