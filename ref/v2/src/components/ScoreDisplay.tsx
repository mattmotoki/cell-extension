import React, { useEffect, useRef } from 'react';
import { PlayerIndex, BoardState, ScoringMechanismId } from '../types';
import { calculateScore, getConnectedComponents, parsePositionKey, createPositionKey } from '../logic/board/GameBoardLogic';
import * as d3 from 'd3';

// Props required by ScoreDisplay
interface ScoreDisplayProps {
  scores: [number, number];
  currentPlayer: PlayerIndex;
  scoringMechanism: ScoringMechanismId;
  boardState: BoardState; // Needed to calculate component breakdown
  scoringDescription: string;
  playerColors: string[]; // To color player scores
}

const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  scores,
  currentPlayer,
  scoringMechanism,
  boardState,
  scoringDescription,
  playerColors
}) => {
  const scoresRef = useRef<HTMLDivElement>(null);
  const breakdownRef = useRef<HTMLDivElement>(null);

  // Get component calculations
  useEffect(() => {
    updateScoreDisplay();
  }, [scores, currentPlayer, boardState, scoringMechanism]);

  // Helper function to get adjacent positions for a cell
  const getAdjacentPositions = (gridX: number, gridY: number): [number, number][] => {
    return [
      [gridX + 1, gridY], // right
      [gridX - 1, gridY], // left
      [gridX, gridY + 1], // down
      [gridX, gridY - 1]  // up
    ];
  };

  // Calculate the appropriate "size" measure for a component based on the scoring mechanism
  const calculateComponentSize = (component: string[], scoringMech: ScoringMechanismId): number => {
    // If it's a single cell, size is always 1 across all scoring mechanisms
    if (component.length === 1) return 1;
    
    switch(scoringMech) {
      case 'cell-multiplication':
        // For this mechanism, size is the number of cells
        return component.length;
          
      case 'cell-connection':
        // For cell-connection, calculate all connections within the component
        let connectionCount = 0;
        
        // For each cell in the component, count connections to other cells
        for (let cellKey of component) {
          const [gridX, gridY] = parsePositionKey(cellKey);
          
          // Get adjacent positions
          const adjacentPositions = getAdjacentPositions(gridX, gridY);
          
          // Count connections to other cells in the same component
          for (let [adjX, adjY] of adjacentPositions) {
            const adjKey = createPositionKey(adjX, adjY);
            if (component.includes(adjKey)) {
              connectionCount++;
            }
          }
        }
        
        // Divide by 2 since each connection is counted twice
        // (once from each end)
        return connectionCount / 2;
          
      case 'cell-extension':
        // For cell-extension, calculate the number of unique edges
        let extensionSum = 0;
        const processedEdges = new Set<string>();
        
        // For each cell in the component
        for (let cellKey of component) {
          const [gridX, gridY] = parsePositionKey(cellKey);
          
          // Check adjacent positions
          const adjacentPositions = getAdjacentPositions(gridX, gridY);
          
          // For each adjacent position
          for (let [adjX, adjY] of adjacentPositions) {
            const adjKey = createPositionKey(adjX, adjY);
            
            // If the adjacent cell is in the same component
            if (component.includes(adjKey)) {
              // Create an edge identifier (smaller key first to ensure uniqueness)
              const edge = cellKey < adjKey 
                ? `${cellKey}-${adjKey}` 
                : `${adjKey}-${cellKey}`;
              
              // Only count each edge once
              if (!processedEdges.has(edge)) {
                extensionSum++;
                processedEdges.add(edge);
              }
            }
          }
        }
        
        // If there are no extensions (shouldn't happen for multi-cell), return 1
        return extensionSum > 0 ? extensionSum : 1;
          
      default:
        // Default to using the number of cells
        return component.length;
    }
  };

  // Unified method to calculate the breakdown text for any scoring mechanism
  const calculateBreakdownText = (score: number, components: string[][], scoringMech: ScoringMechanismId): string => {
    if (score === 0 || !components || components.length === 0) {
      return `${score} = 0`;
    }
    
    // Calculate the appropriate "size" for each component based on the scoring mechanism
    const componentSizes = components.map(component => {
      return calculateComponentSize(component, scoringMech);
    });
    
    // Sort by size (largest first) and join with multiplication symbol
    const sizesText = componentSizes.sort((a, b) => b - a).join('×');
    return `${score} = ${sizesText}`;
  };

  const updateScoreDisplay = () => {
    if (!scoresRef.current || !breakdownRef.current) return;

    const componentsP1 = getConnectedComponents(boardState, 0);
    const componentsP2 = getConnectedComponents(boardState, 1);
    
    // Generate breakdown text for each player using the appropriate sizing method
    const breakdownText1 = calculateBreakdownText(scores[0], componentsP1, scoringMechanism);
    const breakdownText2 = calculateBreakdownText(scores[1], componentsP2, scoringMechanism);
    
    // Create CSS for player styles to match the original implementation
    const player1Color = playerColors[0];
    const player2Color = playerColors[1];
    
    // Style based on current player - similar to the original implementation
    const player1LabelStyle = currentPlayer === 0 
      ? `color: ${player1Color}; font-weight: 600; border-bottom: 2px solid ${player1Color};` 
      : `color: ${player1Color}; font-weight: 500;`;
        
    const player2LabelStyle = currentPlayer === 1 
      ? `color: ${player2Color}; font-weight: 600; border-bottom: 2px solid ${player2Color};` 
      : `color: ${player2Color}; font-weight: 500;`;
    
    // Set player scores HTML (above the board)
    scoresRef.current.innerHTML = `
      <div style="display: flex; justify-content: space-between; width: 100%;">
        <div style="text-align: left; padding-right: 10px;">
          <div style="${player1LabelStyle}">Player 1: ${scores[0]}</div>
        </div>
        <div style="text-align: right; padding-left: 10px;">
          <div style="${player2LabelStyle}">Player 2: ${scores[1]}</div>
        </div>
      </div>
    `;
    
    // Set breakdown HTML with proper formatting
    breakdownRef.current.innerHTML = `
      <div style="display: flex; justify-content: space-between; width: 100%;">
        <div style="text-align: left; padding-right: 10px;">
          <div style="font-size: 0.9em; font-weight: 400; min-height: 1.2em; opacity: 0.9; color: ${player1Color};">${breakdownText1}</div>
        </div>
        <div style="text-align: right; padding-left: 10px;">
          <div style="font-size: 0.9em; font-weight: 400; min-height: 1.2em; opacity: 0.9; color: ${player2Color};">${breakdownText2}</div>
        </div>
      </div>
    `;
  };

  return (
    <div id="scores-container" title={`Scoring: ${scoringDescription}`}>
      <div id="player-scores" ref={scoresRef}></div>
      <div id="score-breakdown" ref={breakdownRef}></div>
    </div>
  );
};

export default ScoreDisplay; 