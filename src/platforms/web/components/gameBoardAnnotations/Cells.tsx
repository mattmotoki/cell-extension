/**
 * src/platforms/web/components/gameBoardAnnotations/Cells.tsx - Cell Rendering Component
 * 
 * React component that renders the occupied cells on the game board.
 * Extracted from GameBoard.tsx to modularize rendering responsibilities.
 */

import React from 'react';
import * as d3 from 'd3';
import { PlayerIndex, parsePositionKey } from '@core';
import { drawCell } from './utils';

interface CellData {
  key: string;
  player: PlayerIndex;
  gridX: number;
  gridY: number;
}

interface CellsProps {
  occupiedCells: Record<string, boolean>[];
  playerColors: string[];
  cellDimension: number;
  cellPadding: number;
  cellRadius: number;
  group: d3.Selection<any, unknown, null, undefined>;
}

export const Cells: React.FC<CellsProps> = ({
  occupiedCells,
  playerColors,
  cellDimension,
  cellPadding,
  cellRadius,
  group
}) => {
  // Clear existing cells
  group.selectAll('.player-cell').remove();
  
  // Create data array of all occupied cells
  const allOccupied: CellData[] = [
    ...Object.keys(occupiedCells[0]).map(key => {
      const [gridX, gridY] = parsePositionKey(key);
      return { key, player: 0 as PlayerIndex, gridX, gridY };
    }),
    ...Object.keys(occupiedCells[1]).map(key => {
      const [gridX, gridY] = parsePositionKey(key);
      return { key, player: 1 as PlayerIndex, gridX, gridY };
    })
  ];

  // Render player cells using the drawCell utility function for consistency
  allOccupied.forEach(cell => {
    drawCell({
      gridX: cell.gridX,
      gridY: cell.gridY,
      cellDimension,
      cellPadding,
      cellRadius,
      group,
      player: cell.player,
      playerColors
    });
  });
    
  return null; 
};

export default Cells; 