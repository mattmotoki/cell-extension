/**
 * src/platforms/web/components/ScoreChart.tsx - Score History Visualization
 * 
 * React component that visualizes the score history of both players as a line chart.
 * Uses D3.js to create a dynamic line chart showing how scores change throughout the game,
 * providing a visual representation of the game's progression and helping players
 * understand the impact of their moves.
 * 
 * Key features:
 * - Line chart visualization of score history
 * - Player-specific line colors matching the game board
 * - Dynamic scaling based on maximum scores
 * - Responsive design that adapts to container size
 * 
 * Technical approach:
 * - D3.js integration for chart rendering
 * - React refs to manage D3 and DOM interactions
 * - Redux state to access score history data
 * - Dynamic axis scaling based on current scores
 * 
 * Relationships:
 * - Retrieves score history data from Redux store
 * - Updates in response to score changes
 * - Visually complements the ScoreDisplay component
 * - Part of the overall game UI in App.tsx
 * 
 * Revision Log:
 * - Improved chart initialization to prevent resizing during updates
 * - Added responsive sizing while maintaining chart stability
 * - Made chart fully responsive using available width and height
 * - Changed from fixed pixel margins to percentage-based margins
 *  
 * Note: This revision log should be updated whenever this file is modified. 
 * Do not use dates in the revision log.
 */

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useSelector } from 'react-redux';
import { PlayerIndex, RootState } from '@core';

// Default chart margins as percentages of container dimensions
const CHART_MARGIN_PERCENTAGES = { top: 5, right: 5, bottom: 10, left: 8 };

const ScoreChart: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<{ initialized: boolean }>({ initialized: false });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const scoreHistory1 = useSelector((state: RootState) => state.game.scoreHistory1);
  const scoreHistory2 = useSelector((state: RootState) => state.game.scoreHistory2);
  const playerColors = ["#00FF00", "#1E90FF"];

  // Update dimensions when container size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({ width: clientWidth, height: clientHeight });
      }
    };

    // Initialize dimensions on mount
    updateDimensions();

    // Add window resize listener
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [dimensions.width, dimensions.height]);

  // Update chart when dimensions or data change
  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !scoreHistory1 || !scoreHistory2 || dimensions.width === 0 || dimensions.height === 0) return;

    const svg = d3.select(svgRef.current);
    const { width, height } = dimensions;
    
    // Calculate actual margin values based on percentages of container dimensions
    const margin = {
      top: Math.round(height * (CHART_MARGIN_PERCENTAGES.top / 100)),
      right: Math.round(width * (CHART_MARGIN_PERCENTAGES.right / 100)),
      bottom: Math.round(height * (CHART_MARGIN_PERCENTAGES.bottom / 100)),
      left: Math.round(width * (CHART_MARGIN_PERCENTAGES.left / 100))
    };
    
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create chart structure if not already initialized
    if (!chartRef.current.initialized) {
      svg.attr('width', width).attr('height', height);
      svg.append('g')
        .attr('class', 'chart-container')
        .attr('transform', `translate(${margin.left},${margin.top})`);
      
      // Create axes groups
      svg.select('.chart-container').append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${innerHeight})`);
      
      svg.select('.chart-container').append('g')
        .attr('class', 'y-axis');
      
      // Create player line groups
      svg.select('.chart-container').append('path').attr('class', 'line-player1');
      svg.select('.chart-container').append('path').attr('class', 'line-player2');
      
      chartRef.current.initialized = true;
    } else {
      // Update SVG dimensions if they changed
      svg.attr('width', width).attr('height', height);
      
      // Update container position with new margin values
      svg.select('.chart-container')
        .attr('transform', `translate(${margin.left},${margin.top})`);
      
      // Update x-axis position
      svg.select('.x-axis')
        .attr('transform', `translate(0,${innerHeight})`);
    }

    // Update chart data
    const maxScoreP1 = d3.max(scoreHistory1 as number[]) ?? 0;
    const maxScoreP2 = d3.max(scoreHistory2 as number[]) ?? 0;
    const maxScore = Math.max(10, maxScoreP1, maxScoreP2);
    const numTurns = Math.max(0, scoreHistory1.length > 0 ? scoreHistory1.length - 1 : 0);
    
    // Create scales
    const xScale = d3.scaleLinear().domain([0, Math.max(1, numTurns)]).range([0, innerWidth]);
    const yScale = d3.scaleLinear().domain([0, maxScore]).range([innerHeight, 0]).nice();
    
    // Create line generator
    const lineGenerator = d3.line<number>()
      .x((d: number, i: number) => xScale(i))
      .y((d: number) => yScale(d));
    
    // Ensure we have consistent data rendering by using placeholder data for empty histories
    const renderHistory1 = scoreHistory1.length === 0 ? [0, 0] : scoreHistory1;
    const renderHistory2 = scoreHistory2.length === 0 ? [0, 0] : scoreHistory2;
    
    // Update player lines
    svg.select('.line-player1')
      .datum(renderHistory1)
      .attr('fill', 'none')
      .attr('stroke', playerColors[0])
      .attr('stroke-width', 1.5)
      .attr('d', lineGenerator);
    
    svg.select('.line-player2')
      .datum(renderHistory2)
      .attr('fill', 'none')
      .attr('stroke', playerColors[1])
      .attr('stroke-width', 1.5)
      .attr('d', lineGenerator);
    
    // Update axes
    const xAxis = numTurns <= 1 
      ? d3.axisBottom(xScale).tickValues([0, 1]).tickFormat(d3.format('d'))
      : d3.axisBottom(xScale).ticks(Math.min(numTurns, 10)).tickFormat(d3.format('d'));
    const yAxis = d3.axisLeft(yScale).ticks(5);
    
    svg.select('.x-axis').call(xAxis as any);
    svg.select('.y-axis').call(yAxis as any);
    
  }, [dimensions, scoreHistory1, scoreHistory2, playerColors]);

  return (
    <div id="score-chart-container" ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg id="score-chart" ref={svgRef}></svg>
    </div>
  );
};

export default ScoreChart; 