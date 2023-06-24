export class ScoreDisplay {

    constructor(currentPlayer, playerColors) {
        this.display = d3.select(("#score-display"));
        this.playerColors = playerColors;
        this.reset(currentPlayer);
    }

    update(currentPlayer, scores) {
        if (currentPlayer === 0) {
            this.display.html(` 
                <span style='border-bottom: 2px solid ${this.playerColors[0]};'>Player 1: ${scores[0]}</span> &nbsp;
                Player 2: ${scores[1]}`);
        } else {
            this.display.html(` 
                Player 1: ${scores[0]} &nbsp;
                <span style='border-bottom: 2px solid ${this.playerColors[1]};'>Player 2: ${scores[1]}</span>`);
        }
    }

    reset(currentPlayer) {
        this.update(currentPlayer, [0, 0]);
    }

}


export class ScoreChart {

    constructor(playerColors, gridSize) {

        this.scoreHistory1 = [];
        this.scoreHistory2 = [];
        this.playerColors = playerColors;

        let svgWidth = gridSize
        let svgHeight = 150;        
        let margin = {top: 10, right: 20, bottom: 10, left: 30};
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

        this.svg = d3.select(("#score-chart"))
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        this.svg.append("path")
            .attr("class", "line line1");

        this.svg.append("path")
            .attr("class", "line line2");

        this.svg.append("g")
            .attr("class", "x axis");

        this.svg.append("g")
            .attr("class", "y axis");

        this.reset();
    }


    update(currentPlayer, scores) {

        // Add the scores to the history arrays
        this.scoreHistory1.push(scores[0]);
        this.scoreHistory2.push(scores[1]);

        // Update the domain of the x scale
        this.xScale.domain([0, d3.max([this.scoreHistory1.length, this.scoreHistory2.length])]);

        // Update the domain of the y scale
        this.yScale.domain([0, d3.max(this.scoreHistory1.concat(this.scoreHistory2))]);
        
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

        // Update y axis
        this.svg.selectAll(".y.axis")
            .call(d3.axisLeft(this.yScale));        
    }
    

    _updateMarkers(player, history, color, isCurrentPlayer) {
        let dots = this.svg.selectAll(`.dot${player}`)
            .data(history, (d, i) => i);

        dots.enter()
            .append("circle")
            .attr("class", `dot${player}`)
            .attr("r", 3)
            .attr("fill", isCurrentPlayer ? color : "none")
            .attr("stroke", color)            
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
