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

// import { getScoringMechanism } from "../utils.js"; // Remove direct dependency

export class ScoreBreakdown {
    constructor(playerColors) {
        this.breakdown = d3.select("#score-breakdown");
        this.scores = d3.select("#player-scores");
        this.playerColors = playerColors;
        this.reset();
    }
    
    update(currentPlayer, scores, components1, components2, scoringMechanism) {
        // const scoring = getScoringMechanism(); // Removed direct call
        const scoring = scoringMechanism; // Use passed value
        
        // Generate breakdown text for each player using the appropriate sizing method
        let breakdownText1 = this.calculateBreakdownText(scores[0], components1, scoring);
        let breakdownText2 = this.calculateBreakdownText(scores[1], components2, scoring);
        
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
        this.breakdown.html(`
            <div style="display: flex; justify-content: space-between; width: 100%;">
                <div style="text-align: left; padding-right: 10px;">
                    <div style="font-size: 0.9em; font-weight: 400; min-height: 1.2em; opacity: 0.9; color: ${player1Color};">${breakdownText1}</div>
                </div>
                <div style="text-align: right; padding-left: 10px;">
                    <div style="font-size: 0.9em; font-weight: 400; min-height: 1.2em; opacity: 0.9; color: ${player2Color};">${breakdownText2}</div>
                </div>
            </div>
        `);
    }
    
    reset(currentPlayer = 0, scoringMechanism) {
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
        
        // Display initial score breakdown with zeros
        const breakdownText1 = this.calculateBreakdownText(0, [], scoringMechanism);
        const breakdownText2 = this.calculateBreakdownText(0, [], scoringMechanism);
        
        this.breakdown.html(`
            <div style="display: flex; justify-content: space-between; width: 100%;">
                <div style="text-align: left; padding-right: 10px;">
                    <div style="font-size: 0.9em; font-weight: 400; min-height: 1.2em; opacity: 0.9; color: ${player1Color};">${breakdownText1}</div>
                </div>
                <div style="text-align: right; padding-left: 10px;">
                    <div style="font-size: 0.9em; font-weight: 400; min-height: 1.2em; opacity: 0.9; color: ${player2Color};">${breakdownText2}</div>
                </div>
            </div>
        `);
    }
    
    // Unified method to calculate the breakdown text for any scoring mechanism
    calculateBreakdownText(score, components, scoringMechanism) {
        if (score === 0 || !components || components.length === 0) {
            return `${score} = 0`;
        }
        
        // Calculate the appropriate "size" for each component based on the scoring mechanism
        const componentSizes = components.map(component => {
            return this.calculateComponentSize(component, scoringMechanism);
        });
        
        // Sort by size (largest first) and join with multiplication symbol
        const sizesText = componentSizes.sort((a, b) => b - a).join('×');
        return `${score} = ${sizesText}`;
    }
    
