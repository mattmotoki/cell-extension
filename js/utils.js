// shuffle list
export function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    // While there remain elements to shuffle
    while (0 !== currentIndex) {

        // Pick a remaining element
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}


// Display a message based on the scores
export function displayWinnerMessage(scores) {
    if (scores[0] > scores[1]) {
        alert("Game Over! Player 1 wins. Congratulations!");
    } else if (scores[0] < scores[1]) {
        if (getPlayerMode() == "ai") {
            alert("Game Over! Sorry the AI won.");
        } else {
            alert("Game Over! Player 2 wins. Congratulations!");
        }
    } else {
        alert("Game Over! It's a tie.");
    }            
}

// Get player mode: "ai" or "user"
export function getPlayerMode() {
    // Get value directly from the dropdown
    const playerModeDropdown = document.getElementById("player-mode");
    return playerModeDropdown ? playerModeDropdown.value : 'ai'; // Default to 'ai' if not found
}

// Get the current scoring mechanism
export function getScoringMechanism() {
    const scoringSelect = document.getElementById("scoring-mechanism");
    return scoringSelect ? scoringSelect.value : 'cell-connection'; // Default to cell-connection
}

// Get description for a scoring mechanism
export function getScoringDescription(mechanism) {
    const descriptions = {
        'cell-connection': 'The total number of edges (connections)',
        'cell-multiplication': 'Product of the size (number of cells) of the connected components',
        'cell-maximization': 'The size of the largest connected component',
        'cell-extension': 'The largest diameter of the graph',
        'cell-division': 'Cells can connect in any direction to grow across the board',
        'cell-minimization': 'Minimize the score of a random opponent'
    };
    
    return descriptions[mechanism] || 'Unknown scoring mechanism';
}
