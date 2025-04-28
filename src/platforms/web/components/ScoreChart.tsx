/**
 * src/platforms/web/components/ScoreChart.tsx - Score History Visualization
 * 
 * React component that visualizes the score history of both players as a line chart
 * using D3.js. Features player-specific line colors, dynamic scaling with a logarithmic 
 * y-axis scale, and responsive design that adapts to container size changes in real-time.
 * The chart helps players understand the impact of their moves and the game's progression 
 * over time.
 * 
 * Technical features:
 * - Uses ResizeObserver to dynamically respond to any container size changes
 * - Reacts to CSS variable updates (like --score-chart-height) without page refresh
 * - Implements logarithmic y-axis scale for better visualization of score differences
 * - Uses percentage-based margins that scale with container size
 * - Maintains chart stability during updates with calculated dimensions
 * 
 * Relationships:
 * - Complements the ScoreDisplay component by showing historical progression
 * 
 * Revision Log:
 * - Changed y-axis to logarithmic scale for better visualization of score differences
 * - Improved chart initialization to prevent resizing during updates
 * - Added responsive sizing while maintaining chart stability
 * - Made chart fully responsive using available width and height
 * - Changed from fixed pixel margins to percentage-based margins
 *  
 */

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { useSelector } from 'react-redux';
import { PlayerIndex, RootState } from '@core';

// Default chart margins as percentages of container dimensions
const CHART_MARGIN_PERCENTAGES = { top: 5, right: 7, bottom: 15, left: 10 };
// Minimum value for log scale (since log(0) is undefined)
const MIN_LOG_VALUE = 1;

const ScoreChart: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<{ initialized: boolean }>({ initialized: false });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  const scoreHistory1 = useSelector((state: RootState) => state.game.scoreHistory1);
  const scoreHistory2 = useSelector((state: RootState) => state.game.scoreHistory2);
  const playerColors = ["#00FF00", "#1E90FF"];

  // Update dimensions when container size changes using ResizeObserver for robustness
  useEffect(() => {
    if (!containerRef.current) return;

    // Set initial size
    setDimensions({
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    });

    // Observe size changes (works even when they are triggered by CSS variable updates)
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    resizeObserver.observe(containerRef.current);

    // Cleanup on unmount
    return () => resizeObserver.disconnect();
  }, []);

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
    
    // Create scales - x is still linear, but y is now logarithmic
    const xScale = d3.scaleLinear().domain([0, Math.max(1, numTurns)]).range([0, innerWidth]);
    // Use scaleLog for y-axis with a safe minimum value
    const yScale = d3.scaleLog()
      .domain([Math.max(MIN_LOG_VALUE, 1), Math.max(MIN_LOG_VALUE + 1, maxScore)])
      .range([innerHeight, 0])
      .nice();
    
    // Modify line generator to handle zero values (convert to MIN_LOG_VALUE)
    const lineGenerator = d3.line<number>()
      .x((d: number, i: number) => xScale(i))
      .y((d: number) => yScale(Math.max(MIN_LOG_VALUE, d)));
    
    // Process data to handle zero values (convert to MIN_LOG_VALUE for rendering)
    const processScoreHistory = (history: number[]) => {
      if (history.length === 0) return [MIN_LOG_VALUE, MIN_LOG_VALUE];
      return history.map(score => Math.max(MIN_LOG_VALUE, score));
    };
    
    const renderHistory1 = processScoreHistory(scoreHistory1);
    const renderHistory2 = processScoreHistory(scoreHistory2);
    
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
    
    // Get the actual domain max after applying .nice()
    const yDomainMax = yScale.domain()[1] as number;
    
    // Generate power-of-2 tick values (2, 4, 8, 16, 32, ...) based on the actual scale domain
    const generatePowerOfTwoTicks = (max: number) => {
      const ticks = [];
      let value = 2; // Start with 2
      while (value <= max) {
        ticks.push(value);
        value *= 2; // Double for next power of 2
      }
      return ticks;
    };
    
    // Create y-axis with power-of-2 tick values based on actual domain
    const yAxis = d3.axisLeft(yScale)
      .tickValues(generatePowerOfTwoTicks(yDomainMax))
      .tickFormat((d) => d3.format('d')(d)); // Format as integers
    
    svg.select('.x-axis').call(xAxis as any);
    svg.select('.y-axis').call(yAxis as any);
    
  }, [dimensions, scoreHistory1, scoreHistory2, playerColors]);

  return (
    <div id="score-chart-container" ref={containerRef}>
      <svg id="score-chart" ref={svgRef}></svg>
    </div>
  );
};

export default ScoreChart; 