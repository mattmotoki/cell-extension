/**
 * MultiplicationAnnotation.tsx
 * 
 * This component visualizes the multiplication scoring mechanism on the game board.
 * It displays a sequential number for each cell in a connected component by placing
 * text annotations at the center of each cell. The cells are numbered from 1 to N
 * starting from the leftmost cell and following a top-to-bottom, left-to-right traversal order.
 * 
 * Key features:
 * - Numbers each cell sequentially (1, 2, 3, etc.) based on traversal order
 * - Places text annotations at the center of each cell
 * - Uses colored circle markers as backgrounds for the text
 * - Isolated cells are labeled with '1'
 * - The total number of cells (product of component sizes) is the multiplication score
 * - Consistent ordering provides a visual representation of how cells are counted
 * 
 * Related files:
 * - utils.ts: Contains helper functions for drawing connections and ordering cells
 * - GameBoard.tsx: Main game board component that uses this annotation
 */

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
  playerColors: string[]; // Array of player colors
}

export const MultiplicationAnnotation: React.FC<MultiplicationAnnotationProps> = ({
  components,
  cellDimension,
  scoringVisualsGroup,
  gridWidth,
  gridHeight,
  playerColors
}) => {
  // Keep track of cells that will have text annotations
  const cellsWithText = new Set<string>();
  const processedComponents = new Set<string>();

  // For multiplication, highlight the component sizes and number each cell
  components.forEach(({ player, cells }) => {
    // Process all components, including isolated cells
    if (cells.length > 0) {
      const componentKey = `${player}-${cells.join('|')}`;
      if (!processedComponents.has(componentKey)) {
        processedComponents.add(componentKey);
        
        // Draw connection lines (only if there are multiple cells)
        if (cells.length > 1) {
          drawConnectionLines({
            cellDimension,
            group: scoringVisualsGroup,
            cells,
            gridWidth,
            gridHeight,
            player,
            playerColors,
            lineWidth: cellDimension * 0.005, // Thin lines
            color: '#888888'
          });
        }
        
        // Order cells by position (leftmost first, then top-to-bottom)
        const orderedCells = [...cells].sort((a, b) => {
          const [x1, y1] = parsePositionKey(a);
          const [x2, y2] = parsePositionKey(b);
          // First priority: x-coordinate (ascending)
          if (x1 !== x2) return x1 - x2;
          // Second priority: y-coordinate (ascending)
          return y1 - y2;
        });
        
        // Draw background markers using player color
        drawConnectionMarkers({
          cellDimension,
          group: scoringVisualsGroup,
          cells: orderedCells,
          gridWidth,
          gridHeight,
          player,
          playerColors,
          markerRadius: cellDimension * 0.15, // Larger radius for text background
          fillColor: playerColors[player], // Use player color directly
        });
        
        // Add sequential number annotations to each cell
        orderedCells.forEach((cellKey, index) => {
          const [gridX, gridY] = parsePositionKey(cellKey);
          cellsWithText.add(cellKey);
          
          const centerX = gridX * cellDimension + cellDimension / 2;
          const centerY = gridY * cellDimension + cellDimension / 2;
          
          // Add cell number (1-based index) as text annotation
          scoringVisualsGroup.append('text')
            .attr('class', `score-indicator player-${player}`)
            .attr('x', centerX)
            .attr('y', centerY)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', '#ffffff') // White text for contrast
            .attr('font-weight', 'bold')
            .attr('font-size', cellDimension * 0.25) // Smaller font size
            .attr('stroke', 'none') // No stroke needed with colored background
            .text((index + 1).toString());
        });
      }
    }
  });

  return cellsWithText;
};

export default MultiplicationAnnotation; 