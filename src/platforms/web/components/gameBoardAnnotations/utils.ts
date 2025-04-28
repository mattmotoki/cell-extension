/**
 * utils.ts
 * 
 * Utility functions for game board annotations that handle connections, edge management,
 * and visualization of game components.
 * 
 * This file provides the core functionality for:
 * - Getting adjacent positions on a grid
 * - Managing edge keys for connections between cells
 * - Ordering edges using various traversal strategies
 * - Drawing connection lines, markers, and other visual elements
 * 
 * The traversal algorithm is particularly important for consistent edge numbering
 * in the ExtensionAnnotation component, where edges are numbered based on their
 * discovery order starting from the leftmost node.
 * 
 * Related files:
 * - ExtensionAnnotation.tsx: Uses these utilities to visualize extension scoring
 * - ConnectionAnnotation.tsx: Uses these utilities to visualize connection scoring
 * - MultiplicationAnnotation.tsx: Uses these utilities to visualize multiplication scoring
 */

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
 * Orders cells by position (left to right, top to bottom)
 * This is the standard ordering used in multiplication scoring
 * 
 * @param cells Array of cell position keys
 * @returns A new array with cells ordered left to right, top to bottom
 */
export const orderCellsLeftToRight = (cells: string[]): string[] => {
  return [...cells].sort((a, b) => {
    const [x1, y1] = parsePositionKey(a);
    const [x2, y2] = parsePositionKey(b);
    // First priority: x-coordinate (ascending)
    if (x1 !== x2) return x1 - x2;
    // Second priority: y-coordinate (ascending)
    return y1 - y2;
  });
};

/**
 * Orders edges based on a depth-first traversal starting from the leftmost node.
 * Prioritizes nodes with smaller y-values, then smaller x-values during traversal.
 * 
 * This produces a consistent top-to-bottom, left-to-right traversal pattern that
 * makes the edge numbering more intuitive and readable.
 */
export const orderEdgesDepthFirst = (
  cells: string[], 
  gridWidth: number, 
  gridHeight: number,
  processedEdges: Set<string>
): string[] => {
  if (cells.length <= 1) return [];
  
  const cellsSet = new Set(cells);
  
  // Step 1: Find the leftmost node (smallest x, breaking ties with smallest y)
  let rootNode = cells[0];
  let [minX, minY] = parsePositionKey(rootNode);
  
  cells.forEach(cellKey => {
    const [x, y] = parsePositionKey(cellKey);
    
    // Check if this is the leftmost node or a node with same x but smaller y
    if (x < minX || (x === minX && y < minY)) {
      minX = x;
      minY = y;
      rootNode = cellKey;
    }
  });
  
  // Step 2: Build adjacency map with all neighbors connected by an edge
  const adjacencyMap = new Map<string, string[]>();
  
  cells.forEach(cellKey => {
    const [gridX, gridY] = parsePositionKey(cellKey);
    const neighbors: string[] = [];
    
    getAdjacentPositions(gridX, gridY).forEach(([adjX, adjY]) => {
      if (adjX >= 0 && adjX < gridWidth && adjY >= 0 && adjY < gridHeight) {
        const adjKey = createPositionKey(adjX, adjY);
        if (cellsSet.has(adjKey)) {
          // Only add if there's an edge between them
          const edgeKey = createEdgeKey(cellKey, adjKey);
          if (processedEdges.has(edgeKey)) {
            neighbors.push(adjKey);
          }
        }
      }
    });
    
    adjacencyMap.set(cellKey, neighbors);
  });
  
  // Step 3: Create a set of all valid edges
  const allEdges = new Set<string>();
  cells.forEach(cellKey => {
    const neighbors = adjacencyMap.get(cellKey) || [];
    neighbors.forEach(neighbor => {
      const edgeKey = createEdgeKey(cellKey, neighbor);
      if (processedEdges.has(edgeKey)) {
        allEdges.add(edgeKey);
      }
    });
  });
  
  // Step 4: Perform DFS with custom ordering of neighbors
  const visited = new Set<string>();
  const orderedEdges: string[] = [];
  const usedEdges = new Set<string>();
  
  // Helper to mark an edge as used and add it to the result
  const processEdge = (from: string, to: string): void => {
    const edgeKey = createEdgeKey(from, to);
    if (!usedEdges.has(edgeKey) && processedEdges.has(edgeKey)) {
      usedEdges.add(edgeKey);
      orderedEdges.push(edgeKey);
    }
  };
  
  // Custom DFS that prioritizes nodes with smaller y-values, then smaller x-values
  const dfs = (node: string): void => {
    visited.add(node);
    
    const neighbors = adjacencyMap.get(node) || [];
    if (neighbors.length === 0) return;
    
    // Get coordinates for all neighbors
    const neighborsWithCoords = neighbors.map(n => {
      const [x, y] = parsePositionKey(n);
      return { node: n, x, y };
    });
    
    // Sort neighbors by y-value (ascending), then by x-value (ascending)
    const sortedNeighbors = neighborsWithCoords.sort((a, b) => {
      // First priority: y-value (ascending)
      if (a.y !== b.y) return a.y - b.y;
      // Second priority: x-value (ascending)
      return a.x - b.x;
    });
    
    // Process each neighbor in order
    for (const { node: neighbor } of sortedNeighbors) {
      processEdge(node, neighbor);
      
      if (!visited.has(neighbor)) {
        dfs(neighbor);
      }
    }
  };
  
  // Start DFS from the leftmost node
  dfs(rootNode);
  
  // Handle disconnected parts (shouldn't happen with connected components)
  for (const cell of cells) {
    if (!visited.has(cell)) {
      dfs(cell);
    }
  }
  
  // Add any remaining unprocessed edges
  const edgesList = Array.from(allEdges);
  edgesList.forEach(edge => {
    if (!usedEdges.has(edge)) {
      orderedEdges.push(edge);
    }
  });
  
  return orderedEdges;
};

