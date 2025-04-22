/**
 * scoring.js - Score Visualization for Cell Collection
 * 
 * This file implements the visual components for displaying game scores.
 * 
 * Key components:
 * - ScoreBreakdown: Shows player scores and detailed score breakdowns
 * - ScoreChart: Visualizes score progression throughout the game
 * 
 * ScoreBreakdown displays:
 * - Current scores for both players
 * - Breakdown of multiplication factors for cell-multiplication scoring
 * - Visual indicators for the current player's turn
 * 
 * ScoreChart visualizes:
 * - Score trends over time with colored lines for each player
 * - Round number labels on the x-axis
 * - Maximum score label on the y-axis
 * - Colored indicators to show which player is leading
 * 
 * Relationships with other files:
 * - game.js: Updates these components when scores change
 * - utils.js: Gets the current scoring mechanism
 */

import { getScoringMechanism } from "./utils.js";

export class ScoreBreakdown {
    constructor(playerColors) {
        this.breakdown = d3.select("#score-breakdown");
        this.scores = d3.select("#player-scores");
        this.playerColors = playerColors;
        this.reset();
    }
    
    update(currentPlayer, scores, components1, components2) {
        const scoring = getScoringMechanism();
        
        // Generate breakdown text for each player
        let breakdownText1 = "";
        let breakdownText2 = "";
        
        if (scoring === 'cell-multiplication' && components1 && components2) {
            // Format player 1 breakdown - only show if there are multiple components
            const componentSizes1 = components1.map(comp => comp.length).sort((a, b) => b - a);
            if (componentSizes1.length > 1) {
                const breakdown1 = componentSizes1.join('×');
                breakdownText1 = `(${scores[0]} = ${breakdown1})`;
            }
            
            // Format player 2 breakdown - only show if there are multiple components
            const componentSizes2 = components2.map(comp => comp.length).sort((a, b) => b - a);
            if (componentSizes2.length > 1) {
                const breakdown2 = componentSizes2.join('×');
                breakdownText2 = `(${scores[1]} = ${breakdown2})`;
            }
        }
        
        // Create label and score text with player colors
        const player1Color = this.playerColors[0];
        const player2Color = this.playerColors[1];
        
        // Style based on current player
        const player1LabelStyle = currentPlayer === 0 
            ? `color: ${player1Color}; font-weight: 600; border-bottom: 2px solid ${player1Color};` 
            : `color: ${player1Color}; font-weight: 500;`;
            
        const player2LabelStyle = currentPlayer === 1 
            ? `color: ${player2Color}; font-weight: 600; border-bottom: 2px solid ${player2Color};` 
            : `color: ${player2Color}; font-weight: 500;`;
        
        // Create player scores display (above the board)
        this.scores.html(`
            <div style="display: flex; justify-content: space-between; width: 100%;">
                <div style="text-align: left; padding-right: 10px;">
                    <div style="${player1LabelStyle}">Player 1: ${scores[0]}</div>
                </div>
                <div style="text-align: right; padding-left: 10px;">
                    <div style="${player2LabelStyle}">Player 2: ${scores[1]}</div>
                </div>
            </div>
        `);
        
        // Always create the breakdown container with the same structure
        // Use non-breaking spaces (&#160;) as placeholders when there's no content
        this.breakdown.html(`
            <div style="display: flex; justify-content: space-between; width: 100%;">
                <div style="text-align: left; padding-right: 10px;">
                    <div style="font-size: 0.9em; font-weight: 400; min-height: 1.2em; opacity: 0.9; color: ${player1Color};">${breakdownText1 || '&#160;'}</div>
                </div>
                <div style="text-align: right; padding-left: 10px;">
                    <div style="font-size: 0.9em; font-weight: 400; min-height: 1.2em; opacity: 0.9; color: ${player2Color};">${breakdownText2 || '&#160;'}</div>
                </div>
            </div>
        `);
    }
    
    reset(currentPlayer = 0) {
        // Initialize with placeholders to maintain consistent height
        const player1Color = this.playerColors[0];
        const player2Color = this.playerColors[1];
        
        this.scores.html(`
            <div style="display: flex; justify-content: space-between; width: 100%;">
                <div style="text-align: left; padding-right: 10px;">
                    <div style="color: ${player1Color}; font-weight: 500;">Player 1: 0</div>
                </div>
                <div style="text-align: right; padding-left: 10px;">
                    <div style="color: ${player2Color}; font-weight: 500;">Player 2: 0</div>
                </div>
            </div>
        `);
        
        this.breakdown.html(`
            <div style="display: flex; justify-content: space-between; width: 100%;">
                <div style="text-align: left; padding-right: 10px;">
                    <div style="font-size: 0.9em; font-weight: 400; min-height: 1.2em; opacity: 0.9; color: ${player1Color};">&#160;</div>
                </div>
                <div style="text-align: right; padding-left: 10px;">
                    <div style="font-size: 0.9em; font-weight: 400; min-height: 1.2em; opacity: 0.9; color: ${player2Color};">&#160;</div>
                </div>
            </div>
        `);
    }
}