    // Calculate the appropriate "size" measure for a component based on the scoring mechanism
    calculateComponentSize(component, scoringMechanism) {
        // If it's a single cell, size is always 1 across all scoring mechanisms
        if (component.length === 1) return 1;
        
        switch(scoringMechanism) {
            case 'cell-multiplication':
            case 'cell-multiplication':
                // For these mechanisms, size is the number of cells
                return component.length;
                
            case 'cell-connection':
                // For cell-connection, calculate all connections within the component
                // This matches the logic in Board.getConnectionScore()
                let connectionCount = 0;
                
                // For each cell in the component, count connections to other cells
                for (let cellKey of component) {
                    const [gridX, gridY] = cellKey.split('-').map(Number);
                    
                    // Get adjacent positions
                    const adjacentPositions = this.getAdjacentPositions(gridX, gridY);
                    
                    // Count connections to other cells in the same component
                    for (let [adjX, adjY] of adjacentPositions) {
                        const adjKey = `${adjX}-${adjY}`;
                        if (component.includes(adjKey)) {
                            connectionCount++;
                        }
                    }
                }
                
                return connectionCount;
                
            case 'cell-extension':
                // For cell-extension, use the same logic as in Board.getExtensionScore()
                let extensionSum = 0;
                const processedEdges = new Set();
                
                // For each cell in the component
                for (let cellKey of component) {
                    const [gridX, gridY] = cellKey.split('-').map(Number);
                    
                    // Check adjacent positions
                    const adjacentPositions = this.getAdjacentPositions(gridX, gridY);
                    
                    // For each adjacent position
                    for (let [adjX, adjY] of adjacentPositions) {
                        const adjKey = `${adjX}-${adjY}`;
                        
                        // If the adjacent cell is in the same component
                        if (component.includes(adjKey)) {
                            // Create an edge identifier (smaller key first to ensure uniqueness)
                            const edge = cellKey < adjKey 
                                ? `${cellKey}-${adjKey}` 
                                : `${adjKey}-${cellKey}`;
                            
                            // Only count each edge once
                            if (!processedEdges.has(edge)) {
                                extensionSum++;
                                processedEdges.add(edge);
                            }
                        }
                    }
                }
                
                // If there are no extensions (single cell), return 1
                return extensionSum > 0 ? extensionSum : 1;
                
            default:
                // Default to using the number of cells
                return component.length;
        }
    }
    
    // Get adjacent positions for a grid cell
    getAdjacentPositions(gridX, gridY) {
        return [
            [gridX + 1, gridY], // right
            [gridX - 1, gridY], // left
            [gridX, gridY + 1], // down
            [gridX, gridY - 1]  // up
        ];
    }
    
    // Helper function to get prime factors of a number for display or debugging
    getFactors(num) {
        if (num === 0) return "0";
        if (num === 1) return "1";
        
        // Find all prime factors
        const factors = [];
        for (let i = 2; i <= Math.sqrt(num); i++) {
            while (num % i === 0) {
                factors.push(i);
                num /= i;
            }
        }
        
        // If num is a prime number larger than sqrt
        if (num > 1) {
            factors.push(num);
        }
        
        // If no factors were found
        if (factors.length === 0) {
            return num.toString();
        }
        
        // Group repeated factors to make the display cleaner
        const grouped = [];
        let current = factors[0];
        let count = 1;
        
        for (let i = 1; i < factors.length; i++) {
            if (factors[i] === current) {
                count++;
            } else {
                grouped.push(count > 1 ? `${current}^${count}` : `${current}`);
                current = factors[i];
                count = 1;
            }
        }
        
        // Add the last factor
        grouped.push(count > 1 ? `${current}^${count}` : `${current}`);
        
        return grouped.join('×');
    }
}


// Renamed from ScoreChart to ScoreChartRenderer
export class ScoreChartRenderer {

