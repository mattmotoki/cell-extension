// class ConnectedComponents {
//     constructor() {
//         this.components = [];
//     }

//     addCell(component) {
//         this.components.push(component);
//     }

//     getComponent(x, y) {
//         for (let i = 0; i < this.components.length; i++) {
//             if (this.components[i].hasCell(x, y)) {
//                 return this.components[i];
//             }
//         }
//         return null;
//     }

//     getComponents() {
//         return this.components;
//     }

//     reset() {
//         this.components = [];
//     }

// }


export class Player {
    constructor() {
        this.score = 0;
        this.move_history = [];
        this.score_history = [];
        this.connectedComponents = [];
    }

    getScore() {
        return this.score;
    }

    incrementScore(amount) {
        this.score += amount;
    }

    addMove(move) {
        this.move_history.push(move);

        // udpate connected components
    }

    reset() {
        this.score = 0;
        this.move_history = [];
        this.score_history = [];
    }
}


export class AIPlayer extends Player {

    constructor() {
        super();
    }

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

        // Sort cells by score (in descending order)
        availableCells.sort((a, b) => b.score - a.score);

        // Get the maximum score
        let maxScore = availableCells[0].score;

        // Filter the available cells to only include those with the maximum score
        let maxScoreCells = availableCells.filter(cell => cell.score === maxScore);

        // Select a random cell from those with the maximum score
        let move = maxScoreCells[Math.floor(Math.random() * maxScoreCells.length)];

        return move
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

        // console.log({"edgeness":edgeness, "centrality":centrality, "openness":openness, "nOpponents":nOpponents, "nNeighbors":nNeighbors});
        let score = -0*edgeness + 0*centrality + openness + nOpponents + nNeighbors;

        return score;
    }

}

export class HumanPlayer extends Player {

    constructor() {
        super();
    }


}