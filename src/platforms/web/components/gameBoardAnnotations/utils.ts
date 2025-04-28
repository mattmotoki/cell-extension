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
  useDepthFirstOrder?: boolean;
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
 * Returns an array of processed edges in requested order
 */
export const drawComponentConnections = (options: ConnectionDrawingOptions): string[] => {
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