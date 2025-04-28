/**
 * ConnectionAnnotation.tsx
 * 
 * This component visualizes the connection scoring mechanism on the game board.
 * It displays the number of connections each cell has with adjacent cells of the same player.
 * 
 * Key features:
 * - Calculates individual connection counts for each cell
 * - Displays the connection count as a text annotation on each cell
 * - Uses player-colored markers as backgrounds for the text
 * - Follows the rule that isolated cells have a connection count of 1
 *  
 * Related files:
 * - utils.ts: Contains helper functions for drawing connections
 * - GameBoard.tsx: Main game board component that uses this annotation
 */

import React from 'react';
import * as d3 from 'd3';
import { PlayerIndex, parsePositionKey, createPositionKey } from '@core';
import { getAdjacentPositions, drawConnectionLines, drawLabels } from './utils';

interface ConnectionAnnotationProps {
  components: Array<{ player: PlayerIndex, cells: string[] }>;
  cellDimension: number;
  scoringVisualsGroup: d3.Selection<any, unknown, null, undefined>;
  gridWidth: number;
  gridHeight: number;
  playerColors: string[]; // Array of player colors
}

export const ConnectionAnnotation: React.FC<ConnectionAnnotationProps> = ({
  components,
  cellDimension,
  scoringVisualsGroup,
  gridWidth,
  gridHeight,
  playerColors
}) => {
  // For connection scoring, highlight the connections
  components.forEach(({ player, cells }) => {
    if (cells.length === 0) return;
    
    // Create a set of cells for quick lookups
    const cellsSet = new Set(cells);
    
    // Draw connection lines using default styling
    drawConnectionLines({
      cellDimension,
      group: scoringVisualsGroup,
      cells,
      gridWidth,
      gridHeight,
      player,
      playerColors
    });
    
    // Calculate individual connection counts for each cell
    const cellConnectionCount = new Map<string, number>();
    
    // Process each cell in the component
    cells.forEach(cellKey => {
      const [gridX, gridY] = parsePositionKey(cellKey);
      
      // Count connections to adjacent cells of the same player
      let count = 0;
      
      // Get adjacent positions
      const adjacentPositions = getAdjacentPositions(gridX, gridY);
      
      // Check each adjacent position
      adjacentPositions.forEach(([adjX, adjY]) => {
        if (adjX >= 0 && adjX < gridWidth && adjY >= 0 && adjY < gridHeight) {
          const adjKey = createPositionKey(adjX, adjY);
          
          // If the adjacent cell is in the same component, add a connection
          if (cellsSet.has(adjKey)) {
            count++;
          }
        }
      });
      
      // For isolated cells with no connections, set count to 1
      count = count === 0 ? 1 : count;
      
      // Store the count for this cell
      cellConnectionCount.set(cellKey, count);
    });
    
    // Convert cells to positions and prepare labels
    const positions: Array<{x: number, y: number}> = [];
    const connectionLabels: Array<number> = [];
    
    // Create positions and labels arrays from cell connection counts
    cellConnectionCount.forEach((count, cellKey) => {
      const [gridX, gridY] = parsePositionKey(cellKey);
      positions.push({
        x: gridX * cellDimension + cellDimension / 2,
        y: gridY * cellDimension + cellDimension / 2
      });
      connectionLabels.push(count);
    });
    
    // Draw markers with connection count labels using default styling where possible
    drawLabels({
      cellDimension,
      group: scoringVisualsGroup,
      positions,
      labels: connectionLabels,
      gridWidth,
      gridHeight,
      player,
      playerColors,
      markerRadius: cellDimension * 0.15 // Only specify what's different from defaults
    });
  });
  
  return null;
};

export default ConnectionAnnotation; 