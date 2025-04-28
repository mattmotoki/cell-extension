import React from 'react';
import * as d3 from 'd3';
import { PlayerIndex, parsePositionKey, createPositionKey } from '@core';

interface ExtensionAnnotationProps {
  components: Array<{ player: PlayerIndex, cells: string[] }>;
  cellDimension: number;
  scoringVisualsGroup: d3.Selection<any, unknown, null, undefined>;
  gridWidth: number;
  gridHeight: number;
  cellPadding: number;
  cellRadius: number;
}

export const ExtensionAnnotation: React.FC<ExtensionAnnotationProps> = ({
  components,
  cellDimension,
  scoringVisualsGroup,
  gridWidth,
  gridHeight,
  cellPadding,
  cellRadius
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

  // For extension scoring, highlight component perimeter/border cells
  components.forEach(({ player, cells }) => {
    if (cells.length <= 1) return;
    
    // Highlight each cell in the component
    const cellKeys = new Set(cells);
    let perimeterCells = [];
    
    // Find cells on the perimeter (having fewer than 4 neighbors)
    for (const cellKey of cells) {
      const [gridX, gridY] = parsePositionKey(cellKey);
      const adjacentPositions = getAdjacentPositions(gridX, gridY);
      
      // Count how many neighbors this cell has within the component
      const neighCount = adjacentPositions.filter(([adjX, adjY]) => {
        if (adjX >= 0 && adjX < gridWidth && adjY >= 0 && adjY < gridHeight) {
          const adjKey = createPositionKey(adjX, adjY);
          return cellKeys.has(adjKey);
        }
        return false;
      }).length;
      
      // If it has fewer than 4 neighbors, it's on the perimeter
      if (neighCount < 4) {
        perimeterCells.push(cellKey);
      }
    }
    
    // Highlight perimeter cells with a subtle glow (but no border)
    perimeterCells.forEach(cellKey => {
      const [gridX, gridY] = parsePositionKey(cellKey);
      
      scoringVisualsGroup.append('rect')
        .attr('class', `perimeter-highlight player-${player}`)
        .attr('x', gridX * cellDimension + (cellDimension * cellPadding / 2) - 1)
        .attr('y', gridY * cellDimension + (cellDimension * cellPadding / 2) - 1)
        .attr('width', cellDimension * (1 - cellPadding) + 2)
        .attr('height', cellDimension * (1 - cellPadding) + 2)
        .attr('rx', cellRadius + 1)
        .attr('ry', cellRadius + 1)
        .attr('fill', 'none')
        .attr('stroke', '#888888') // Gray color for all highlights
        .attr('stroke-width', 1.5) // Thinner border
        .attr('stroke-opacity', 0.9) // More opaque
        .attr('stroke-dasharray', '2 2'); // Smaller dashes
    });
    
    // Find non-perimeter cells for the score
    const nonPerimeterCells = cells.filter(cell => !perimeterCells.includes(cell));
    
    if (perimeterCells.length > 0 && nonPerimeterCells.length > 0) {
      // Use a non-perimeter cell to show the score
      const [gridX, gridY] = parsePositionKey(nonPerimeterCells[0]);
      const cellKey = createPositionKey(gridX, gridY);
      cellsWithText.add(cellKey); // Mark this cell as having text
      
      const centerX = gridX * cellDimension + cellDimension / 2;
      const centerY = gridY * cellDimension + cellDimension / 2;
      
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
        .text(perimeterCells.length.toString());
    }
  });

  return cellsWithText;
};

export default ExtensionAnnotation; 