/**
 * Base interface for connection drawing options
 */
export interface BaseConnectionOptions {
  cellDimension: number;
  group: d3.Selection<any, unknown, null, undefined>;
  gridWidth: number;
  gridHeight: number;
  player: PlayerIndex;
  playerColors?: string[]; // Array of player colors
}

/**
 * Interface for drawing connection lines
 */
export interface ConnectionLineOptions extends BaseConnectionOptions {
  cells: string[];
  lineWidth?: number;
  color?: string;
  opacity?: number;
  useDepthFirstOrder?: boolean;
}

/**
 * Interface for drawing markers
 */
export interface MarkerOptions extends Omit<BaseConnectionOptions, 'cells'> {
  cells?: string[]; // Optional cell keys for backward compatibility
  positions?: Array<{x: number, y: number}>; // Optional array of specific marker positions
  markerRadius?: number;
  color?: string;
  fillColor?: string;
  strokeWidth?: number;
  opacity?: number;
}

/**
 * Interface for drawing text labels with background markers
 */
export interface LabelOptions extends Omit<BaseConnectionOptions, 'cells'> {
  positions: Array<{x: number, y: number}>; // Array of positions for labels
  labels: Array<string | number>; // Array of labels corresponding to positions
  markerRadius?: number; // Radius for the background markers
  color?: string; // Stroke color (optional)
  fillColor?: string; // Fill color for markers
  opacity?: number; // Opacity for markers
  strokeWidth?: number; // Stroke width for markers
  fontSize?: number; // Font size for labels
  fontColor?: string; // Text color
  fontWeight?: string; // Font weight
}

/**
 * Draws connection lines between adjacent cells for a component
 * Returns an array of processed edges, either in lexicographical or depth-first order
 */
