import React from 'react';
import * as d3 from 'd3';
import { PlayerIndex, parsePositionKey, createPositionKey } from '@core';
import { getAdjacentPositions, drawConnectionLines, drawConnectionMarkers, parseEdgeKey } from './utils';

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

  // For extension scoring, we'll count the edges in a connected component
  components.forEach(({ player, cells }) => {
    if (cells.length <= 1) return;
    
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
    
    // Draw connection markers for each cell
    drawConnectionMarkers({
      cellDimension,
      group: scoringVisualsGroup,
      cells,
      gridWidth,
      gridHeight,
      player,
      markerRadius: cellDimension * 0.05
    });
    
    // Get the total edge count for this component
    let edgeCount = 0;
    
    // Add text annotations at the center of each edge
    processedEdges.forEach(edgeKey => {
      // Use the parseEdgeKey helper function
      const [cell1, cell2] = parseEdgeKey(edgeKey);
      const [x1, y1] = parsePositionKey(cell1);
      const [x2, y2] = parsePositionKey(cell2);
      edgeCount += 1;
      
      // Calculate the center of the edge
      const centerX = cellDimension*(x1 + x2 + 1) / 2;
      const centerY = cellDimension*(y1 + y2 + 1) / 2;
      
      // Add the edge count as text annotation
      scoringVisualsGroup.append('text')
        .attr('class', `score-indicator player-${player}`)
        .attr('x', centerX)
        .attr('y', centerY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-weight', 'bold')
        .attr('font-size', cellDimension * 0.2) // Smaller font size
        .attr('stroke', 'rgba(0,0,0,0.3)')
        .attr('stroke-width', 0.3)
        .text(edgeCount.toString());
    });
  });

  return cellsWithText;
};

export default ExtensionAnnotation; 