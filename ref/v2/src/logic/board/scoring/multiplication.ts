/**
 * src/logic/board/scoring/multiplication.ts
 * 
 * Cell-Multiplication Scoring Mechanism (pure function)
 */

import { BoardState, PlayerIndex } from "../../../types";
import { getConnectedComponents } from "../GameBoardLogic";

/**
 * Calculate the score for Cell-Multiplication scoring mechanism.
 * Score is the product of the sizes of each connected component.
 * 
 * @param boardState The current state of the board.
 * @param playerIndex The index of the player (0 or 1).
 * @returns The calculated score.
 */
export function getMultiplicationScore(boardState: BoardState, playerIndex: PlayerIndex): number {
    const components = getConnectedComponents(boardState, playerIndex);
    
    // If no components, score is 0
    if (components.length === 0) return 0;
    
    // Calculate product of component sizes (ensure non-empty product starts at 1)
    return components.reduce((product, component) => product * component.length, 1);
} 