import {shuffle} from "./utils.js";


export class Widget {

    constructor(widgetName, gridSize, cellSize, waitTime) {

        this.widgetName = widgetName;
        this.gridSize = gridSize;
        this.cellSize = cellSize;
        this.waitTime = waitTime;
        this.colorPalette = ["#00FF00", "#1E90FF"];
        this.playerColors = ["#00FF00", "#1E90FF"];
        // ["#000000", "#FFDD00", "#1E90FF", "#FF2600", "#00FF00", "#800080"];
        //this.colorPalette = ["skyblue", "aquamarine", "lightcoral", "plum", "peachpuff", "khaki"];
        //this.playerColors = ["skyblue", "plum"];
        this.occupiedCells = [{}, {}];
        this.currentPlayer = 0;
        this.svg = d3.select(`#${widgetName}`)
            .attr("width", gridSize)
            .attr("height", gridSize);
        
        // Draw the grid
        for (let x = 0; x < gridSize; x += cellSize) {
            for (let y = 0; y < gridSize; y += cellSize) {
                this.svg.append("rect")
                    .attr("class", "grid-cell")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("width", cellSize)
                    .attr("height", cellSize);
            }
        }
    }


    // Helper function to check whether a rectangle can be placed
    canPlaceRectangle(x, y, currentPlayer) {
        let neighbors = [];

        // Check if the cell is adjacent to any occupied cell
        for (let key in this.occupiedCells[currentPlayer]) {
            let cell = key.split("-").map(parseFloat);
            if (
                (Math.abs(cell[0] - x) === this.cellSize && cell[1] === y) ||
                (cell[0] === x && Math.abs(cell[1] - y) === this.cellSize)
            ) {
                // Check if the other player hasn't occupied the cell
                if (!this.occupiedCells[(currentPlayer + 1) % 2][`${x}-${y}`]) {
                    neighbors.push(cell); // Cell is adjacent to an occupied cell
                }
            }
        }

        return neighbors; // Return array of all adjacent cells
    }        


    // Draw rectangle
    drawRectangle(x, y, neighbors, player) {

        // extend cells
        for (let i = 0; i < neighbors.length; i++) {                
            let neighbor = neighbors[i];
            if (x > neighbor[0]) {  // right
                this.extendRectangle(neighbor[0], y, neighbor[0], y, this.cellSize * 2, this.cellSize, player);
            } else if (x < neighbor[0]) {  // left
                this.extendRectangle(neighbor[0], y, x, y, this.cellSize * 2, this.cellSize, player);
            } else if (y > neighbor[1]) {  // down
                this.extendRectangle(x, neighbor[1], x, neighbor[1], this.cellSize, this.cellSize * 2, player);
            } else if (y < neighbor[1]) {  // up
                this.extendRectangle(x, neighbor[1], x, y, this.cellSize, this.cellSize * 2, player);
            }    
        }

        // If there are no neighbors, draw a new rectangle
        if (neighbors.length === 0) {
            this.extendRectangle(x, y, x, y, this.cellSize, this.cellSize, player);
        }
    }

    
    // Helper to draw or extend a rectangle
    extendRectangle(x_start, y_start, x_end, y_end, width, height, player) {
        let rect = this.svg.append("rect")
            .attr("class", `rectangle${player}`)
            .attr("x", x_start)
            .attr("y", y_start)
            .attr("width", width === 2*this.cellSize ? this.cellSize : width)
            .attr("height", height === 2*this.cellSize ? this.cellSize : height)
            .attr("fill", this.playerColors[player - 1])
            .attr("rx", this.cellSize/5)
            .attr("ry", this.cellSize/5);

        rect.transition()
            .duration(this.waitTime)
            .attr("x", x_end)
            .attr("y", y_end)
            .attr("width", width)
            .attr("height", height);
    }


