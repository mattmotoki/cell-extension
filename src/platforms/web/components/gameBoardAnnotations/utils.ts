import * as d3 from 'd3';
import { PlayerIndex, parsePositionKey, createPositionKey } from '@core';

/**
 * Gets adjacent positions for a given grid coordinate
 */
export const getAdjacentPositions = (gridX: number, gridY: number): [number, number][] => {
  return [
    [gridX + 1, gridY],
    [gridX - 1, gridY],
    [gridX, gridY + 1],
    [gridX, gridY - 1]
  ];
};

/**
 * Interface for drawing connection lines
 */
export interface ConnectionDrawingOptions {
  cellDimension: number;
  group: d3.Selection<any, unknown, null, undefined>;
  lineWidth?: number;
  color?: string;
  opacity?: number;
  drawMarkers?: boolean;
  markerRadius?: number;
  cells: string[];
  gridWidth: number;
  gridHeight: number;
  player: PlayerIndex;
}

/**
 * Draws connection lines between adjacent cells for a component
 * Returns a Set of processed edges
 */
export const drawComponentConnections = (options: ConnectionDrawingOptions): Set<string> => {
  const {
    cellDimension,
    group,
    lineWidth = cellDimension * 0.005, // Default thin line
    color = '#888888', // Default gray color
    opacity = 1.0,
    drawMarkers = true,
    markerRadius = cellDimension * 0.05,
    cells,
    gridWidth,
    gridHeight,
    player
  } = options;

  const processedEdges = new Set<string>();
  const cellsSet = new Set(cells);

  cells.forEach(cellKey => {
    const [gridX, gridY] = parsePositionKey(cellKey);
    
    // Get cell center coordinates
    const cellCenterX = gridX * cellDimension + cellDimension / 2;
    const cellCenterY = gridY * cellDimension + cellDimension / 2;
    
    // Check neighbors of the same component
    const adjacentPositions = getAdjacentPositions(gridX, gridY);
    adjacentPositions.forEach(([adjX, adjY]) => {
      if (adjX >= 0 && adjX < gridWidth && adjY >= 0 && adjY < gridHeight) {
        const adjKey = createPositionKey(adjX, adjY);
        const edgeKey = cellKey < adjKey ? `${cellKey}-${adjKey}` : `${adjKey}-${cellKey}`;
        
        // Skip if already processed or not in the component
        if (processedEdges.has(edgeKey) || !cellsSet.has(adjKey)) {
          return;
        }
        
        processedEdges.add(edgeKey);
        
        const adjCenterX = adjX * cellDimension + cellDimension / 2;
        const adjCenterY = adjY * cellDimension + cellDimension / 2;
        
        // Draw line connecting centers of cells
        group.append('line')
          .attr('class', `connection-line player-${player}`)
          .attr('x1', cellCenterX)
          .attr('y1', cellCenterY)
          .attr('x2', adjCenterX)
          .attr('y2', adjCenterY)
          .attr('stroke', color)
          .attr('stroke-width', lineWidth)
          .attr('stroke-opacity', opacity);
        
        // Add connection markers (small circles) at endpoints if requested
        if (drawMarkers) {
          group.append('circle')
            .attr('class', 'connection-marker')
            .attr('cx', cellCenterX)
            .attr('cy', cellCenterY)
            .attr('r', markerRadius)
            .attr('fill', '#ffffff')
            .attr('stroke', color)
            .attr('stroke-width', 0.1);
          
          group.append('circle')
            .attr('class', 'connection-marker')
            .attr('cx', adjCenterX)
            .attr('cy', adjCenterY)
            .attr('r', markerRadius)
            .attr('fill', '#ffffff')
            .attr('stroke', color)
            .attr('stroke-width', 0.1);
        }
      }
    });
  });

  return processedEdges;
}; 