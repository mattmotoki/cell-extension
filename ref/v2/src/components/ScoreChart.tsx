import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { PlayerIndex } from '../types';

interface ScoreChartProps {
  scoreHistory1: number[];
  scoreHistory2: number[];
  currentPlayer: PlayerIndex;
  playerColors: string[];
}

const ScoreChart: React.FC<ScoreChartProps> = ({ scoreHistory1, scoreHistory2, currentPlayer, playerColors }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    
    // Get dimensions from container
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight || 100; // Default height if not set

    // Margins
    const margin = { top: 10, right: 20, bottom: 20, left: 30 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    
    // Clear previous render
    svg.selectAll('*').remove();

    // Create main group with margins
    const mainGroup = svg
        .attr('width', containerWidth)
        .attr('height', containerHeight)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    // Determine max score and number of turns for scales
    const maxScore = Math.max(10, d3.max(scoreHistory1) ?? 0, d3.max(scoreHistory2) ?? 0); // Ensure minimum height
    const numTurns = Math.max(scoreHistory1.length - 1, 0);

    // Scales
    const xScale = d3.scaleLinear()
      .domain([0, numTurns])
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, maxScore])
      .range([height, 0]); // Inverted for SVG Y-axis

    // Line generator
    const lineGenerator = d3.line<number>()
      .x((d, i) => xScale(i))
      .y(d => yScale(d));

    // Draw lines
    mainGroup.append('path')
      .datum(scoreHistory1)
      .attr('fill', 'none')
      .attr('stroke', playerColors[0])
      .attr('stroke-width', 1.5)
      .attr('d', lineGenerator);

    mainGroup.append('path')
      .datum(scoreHistory2)
      .attr('fill', 'none')
      .attr('stroke', playerColors[1])
      .attr('stroke-width', 1.5)
      .attr('d', lineGenerator);

    // Draw Axes
    const xAxis = d3.axisBottom(xScale).ticks(Math.min(numTurns, 10)).tickFormat(d3.format('d'));
    const yAxis = d3.axisLeft(yScale).ticks(5);

    mainGroup.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis);

    mainGroup.append('g')
      .call(yAxis);
      
    // Optional: Highlight current player's line end point
    // ... add logic if desired ...

  }, [scoreHistory1, scoreHistory2, playerColors]); // Re-render if history or colors change

  return (
    // Use a div container to get width/height for the SVG
    <div id="score-chart-container" ref={containerRef} style={{ width: '100%', height: '150px' }}> 
      <svg id="score-chart" ref={svgRef}></svg>
    </div>
  );
};

export default ScoreChart; 