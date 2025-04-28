import React from 'react';
import * as d3 from 'd3';
import { PlayerIndex, parsePositionKey, createPositionKey } from '@core';
import { getAdjacentPositions, drawComponentConnections } from './utils';

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

  // For extension scoring, count perimeter cells without highlighting them
  components.forEach(({ player, cells }) => {
    if (cells.length <= 1) return;
    
    // Draw connections using shared utility
    drawComponentConnections({
      cellDimension,
      group: scoringVisualsGroup,
      cells,
      gridWidth,
      gridHeight,
      player,
      lineWidth: cellDimension * 0.005, // Thin lines
      drawMarkers: true,
      markerRadius: cellDimension * 0.05
    });
    
    // Find cells on the perimeter (having fewer than 4 neighbors) without highlighting them
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
    
    // We don't add perimeter highlights anymore
    
    // Display score on a non-perimeter cell if available
    const nonPerimeterCells = cells.filter(cell => !perimeterCells.includes(cell));
    
    if (perimeterCells.length > 0) {
      // Choose a cell to display the score on (non-perimeter cell if available, otherwise the first cell)
      const cellToUseForScore = nonPerimeterCells.length > 0 ? nonPerimeterCells[0] : cells[0];
      const [gridX, gridY] = parsePositionKey(cellToUseForScore);
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