/**
 * ExtensionAnnotation Component
 * 
 * This component visualizes the extension scoring mechanism on the game board.
 * It displays a sequential number for each edge in a connected component, 
 * numbered from 1 to N in depth-first order.
 * 
 * Key features:
 * - Numbers each edge sequentially using depth-first traversal order
 * - Places text annotations at the center of each edge with circular markers as backgrounds
 * - Adds default markers to each cell in the component
 * - The total number of edges represents the extension score for the component
 * 
 * Related files:
 * - utils.ts: Contains utility functions for drawing connections and markers
 * - ConnectionAnnotation.tsx: Similar component for connection scoring
 * - MultiplicationAnnotation.tsx: Similar component for multiplication scoring
 */

import React from 'react';
import * as d3 from 'd3';
import { PlayerIndex, parsePositionKey, createPositionKey } from '@core';
import { getAdjacentPositions, drawConnectionLines, parseEdgeKey, drawConnectionMarkers } from './utils';

interface ExtensionAnnotationProps {
  components: Array<{ player: PlayerIndex, cells: string[] }>;
  cellDimension: number;
  scoringVisualsGroup: d3.Selection<any, unknown, null, undefined>;
  gridWidth: number;
  gridHeight: number;
  cellPadding: number;
  cellRadius: number;
  playerColors: string[]; // Array of player colors
}

export const ExtensionAnnotation: React.FC<ExtensionAnnotationProps> = ({
  components,
  cellDimension,
  scoringVisualsGroup,
  gridWidth,
  gridHeight,
  cellPadding,
  cellRadius,
  playerColors
}) => {
  // Keep track of cells that will have text annotations
  const cellsWithText = new Set<string>();

  // Process each component
  components.forEach(({ player, cells }) => {
    if (cells.length === 0) return;
    
    // Draw connection lines between cells in this component, returning edges in depth-first order
    const processedEdges = drawConnectionLines({
      cellDimension,
      group: scoringVisualsGroup,
      cells,
      gridWidth,
      gridHeight,
      player,
      playerColors,
      lineWidth: cellDimension * 0.005,
      color: playerColors[player],
      useDepthFirstOrder: true
    });
    
    // Draw default markers at cell centers
    drawConnectionMarkers({
      cellDimension,
      group: scoringVisualsGroup,
      cells,
      gridWidth,
      gridHeight,
      player,
      playerColors,
      markerRadius: cellDimension * 0.1,
      fillColor: playerColors[player],
    });

    // Add text annotations at the center of each edge with sequential numbering and markers
    processedEdges.forEach((edgeKey, index) => {
      // Parse the edge key to get the cell positions
      const [cell1, cell2] = parseEdgeKey(edgeKey);
      const [x1, y1] = parsePositionKey(cell1);
      const [x2, y2] = parsePositionKey(cell2);
      
      // Calculate the center of the edge
      const centerX = cellDimension * (x1 + x2 + 1) / 2;
      const centerY = cellDimension * (y1 + y2 + 1) / 2;
      
      // Draw gray marker as background for text annotation
      scoringVisualsGroup.append('circle')
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', cellDimension * 0.15) // Same size as MultiplicationAnnotation
        .attr('fill', '#888888') // Gray fill
        .attr('opacity', 0.8); // Slightly transparent
      
      // Display the edge number (1-based index)
      const edgeNumber = index + 1;
      
      // Add text label at the midpoint of the edge
      scoringVisualsGroup.append('text')
        .attr('class', `score-indicator player-${player}`)
        .attr('x', centerX)
        .attr('y', centerY)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#ffffff')
        .attr('font-weight', 'bold')
        .attr('font-size', cellDimension * 0.25) // Match MultiplicationAnnotation font size
        .attr('stroke', 'none') // No stroke with markers
        .text(edgeNumber.toString());
    });
  });

  return cellsWithText;
};

export default ExtensionAnnotation; 