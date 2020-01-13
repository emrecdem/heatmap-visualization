
// set the dimensions and margins of the graph
var margin = {top: 30, right: 100, bottom: 30, left: 50},
  width = 1000 - margin.left - margin.right,
  height = 200 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#svg-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Labels of row and columns
let start_time = 0
let end_time = 350
let resolution = 10
var myGroups = d3.range(start_time, end_time, resolution);
var myVars = ["au01", "au04", "au09", "au10", "au12", "au14"]

// Build X scales and axis:
const x = d3.scaleBand()
  .range([ 0, width ])
  .domain(myGroups)
  .padding(0.01);
const xAxis = g => g
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));
svg.append("g")
  .attr("class", "x-axis")
  .call(xAxis);

// Build Y scales and axis:
const y = d3.scaleBand()
  .range([ height, 0 ])
  .domain(myVars)
  .padding(0.01);
const yAxis = g => g
  .call(d3.axisLeft(y));
svg.append("g")
  .attr("class", "y-axis")
  .call(yAxis);

// Build color scale
var myColor = d3.scaleLinear()
  .range(["#f5dd42", "#dd0000"])
  .domain([0, 4])


// Converts wide format data to long format
const longify = (rows) => {
  const extracted = []
  rows.forEach((row) => {
    myVars.forEach((varr) => {
      extracted.push({ frame: row.min_timestamp, variable: varr, value: row[varr] });
    });
  });
  return extracted;
}

const fetchData = () => {

  const body = JSON.stringify({
    query: `query MyQuery2 {
      testaggau(args: {start_time: ${start_time}, end_time: ${end_time}, resolution: ${resolution}}) {
        ${myVars.join(', ')}
        grouped_seconds
        min_timestamp
      }
  }`});

  console.log(body);
    return fetch('http://localhost:8080/v1/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  })
    .then(response => {
      return response.json()
    })
    .then(responseAsJson => {
      //console.log(responseAsJson.data.testaggau);
      const data = longify(responseAsJson.data.testaggau);
      //console.log(data);
      
      const cells = svg.selectAll(".cell")
        .data(data, function(d) {return "" + d.frame+':'+d.variable;})
      cells.exit().remove();
      cells.enter().append("rect")
        .attr("class", "cell")
        .merge(cells)
        .attr("x", function(d) { return x(d.frame) })
        .attr("y", function(d) { return y(d.variable) })
        .attr("width", x.bandwidth() )
        .attr("height", y.bandwidth() )
        .style("fill", function(d) { return myColor(d.value)} )
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

      svg.selectAll(".x-axis").call(xAxis);
      svg.selectAll(".y-axis").call(yAxis);
    });
};
fetchData();

function zoomed() {
  x.range([margin.left, width - margin.right]
    .map(d => d3.event.transform.applyX(d)));
  svg.selectAll(".cell")
    .attr("x", d => x(d.frame))
    .attr("width", x.bandwidth());
  svg.selectAll(".x-axis").call(xAxis);

  let k = d3.event.transform.k;
  let new_resolution = Math.floor(10 / k);
  if (new_resolution !== resolution) {
    resolution = Math.max(new_resolution, 1);
    console.log(resolution);

    // Update groups used for x-axis
    myGroups = d3.range(start_time, end_time, resolution);
    x.domain(myGroups);

    // Update cells
    fetchData();
  }

}

var zoom = d3.zoom().on("zoom", zoomed);
svg.call(zoom);


function handleMouseOver(d, i) {
  // Specify where to put label of text
  let node = svg.append("text").attrs({
    id: "popup",  // Create an id for text so we can select it later for removing on mouseout
    x: d3.event.pageX, // - document.getElementById('svg-container').getBoundingClientRect().x,
    y: d3.event.pageY, // - document.getElementById('svg-container').getBoundingClientRect().y
  });
  //console.log(node);

  node.text(function() {
    return [d.value];  // Value of the text
  });
}

function handleMouseOut(d, i) {
  d3.selectAll("#popup").remove();
}
