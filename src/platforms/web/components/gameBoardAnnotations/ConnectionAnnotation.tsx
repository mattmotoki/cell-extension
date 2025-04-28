import React from 'react';
import * as d3 from 'd3';
import { PlayerIndex, parsePositionKey, createPositionKey } from '@core';

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

  // Helper function to get adjacent positions
  const getAdjacentPositions = (gridX: number, gridY: number): [number, number][] => {
    return [
      [gridX + 1, gridY],
      [gridX - 1, gridY],
      [gridX, gridY + 1],
      [gridX, gridY - 1]
    ];
  };

  // For connection scoring, highlight the connections
  components.forEach(({ player, cells }) => {
    if (cells.length <= 1) return;
    
    // Count connections between cells
    let connectionCount = 0;
    const processedEdges = new Set<string>();
    const connectedCellPairs: [string, string][] = []; // Keep track of cell pairs that are connected
    
    cells.forEach(cellKey => {
      const [gridX, gridY] = parsePositionKey(cellKey);
      const adjacentPositions = getAdjacentPositions(gridX, gridY);
      
      adjacentPositions.forEach(([adjX, adjY]) => {
        if (adjX >= 0 && adjX < gridWidth && adjY >= 0 && adjY < gridHeight) {
          const adjKey = createPositionKey(adjX, adjY);
          if (cells.includes(adjKey)) {
            const edgeKey = cellKey < adjKey ? `${cellKey}-${adjKey}` : `${adjKey}-${cellKey}`;
            if (!processedEdges.has(edgeKey)) {
              connectionCount++;
              processedEdges.add(edgeKey);
              connectedCellPairs.push([cellKey, adjKey]); // Store the connected cell pair
              
              const cellCenterX = gridX * cellDimension + cellDimension / 2;
              const cellCenterY = gridY * cellDimension + cellDimension / 2;
              const adjCenterX = adjX * cellDimension + cellDimension / 2;
              const adjCenterY = adjY * cellDimension + cellDimension / 2;
              
              // Highlight this connection with a thinner, solid line
              scoringVisualsGroup.append('line')
                .attr('class', `score-connection player-${player}`)
                .attr('x1', cellCenterX)
                .attr('y1', cellCenterY)
                .attr('x2', adjCenterX)
                .attr('y2', adjCenterY)
                .attr('stroke', '#888888') // Gray color for all connections
                .attr('stroke-width', cellDimension * 0.08) // Connection width
                .attr('stroke-opacity', 1.0); // Fully opaque
            }
          }
        }
      });
    });
    
    // Only display score if there are cells to show it on
    if (connectionCount > 0 && cells.length > 0) {
      // Find a good cell to display the score (preferably one not in a connection)
      const connectedCells = new Set<string>();
      connectedCellPairs.forEach(([cell1, cell2]) => {
        connectedCells.add(cell1);
        connectedCells.add(cell2);
      });
      
      // Try to find a cell that's not part of a connection
      const nonConnectedCells = cells.filter(cell => !connectedCells.has(cell));
      
      if (nonConnectedCells.length > 0) {
        // Use a non-connected cell to show the score
        const [gridX, gridY] = parsePositionKey(nonConnectedCells[0]);
        const cellKey = createPositionKey(gridX, gridY);
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
      } else if (cells.length > 0) {
        // If all cells are connected, pick the first one
        const [gridX, gridY] = parsePositionKey(cells[0]);
        const cellKey = createPositionKey(gridX, gridY);
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