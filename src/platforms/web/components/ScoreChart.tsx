import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useSelector } from 'react-redux';
import { PlayerIndex } from '@core/types';
import { RootState } from '@core/store';

const ScoreChart: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const scoreHistory1 = useSelector((state: RootState) => state.game.scoreHistory1);
  const scoreHistory2 = useSelector((state: RootState) => state.game.scoreHistory2);
  const currentPlayer = useSelector((state: RootState) => state.game.currentPlayer);
  const playerColors = ["#00FF00", "#1E90FF"];

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight || 100;
    const margin = { top: 10, right: 20, bottom: 20, left: 30 };
    const width = containerWidth - margin.left - margin.right;
    const height = containerHeight - margin.top - margin.bottom;
    svg.selectAll('*').remove();
    const mainGroup = svg.attr('width', containerWidth).attr('height', containerHeight).append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const maxScore = Math.max(10, d3.max(scoreHistory1) ?? 0, d3.max(scoreHistory2) ?? 0);
    const numTurns = Math.max(scoreHistory1.length - 1, 0);
    const xScale = d3.scaleLinear().domain([0, numTurns]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, maxScore]).range([height, 0]);
    const lineGenerator = d3.line<number>().x((d, i) => xScale(i)).y(d => yScale(d));
    mainGroup.append('path').datum(scoreHistory1).attr('fill', 'none').attr('stroke', playerColors[0]).attr('stroke-width', 1.5).attr('d', lineGenerator);
    mainGroup.append('path').datum(scoreHistory2).attr('fill', 'none').attr('stroke', playerColors[1]).attr('stroke-width', 1.5).attr('d', lineGenerator);
    const xAxis = d3.axisBottom(xScale).ticks(Math.min(numTurns, 10)).tickFormat(d3.format('d'));
    const yAxis = d3.axisLeft(yScale).ticks(5);
    mainGroup.append('g').attr('transform', `translate(0,${height})`).call(xAxis);
    mainGroup.append('g').call(yAxis);
    
  }, [scoreHistory1, scoreHistory2, playerColors, currentPlayer]);

  return (
    <div id="score-chart-container" ref={containerRef} style={{ width: '100%', height: '150px' }}> 
      <svg id="score-chart" ref={svgRef}></svg>
    </div>
  );
};

export default ScoreChart; 