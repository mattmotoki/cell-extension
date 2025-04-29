/**
 * src/platforms/web/components/GameBoard.tsx - Game Board Visualization
 * 
 * React component that renders the interactive game board using D3.js for SVG manipulation.
 * Provides visual representation of the game state and handles user interactions with the board.
 * 
 * Relationships:
 * - Utilizes gameBoardAnnotations for scoring visualizations and connecting lines
 * - Utilizes GridLines for rendering the grid
 * - Utilizes Cells for rendering the occupied cells
 * 
 * Revision Log:
 * - Refactored scoring mechanism visualizations into separate subcomponents
 * - Replaced console.log calls with custom logger utility
 * - Moved connection line drawing to shared utility
 * - Moved grid lines rendering and cell rendering to separate components
 * - Added extension rectangles to visualize cell extensions
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

import { createLogger } from '../../../utils/logger';
// Import player colors from the theme
import { players } from '../../../shared/styles/theme/colors';

import {
  MultiplicationAnnotation,
  ConnectionAnnotation,
  ExtensionAnnotation,
  GridLines,
  Cells,
  orderCellsLeftToRight,
  getAdjacentPositions,
  drawExtension
} from './gameBoardAnnotations';

// Create module-specific logger
const logger = createLogger('GameBoard');

const GameBoard: React.FC = () => { // No props needed directly
  const svgRef = useRef<SVGSVGElement>(null);
  
  // Select necessary state from Redux using RootState
  const boardState = useSelector((state: RootState) => state.game.boardState);
  const currentPlayer = useSelector((state: RootState) => state.game.currentPlayer);
  const gameProgress = useSelector((state: RootState) => state.game.progress);
  const settings = useSelector((state: RootState) => state.settings);
  const scoringMechanism = useSelector((state: RootState) => state.settings.scoringMechanism);
  const playerColors = [players.player1, players.player2]; // Use consistent player colors from theme
  
  // Use AppDispatch type
  const dispatch = useDispatch<AppDispatch>();

  // Destructure boardState safely
  const { occupiedCells, gridWidth, gridHeight } = boardState || { occupiedCells: [{}, {}], gridWidth: 6, gridHeight: 6 }; // Provide default if boardState is null/undefined initially
  const [isGridInitialized, setIsGridInitialized] = useState(false);
  
  // Calculate dimensions - handle potential division by zero if gridWidth is 0
  const gridDimension = 100; // Logical size for viewBox
  const cellDimension = gridWidth > 0 ? gridDimension / gridWidth : 0;
  const cellPadding = 0.0; 
  const cellRadius = cellDimension * 0.15; // Rounded corners radius

  // Use dispatch to handle cell clicks - use placeMove from @core
  const handleCellClick = useCallback((coords: Coordinates) => {
     if (gameProgress === 'playing') {
        // Allow click if it's a two-player game OR if it's player 0's turn in AI mode
        if (settings.playerMode === 'user' || currentPlayer === 0) {
             dispatch(placeMove({ coords, settings })); // Dispatch action from @core
        } else {
            logger.debug("Not human player's turn (in AI mode).");
        }
    } else {
        logger.debug("Cannot place move, game state is:", gameProgress);
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

    // Render grid lines using the GridLines component
    GridLines({
      gridWidth,
      gridHeight,
      gridDimension,
      cellDimension,
      group: gridGroup
    });
    
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
        // Sort the cells using the utility function for consistent ordering
        components.push(orderCellsLeftToRight(component));
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
    
    // Render cells using the Cells component
    Cells({
      occupiedCells,
      playerColors,
      cellDimension,
      cellPadding,
      cellRadius,
      group: cellsGroup
    });

    // Get connected components for each player
    const components1 = getConnectedComponents(0, occupiedCells[0]);
    const components2 = getConnectedComponents(1, occupiedCells[1]);
    const allComponents = [
      ...components1.map(comp => ({ player: 0 as PlayerIndex, cells: comp })),
      ...components2.map(comp => ({ player: 1 as PlayerIndex, cells: comp }))
    ];
    
    // First, draw extension rectangles for all components regardless of scoring mechanism
    // Create a separate group for extensions to ensure proper layering
    const extensionsGroup = svg.select('#scoring-visuals-group').append('g').attr('id', 'extensions-group');
    
    allComponents.forEach(({ player, cells }) => {
      if (cells.length <= 1) return; // Skip isolated cells
      
      // Create a set for quick lookups
      const cellsSet = new Set(cells);
      
      // Find connected cells (those with at least one adjacent cell in the same component)
      const connectedCells: string[] = [];
      
      cells.forEach(cellKey => {
        const [gridX, gridY] = parsePositionKey(cellKey);
        let hasConnection = false;
        
        // Check if this cell has any adjacent cells in the same component
        const adjacentPositions = getAdjacentPositions(gridX, gridY);
        for (const [adjX, adjY] of adjacentPositions) {
          if (adjX >= 0 && adjX < gridWidth && adjY >= 0 && adjY < gridHeight) {
            const adjKey = createPositionKey(adjX, adjY);
            if (cellsSet.has(adjKey)) {
              hasConnection = true;
              connectedCells.push(cellKey);
              break;
            }
          }
        }
      });
      
      // Draw extension rectangles for connected cells
      if (connectedCells.length > 1) {
        drawExtension({
          cellDimension,
          group: extensionsGroup,
          cells: connectedCells,
          gridWidth, 
          gridHeight,
          player,
          playerColors,
          cellPadding,
          cellRadius
        });
      }
    });

    // Use the appropriate subcomponent based on the scoring mechanism
    if (scoringMechanism === 'cell-multiplication') {
      // Use MultiplicationAnnotation component
      const annotationProps = {
        components: allComponents,
        cellDimension,
        scoringVisualsGroup,
        gridWidth,
        gridHeight,
        playerColors
      };
      MultiplicationAnnotation(annotationProps);
    } 
    else if (scoringMechanism === 'cell-connection') {
      // Use ConnectionAnnotation component
      const annotationProps = {
        components: allComponents,
        cellDimension,
        scoringVisualsGroup,
        gridWidth,
        gridHeight,
        playerColors
      };
      ConnectionAnnotation(annotationProps);
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
        cellRadius,
        playerColors
      };
      ExtensionAnnotation(annotationProps);
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