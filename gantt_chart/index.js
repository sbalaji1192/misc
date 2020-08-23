var data = [];
let status = ["Successful", "Cancelled", "Failed", "Aborted", "Running"]

d3.range(0, 40)
    .forEach(() => {
        let d = randomDate(new Date(2020, 7, 23), new Date());
        let stat = status[Math.random().toString().slice(-1) % 5]
        data.push({
            start_time: d,
            end_time: stat == 'Running' ? new Date() : randomDate(d, new Date()),
            status: stat,
            schedule: Math.random().toString().slice(-1) % 5
        })
    });

function randomDate(start, end) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

let dimension = {
    width: $(window).width() - 20,
    height: $(window).height() - 100,
    margin: {
        top: 20,
        left: 20,
        right: 20,
        bottom: 20
    }
};
data.forEach(d => {
    d.start_time = new Date(d.start_time);
    d.end_time = new Date(d.end_time);
})
let svg = d3.select("div")
    .append("svg")
    .attr("width", dimension.width)
    .attr("height", dimension.height);

svg.call(zoom);

let low = d3.min(data, (d) => d.start_time);
let high = new Date();

let X = d3.scaleTime()
    .domain([low, high])
    .range([dimension.margin.left, dimension.width - dimension.margin.right]);
let originalX = X;
let Xaxis = d3.axisBottom().scale(X);
let colors = d3.scaleOrdinal()
    .domain(status)
    .range(["#b8e3cd", "#ccc", "#eccfd5", "#fbeeca", "#cce7f6"]);
let height = ((dimension.height - dimension.margin.bottom - dimension.margin.top) / data.length);
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(function(d) {
        return "";
        // return `
        //     <div>
        //         <h2>Some Randow schedule</h2><br/>
        //         start : ${d.start_time.toString()}<br/>
        //         end : ${d.end_time.toString()}
        //     </div>
        // `;
    });
svg.call(tip);

svg.selectAll("g")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", d => `schedule-${d.schedule}`)
    .attr("x", (d) => X(d.start_time))
    .attr("y", (d, i) => i * height)
    .attr("height", (d) => height - 5)
    .attr("fill", (d) => colors(d.status))
    .attr("fill-opacity", "1")
    .on("mouseenter", highlight)
    .on("mouseleave", unwindHighlight).on('mouseover', tip.show)
    .on('mouseout', tip.hide)
    .attr("width", 0)
    .transition()
    .duration(400)
    .ease(d3.easeSinInOut)
    .attr("width", (d) => X(d.end_time) - X(d.start_time));

function highlight (d) {
    d3.selectAll("rect")
        .transition()
        .duration(300)
        .attr("fill-opacity", "0.2");

    d3.selectAll(`.schedule-${d.schedule}`)
        .transition()
        .duration(300)
        .attr("fill-opacity", "0.7");

    d3.selectAll(this)
        .transition()
        .duration(300)
        .attr("fill-opacity", "1");
}

function unwindHighlight (d) {
    d3.selectAll(`rect`)
        .transition()
        .duration(300)
        .attr("fill-opacity", "1");
}

svg.append("g")
    .attr("class", "axis x-axis")
    .attr("transform", "translate(0," + (dimension.height - dimension.margin.bottom) + ")")
    .call(Xaxis);

function zoom() {
    const extent = [[dimension.margin.left, dimension.margin.top], [dimension.width - dimension.margin.right, dimension.height - dimension.margin.top]];

    svg.call(d3.zoom()
        .scaleExtent([1, 12])
        .translateExtent(extent)
        .extent(extent)
        .on("zoom", zoomed));

    function zoomed() {
        X = d3.event.transform.rescaleX(originalX);

        svg.selectAll("rect")
            .attr("x", (d) => X(d.start_time))
            .attr("width", (d) => X(d.end_time) - X(d.start_time));
        svg.selectAll(".x-axis").call(Xaxis.scale(X));
    }
}