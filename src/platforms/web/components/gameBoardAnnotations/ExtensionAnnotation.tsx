/**
 * ExtensionAnnotation Component
 * 
 * This component visualizes the extension scoring mechanism on the game board.
 * It displays a sequential number for each edge in a connected component, 
 * numbered from 1 to N in depth-first order. Isolated cells are labeled with "1".
 * 
 * Key features:
 * - Numbers each edge sequentially using depth-first traversal order
 * - Places text annotations at the center of each edge with circular markers as backgrounds
 * - Adds white cell markers to highlight cells in the component (except isolated cells)
 * - Adds gray edge markers with text labels showing the sequence number
 * - Labels isolated cells with "1" directly on the cell
 * - Draws rectangle overlays between connected cells to visualize extensions
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
import { 
  getAdjacentPositions, 
  drawConnectionLines, 
  parseEdgeKey, 
  drawMarkers, 
  drawLabels,
  drawExtension 
} from './utils';

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
  // Process each component
  components.forEach(({ player, cells }) => {
    if (cells.length === 0) return;
    
    // Create a Set of cells for quick lookups
    const cellsSet = new Set(cells);
    
    // Identify isolated cells (cells with no connections to other cells in the component)
    const isolatedCells: string[] = [];
    const connectedCells: string[] = [];
    
    cells.forEach(cellKey => {
      const [gridX, gridY] = parsePositionKey(cellKey);
      let hasConnection = false;
      
      // Check if this cell has any adjacent cells in the same component
      const adjacentPositions = getAdjacentPositions(gridX, gridY);
      for (const [adjX, adjY] of adjacentPositions) {
        if (adjX >= 0 && adjX < gridWidth && adjY >= 0 && adjY < gridHeight) {
          const adjKey = createPositionKey(adjX, adjY);
          if (cellsSet.has(adjKey)) {
            hasConnection = true;
            break;
          }
        }
      }
      
      // Sort cells into isolated or connected
      if (hasConnection) {
        connectedCells.push(cellKey);
      } else {
        isolatedCells.push(cellKey);
      }
    });
    
    // Note: Extension rectangles are now drawn in the GameBoard component for all scoring mechanisms
    
    // Draw connection lines between cells in this component, returning edges in depth-first order
    const processedEdges = drawConnectionLines({
      cellDimension,
      group: scoringVisualsGroup,
      cells,
      gridWidth,
      gridHeight,
      player,
      playerColors,
      useDepthFirstOrder: true // Only specify non-default value
    });
    
    // Draw small dark markers at connected cell centers (matching line and text color)
    if (connectedCells.length > 0) {
      console.log('connectedCells', connectedCells.length);
      drawMarkers({
        cellDimension,
        group: scoringVisualsGroup,
        cells: connectedCells,
        gridWidth,
        gridHeight,
        player,
        playerColors
      });
    }

    // Handle isolated cells - add a "1" label to each isolated cell
    if (isolatedCells.length > 0) {
      // Convert isolated cells to positions for labeling
      const isolatedPositions = isolatedCells.map(cellKey => {
        const [gridX, gridY] = parsePositionKey(cellKey);
        return {
          x: gridX * cellDimension + cellDimension / 2,
          y: gridY * cellDimension + cellDimension / 2
        };
      });
      
      // Create labels with "1" for each isolated cell
      const isolatedLabels = isolatedCells.map(() => 1);
      
      // Draw labels with "1" on isolated cells
      drawLabels({
        cellDimension,
        group: scoringVisualsGroup,
        gridWidth,
        gridHeight,
        player,
        playerColors,
        positions: isolatedPositions,
        labels: isolatedLabels,
      });
    }

    // Collect edge midpoints for marker positioning
    const edgePositions = processedEdges.map((edgeKey) => {
      // Parse the edge key to get the cell positions
      const [cell1, cell2] = parseEdgeKey(edgeKey);
      const [x1, y1] = parsePositionKey(cell1);
      const [x2, y2] = parsePositionKey(cell2);
      
      // Calculate the center of the edge
      const centerX = cellDimension * (x1 + x2 + 1) / 2;
      const centerY = cellDimension * (y1 + y2 + 1) / 2;
      
      return { 
        x: centerX, 
        y: centerY 
      };
    });
    
    // Create sequential numbers for edge labels (1-indexed)
    const edgeLabels = processedEdges.map((_, index) => index + 1);
    
    // Draw labels with sequential edge numbers using player color background and dark text
    drawLabels({
      cellDimension,
      group: scoringVisualsGroup,
      gridWidth,
      gridHeight,
      player,
      playerColors,
      positions: edgePositions,
      labels: edgeLabels,
      fillColor: playerColors[player], // Use player color for background
    });
  });

  return null;
};

export default ExtensionAnnotation; 