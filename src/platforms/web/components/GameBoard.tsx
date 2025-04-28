/**
 * src/platforms/web/components/GameBoard.tsx - Game Board Visualization
 * 
 * React component that renders the interactive game board using D3.js for SVG manipulation.
 * Provides visual representation of the game state and handles user interactions with the board.
  * 
 * Relationships:
 * 
 * Revision Log:
 * - Refactored scoring mechanism visualizations into separate subcomponents
 * 
 */

import React, { useRef, useEffect, useCallback, useState } from 'react';
import * as d3 from 'd3'; // Import d3
import { useSelector, useDispatch } from 'react-redux'; // Import Redux hooks
// Import all necessary core items from the main @core index
import {
    RootState,
    AppDispatch,
    BoardState,
    PlayerIndex,
    Coordinates,
    GameSettings,
    ScoringMechanism,
    createPositionKey, // Utility function
    parsePositionKey,  // Utility function
    placeMove          // Action creator
} from '@core';

// Import scoring mechanism subcomponents
import {
  MultiplicationAnnotation,
  ConnectionAnnotation,
  ExtensionAnnotation
} from './gameBoardAnnotations';


// const GameBoard: React.FC<GameBoardProps> = ({ boardState, currentPlayer, onCellClick, playerColors }) => {
const GameBoard: React.FC = () => { // No props needed directly
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Select necessary state from Redux using RootState
  const boardState = useSelector((state: RootState) => state.game.boardState);
  const currentPlayer = useSelector((state: RootState) => state.game.currentPlayer);
  const gameProgress = useSelector((state: RootState) => state.game.progress);
  const settings = useSelector((state: RootState) => state.settings);
  const scoringMechanism = useSelector((state: RootState) => state.settings.scoringMechanism);
  const playerColors = ["#00FF00", "#1E90FF"]; // TODO: Move to config/theme
  
  // Use AppDispatch type
  const dispatch = useDispatch<AppDispatch>();

  // Destructure boardState safely
  const { occupiedCells, gridWidth, gridHeight } = boardState || { occupiedCells: [{}, {}], gridWidth: 6, gridHeight: 6 }; // Provide default if boardState is null/undefined initially
  const [isGridInitialized, setIsGridInitialized] = useState(false);
  
  // Calculate dimensions - handle potential division by zero if gridWidth is 0
  const gridDimension = 100; // Logical size for viewBox
  const cellDimension = gridWidth > 0 ? gridDimension / gridWidth : 0;
  const cellPadding = 0.05; 
  const cellRadius = cellDimension * 0.15; // Rounded corners radius

  // Use dispatch to handle cell clicks - use placeMove from @core
  const handleCellClick = useCallback((coords: Coordinates) => {
     if (gameProgress === 'playing') {
        // Allow click if it's a two-player game OR if it's player 0's turn in AI mode
        if (settings.playerMode === 'user' || currentPlayer === 0) {
             dispatch(placeMove({ coords, settings })); // Dispatch action from @core
        } else {
            console.log("Not human player's turn (in AI mode).");
        }
    } else {
        console.log("Cannot place move, game state is:", gameProgress);
    }
  }, [gameProgress, currentPlayer, settings, dispatch]);

  // Memoize the SVG click handler
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
    
    if (gridX >= 0 && gridX < gridWidth && gridY >= 0 && gridY < gridHeight) {
         handleCellClick({ gridX, gridY }); // Call internal handler
    }

  }, [handleCellClick, cellDimension, gridWidth, gridHeight]);

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
    if (!svg.select('#scoring-visuals-group').empty()) {
      svg.select('#scoring-visuals-group').remove();
    }
    
    const gridGroup = svg.append('g').attr('id', 'grid-group');
    svg.append('g').attr('id', 'cells-group');
    svg.append('g').attr('id', 'lines-group');
    svg.append('g').attr('id', 'scoring-visuals-group');

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

  // Helper function to get adjacent positions
  const getAdjacentPositions = (gridX: number, gridY: number): [number, number][] => {
    return [
      [gridX + 1, gridY],
      [gridX - 1, gridY],
      [gridX, gridY + 1],
      [gridX, gridY - 1]
    ];
  };

  // Helper function to identify connected components for a player
  const getConnectedComponents = (playerIndex: PlayerIndex, cells: Record<string, boolean>): string[][] => {
    const visited = new Set<string>();
    const components: string[][] = [];
    
    const dfs = (posKey: string, component: string[]) => {
      visited.add(posKey);
      component.push(posKey);
      
      const [gridX, gridY] = parsePositionKey(posKey);
      const adjacentPositions = getAdjacentPositions(gridX, gridY);
      
      adjacentPositions.forEach(([adjX, adjY]) => {
        if (adjX >= 0 && adjX < gridWidth && adjY >= 0 && adjY < gridHeight) {
          const adjKey = createPositionKey(adjX, adjY);
          if (cells[adjKey] && !visited.has(adjKey)) {
            dfs(adjKey, component);
          }
        }
      });
    };
    
    Object.keys(cells).forEach(posKey => {
      if (!visited.has(posKey)) {
        const component: string[] = [];
        dfs(posKey, component);
        components.push(component);
      }
    });
    
    return components;
  };

  // Effect for updating dynamic elements (cells and connections)
  useEffect(() => {
    if (!svgRef.current || !isGridInitialized) return;
    
    const svg = d3.select(svgRef.current);
    const cellsGroup = svg.select('#cells-group');
    const linesGroup = svg.select('#lines-group');
    const scoringVisualsGroup = svg.select('#scoring-visuals-group');
    
    // Clear only the dynamic elements (cells, lines, and scoring visuals)
    cellsGroup.selectAll('*').remove();
    linesGroup.selectAll('*').remove();
    scoringVisualsGroup.selectAll('*').remove();
        
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
        .attr('stroke', 'none'); // Remove border

    // Draw connection lines between adjacent cells from the same player
    const processedEdges = new Set<string>(); // Track processed edges
    
    allOccupied.forEach((cell: CellData) => {
      const { gridX, gridY, player } = cell;
      
      // Define potential neighbors (adjacent cells)
      const potentialNeighbors = getAdjacentPositions(gridX, gridY);
      
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
          
          // Draw line connecting centers of cells - MAKE THINNER
          linesGroup.append('line')
            .attr('class', `connection-line player-${player}`)
            .attr('x1', cellCenterX)
            .attr('y1', cellCenterY)
            .attr('x2', adjCenterX)
            .attr('y2', adjCenterY)
            .attr('stroke', '#888888') // Gray color for all connections
            .attr('stroke-width', cellDimension * 0.005) // Thinner connection lines (reduced from 0.01)
            .attr('stroke-opacity', 1.0); // Fully opaque
          
          // Add connection markers (small circles) at endpoints
          linesGroup.append('circle')
            .attr('class', 'connection-marker')
            .attr('cx', cellCenterX)
            .attr('cy', cellCenterY)
            .attr('r', cellDimension * 0.05) // Slightly smaller circles
            .attr('fill', '#ffffff')
            .attr('stroke', '#888888') // Gray stroke
            .attr('stroke-width', 0.5);
          
          linesGroup.append('circle')
            .attr('class', 'connection-marker')
            .attr('cx', adjCenterX)
            .attr('cy', adjCenterY)
            .attr('r', cellDimension * 0.05) // Slightly smaller circles
            .attr('fill', '#ffffff')
            .attr('stroke', '#888888') // Gray stroke
            .attr('stroke-width', 0.5);
        }
      });
    });

    // --- Add scoring mechanism-specific visual aids using subcomponents ---
    // Get connected components for each player
    const components1 = getConnectedComponents(0, occupiedCells[0]);
    const components2 = getConnectedComponents(1, occupiedCells[1]);
    const allComponents = [
      ...components1.map(comp => ({ player: 0 as PlayerIndex, cells: comp })),
      ...components2.map(comp => ({ player: 1 as PlayerIndex, cells: comp }))
    ];

    // Use the appropriate subcomponent based on the scoring mechanism
    let cellsWithText = new Set<string>();
    
    if (scoringMechanism === 'cell-multiplication') {
      // Use MultiplicationAnnotation component
      const annotationProps = {
        components: allComponents,
        cellDimension,
        scoringVisualsGroup
      };
      const annotationComponent = MultiplicationAnnotation(annotationProps);
      cellsWithText = annotationComponent as Set<string>;
    } 
    else if (scoringMechanism === 'cell-connection') {
      // Use ConnectionAnnotation component
      const annotationProps = {
        components: allComponents,
        cellDimension,
        scoringVisualsGroup,
        gridWidth,
        gridHeight
      };
      const annotationComponent = ConnectionAnnotation(annotationProps);
      cellsWithText = annotationComponent as Set<string>;
    }
    else if (scoringMechanism === 'cell-extension') {
      // Use ExtensionAnnotation component
      const annotationProps = {
        components: allComponents,
        cellDimension,
        scoringVisualsGroup,
        gridWidth,
        gridHeight,
        cellPadding,
        cellRadius
      };
      const annotationComponent = ExtensionAnnotation(annotationProps);
      cellsWithText = annotationComponent as Set<string>;
    }

    // Remove circles at positions that have text indicators
    if (cellsWithText.size > 0) {
      // Remove circles at positions that will have text
      linesGroup.selectAll('circle.connection-marker').each(function() {
        const circle = d3.select(this);
        const cx = parseFloat(circle.attr('cx'));
        const cy = parseFloat(circle.attr('cy'));
        
        // Determine which cell this circle is in
        const gridX = Math.floor(cx / cellDimension);
        const gridY = Math.floor(cy / cellDimension);
        const cellKey = createPositionKey(gridX, gridY);
        
        // If this cell will have text, remove the circle
        if (cellsWithText.has(cellKey)) {
          circle.remove();
        }
      });
    }

    // Re-add click listener (in case it got removed)
    svg.on('click', handleSvgClick);
    
  }, [boardState, playerColors, currentPlayer, cellDimension, cellPadding, cellRadius, handleSvgClick, isGridInitialized, gridWidth, gridHeight, scoringMechanism]);

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