export const drawConnectionLines = (options: ConnectionLineOptions): string[] => {
  const {
    cellDimension,
    group,
    lineWidth = cellDimension * 0.005, // Default thin line
    color = '#888888', // Default gray color
    opacity = 1.0,
    cells,
    gridWidth,
    gridHeight,
    player,
    useDepthFirstOrder = false
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

  // Return edges in the requested order
  if (useDepthFirstOrder) {
    // Generate edges in traversal order, starting from leftmost node
    return orderEdgesDepthFirst(cells, gridWidth, gridHeight, processedEdges);
  } else {
    // Convert Set to lexicographically sorted Array (original behavior)
    return Array.from(processedEdges).sort();
  }
};

/**
 * Draws marker circles at specified positions or at the center of each cell.
 * If positions are provided, they will be used directly instead of cell centers.
 * Customizable options for marker size, color, and appearance.
 */
export const drawMarkers = (options: MarkerOptions): void => {
  const {
    cellDimension,
    group,
    markerRadius = cellDimension * 0.05,
    color, // Explicit color overrides player color
    fillColor, // Explicit fill color
    strokeWidth = 0.1,
    opacity = 1.0, // Default to fully opaque
    cells,
    player,
    playerColors = ['#ff0000', '#0000ff'], // Default colors if not provided
    positions // Optional specific positions
  } = options;

  // Use provided color or player color from array
  const markerStroke = color || playerColors[player] || '#888888';
  const markerFill = fillColor || markerStroke;

  // If positions are provided, use them directly
  if (positions && positions.length > 0) {
    positions.forEach(({x, y}) => {
      // Draw a marker at the specified position
      group.append('circle')
        .attr('class', `connection-marker player-${player}`)
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', markerRadius)
        .attr('fill', markerFill)
        .attr('fill-opacity', opacity)
        .attr('stroke', markerStroke)
        .attr('stroke-width', strokeWidth);
    });
  } 
  // Otherwise use cell centers (backward compatibility)
  else if (cells && cells.length > 0) {
    cells.forEach(cellKey => {
      const [gridX, gridY] = parsePositionKey(cellKey);
      
      // Calculate cell center
      const centerX = gridX * cellDimension + cellDimension / 2;
      const centerY = gridY * cellDimension + cellDimension / 2;
      
      // Draw a single marker at the cell center
      group.append('circle')
        .attr('class', `connection-marker player-${player}`)
        .attr('cx', centerX)
        .attr('cy', centerY)
        .attr('r', markerRadius)
        .attr('fill', markerFill)
        .attr('fill-opacity', opacity)
        .attr('stroke', markerStroke)
        .attr('stroke-width', strokeWidth);
    });
  }
};

/**
 * Draws text labels with background markers at specified positions.
 * The function draws markers using player colors by default and adds text labels on top.
 * 
 * @param options The configuration options for markers and labels
 */
export const drawLabels = (options: LabelOptions): void => {
  const {
    cellDimension,
    group,
    markerRadius = cellDimension * 0.15, // Default radius for text annotations
    positions,
    labels,
    player,
    playerColors = ['#ff0000', '#0000ff'],
    color, 
    fillColor = playerColors[player] || '#888888', // Default to player color
    opacity = 1.0, 
    strokeWidth = 0,
    fontSize = cellDimension * 0.15,
    fontColor = '#ffffff', // White text by default
    fontWeight = 'bold',
    gridWidth,
    gridHeight
  } = options;

  // Map positions with corresponding labels
  const labelPositions = positions.map((pos, index) => ({
    ...pos,
    label: index < labels.length ? labels[index] : ''
  }));
  
  // Draw markers for all positions
  drawMarkers({
    cellDimension,
    group,
    player,
    playerColors,
    markerRadius,
    fillColor,
    color,
    opacity,
    strokeWidth,
    gridWidth,
    gridHeight,
    positions: labelPositions
  });
  
  // Then add text labels
  labelPositions.forEach(({x, y, label}) => {
    group.append('text')
      .attr('class', `score-indicator player-${player}`)
      .attr('x', x)
      .attr('y', y)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('fill', fontColor)
      .attr('font-weight', fontWeight)
      .attr('font-size', fontSize)
      .attr('stroke', 'none') // No stroke needed with markers
      .text(String(label));
  });
}; 