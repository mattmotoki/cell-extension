
export class AIPlayer {

    constructor() {}

    // any methods specific to Player go here
    getMove(currentPlayer, board) {

        // Do not continue if it's not Player 2's turn
        if (currentPlayer !== 1) {return;}

        // List all available cells
        let availableCells = [];
        board.svg.selectAll(".grid-cell").each((d, i, nodes) => {
            let cell = d3.select(nodes[i]);
            let x = parseFloat(cell.attr("x"));
            let y = parseFloat(cell.attr("y"));
            if (!board.occupiedCells[0][`${x}-${y}`] && !board.occupiedCells[1][`${x}-${y}`]) {
                let score = this.calculateScore(x, y, currentPlayer, board);
                availableCells.push({x: x, y: y, score:score});
            }
        });

        if (availableCells.length === 0) {return;}

        // Sort cells by open space (in descending order)
        availableCells.sort((a, b) => b.score - a.score);

        // Return the cell with the most open space
        return availableCells[0];
    }

    calculateScore(x, y, currentPlayer, board) {
        
        let openness = 0;
        for (let dx = -board.cellSize; dx <= board.cellSize; dx += board.cellSize) {
            for (let dy = -board.cellSize; dy <= board.cellSize; dy += board.cellSize) {
                let nx = x + dx;
                let ny = y + dy;
                if (nx >= 0 && nx < board.gridSize && ny >= 0 && ny < board.gridSize) {
                    if (!board.occupiedCells[0][`${nx}-${ny}`] && !board.occupiedCells[1][`${nx}-${ny}`]) {
                        openness++;
                    }
                }
            }
        }        

        let edges = new Set([0, board.gridSize - board.cellSize]);
        let edgeness = edges.has(x) || edges.has(y);

        let centrality = -Math.sqrt(Math.pow(x - board.gridSize/2, 2) + Math.pow(y - board.gridSize/2, 2));
        let nOpponents = board.canPlaceRectangle(x, y, (currentPlayer + 1) % 2).length;
        let nNeighbors = board.canPlaceRectangle(x, y, currentPlayer).length;
        let score = -0*edgeness + 0*centrality + openness + nOpponents + nNeighbors;

        return score;
    }

    reset() {

    }
}

