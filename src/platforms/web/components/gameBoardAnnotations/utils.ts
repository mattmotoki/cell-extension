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
 * Creates a consistent edge key from two cell keys
 * Uses the format '{cell1}<->{cell2}' where cell1 and cell2 are ordered lexicographically
 */
export const createEdgeKey = (cell1: string, cell2: string): string => {
  return cell1 < cell2 ? `${cell1}<->${cell2}` : `${cell2}<->${cell1}`;
};

/**
 * Parses an edge key into its constituent cell keys
 * @param edgeKey Edge key in the format '{cell1}<->{cell2}'
 * @returns An array containing the two cell keys
 */
export const parseEdgeKey = (edgeKey: string): [string, string] => {
  const [cell1, cell2] = edgeKey.split('<->');
  return [cell1, cell2];
};

/**
 * Base interface for connection drawing options
 */
export interface BaseConnectionOptions {
  cellDimension: number;
  group: d3.Selection<any, unknown, null, undefined>;
  cells: string[];
  gridWidth: number;
  gridHeight: number;
  player: PlayerIndex;
}

/**
 * Interface for drawing connection lines
 */
export interface ConnectionLineOptions extends BaseConnectionOptions {
  lineWidth?: number;
  color?: string;
  opacity?: number;
}

/**
 * Interface for drawing connection markers
 */
export interface ConnectionMarkerOptions extends BaseConnectionOptions {
  markerRadius?: number;
  color?: string;
}

/**
 * For backwards compatibility
 */
export interface ConnectionDrawingOptions extends ConnectionLineOptions {
  drawMarkers?: boolean;
  markerRadius?: number;
}

/**
 * Draws connection lines between adjacent cells for a component
 * Returns a Set of processed edges
 */
export const drawConnectionLines = (options: ConnectionLineOptions): Set<string> => {
  const {
    cellDimension,
    group,
    lineWidth = cellDimension * 0.005, // Default thin line
    color = '#888888', // Default gray color
    opacity = 1.0,
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
        // Use the new createEdgeKey function to create a consistent edge key
        const edgeKey = createEdgeKey(cellKey, adjKey);
        
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
      }
    });
  });

  return processedEdges;
};

/**
 * Draws connection markers at the center of each cell
 */
export const drawConnectionMarkers = (options: ConnectionMarkerOptions): void => {
  const {
    cellDimension,
    group,
    markerRadius = cellDimension * 0.05,
    color = '#888888', // Default gray color
    cells,
    player
  } = options;

  // Process each cell directly
  cells.forEach(cellKey => {
    const [gridX, gridY] = parsePositionKey(cellKey);
    
    // Calculate cell center
    const centerX = gridX * cellDimension + cellDimension / 2;
    const centerY = gridY * cellDimension + cellDimension / 2;
    
    // Draw a single marker at the cell center
    group.append('circle')
      .attr('class', 'connection-marker')
      .attr('cx', centerX)
      .attr('cy', centerY)
      .attr('r', markerRadius)
      .attr('fill', '#ffffff')
      .attr('stroke', color)
      .attr('stroke-width', 0.1);
  });
};

/**
 * For backwards compatibility - draws both connection lines and markers
 * Returns a Set of processed edges
 */
export const drawComponentConnections = (options: ConnectionDrawingOptions): Set<string> => {
  const {
    drawMarkers = true,
    ...lineOptions
  } = options;

  // First draw the connection lines
  const processedEdges = drawConnectionLines(lineOptions);
  
  // Then draw the markers if requested
  if (drawMarkers) {
    drawConnectionMarkers(options);
  }
  
  return processedEdges;
}; 