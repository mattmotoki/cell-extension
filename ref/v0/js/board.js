
export class Board {

    constructor(gridSize, cellSize, playerColors, clickHandler) {

        this.gridSize = gridSize;
        this.cellSize = cellSize;
        this.playerColors = playerColors;
        this.lineColors = ["#D8BFD8", "#D8BFD8"];  // #7851A9
        // this.lineColors = this.playerColors.map(color => d3.rgb(color).darker(2));
        this.clickHandler = clickHandler;
        this.occupiedCells = [{}, {}];
        this.svg = d3.select("#board")
            .attr("width", this.gridSize)
            .attr("height", this.gridSize);
        this.gridGroup = this.svg.append("g");
        this.cellsGroup = this.svg.append("g");
        this.linesGroup = this.svg.append("g").style("display", "none");

        // initialize board
        for (let x = 0; x < this.gridSize; x += this.cellSize) {
            for (let y = 0; y < this.gridSize; y += this.cellSize) {
                this.gridGroup.append("rect")
                    .attr("class", "grid-cell")
                    .attr("x", x)
                    .attr("y", y)
                    .attr("width", this.cellSize)
                    .attr("height", this.cellSize)
                    .on("click", this.clickHandler);
            }
        }
    }

    // game functions
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
                this.extendRectangle(neighbor[0], y, neighbor[0], y, this.cellSize * 2, this.cellSize, player);
            } else if (x < neighbor[0]) {  // left
                this.extendRectangle(neighbor[0], y, x, y, this.cellSize * 2, this.cellSize, player);
            } else if (y > neighbor[1]) {  // down
                this.extendRectangle(x, neighbor[1], x, neighbor[1], this.cellSize, this.cellSize * 2, player);
            } else if (y < neighbor[1]) {  // up
                this.extendRectangle(x, neighbor[1], x, y, this.cellSize, this.cellSize * 2, player);
            }    
            n_extensions++;
        }

        // If there are no neighbors, draw a new rectangle
        if (neighbors.length === 0) {
            this.extendRectangle(x, y, x, y, this.cellSize, this.cellSize, player);
        }

        return n_extensions;
    }

    // Helper function to draw or extend a rectangle
    extendRectangle(x_start, y_start, x_end, y_end, width, height, player) {
        let rect = this.cellsGroup.append("rect")
            .attr("class", `rectangle${player}`)
            .attr("x", x_start)
            .attr("y", y_start)
            .attr("width", width === 2*this.cellSize ? this.cellSize : width)
            .attr("height", height === 2*this.cellSize ? this.cellSize : height)
            .attr("fill", this.playerColors[player - 1])
            .attr("rx", this.cellSize/5)
            .attr("ry", this.cellSize/5);

        rect.transition()
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
                        .attr("stroke-width", 1);
                    this.linesGroup.append("circle")
                        .attr("cx", x_end + this.cellSize / 2)
                        .attr("cy", y_mid)
                        .attr("r", 2)
                        .attr("fill", this.lineColors[player - 1]);
                    this.linesGroup.append("circle")
                        .attr("cx", x_end + 3*this.cellSize / 2)
                        .attr("cy", y_mid)
                        .attr("r", 2)
                        .attr("fill", this.lineColors[player - 1]);
                } else if (height === 2*this.cellSize) {  // vertical extension
                    let x_mid = x_start + this.cellSize / 2;
                    this.linesGroup.append("line")
                        .attr("x1", x_mid)
                        .attr("y1", y_end + this.cellSize / 2)
                        .attr("x2", x_mid)
                        .attr("y2", y_end + 3*this.cellSize / 2)
                        .attr("stroke", this.lineColors[player - 1])
                        .attr("stroke-width", 1);
                    this.linesGroup.append("circle")
                        .attr("cx", x_mid)
                        .attr("cy", y_end + this.cellSize / 2)
                        .attr("r", 2)
                        .attr("fill", this.lineColors[player - 1]);
                    this.linesGroup.append("circle")
                        .attr("cx", x_mid)
                        .attr("cy", y_end + 3*this.cellSize / 2)
                        .attr("r", 2)
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