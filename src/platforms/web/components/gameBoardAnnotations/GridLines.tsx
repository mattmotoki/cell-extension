/**
 * src/platforms/web/components/GridLines.tsx - Grid Lines Component
 * 
 * React component that renders the grid lines for the game board.
 * Extracted from GameBoard.tsx to modularize rendering responsibilities.
 */

import React from 'react';
import * as d3 from 'd3';

interface GridLinesProps {
  gridWidth: number;
  gridHeight: number;
  gridDimension: number;
  cellDimension: number;
  group: d3.Selection<any, unknown, null, undefined>;
}

export const GridLines: React.FC<GridLinesProps> = ({
  gridWidth,
  gridHeight,
  gridDimension,
  cellDimension,
  group
}) => {
  // Clear existing grid lines
  group.selectAll('.grid-line').remove();
  
  // --- Render Grid Lines Only (subtle) ---
  // Vertical lines
  group.selectAll('.vline')
    .data(d3.range(gridWidth + 1))
    .enter().append('line')
    .attr('class', 'vline grid-line')
    .attr('x1', (d: number) => d * cellDimension)
    .attr('y1', 0)
    .attr('x2', (d: number) => d * cellDimension)
    .attr('y2', gridDimension)
    .attr('stroke', '#e0e0e0')
    .attr('stroke-width', 0.3)
    .attr('stroke-opacity', 0.3);

  // Horizontal lines
  group.selectAll('.hline')
    .data(d3.range(gridHeight + 1))
    .enter().append('line')
    .attr('class', 'hline grid-line')
    .attr('x1', 0)
    .attr('y1', (d: number) => d * cellDimension)
    .attr('x2', gridDimension)
    .attr('y2', (d: number) => d * cellDimension)
    .attr('stroke', '#e0e0e0')
    .attr('stroke-width', 0.3)
    .attr('stroke-opacity', 0.3);
    
  return null; // This is a render-only component with side effects
};

export default GridLines; 