export class ScoreChart {

    constructor(playerColors, gridSize) {

        this.scoreHistory1 = [0];
        this.scoreHistory2 = [0];
        this.playerColors = playerColors;

        let svgWidth = 100;
        let svgHeight = 25;
        let margin = {top: 4, right: 4, bottom: 5, left: 7};
        let chartWidth = svgWidth - margin.left - margin.right;
        let chartHeight = svgHeight - margin.top - margin.bottom;

        this.xScale = d3.scaleLinear().range([0, chartWidth]);
        this.yScale = d3.scaleLinear().range([chartHeight, 0]);

        this.line1 = d3.line()
            .x((d, i) => { return this.xScale(i); })
            .y((d) => { return this.yScale(d); });

        this.line2 = d3.line()
            .x((d, i) => { return this.xScale(i); })
            .y((d) => { return this.yScale(d); });

        // Create a chart with viewBox for responsive scaling
        d3.select("#score-chart")
            .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
            .attr("preserveAspectRatio", "xMidYMid meet");
            
        this.svg = d3.select("#score-chart")
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        this.svg.append("path")
            .attr("class", "line line1")
            .style("stroke-width", "0.2");

        this.svg.append("path")
            .attr("class", "line line2")
            .style("stroke-width", "0.2");

        // Create a simplified y-axis
        this.yAxis = this.svg.append("g")
            .attr("class", "y axis");

        // Create a simplified x-axis
        this.xAxis = this.svg.append("g")
            .attr("class", "x axis")
            .attr("transform", `translate(0,${chartHeight})`);

        // Style the axis lines to match score lines
        this.svg.selectAll(".axis path, .axis line")
            .style("stroke-width", "0.2")
            .style("stroke", "#aaaaaa");

        this.svg.selectAll(".axis text")
            .style("font-size", "2.5")
            .style("fill", "#cccccc");

        this.reset();
    }


    update(currentPlayer, scores) {

        // Add the scores to the history arrays
        this.scoreHistory1.push(scores[0]);
        this.scoreHistory2.push(scores[1]);

        // Update the domain of the x scale
        let moveCount = Math.max(this.scoreHistory1.length, this.scoreHistory2.length) - 1;
        this.xScale.domain([0, moveCount]);

        // Update the domain of the y scale
        let maxScore = d3.max(this.scoreHistory1.concat(this.scoreHistory2)) || 1;
        this.yScale.domain([0, maxScore]);
        
        // Determine which player has the highest score for coloring the max score label
        const player1HasMax = Math.max(...this.scoreHistory1) >= Math.max(...this.scoreHistory2);
        const maxScoreColor = player1HasMax ? this.playerColors[0] : this.playerColors[1];
        
        // Update line paths
        this.svg.selectAll(".line1")
            .attr("stroke", this.playerColors[0])
            .datum(this.scoreHistory1)
            .attr("d", this.line1);

        this.svg.selectAll(".line2")
            .attr("stroke", this.playerColors[1])
            .datum(this.scoreHistory2)
            .attr("d", this.line2);

        // Update markers
        if (currentPlayer === 0) {
            this._updateMarkers(0, this.scoreHistory1, this.playerColors[0], currentPlayer === 0);
            this._updateMarkers(1, this.scoreHistory2, this.playerColors[1], currentPlayer === 1);
        } else {
            this._updateMarkers(1, this.scoreHistory2, this.playerColors[1], currentPlayer === 1);
            this._updateMarkers(0, this.scoreHistory1, this.playerColors[0], currentPlayer === 0);
        }

        // Create a custom minimalist y-axis
        // First clear the existing axis
        this.yAxis.selectAll("*").remove();
        
        // Add the axis line
        this.yAxis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", this.yScale.range()[0])
            .style("stroke", "#aaaaaa")
            .style("stroke-width", "0.2");
            
        // Add tick mark at the top (max value)
        this.yAxis.append("line")
            .attr("x1", -2)
            .attr("y1", this.yScale(maxScore))
            .attr("x2", 0)
            .attr("y2", this.yScale(maxScore))
            .style("stroke", "#aaaaaa")
            .style("stroke-width", "0.2");
            
        // Add only the max score label
        this.yAxis.append("text")
            .attr("x", -2)
            .attr("y", this.yScale(maxScore))
            .attr("dy", "0.3em")
            .style("text-anchor", "end")
            .style("font-size", "2.5")
            .style("fill", maxScoreColor)  // Use color of player with highest score
            .text(maxScore);
            
        // Create a custom minimalist x-axis (showing only the most recent player's move count)
        // Clear the existing x-axis
        this.xAxis.selectAll("*").remove();
        
        // Add the axis line
        this.xAxis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", this.xScale.range()[1])
            .attr("y2", 0)
            .style("stroke", "#aaaaaa")
            .style("stroke-width", "0.2");
            
        // Show the round number instead of move count
        const roundNumber = Math.floor((moveCount+1) / 2);
    
        // Add a tick mark for the round number position
        this.xAxis.append("line")
            .attr("x1", this.xScale(moveCount))
            .attr("y1", 0)
            .attr("x2", this.xScale(moveCount))
            .attr("y2", -2)
            .style("stroke", "#aaaaaa")
            .style("stroke-width", "0.2");
            
        // Add the round number label above the axis
        this.xAxis.append("text")
            .attr("x", this.xScale(moveCount))
            .attr("y", -2)  // Negative value to position above the axis
            .attr("dy", "-0.2em")  // Small adjustment for better vertical positioning
            .attr("text-anchor", "middle")
            .style("font-size", "2.5")
            .style("fill", "#aaaaaa")
            .text(roundNumber);
    }
    

