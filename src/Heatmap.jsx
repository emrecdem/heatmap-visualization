import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';

let svg;
let margin;
let x;
let width, height;

function Heatmap(props) {

  //const [cursor, setCursor] = useState(0);

  useEffect(() => draw(props), []);
  useEffect(() => updateCursor(props.cursor), [props])

  function updateCursor() {
    console.log("cursor", props.cursor);
    const cursor = props.cursor;
    svg.selectAll(".cursorline")
      .attr('x1', () => x(Math.round(cursor)))
      .attr('y1', 0 - margin.top)
      .attr('x2', () => x(Math.round(cursor)))
      .attr('y2', height + margin.bottom)
  }

  function draw(props) {
    console.log("draw()", props.cursor);
    const cursor = props.cursor;
    const onCursorChange = props.onCursorChange;

    // set the dimensions and margins of the graph
    margin = {top: 30, right: 100, bottom: 50, left: 50};
    width = props.width - margin.left - margin.right;
    height = props.height - margin.top - margin.bottom;

    // append the svg object to the body of the page
    svg = d3.select("#svg-container")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Clipping
    svg.append('defs')
      .append('clipPath')
      .attr('id', 'clip')
      .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height);

    // Labels of row and columns
    let start_time = 0
    let end_time = 350
    let resolution = 1
    var myGroups = d3.range(start_time, end_time, resolution);
    var tickValues = d3.range(start_time, end_time, 30);
    var myVars = ["au01r", "au01c", "au04r", "au04c", "au09r", "au09c", "au10r", "au10c", "au12r", "au12c", "au14r", "au14c"]

    const formatDuration = d => new Date(1000 * d).toISOString().substr(14, 5);

    // Build X scales and axis:
    x = d3.scaleBand()
      .range([ 0, width ])
      .domain(myGroups)
      .padding(0.01);
    const xAxis = g => g
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));
        //.tickValues(tickValues)
        //.tickFormat(formatDuration));
    svg.append("g")
      .attr("class", "x-axis")
      .attr('clip-path', 'url(#clip)')
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

    // Group for main content
    const main = svg.append("g")
      .attr("class", "main")
      .attr('clip-path', 'url(#clip)');

    // Cursor
    const cursorGroup = svg.append("g")
      .attr("class", "cursor")
      .append("line")
        .attr("class", "cursorline")
        .attr('x1', () => { console.log(cursor); return x(cursor); })
        .attr('y1', 0 - margin.top)
        .attr('x2', () => x(cursor))
        .attr('y2', height + margin.bottom)
        .attr('stroke', '#0b0')
        .attr('stroke-width', 2)
        .call(d3.drag().on('drag', dragmove));

    function dragmove(d) {
      const eventX = d3.event.x;
//      console.log("dragmove: " + x.invert(eventX));
      svg.selectAll(".cursorline")
        .attr('x1', eventX)
        .attr('x2', eventX);
      //cursorGroup.attr("transform", "translate(" + eventX + "," + 0 + ")");
      onCursorChange(eventX);
    }

    // Build color scale
    const myColor = d3.scaleSequential()
      .domain([0,4])
      .interpolator(d3.interpolateInferno);

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

      return fetch('http://localhost:8080/v1/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      })
        .then(res => res.json())
        .then(res => {
          const data = longify(res.data.testaggau);
          
          const cells = main.selectAll(".cell")
            .data(data, d => "" + d.frame + ':' + d.variable)
          cells.exit().remove();
          cells.enter().append("rect")
            .attr("class", "cell")
            .merge(cells)
            .attr("x", d => x(d.frame))
            .attr("y", d => y(d.variable))
            .attr("width", x.bandwidth() )
            .attr("height", y.bandwidth() )
            .style("fill", d => {
              if (d.variable.endsWith('c')) {
                return myColor(d.value * 4);
              }
              return myColor(d.value);
            });
            //.on("mouseover", handleMouseOver)
            //.on("mouseout", handleMouseOut);

          svg.selectAll(".x-axis").call(xAxis);
          svg.selectAll(".y-axis").call(yAxis);
        });
    };
    fetchData();

    function zoomed() {
      //console.log(d3.event.transform);
      //console.log([0, 350].map(d => d3.event.transform.invertX(d)));
      //console.log([0, 350].map(d => d3.event.transform.applyX(d)));
      
      x.range([margin.left, width - margin.right]
        .map(d => d3.event.transform.applyX(d)));
      svg.selectAll(".cell")
        .attr("x", d => x(d.frame))
        .attr("width", x.bandwidth());
      svg.selectAll(".x-axis").call(xAxis);
      
      // let currentTime = x.invert(400);
      // console.log(currentTime);


    /*  let t = d3.event.transform;
      let tx = Math.min(0, Math.max(t.x, width - width*t.k));
      let ty = Math.min(0, Math.max(t.y, height - height*t.k));
      main.attr('transform', 'translate(' + [tx,ty] + ')scale(' + t.k + ')');
      svg.selectAll('.x-axis').call(xAxis);
      svg.selectAll('.y-axis').call(yAxis);*/

      // let k = d3.event.transform.k;
      // let new_resolution = 1; //Math.floor(10 / k);
      // if (new_resolution !== resolution) {
      //   resolution = Math.max(new_resolution, 1);

      //   // Update groups used for x-axis
      //   myGroups = d3.range(start_time, end_time, resolution);
      //   x.domain(myGroups);

      //   // Update cells
      //   fetchData();
      // }
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

  }

  return <div id="svg-container"></div>;
}

export default Heatmap;
