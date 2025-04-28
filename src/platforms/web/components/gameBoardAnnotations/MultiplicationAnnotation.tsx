import React from 'react';
import * as d3 from 'd3';
import { PlayerIndex, parsePositionKey, createPositionKey } from '@core';
import { drawConnectionLines, drawConnectionMarkers } from './utils';

interface MultiplicationAnnotationProps {
  components: Array<{ player: PlayerIndex, cells: string[] }>;
  cellDimension: number;
  scoringVisualsGroup: d3.Selection<any, unknown, null, undefined>;
  gridWidth: number;
  gridHeight: number;
}

export const MultiplicationAnnotation: React.FC<MultiplicationAnnotationProps> = ({
  components,
  cellDimension,
  scoringVisualsGroup,
  gridWidth,
  gridHeight
}) => {
  // Keep track of cells that will have text annotations
  const cellsWithText = new Set<string>();
  const processedComponents = new Set<string>();

  // For multiplication, highlight the component sizes
  components.forEach(({ player, cells }) => {
    // Only show score for components with more than 1 cell
    if (cells.length > 1) {
      const componentKey = `${player}-${cells.join('|')}`;
      if (!processedComponents.has(componentKey)) {
        processedComponents.add(componentKey);
        
        // Draw connection lines 
        const processedEdges = drawConnectionLines({
          cellDimension,
          group: scoringVisualsGroup,
          cells,
          gridWidth,
          gridHeight,
          player,
          lineWidth: cellDimension * 0.005, // Thin lines
          color: '#888888'
        });
        
        // Draw the connection markers - no need to pass processedEdges
        drawConnectionMarkers({
          cellDimension,
          group: scoringVisualsGroup,
          cells,
          gridWidth,
          gridHeight,
          player,
          markerRadius: cellDimension * 0.05
        });
        
        const [firstX, firstY] = parsePositionKey(cells[0]);
        const cellKey = createPositionKey(firstX, firstY);
        cellsWithText.add(cellKey); // Mark this cell as having text
        
        // Add size indicator text in the center of the first cell
        scoringVisualsGroup.append('text')
          .attr('class', `score-indicator player-${player}`)
          .attr('x', cellDimension * (firstX + 1/2))
          .attr('y', cellDimension * (firstY + 1/2))
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .attr('fill', '#ffffff')
          .attr('font-weight', 'bold')
          .attr('font-size', cellDimension * 0.25) // Smaller font size
          .attr('stroke', 'rgba(0,0,0,0.3)')
          .attr('stroke-width', 0.3)
          .text(cells.length.toString());
      }
    }
  });

  return cellsWithText;
};

export default MultiplicationAnnotation; 