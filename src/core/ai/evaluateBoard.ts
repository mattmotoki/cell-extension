/**
 * src/core/ai/evaluateBoard.ts - Board Position Evaluation for AI
 * 
 * Implements the heuristic evaluation function used by the AI to assess board positions.
 * This is a critical component for the minimax algorithm and AI decision making.
 * 
 * The evaluation function computes a score for a given board state from the perspective
 * of a specified player. Higher scores indicate better positions for that player.
 * The evaluation adapts to different scoring mechanisms:
 * - Cell Multiplication: Favors fewer, larger connected components
 * - Cell Connection: Values densely connected cell formations
 * - Cell Extension: Prioritizes board control and expansion potential
 * 
 * Relationships:
 * - Called by the minimax function in aiLogic.ts
 * - Uses GameBoardLogic.ts functions to analyze board state
 * - Adapts evaluation based on the active scoring mechanism
 * - Returns a numeric score used to rank potential moves
 * 
 * Key Components:
 * - Basic score difference calculation between player and opponent
 * - Scoring mechanism-specific heuristics
 * - Late game evaluation adjustment
 * - Error handling to prevent AI calculation failures
 * 
 * Revision Log:
 *  
 * Note: This revision log should be updated whenever this file is modified. 
 * Do not use dates in the revision log.
 */

import { BoardState, PlayerIndex, ScoringMechanismId } from "../types";
import {
    calculateScore,
    getConnectedComponents,
    getAvailableCells,
    getAdjacentPlayerCells,
    getTotalCellCount,
    parsePositionKey,
    createPositionKey
} from "../game/GameBoardLogic";

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
    try {
        const opponentIndex = (playerIndex + 1) % 2 as PlayerIndex;
        
        // Calculate scores for both players
        let playerScore = 0;
        let opponentScore = 0;
        
        try {
            playerScore = calculateScore(boardState, playerIndex, scoringMechanism);
            opponentScore = calculateScore(boardState, opponentIndex, scoringMechanism);
        } catch (scoreError) {
            console.error("Error calculating scores in evaluateBoard:", scoreError);
            return 0; // Return neutral evaluation on error
        }
        
        // Basic score difference evaluation
        let evaluation = playerScore - opponentScore;
        
        try {
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
                    let playerConnectionCount = 0;
                    for (const component of playerComponents) {
                        for (const cellKey of component) {
                            const [x, y] = parsePositionKey(cellKey);
                            const neighbors = getAdjacentPlayerCells(boardState, playerIndex, x, y);
                            playerConnectionCount += neighbors.filter(neighbor => 
                                component.includes(createPositionKey(neighbor.gridX, neighbor.gridY))
                            ).length;
                        }
                    }
                    playerConnectionCount /= 2; // Each connection counted twice
                    
                    let opponentConnectionCount = 0;
                     for (const component of opponentComponents) {
                        for (const cellKey of component) {
                            const [x, y] = parsePositionKey(cellKey);
                             const neighbors = getAdjacentPlayerCells(boardState, opponentIndex, x, y);
                            opponentConnectionCount += neighbors.filter(neighbor => 
                                component.includes(createPositionKey(neighbor.gridX, neighbor.gridY))
                            ).length;
                        }
                    }
                    opponentConnectionCount /= 2;
                    
                    evaluation += (playerConnectionCount - opponentConnectionCount) * 0.4;
                    break;
                    
                case 'cell-extension':
                    // Look at board control and potential expansions
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
                         // Slightly penalize placing next to opponent cells
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
        } catch (heuristicError) {
            console.error("Error in heuristic calculation in evaluateBoard:", heuristicError);
            // Return basic score difference if heuristics fail
            return evaluation;
        }
    } catch (error) {
        console.error("Fatal error in evaluateBoard:", error);
        return 0; // Return neutral evaluation on fatal error
    }
} 