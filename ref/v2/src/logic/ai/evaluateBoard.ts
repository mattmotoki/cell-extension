/**
 * src/logic/ai/evaluateBoard.ts
 * 
 * Heuristic board evaluation function for AI.
 */

import { BoardState, PlayerIndex, ScoringMechanismId } from "../../types";
import {
    calculateScore,
    getConnectedComponents,
    getAvailableCells,
    getAdjacentPlayerCells,
    getTotalCellCount,
    parsePositionKey,
    createPositionKey
} from "../board/GameBoardLogic";

/**
 * Evaluates a board state from the perspective of the specified player.
 * Returns a higher score for states that are better for the player.
 * 
 * @param boardState The board state to evaluate.
 * @param playerIndex The player to evaluate for (0 or 1).
 * @param scoringMechanism Which scoring mechanism to use.
 * @returns The evaluation score (higher is better for the specified player).
 */
export function evaluateBoard(
    boardState: BoardState, 
    playerIndex: PlayerIndex, 
    scoringMechanism: ScoringMechanismId
): number {
    const opponentIndex = (playerIndex + 1) % 2 as PlayerIndex;
    
    const playerScore = calculateScore(boardState, playerIndex, scoringMechanism);
    const opponentScore = calculateScore(boardState, opponentIndex, scoringMechanism);
    
    // Basic score difference evaluation
    let evaluation = playerScore - opponentScore;
    
    // Get components once for efficiency
    const playerComponents = getConnectedComponents(boardState, playerIndex);
    const opponentComponents = getConnectedComponents(boardState, opponentIndex);

    // Additional positional heuristics based on scoring mechanism
    switch(scoringMechanism) {
        case 'cell-multiplication':
            // Bonus for having fewer but larger components
            if (playerComponents.length > 0) {
                const avgPlayerComponentSize = playerComponents.reduce((sum, comp) => sum + comp.length, 0) / playerComponents.length;
                evaluation += avgPlayerComponentSize * 0.5; 
            }
            // Penalty for opponent having large components
            if (opponentComponents.length > 0) {
                const largestOpponentComponent = Math.max(...opponentComponents.map(comp => comp.length));
                evaluation -= largestOpponentComponent * 0.3; 
            }
            break;
            
        case 'cell-connection':
            // Count total connections for each player
            // Note: Original implementation double-counted connections. Let's fix that by dividing by 2.
            let playerConnectionCount = 0;
            for (const component of playerComponents) {
                for (const cellKey of component) {
                    const [x, y] = parsePositionKey(cellKey);
                    // Connections are to other cells *within the same component*
                    const neighbors = getAdjacentPlayerCells(boardState, playerIndex, x, y);
                    playerConnectionCount += neighbors.filter(neighbor => 
                        component.includes(createPositionKey(neighbor.gridX, neighbor.gridY)) // Check if neighbor is in the same component
                    ).length;
                }
            }
            playerConnectionCount /= 2; // Each connection counted twice (once for each cell)
            
            let opponentConnectionCount = 0;
             for (const component of opponentComponents) {
                for (const cellKey of component) {
                    const [x, y] = parsePositionKey(cellKey);
                     const neighbors = getAdjacentPlayerCells(boardState, opponentIndex, x, y);
                    opponentConnectionCount += neighbors.filter(neighbor => 
                        component.includes(createPositionKey(neighbor.gridX, neighbor.gridY)) // Check if neighbor is in the same component
                    ).length;
                }
            }
            opponentConnectionCount /= 2;
            
            evaluation += (playerConnectionCount - opponentConnectionCount) * 0.4; // Increased weight slightly
            break;
            
        case 'cell-extension':
            // For extension scoring, look at board control and potential expansions
            const availableCells = getAvailableCells(boardState);
            let playerExpansionPotential = 0;
            let opponentExpansionPotential = 0;
            
            for (const cell of availableCells) {
                const { gridX, gridY } = cell;
                const playerAdjacentCount = getAdjacentPlayerCells(boardState, playerIndex, gridX, gridY).length;
                const opponentAdjacentCount = getAdjacentPlayerCells(boardState, opponentIndex, gridX, gridY).length;
                
                // Prioritize placing next to own cells
                if (playerAdjacentCount > 0) {
                    playerExpansionPotential += playerAdjacentCount;
                }
                 // Slightly penalize placing next to opponent cells (less important than own)
                if (opponentAdjacentCount > 0) {
                    opponentExpansionPotential += opponentAdjacentCount * 0.5; 
                }
            }
            
            evaluation += (playerExpansionPotential - opponentExpansionPotential) * 0.25;
            break;
    }
    
    // Consider remaining moves
    const remainingMoves = getAvailableCells(boardState).length;
    const totalCells = getTotalCellCount(boardState);
    const gameProgress = 1 - (remainingMoves / totalCells);
    
    // Late game: emphasize current score difference more
    if (gameProgress > 0.7) {
        evaluation *= (1 + (gameProgress - 0.7) * 2); // Scale bonus based on how far into late game
    }
    
    return evaluation;
} 