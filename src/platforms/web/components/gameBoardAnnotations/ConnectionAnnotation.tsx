import React from 'react';
import * as d3 from 'd3';
import { PlayerIndex, parsePositionKey, createPositionKey } from '@core';
import { getAdjacentPositions, drawComponentConnections } from './utils';

interface ConnectionAnnotationProps {
  components: Array<{ player: PlayerIndex, cells: string[] }>;
  cellDimension: number;
  scoringVisualsGroup: d3.Selection<any, unknown, null, undefined>;
  gridWidth: number;
  gridHeight: number;
}

export const ConnectionAnnotation: React.FC<ConnectionAnnotationProps> = ({
  components,
  cellDimension,
  scoringVisualsGroup,
  gridWidth,
  gridHeight
}) => {
  // Keep track of cells that will have text annotations
  const cellsWithText = new Set<string>();

  // For connection scoring, highlight the connections
  components.forEach(({ player, cells }) => {
    if (cells.length <= 1) return;
    
    // Count connections between cells
    let connectionCount = 0;
    const cellsSet = new Set(cells);
    
    // Draw connections using shared utility
    const processedEdges = drawComponentConnections({
      cellDimension,
      group: scoringVisualsGroup,
      cells,
      gridWidth,
      gridHeight,
      player,
      lineWidth: cellDimension * 0.005, // Thin lines
      drawMarkers: false // Don't draw markers, we'll handle them specially
    });
    
    connectionCount = processedEdges.size;
    
    // Add additional thicker highlight lines for connections that are part of the score
    processedEdges.forEach(edgeKey => {
      const [cell1, cell2] = edgeKey.split('-');
      const [x1, y1] = parsePositionKey(cell1);
      const [x2, y2] = parsePositionKey(cell2);
      
      const cell1CenterX = x1 * cellDimension + cellDimension / 2;
      const cell1CenterY = y1 * cellDimension + cellDimension / 2;
      const cell2CenterX = x2 * cellDimension + cellDimension / 2;
      const cell2CenterY = y2 * cellDimension + cellDimension / 2;
      
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
    
    // Only display score if there are cells to show it on
    if (connectionCount > 0 && cells.length > 0) {
      // Find a good cell to display the score (preferably one not part of many connections)
      const cellConnectionCount = new Map<string, number>();
      
      // Count how many connections each cell is part of
      processedEdges.forEach(edgeKey => {
        const [cell1, cell2] = edgeKey.split('-');
        cellConnectionCount.set(cell1, (cellConnectionCount.get(cell1) || 0) + 1);
        cellConnectionCount.set(cell2, (cellConnectionCount.get(cell2) || 0) + 1);
      });
      
      // Sort cells by connection count (ascending)
      const sortedCells = [...cellConnectionCount.entries()]
        .sort((a, b) => a[1] - b[1])
        .map(([cellKey]) => cellKey);
      
      if (sortedCells.length > 0) {
        // Use the cell with fewest connections to show the score
        const cellKey = sortedCells[0];
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
          .attr('font-size', cellDimension * 0.25) // Smaller font size
          .attr('stroke', 'rgba(0,0,0,0.3)')
          .attr('stroke-width', 0.3)
          .text(connectionCount.toString());
      }
    }
  });

  return cellsWithText;
};

export default ConnectionAnnotation; 