    constructor(playerColors, /* gridSize */) { // Removed gridSize if only used for scaling?
        this.playerColors = playerColors;

        // let svgWidth = 100;
        // Use relative units or get container size for flexibility
        const container = d3.select("#score-chart-container"); // Assume a container div
        const svgWidth = container.node() ? container.node().getBoundingClientRect().width : 100;
        const svgHeight = svgWidth * 0.25; // Maintain aspect ratio
        
        let margin = {top: svgHeight * 0.16, right: svgWidth * 0.04, bottom: svgHeight * 0.20, left: svgWidth * 0.07};
        let chartWidth = svgWidth - margin.left - margin.right;
        let chartHeight = svgHeight - margin.top - margin.bottom;

        this.xScale = d3.scaleLinear().range([0, chartWidth]);
        // Replace linear scale with log scale (with special handling for zero values)
        this.yScale = d3.scaleLog()
            .range([chartHeight, 0])
            .clamp(true);  // Clamp values to avoid infinity issues

        // Add a method to safely handle log scale values (replacing 0 with a small positive value)
        this.safeLogValue = (value) => {
            return value <= 0 ? 0.1 : value;  // Use 0.1 as the minimum positive value
        };

        this.line1 = d3.line()
            .x((d, i) => { return this.xScale(i); })
            .y((d) => { return this.yScale(this.safeLogValue(d)); });  // Use safe log value

        this.line2 = d3.line()
            .x((d, i) => { return this.xScale(i); })
            .y((d) => { return this.yScale(this.safeLogValue(d)); });  // Use safe log value

        // Create a chart with viewBox for responsive scaling
        d3.select("#score-chart")
            .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`)
            .attr("preserveAspectRatio", "xMidYMid meet");
            
        this.svg = d3.select("#score-chart") // Select the SVG element directly
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
            
        // Create an overlay group that will always be on top
        this.labelsOverlay = this.svg.append("g")
            .attr("class", "labels-overlay");
            
        // Specifically create a group for x-axis labels within the overlay
        this.xAxisLabels = this.labelsOverlay.append("g")
            .attr("class", "x-axis-labels")
            .attr("transform", `translate(0,${chartHeight})`);

        // Style the axis lines to match score lines
        this.svg.selectAll(".axis path, .axis line")
            .style("stroke-width", "0.2")
            .style("stroke", "#aaaaaa");

        this.svg.selectAll(".axis text")
            .style("font-size", "2.5") // Use relative units? e.g., "0.8em"
            .style("fill", "#cccccc");

        this.reset();
    }

    // Update now takes score history as arguments
    update(currentPlayer, scores, scoreHistory1, scoreHistory2) {
        // Ensure histories are valid arrays
        const history1 = Array.isArray(scoreHistory1) ? scoreHistory1 : [0];
        const history2 = Array.isArray(scoreHistory2) ? scoreHistory2 : [0];

        // Update the domain of the x scale
        let moveCount = Math.max(history1.length, history2.length) - 1;
        this.xScale.domain([0, moveCount <= 0 ? 1 : moveCount]); // Ensure domain is never zero or negative

        // Update the domain of the y scale
        let maxScore = d3.max(history1.concat(history2)) || 1;
        this.yScale.domain([this.safeLogValue(0.1), this.safeLogValue(maxScore)]);
        
        // Determine which player has the highest score for coloring the max score label
        const player1HasMax = (d3.max(history1) ?? 0) >= (d3.max(history2) ?? 0);
        const maxScoreColor = player1HasMax ? this.playerColors[0] : this.playerColors[1];
        
        // Update line paths using the passed history
        this.svg.selectAll(".line1")
            .attr("stroke", this.playerColors[0])
            .datum(history1)
            .attr("d", this.line1);

        this.svg.selectAll(".line2")
            .attr("stroke", this.playerColors[1])
            .datum(history2)
            .attr("d", this.line2);

        // Update markers using the passed history
        if (currentPlayer === 0) {
            this._updateMarkers(0, history1, this.playerColors[0], currentPlayer === 0);
            this._updateMarkers(1, history2, this.playerColors[1], currentPlayer === 1);
        } else {
            this._updateMarkers(1, history2, this.playerColors[1], currentPlayer === 1);
            this._updateMarkers(0, history1, this.playerColors[0], currentPlayer === 0);
        }
        
        // Bring the labels overlay to the front after updating markers
        this.labelsOverlay.raise();

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
            .attr("y1", this.yScale(this.safeLogValue(maxScore)))
            .attr("x2", 0)
            .attr("y2", this.yScale(this.safeLogValue(maxScore)))
            .style("stroke", "#aaaaaa")
            .style("stroke-width", "0.2");
            
        // Add only the max score label
        this.yAxis.append("text")
            .attr("x", -2)
            .attr("y", this.yScale(this.safeLogValue(maxScore)))
            .attr("dy", "0.3em")
            .style("text-anchor", "end")
            .style("font-size", "2.5")
            .style("fill", maxScoreColor)  // Use color of player with highest score
            .text(maxScore);
            
        // Create a custom minimalist x-axis 
        this.xAxis.selectAll("*").remove();
        this.xAxis.append("line")
            .attr("x1", 0).attr("y1", 0)
            .attr("x2", this.xScale.range()[1]).attr("y2", 0)
            .style("stroke", "#aaaaaa").style("stroke-width", "0.2");
            
        this.xAxisLabels.selectAll("*").remove();
        
        // Show the round number instead of move count
        const roundNumber = Math.floor((moveCount + 1) / 2);
        if (moveCount >= 0) { // Only show if there are moves
            const xPos = this.xScale(moveCount);
            this.xAxisLabels.append("rect")
                .attr("x", xPos - 2).attr("y", -2)
                .attr("width", 4).attr("height", 4)
                .attr("rx", 2).attr("ry", 2)
                .style("fill", "#121212");
                
            this.xAxisLabels.append("text")
                .attr("x", xPos).attr("y", 1).attr("dy", "-0.2em")
                .attr("text-anchor", "middle")
                .style("font-size", "2.5").style("fill", "#aaaaaa")
                .text(roundNumber > 0 ? roundNumber : 1); // Show at least 1
        }
    }
    

    _updateMarkers(player, history, color, isCurrentPlayer) {
        // Ensure history is an array
        const validHistory = Array.isArray(history) ? history : [0];
        
        let dots = this.svg.selectAll(`.dot${player}`)
            .data(validHistory, (d, i) => i);

        dots.enter()
            .append("circle")
            .attr("class", `dot${player}`)
            .attr("r", 0.5)
            .attr("fill", isCurrentPlayer ? color : "none")
            .attr("stroke", color)
            .attr("stroke-width", 0.25) 
            .merge(dots)
            .attr("cx", (d, i) => this.xScale(i))
            .attr("cy", d => this.yScale(this.safeLogValue(d)));  // Use safe log value

        dots.exit().remove();

        // Bring the labels overlay to the front
        this.labelsOverlay.raise();
    }

    // Reset does not manage history anymore, just visuals
    reset() {
        // Removed history reset
        
        // Set up initial state with just axes and labels
        let moveCount = 0;
        this.xScale.domain([0, 1]);
        
        // Fix for log scale - set a proper domain range with minimum and maximum values
        // This will position the maximum value (1) at the top of the chart
        this.yScale.domain([this.safeLogValue(0.1), this.safeLogValue(1)]);
        
        // Clear ALL existing elements
        this.svg.selectAll(".dot0, .dot1").remove(); // Clear all markers
        this.yAxis.selectAll("*").remove();
        this.xAxis.selectAll("*").remove();
                    
        // Initialize empty paths for score lines
        this.svg.selectAll(".line1")
            .attr("stroke", this.playerColors[0])
            .datum([])
            .attr("d", this.line1);

        this.svg.selectAll(".line2")
            .attr("stroke", this.playerColors[1])
            .datum([])
            .attr("d", this.line2);

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
            .attr("y1", this.yScale(this.safeLogValue(1)))
            .attr("x2", 0)
            .attr("y2", this.yScale(this.safeLogValue(1)))
            .style("stroke", "#aaaaaa")
            .style("stroke-width", "0.2");
            
        // Add the initial label for the y-axis
        this.yAxis.append("text")
            .attr("x", -2)
            .attr("y", this.yScale(this.safeLogValue(1)))
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
                       
        // Clear the labels overlay as well
        this.xAxisLabels.selectAll("*").remove();
            
        // Add initial '1' label on x-axis with background in the overlay
        this.xAxisLabels.append("rect")
            .attr("x", this.xScale(1)-2)
            .attr("y", -2)
            .attr("width", 4)
            .attr("height", 4)
            .attr("rx", 2)
            .attr("ry", 2)
            .style("fill", "#121212");
        
        this.xAxisLabels.append("text")
            .attr("x", this.xScale(1))
            .attr("y", 1)
            .attr("dy", "-0.2em")
            .attr("text-anchor", "middle")
            .attr("font-size", "2.5")
            .attr("fill", "#aaaaaa")
            .text("1");
            
        // Bring the labels overlay to the front
        this.labelsOverlay.raise();
    }

} 