    // Random move placement
    playRandomly() {
                
        // List all available cells
        let availableCells = [];
        this.svg.selectAll(".grid-cell").each((d, i, nodes) => {
            let cell = d3.select(nodes[i]);
            let x = parseFloat(cell.attr("x"));
            let y = parseFloat(cell.attr("y"));
            if (!this.occupiedCells[0][`${x}-${y}`] && !this.occupiedCells[1][`${x}-${y}`]) {
                availableCells.push({x: x, y: y});
            }
        });
                
        // Randomly pick an available cell
        let randomCell = availableCells[Math.floor(Math.random() * availableCells.length)];

        // Simulate a click on the selected cell
        let neighbors = this.canPlaceRectangle(randomCell.x, randomCell.y, this.currentPlayer);
        if (neighbors.length > 0) {
            this.drawRectangle(randomCell.x, randomCell.y, neighbors, this.currentPlayer + 1);
            this.occupiedCells[this.currentPlayer][`${randomCell.x}-${randomCell.y}`] = true;
        } else {
            this.drawRectangle(randomCell.x, randomCell.y, [], this.currentPlayer + 1);
            this.occupiedCells[this.currentPlayer][`${randomCell.x}-${randomCell.y}`] = true;
        }

        // Switch to the other player
        this.currentPlayer = (this.currentPlayer + 1) % 2;
        
        // If the game is still in progress, schedule the next move
        if (availableCells.length > 1) { // there is still at least one cell left for the next move
            setTimeout(this.playRandomly.bind(this), this.waitTime);            
        } else {
            this.playerColors[0] = "white";
            this.playerColors[1] = "white";
            this.occupiedCells = [{}, {}];
            setTimeout(this.eraseBoard.bind(this), this.waitTime);
        }           
    }


    // Greedy board erasing
    eraseBoard() {
                
        // List all available cells
        let availableCells = [];
        this.svg.selectAll(".grid-cell").each((d, i, nodes) => {
            let cell = d3.select(nodes[i]);
            let x = parseFloat(cell.attr("x"));
            let y = parseFloat(cell.attr("y"));
            if (!this.occupiedCells[0][`${x}-${y}`] && !this.occupiedCells[1][`${x}-${y}`]) {
                let neighbors = this.canPlaceRectangle(x, y, this.currentPlayer);
                availableCells.push({x: x, y: y, neighbors: neighbors});
            }
        });

        // Sort cells by the number of neighbors (in descending order)
        availableCells.sort((a, b) => b.neighbors.length - a.neighbors.length);

        // Filter the cells that have the most neighbors
        let maxNeighbors = availableCells[0].neighbors.length;
        let bestCells = availableCells.filter(cell => cell.neighbors.length === maxNeighbors);

        // Randomly pick a cell among the best cells
        let chosenCell = bestCells[Math.floor(Math.random() * bestCells.length)];

        // Simulate a click on the selected cell
        let neighbors = this.canPlaceRectangle(chosenCell.x, chosenCell.y, this.currentPlayer);
        if (neighbors.length > 0) {
            this.drawRectangle(chosenCell.x, chosenCell.y, neighbors, this.currentPlayer + 1);
            this.occupiedCells[this.currentPlayer][`${chosenCell.x}-${chosenCell.y}`] = true;
        } else {
            this.drawRectangle(chosenCell.x, chosenCell.y, [], this.currentPlayer + 1);
            this.occupiedCells[this.currentPlayer][`${chosenCell.x}-${chosenCell.y}`] = true;
        }
        
        // If the game is still in progress, schedule the next move
        if (availableCells.length > 1) {
            if (availableCells.length > (this.gridSize / this.cellSize)**2 - 1) {
                setTimeout(this.eraseBoard.bind(this), this.waitTime/3);
            } else {
                setTimeout(this.eraseBoard.bind(this), this.waitTime);
            }
        } else {
            shuffle(this.colorPalette);
            this.playerColors[0] = this.colorPalette[0];
            this.playerColors[1] = this.colorPalette[1];
            this.occupiedCells = [{}, {}];
            this.currentPlayer = (this.currentPlayer + 1) % 2;
            setTimeout(this.playRandomly.bind(this), 2*this.waitTime);
        }           
    }  

} 
