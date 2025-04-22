import { getScoringMechanism } from "./utils.js";

export class ScoreBreakdown {
    constructor(playerColors) {
        this.display = d3.select("#score-breakdown");
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
        
        // Style based on current player - apply underline to player label with score
        const player1Label = currentPlayer === 0 
            ? `<span style='border-bottom: 2px solid ${this.playerColors[0]};'>Player 1: ${scores[0]}</span>` 
            : `Player 1: ${scores[0]}`;
            
        const player2Label = currentPlayer === 1 
            ? `<span style='border-bottom: 2px solid ${this.playerColors[1]};'>Player 2: ${scores[1]}</span>` 
            : `Player 2: ${scores[1]}`;
        
        // Create a justified display with labels and breakdowns on separate lines
        this.display.html(`
            <div style="display: flex; justify-content: space-between; width: 100%;">
                <div style="text-align: left; padding-right: 10px;">
                    <div style="font-weight: 500; margin-bottom: 3px;">${player1Label}</div>
                    <div style="font-size: 0.9em; font-weight: 400; min-height: 1.2em;">${breakdownText1}</div>
                </div>
                <div style="text-align: right; padding-left: 10px;">
                    <div style="font-weight: 500; margin-bottom: 3px;">${player2Label}</div>
                    <div style="font-size: 0.9em; font-weight: 400; min-height: 1.2em;">${breakdownText2}</div>
                </div>
            </div>
        `);
    }
    
    reset(currentPlayer = 0) {
        // Just initialize empty display, game will call updateScoreBreakdown after reset
        this.display.html('');
    }
}


export class ScoreChart {

    constructor(playerColors, gridSize) {

        this.scoreHistory1 = [];
        this.scoreHistory2 = [];
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
            .style("font-size", "2.5");

        this.reset();
    }


    update(currentPlayer, scores) {

        // Add the scores to the history arrays
        this.scoreHistory1.push(scores[0]);
        this.scoreHistory2.push(scores[1]);

        // Update the domain of the x scale
        let moveCount = this.scoreHistory1.length;
        this.xScale.domain([0, moveCount > 1 ? moveCount - 1 : 1]);

        // Update the domain of the y scale
        let maxScore = d3.max(this.scoreHistory1.concat(this.scoreHistory2)) || 1;
        this.yScale.domain([0, maxScore]);
        
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
            
        // Add only two labels: 0 and max score
        this.yAxis.append("text")
            .attr("x", -2)
            .attr("y", this.yScale(0))
            .attr("dy", "0.3em")
            .style("text-anchor", "end")
            .style("font-size", "2.5")
            .text("0");
            
        this.yAxis.append("text")
            .attr("x", -2)
            .attr("y", this.yScale(maxScore))
            .attr("dy", "0.3em")
            .style("text-anchor", "end")
            .style("font-size", "2.5")
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
            
        // Only show the last move count (for the player who just moved)
        const prevPlayer = (currentPlayer + 1) % 2;
        const moveLabel = moveCount - 1;
        
        if (moveCount > 1) {
            // Add the move count label above the axis
            this.xAxis.append("text")
                .attr("x", this.xScale(moveLabel))
                .attr("y", -1)  // Negative value to position above the axis
                .attr("dy", "-0.2em")  // Small adjustment for better vertical positioning
                .attr("text-anchor", "middle")
                .style("font-size", "2.5")
                .style("fill", "#000000")  // Black color for better visibility
                .text(moveLabel);
        }
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
        this.scoreHistory1 = [];
        this.scoreHistory2 = [];            
        this.update(0, [0, 0]);
    }

} 
