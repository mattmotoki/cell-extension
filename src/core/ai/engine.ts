/**
 * src/core/ai/engine.ts - AI Engine Logic
 * 
 * Implements the core AI decision-making logic, including strategies
 * (territorial, greedy, minimax) and board evaluation.
 */

import { 
    BoardState, 
    Coordinates, 
    GameState, 
    GameSettings, 
    PlayerIndex, 
    ScoringMechanism, 
    AIDifficulty
} from '../types';
import { 
    getAvailableCells, 
    getTotalCellCount, 
    placeCell, 
    calculateScore,
    getAdjacentPositions, // Now from game/utils
    isValidCoordinate,
    isCellOccupiedByPlayer,
    isCellOccupied,
    createPositionKey,
    getConnectedComponents, // Needed for evaluateBoard
    getAdjacentPlayerCells, // Needed for evaluateBoard
    parsePositionKey      // Needed for evaluateBoard
} from '../game/utils'; // Updated path

// ====================================
// Board Evaluation Function
// ====================================

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
    scoringMechanism: ScoringMechanism
): number {
    try {
        const opponentIndex = (playerIndex + 1) % 2 as PlayerIndex;
        
        // Calculate scores for both players
        let playerScore = 0;
        let opponentScore = 0;
        
        try {
            // Use calculateScore from game/utils
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
                    const availableCellsEval = getAvailableCells(boardState);
                    let playerExpansionPotential = 0;
                    let opponentExpansionPotential = 0;
                    
                    for (const cell of availableCellsEval) {
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
                default:
                    // Handle cases where scoringMechanism might not match the expected enum values
                    // Or perform exhaustive check if needed
                    // const exhaustiveCheck: never = scoringMechanism;
                    break;
            }
            
            // Consider remaining moves
            const remainingMoves = getAvailableCells(boardState).length;
            const totalCells = getTotalCellCount(boardState);
            const gameProgressEval = (totalCells > 0) ? 1 - (remainingMoves / totalCells) : 0;
            
            // Late game: emphasize current score difference more
            if (gameProgressEval > 0.7) {
                evaluation *= (1 + (gameProgressEval - 0.7) * 2); // Scale bonus based on how far into late game
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

// ====================================
// AI Move Calculation Logic
// ====================================

/**
 * Calculates the AI's next move based on the game state and settings.
 * @param gameState The current game state.
 * @param settings The current game settings (especially aiDifficulty).
 * @returns The coordinates of the chosen move, or null if no move is possible.
 */
export function getAIMove(gameState: GameState, settings: GameSettings): Coordinates | null {
    const aiPlayerIndex: PlayerIndex = 1; // Assuming AI is always player 1 (index 1)
    const { boardState, scoringMechanism, history } = gameState;
    const { aiDifficulty } = settings;
    
    console.log(`AI START: Player ${aiPlayerIndex + 1}, Difficulty ${aiDifficulty}, ScoringMech: ${scoringMechanism}`);
    
    try {
        const availableCells = getAvailableCells(boardState);
        
        // Simple move count based on history (excluding initial state)
        const moveCount = history ? history.length -1 : 0; 
        const totalCells = getTotalCellCount(boardState);
        const gameProgress = (totalCells > 0) ? moveCount / totalCells : 0;

        console.log(`AI calculating move #${moveCount + 1}. Game progress: ${(gameProgress * 100).toFixed(1)}%. Available cells: ${availableCells.length}`);

        if (availableCells.length === 0) {
            console.warn("AI: No available cells found. Game should be over.");
            return null; // No possible moves
        }

        // Safety check - do a deep validation of available cells
        const validatedCells = availableCells.filter(cell => {
            if (cell.gridX === undefined || cell.gridY === undefined ||
                isNaN(cell.gridX) || isNaN(cell.gridY)) {
                console.error(`AI: Invalid cell coordinates: ${JSON.stringify(cell)}`);
                return false;
            }
            
            if (isCellOccupied(boardState.occupiedCells, cell.gridX, cell.gridY)) {
                console.error(`AI: Cell already occupied: ${JSON.stringify(cell)}`);
                return false;
            }
            
            return true;
        });
        
        if (validatedCells.length === 0) {
            console.error("AI: All available cells failed validation! Returning null.");
            return null;
        }
        
        let bestMove: Coordinates | null = null;

        try {
            if (aiDifficulty === 'easy') {
                console.log("AI: Using easy difficulty strategy");
                if (gameProgress < 0.25) {
                    bestMove = getTerritorialMove(boardState, validatedCells, aiPlayerIndex);
                } else {
                    bestMove = getGreedyMove(boardState, validatedCells, aiPlayerIndex, scoringMechanism);
                }
            } else { // Hard AI
                console.log("AI: Using hard difficulty (minimax) strategy");
                bestMove = getMinimaxMove(boardState, validatedCells, aiPlayerIndex, scoringMechanism);
            }
            
            if (!bestMove) {
                throw new Error("AI strategy returned null despite available cells");
            }
        } catch (error) {
            console.error("AI calculation error:", error);
            // Continue to fallback
        }

        // Fallback to random move if strategy fails or returns null
        if (!bestMove) {
            console.warn(`AI (${aiDifficulty}) strategy failed, errored, or returned null. Falling back to random move.`);
            const randomIndex = Math.floor(Math.random() * validatedCells.length);
            bestMove = validatedCells[randomIndex];
            console.log(`AI random fallback move: (${bestMove.gridX}, ${bestMove.gridY})`);
        }

        // Final validation of selected move
        if (!bestMove || bestMove.gridX === undefined || bestMove.gridY === undefined || 
            isNaN(bestMove.gridX) || isNaN(bestMove.gridY)) {
            console.error(`AI final move is invalid: ${JSON.stringify(bestMove)}. Generating emergency random move.`);
            
            // Emergency fallback
            if (validatedCells.length > 0) {
                // Pick the first validated cell as an emergency measure
                bestMove = validatedCells[0]; 
            } else {
                console.error("AI: Critical failure - no valid cells available despite earlier checks");
                return null;
            }
        }

        console.log(`AI COMPLETE: Selected move at (${bestMove.gridX}, ${bestMove.gridY})`);
        return bestMove;
    } catch (outerError) {
        console.error("Fatal error in top-level AI logic:", outerError);
        return null;
    }
}

// --- Easy AI Strategies ---

function getTerritorialMove(boardState: BoardState, availableCells: Coordinates[], aiPlayerIndex: PlayerIndex): Coordinates | null {
    let bestMove: Coordinates | null = null;
    let maxValue = -Infinity;
    const opponentID = (aiPlayerIndex + 1) % 2 as PlayerIndex;
    const { gridWidth, gridHeight, occupiedCells } = boardState;

    if (availableCells.length === 0) return null;

    for (const cell of availableCells) {
        const adjacentPositionsCoords = getAdjacentPositions(cell.gridX, cell.gridY, gridWidth, gridHeight);
        
        // Add diagonal positions
        const diagonalPositions: [number, number][] = [
            [cell.gridX - 1, cell.gridY - 1], [cell.gridX + 1, cell.gridY - 1],
            [cell.gridX - 1, cell.gridY + 1], [cell.gridX + 1, cell.gridY + 1]
        ].filter(([x, y]) => isValidCoordinate(x, y, gridWidth, gridHeight)) as [number, number][];
        
        const allAdjacentPositions = [
            ...adjacentPositionsCoords.map(c => [c.gridX, c.gridY]),
            ...diagonalPositions
        ];
        
        let value = Math.random() * 0.1; // Small random factor for tie-breaking
        for (const [adjX, adjY] of allAdjacentPositions) {
            if (isCellOccupiedByPlayer(occupiedCells, opponentID, adjX, adjY)) {
                value -= 1; // Penalize being near opponent
            } else if (isCellOccupiedByPlayer(occupiedCells, aiPlayerIndex, adjX, adjY)) {
                value -= 2; // Strongly penalize being near self (less territorial expansion)
            } else { // Empty cell
                value += 3; // Reward open space
            }
        }

        if (value > maxValue) {
            maxValue = value;
            bestMove = cell;
        } 
    }
    
    return bestMove; // Will return the best found or null if loop didn't run
}

function getGreedyMove(
    boardState: BoardState, 
    availableCells: Coordinates[], 
    aiPlayerIndex: PlayerIndex, 
    scoringMechanism: ScoringMechanism
): Coordinates | null {
    let bestMove: Coordinates | null = null;
    let bestScoreIncrease = -Infinity;

    if (availableCells.length === 0) return null;

    const currentScore = calculateScore(boardState, aiPlayerIndex, scoringMechanism);

    for (const cell of availableCells) {
        const nextBoardState = placeCell(boardState, aiPlayerIndex, cell.gridX, cell.gridY);
        if (nextBoardState) {
            const newScore = calculateScore(nextBoardState, aiPlayerIndex, scoringMechanism);
            const scoreIncrease = newScore - currentScore;

            if (scoreIncrease > bestScoreIncrease) {
                bestScoreIncrease = scoreIncrease;
                bestMove = cell;
            } else if (scoreIncrease === bestScoreIncrease && Math.random() < 0.5) {
                // Randomly break ties to avoid predictable patterns
                bestMove = cell; 
            }
        } else {
             console.warn(` AI (Easy) greedy simulation failed for move (${cell.gridX}, ${cell.gridY})`);
        }
    }

    return bestMove;
}

// --- Hard AI Strategy (Minimax) ---

const MINIMAX_DEPTH = 2; // Default depth - could be configured via settings later

function getMinimaxMove(
    boardState: BoardState, 
    availableCells: Coordinates[], 
    aiPlayerIndex: PlayerIndex, 
    scoringMechanism: ScoringMechanism
): Coordinates | null {
    let bestScore = -Infinity;
    let bestMove: Coordinates | null = null;
    
    if (availableCells.length === 0) return null;

    for (let cell of availableCells) {
        const nextBoardState = placeCell(boardState, aiPlayerIndex, cell.gridX, cell.gridY);
        if (nextBoardState) {
            // Opponent's turn (minimizing player)
            let score = minimax(nextBoardState, MINIMAX_DEPTH, false, -Infinity, Infinity, aiPlayerIndex, scoringMechanism);
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = cell;
            } else if (score === bestScore && Math.random() < 0.5) {
                 // Randomly break ties
                 bestMove = cell; 
            }
        } else {
             console.warn(` AI (Hard) minimax simulation failed for move (${cell.gridX}, ${cell.gridY})`);
        }
    }

    return bestMove;
}

// Minimax with Alpha-Beta Pruning
function minimax(
    boardState: BoardState, 
    depth: number, 
    isMaximizingPlayer: boolean, 
    alpha: number, 
    beta: number, 
    aiPlayerIndex: PlayerIndex, // Pass the original AI player index for evaluation perspective
    scoringMechanism: ScoringMechanism
): number {
    
    const availableCells = getAvailableCells(boardState);
    if (depth === 0 || availableCells.length === 0) { // Terminal state or depth limit
        return evaluateBoard(boardState, aiPlayerIndex, scoringMechanism); // Evaluate from AI's perspective
    }

    const currentPlayer = isMaximizingPlayer ? aiPlayerIndex : ((aiPlayerIndex + 1) % 2 as PlayerIndex);

    if (isMaximizingPlayer) {
        let maxEval = -Infinity;
        for (let cell of availableCells) {
             const childBoardState = placeCell(boardState, currentPlayer, cell.gridX, cell.gridY);
             if (childBoardState) {
                let evaluation = minimax(childBoardState, depth - 1, false, alpha, beta, aiPlayerIndex, scoringMechanism);
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) {
                    break; // Beta cutoff
                }
             } 
             // If placeCell returns null, skip this move (shouldn't happen with validatedCells)
        }
        return maxEval;
    } else { // Minimizing player (opponent)
        let minEval = Infinity;
        for (let cell of availableCells) {
             const childBoardState = placeCell(boardState, currentPlayer, cell.gridX, cell.gridY);
             if (childBoardState) {
                 let evaluation = minimax(childBoardState, depth - 1, true, alpha, beta, aiPlayerIndex, scoringMechanism);
                 minEval = Math.min(minEval, evaluation);
                 beta = Math.min(beta, evaluation);
                 if (beta <= alpha) {
                     break; // Alpha cutoff
                 }
             }
             // If placeCell returns null, skip this move
        }
        return minEval;
    }
} 