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
    // Check if we're on mobile by checking if the dropdown is visible
    const isMobile = window.getComputedStyle(document.querySelector('.dropdown')).display !== 'none';
    
    if (isMobile) {
        // Mobile: get value from dropdown
        return document.getElementById("player-mode").value;
    } else {
        // Desktop: get value from radio buttons
        const radioButton = document.querySelector('input[name="player-mode-radio"]:checked');
        return radioButton ? radioButton.value : 'ai'; // Default to 'ai' if nothing is checked
    }
}
