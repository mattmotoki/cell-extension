/**
 * eval.js - AI Board Evaluation Functions
 * 
 * This file contains utility functions for evaluating board states
 * to help the AI player determine the best move.
 */

/**
 * Evaluates a board state from the perspective of the specified player.
 * Returns a higher score for states that are better for the player.
 * 
 * @param {GameBoardLogic} boardLogic - The board state to evaluate
 * @param {number} playerIndex - The player to evaluate for (0 or 1)
 * @param {string} scoringMechanism - Which scoring mechanism to use
 * @return {number} - The evaluation score (higher is better for the specified player)
 */
export function evaluateBoard(boardLogic, playerIndex, scoringMechanism) {
    const opponentIndex = (playerIndex + 1) % 2;
    
    // Get scores using the appropriate scoring mechanism
    const playerScore = boardLogic.calculateScore(playerIndex, scoringMechanism);
    const opponentScore = boardLogic.calculateScore(opponentIndex, scoringMechanism);
    
    // Basic score difference evaluation
    let evaluation = playerScore - opponentScore;
    
    // Additional positional heuristics based on scoring mechanism
    switch(scoringMechanism) {
        case 'cell-multiplication':
            // For multiplication scoring, evaluate potential for growth
            const playerComponents = boardLogic.getConnectedComponents(playerIndex);
            const opponentComponents = boardLogic.getConnectedComponents(opponentIndex);
            
            // Bonus for having fewer but larger components
            if (playerComponents.length > 0) {
                const avgPlayerComponentSize = playerComponents.reduce((sum, comp) => sum + comp.length, 0) / playerComponents.length;
                evaluation += avgPlayerComponentSize * 0.5; // Slight bonus for larger avg components
            }
            
            // Penalty for opponent having large components
            if (opponentComponents.length > 0) {
                const largestOpponentComponent = Math.max(...opponentComponents.map(comp => comp.length));
                evaluation -= largestOpponentComponent * 0.3; // Penalty based on opponent's largest component
            }
            break;
            
        case 'cell-connection':
            // For connection scoring, focus on connection count
            let playerConnectionCount = 0;
            let opponentConnectionCount = 0;
            
            // Count total connections for each player
            for (const component of boardLogic.getConnectedComponents(playerIndex)) {
                for (const cellKey of component) {
                    const [x, y] = cellKey.split('-').map(Number);
                    playerConnectionCount += boardLogic.countConnections(x, y, playerIndex);
                }
            }
            
            for (const component of boardLogic.getConnectedComponents(opponentIndex)) {
                for (const cellKey of component) {
                    const [x, y] = cellKey.split('-').map(Number);
                    opponentConnectionCount += boardLogic.countConnections(x, y, opponentIndex);
                }
            }
            
            // Adjust evaluation based on connection count difference
            evaluation += (playerConnectionCount - opponentConnectionCount) * 0.2;
            break;
            
        case 'cell-extension':
            // For extension scoring, look at board control and potential expansions
            const availableCells = boardLogic.getAvailableCells();
            let playerExpansionPotential = 0;
            let opponentExpansionPotential = 0;
            
            // Check expansion potential by counting possible adjacent placements
            for (const cell of availableCells) {
                const { gridX, gridY } = cell;
                const playerAdjacentCount = boardLogic.getAdjacentPlayerCells(gridX, gridY, playerIndex).length;
                const opponentAdjacentCount = boardLogic.getAdjacentPlayerCells(gridX, gridY, opponentIndex).length;
                
                if (playerAdjacentCount > 0) {
                    playerExpansionPotential += playerAdjacentCount;
                }
                if (opponentAdjacentCount > 0) {
                    opponentExpansionPotential += opponentAdjacentCount;
                }
            }
            
            // Adjust evaluation based on expansion potential difference
            evaluation += (playerExpansionPotential - opponentExpansionPotential) * 0.25;
            break;
    }
    
    // Consider remaining moves - if few moves remain, prioritize immediate score gain
    const remainingMoves = boardLogic.getAvailableCells().length;
    const totalCells = boardLogic.getTotalCellCount();
    const gameProgress = 1 - (remainingMoves / totalCells);
    
    // Late game: emphasize current score difference more
    if (gameProgress > 0.7) {
        evaluation *= (1 + gameProgress * 0.5); // Increase importance of score difference
    }
    
    return evaluation;
} 