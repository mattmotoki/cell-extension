/**
 * ConnectionAnnotation.tsx
 * 
 * This component visualizes the connection scoring mechanism on the game board.
 * It displays the number of connections each cell has with adjacent cells of the same player.
 * 
 * Key features:
 * - Calculates individual connection counts for each cell
 * - Displays the connection count as a text annotation on each cell
 * - Uses small gray markers as backgrounds for the text
 * - Follows the rule that isolated cells have a connection count of 1
 *  
 * Related files:
 * - utils.ts: Contains helper functions for drawing connections
 * - GameBoard.tsx: Main game board component that uses this annotation
 */

import React from 'react';
import * as d3 from 'd3';
import { PlayerIndex, parsePositionKey, createPositionKey } from '@core';
import { getAdjacentPositions, drawConnectionLines, drawConnectionMarkers, parseEdgeKey } from './utils';

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
  // Keep track of cells that will have text annotations
  const cellsWithText = new Set<string>();

  // For connection scoring, highlight the connections
  components.forEach(({ player, cells }) => {
    if (cells.length === 0) return;
    
    // Create a set of cells for quick lookups
    const cellsSet = new Set(cells);
    
    // Draw connection lines using the new separate function - no markers needed
    const processedEdges = drawConnectionLines({
      cellDimension,
      group: scoringVisualsGroup,
      cells,
      gridWidth,
      gridHeight,
      player,
      playerColors,
      lineWidth: cellDimension * 0.005,
      color: '#888888'
    });
    
    // Add additional thicker highlight lines for connections that are part of the score
    processedEdges.forEach(edgeKey => {
      // Use the parseEdgeKey helper function
      const [cell1, cell2] = parseEdgeKey(edgeKey);
      const [x1, y1] = parsePositionKey(cell1);
      const [x2, y2] = parsePositionKey(cell2);
      
      const cell1CenterX = cellDimension * (x1 + 1/2);
      const cell1CenterY = cellDimension * (y1 + 1/2);
      const cell2CenterX = cellDimension * (x2 + 1/2);
      const cell2CenterY = cellDimension * (y2 + 1/2);
      
      // Highlight this connection with a thinner line for scoring
      scoringVisualsGroup.append('line')
        .attr('class', `score-connection player-${player}`)
        .attr('x1', cell1CenterX)
        .attr('y1', cell1CenterY)
        .attr('x2', cell2CenterX)
        .attr('y2', cell2CenterY)
        .attr('stroke', '#888888') // Gray color for all connections
        .attr('stroke-width', cellDimension * 0.02) // Slightly thicker for emphasis
        .attr('stroke-opacity', 0.8); // Slightly transparent
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
    
    // Create a list of cells with their connection counts for drawing
    const cellsWithCounts = Array.from(cellConnectionCount.entries()).map(
      ([cellKey, count]) => ({ cellKey, count })
    );
    
    // Draw small gray markers as backgrounds for text annotations
    drawConnectionMarkers({
      cellDimension,
      group: scoringVisualsGroup,
      cells: cellsWithCounts.map(item => item.cellKey),
      gridWidth,
      gridHeight,
      player,
      playerColors,
      markerRadius: cellDimension * 0.15, // Increased radius to match MultiplicationAnnotation
      fillColor: playerColors[player],
    });
    
    // Add text annotations to each cell showing its individual connection count
    cellsWithCounts.forEach(({ cellKey, count }) => {
      const [gridX, gridY] = parsePositionKey(cellKey);
      cellsWithText.add(cellKey); // Mark this cell as having text
      
      const centerX = gridX * cellDimension + cellDimension / 2;
      const centerY = gridY * cellDimension + cellDimension / 2;
      
      // Add label showing connection count
      scoringVisualsGroup.append('text')
        .attr('class', `score-indicator player-${player}`)
        .attr('x', centerX)
        .attr('y', centerY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-weight', 'bold')
        .attr('font-size', cellDimension * 0.25) // Increased font size to match MultiplicationAnnotation
        .attr('stroke', 'none') // No stroke needed with background marker
        .text(count.toString());
    });
  });

  return cellsWithText;
};

export default ConnectionAnnotation; 