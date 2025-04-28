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
import { drawConnectionLines, drawLabels, orderCellsLeftToRight } from './utils';

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
            playerColors
          });
        }
        
        // Order cells by position using the utility function (left-to-right, top-to-bottom)
        const orderedCells = orderCellsLeftToRight(cells);
        
        // Create sequential numbers for cell labels (1-indexed)
        const sequentialLabels = orderedCells.map((_, index) => index + 1);
        
        // Convert cell keys to positions
        const positions = orderedCells.map(cellKey => {
          const [gridX, gridY] = parsePositionKey(cellKey);
          return {
            x: gridX * cellDimension + cellDimension / 2,
            y: gridY * cellDimension + cellDimension / 2
          };
        });
        
        // Draw background markers and text labels using player colors
        drawLabels({
          cellDimension,
          group: scoringVisualsGroup,
          positions,
          labels: sequentialLabels,
          gridWidth,
          gridHeight,
          player,
          playerColors
        });
      }
    }
  });

  return null;
};

export default MultiplicationAnnotation; 