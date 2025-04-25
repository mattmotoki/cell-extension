import React, { useRef, useEffect, useCallback, useState } from 'react';
import * as d3 from 'd3'; // Import d3
import { BoardState, PlayerIndex, Coordinates } from '../types';
import { createPositionKey, parsePositionKey } from '../logic/board/GameBoardLogic';

interface GameBoardProps {
  boardState: BoardState;
  currentPlayer: PlayerIndex;
  onCellClick: (coords: Coordinates) => void;
  playerColors: string[];
}

const GameBoard: React.FC<GameBoardProps> = ({ boardState, currentPlayer, onCellClick, playerColors }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const { occupiedCells, gridWidth, gridHeight } = boardState;
  const [isGridInitialized, setIsGridInitialized] = useState(false);
  
  // Calculate dimensions based on grid size
  const gridDimension = 100; // Logical size
  const cellDimension = gridDimension / gridWidth;
  const cellPadding = 0.05; // 5% padding (from original implementation)
  const cellRadius = cellDimension * 0.15; // Rounded corners radius

  // Memoize the click handler to avoid re-binding if not necessary
  const handleSvgClick = useCallback((event: MouseEvent) => {
    if (!svgRef.current) return;

    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;
    
    // Transform screen coordinates to SVG coordinates
    const pointTransformed = svgPoint.matrixTransform(svgRef.current.getScreenCTM()?.inverse());

    // Calculate grid coordinates from SVG coordinates
    const gridX = Math.floor(pointTransformed.x / cellDimension);
    const gridY = Math.floor(pointTransformed.y / cellDimension);
    
    // Call the passed handler if coordinates are valid
    if (gridX >= 0 && gridX < gridWidth && gridY >= 0 && gridY < gridHeight) {
         onCellClick({ gridX, gridY });
    }

  }, [onCellClick, cellDimension, gridWidth, gridHeight]);

  // Effect for grid initialization - runs only once per grid size change
  useEffect(() => {
    if (!svgRef.current || isGridInitialized) return;
    
    const svg = d3.select(svgRef.current);
    
    // Initialize SVG and set its viewBox
    svg.attr('viewBox', `0 0 ${gridDimension} ${gridDimension}`)
       .attr('preserveAspectRatio', 'xMidYMid meet');
    
    // Create the groups - do this only once
    if (!svg.select('#grid-group').empty()) {
      svg.select('#grid-group').remove();
    }
    if (!svg.select('#cells-group').empty()) {
      svg.select('#cells-group').remove();
    }
    if (!svg.select('#lines-group').empty()) {
      svg.select('#lines-group').remove();
    }
    
    const gridGroup = svg.append('g').attr('id', 'grid-group');
    svg.append('g').attr('id', 'cells-group');
    svg.append('g').attr('id', 'lines-group');

    // --- Render Grid Lines Only (subtle) ---
    // Vertical lines
    gridGroup.selectAll('.vline')
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
    gridGroup.selectAll('.hline')
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
    
    // Add click listener to the SVG element itself
    svg.on('click', handleSvgClick);
    
    setIsGridInitialized(true);
    
    // Return cleanup function
    return () => {
      setIsGridInitialized(false);
    };
  }, [gridWidth, gridHeight, gridDimension, cellDimension, handleSvgClick]);

  // Effect for updating dynamic elements (cells and connections)
  useEffect(() => {
    if (!svgRef.current || !isGridInitialized) return;
    
    const svg = d3.select(svgRef.current);
    const cellsGroup = svg.select('#cells-group');
    const linesGroup = svg.select('#lines-group');
    
    // Clear only the dynamic elements (cells and lines)
    cellsGroup.selectAll('*').remove();
    linesGroup.selectAll('*').remove();
        
    // --- Render Occupied Cells ---
    interface CellData {
        key: string;
        player: PlayerIndex;
        gridX: number;
        gridY: number;
    }
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

    // Render player cells with rounded corners and proper styling
    cellsGroup.selectAll<SVGRectElement, CellData>('.player-cell')
        .data(allOccupied, (d: CellData) => d.key)
        .enter()
        .append('rect')
        .attr('class', (d: CellData) => `player-cell player-${d.player}`)
        .attr('x', (d: CellData) => d.gridX * cellDimension + (cellDimension * cellPadding / 2))
        .attr('y', (d: CellData) => d.gridY * cellDimension + (cellDimension * cellPadding / 2))
        .attr('width', cellDimension * (1 - cellPadding))
        .attr('height', cellDimension * (1 - cellPadding))
        .attr('rx', cellRadius) // Rounded corners like original
        .attr('ry', cellRadius) // Rounded corners like original
        .attr('fill', (d: CellData) => playerColors[d.player])
        .attr('stroke', (d: CellData) => {
          const darkColor = d3.color(playerColors[d.player])?.darker(0.5);
          return darkColor ? darkColor.toString() : '#555'; // Provide fallback color
        })
        .attr('stroke-width', 0.8);

    // Draw connection lines between adjacent cells from the same player
    const processedEdges = new Set<string>(); // Track processed edges
    
    allOccupied.forEach((cell: CellData) => {
      const { gridX, gridY, player } = cell;
      
      // Define potential neighbors (adjacent cells)
      const potentialNeighbors = [
        [gridX + 1, gridY], [gridX - 1, gridY],
        [gridX, gridY + 1], [gridX, gridY - 1]
      ];
      
      // Get cell center coordinates
      const cellCenterX = gridX * cellDimension + cellDimension / 2;
      const cellCenterY = gridY * cellDimension + cellDimension / 2;
      
      // Check neighbors of the same player and draw connections
      potentialNeighbors.forEach(([adjX, adjY]) => {
        if (adjX >= 0 && adjX < gridWidth && adjY >= 0 && adjY < gridHeight) {
          const adjKey = createPositionKey(adjX, adjY);
          const fromKey = createPositionKey(gridX, gridY);
          const edgeKey = fromKey < adjKey ? `${fromKey}-${adjKey}` : `${adjKey}-${fromKey}`;
          
          // Skip if already processed or not occupied by same player
          if (processedEdges.has(edgeKey) || !occupiedCells[player][adjKey]) {
            return;
          }
          
          processedEdges.add(edgeKey);
          
          const adjCenterX = adjX * cellDimension + cellDimension / 2;
          const adjCenterY = adjY * cellDimension + cellDimension / 2;
          
          // Draw line connecting centers of cells
          linesGroup.append('line')
            .attr('class', `connection-line player-${player}`)
            .attr('x1', cellCenterX)
            .attr('y1', cellCenterY)
            .attr('x2', adjCenterX)
            .attr('y2', adjCenterY)
            .attr('stroke', (d) => {
              const darkColor = d3.color(playerColors[player])?.darker(0.3);
              return darkColor ? darkColor.toString() : '#555';
            })
            .attr('stroke-width', cellDimension * 0.1) // Proportional line thickness
            .attr('stroke-opacity', 0.6); // Semi-transparent like original
          
          // Add connection markers (small circles) at endpoints
          linesGroup.append('circle')
            .attr('class', 'connection-marker')
            .attr('cx', cellCenterX)
            .attr('cy', cellCenterY)
            .attr('r', cellDimension * 0.1)
            .attr('fill', '#ffffff')
            .attr('stroke', (d) => {
              const darkColor = d3.color(playerColors[player])?.darker(0.5);
              return darkColor ? darkColor.toString() : '#555';
            })
            .attr('stroke-width', 0.5);
          
          linesGroup.append('circle')
            .attr('class', 'connection-marker')
            .attr('cx', adjCenterX)
            .attr('cy', adjCenterY)
            .attr('r', cellDimension * 0.1)
            .attr('fill', '#ffffff')
            .attr('stroke', (d) => {
              const darkColor = d3.color(playerColors[player])?.darker(0.5);
              return darkColor ? darkColor.toString() : '#555';
            })
            .attr('stroke-width', 0.5);
        }
      });
    });

    // Re-add click listener (in case it got removed)
    svg.on('click', handleSvgClick);
    
  }, [boardState, playerColors, currentPlayer, cellDimension, cellPadding, cellRadius, handleSvgClick, isGridInitialized, gridWidth, gridHeight]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (svgRef.current) {
        d3.select(svgRef.current).on('click', null);
      }
    };
  }, []);

  return (
    <div id="board-container">
      <svg id="board" ref={svgRef}></svg>
    </div>
  );
};

export default GameBoard; 