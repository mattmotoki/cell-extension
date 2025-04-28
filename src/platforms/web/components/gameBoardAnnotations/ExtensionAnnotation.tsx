/**
 * ExtensionAnnotation.tsx
 * 
 * This component visualizes the extension scoring mechanism on the game board.
 * It displays a sequential number for each edge in a connected component by placing
 * text annotations at the center of each edge. The edges are numbered from 1 to N
 * in depth-first order, following the connected structure of the component.
 * 
 * Key features:
 * - Numbers each edge sequentially (1, 2, 3, etc.) using depth-first traversal order
 * - Places text annotations at the center of each edge
 * - The total number of edges is the extension score for the component
 * - Depth-first ordering provides a more intuitive visualization of the component structure
 * 
 * Related files:
 * - utils.ts: Contains helper functions for drawing connections and edges
 * - GameBoard.tsx: Main game board component that uses this annotation
 * - algorithms.ts: Contains the extension scoring algorithm implementation
 */

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
    
    // Draw connection lines - using depth-first order for edges
    const processedEdges = drawConnectionLines({
      cellDimension,
      group: scoringVisualsGroup,
      cells,
      gridWidth,
      gridHeight,
      player,
      lineWidth: cellDimension * 0.005, // Thin lines
      color: '#888888',
      useDepthFirstOrder: true // Enable depth-first ordering
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
    
    // Add text annotations at the center of each edge with sequential numbering
    processedEdges.forEach((edgeKey, index) => {
      // Use the parseEdgeKey helper function
      const [cell1, cell2] = parseEdgeKey(edgeKey);
      const [x1, y1] = parsePositionKey(cell1);
      const [x2, y2] = parsePositionKey(cell2);
      
      // Calculate the center of the edge
      const centerX = cellDimension*(x1 + x2 + 1) / 2;
      const centerY = cellDimension*(y1 + y2 + 1) / 2;
      
      // Display the edge's sequential number (1-based index) in depth-first order
      const edgeNumber = index + 1;
      
      // Add the edge's sequential number as text annotation
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
        .text(edgeNumber.toString());
    });
  });

  return cellsWithText;
};

export default ExtensionAnnotation; 