
export class ScoreChart {

    constructor(chartName, gridSize) {

        this.scoreHistory1 = [];
        this.scoreHistory2 = [];

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

        this.svg = d3.select(`#${chartName}`)
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

    }


    update(playerColors, scores) {

        // Add the scores to the history arrays
        this.scoreHistory1.push(scores[0]);
        this.scoreHistory2.push(scores[1]);

        // Update the domain of the x scale
        this.xScale.domain([0, d3.max([this.scoreHistory1.length, this.scoreHistory2.length])]);

        // Update the domain of the y scale
        this.yScale.domain([0, d3.max(this.scoreHistory1.concat(this.scoreHistory2))]);
        
        // Update line paths
        this.svg.selectAll(".line1")
            .attr("stroke", playerColors[0])
            .datum(this.scoreHistory1)
            .attr("d", this.line1);

        this.svg.selectAll(".line2")
            .attr("stroke", playerColors[1])
            .datum(this.scoreHistory2)
            .attr("d", this.line2);

        // Update y axis
        this.svg.selectAll(".y.axis")
            .call(d3.axisLeft(this.yScale));
    }

    
    reset(playerColors, scores) {
        this.scoreHistory1 = [];
        this.scoreHistory2 = [];            
        this.update(playerColors, scores);
    }

} 