    _updateMarkers(player, history, color, isCurrentPlayer) {
        let dots = this.svg.selectAll(`.dot${player}`)
            .data(history, (d, i) => i);

        dots.enter()
            .append("circle")
            .attr("class", `dot${player}`)
            .attr("r", 0.5)
            .attr("fill", isCurrentPlayer ? color : "none")
            .attr("stroke", color)
            .attr("stroke-width", 0.25) 
            .merge(dots)
            .attr("cx", (d, i) => this.xScale(i))
            .attr("cy", d => this.yScale(d));

        dots.exit().remove();
    }

    reset() {
        this.scoreHistory1 = [0];
        this.scoreHistory2 = [0];
        
        // Set up initial state with just axes and labels
        let moveCount = 0;
        this.xScale.domain([0, 1]);
        this.yScale.domain([0, 1]);
        
        // Clear ALL existing elements
        this.svg.selectAll(".dot0, .dot1").remove(); // Clear all markers
        this.yAxis.selectAll("*").remove();
        this.xAxis.selectAll("*").remove();
        
        // Add the y-axis line
        this.yAxis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", this.yScale.range()[0])
            .style("stroke", "#aaaaaa")
            .style("stroke-width", "0.2");
            
        // Add tick mark at the top for max value (1 initially)
        this.yAxis.append("line")
            .attr("x1", -2)
            .attr("y1", this.yScale(1))
            .attr("x2", 0)
            .attr("y2", this.yScale(1))
            .style("stroke", "#aaaaaa")
            .style("stroke-width", "0.2");
            
        // Add the initial label for the y-axis
        this.yAxis.append("text")
            .attr("x", -2)
            .attr("y", this.yScale(1))
            .attr("dy", "0.3em")
            .style("text-anchor", "end")
            .style("font-size", "2.5")
            .style("fill", "#aaaaaa")
            .text("1");
            
        // Add the x-axis line
        this.xAxis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", this.xScale.range()[1])
            .attr("y2", 0)
            .style("stroke", "#aaaaaa")
            .style("stroke-width", "0.2");
            
        // Add a tick mark for the first round
        this.xAxis.append("line")
            .attr("x1", this.xScale(1))
            .attr("y1", 0)
            .attr("x2", this.xScale(1))
            .attr("y2", -2)
            .style("stroke", "#aaaaaa")
            .style("stroke-width", "0.2");
            
        // Add initial '1' label on x-axis 
        this.xAxis.append("text")
            .attr("x", this.xScale(1))
            .attr("y", -2)
            .attr("dy", "-0.2em")
            .attr("text-anchor", "middle")
            .attr("font-size", "2.5")
            .attr("fill", "#aaaaaa")
            .text("1");
            
        // Initialize empty paths for score lines
        this.svg.selectAll(".line1")
            .attr("stroke", this.playerColors[0])
            .datum([])
            .attr("d", this.line1);

        this.svg.selectAll(".line2")
            .attr("stroke", this.playerColors[1])
            .datum([])
            .attr("d", this.line2);
    }

} 
