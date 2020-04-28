import React, { useEffect } from 'react';
import * as d3 from 'd3';

function Slider(props) {
  useEffect(() => draw(props), []);
  return <div id="slider"></div>
}

function draw(props) {
  var margin = {top: 30, right: 100, bottom: 50, left: 50},
    width = props.width - margin.left - margin.right,
    height = props.height - margin.top - margin.bottom;

  var svg = d3.select("#slider")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var x = d3.scaleLinear()
    .domain([0, 250])
    .range([0, width])
    .clamp(true);

  var slider = svg.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + margin.left + "," + props.height / 2 + ")");

  slider.append("line")
      .attr("class", "track")
      .attr("x1", x.range()[0])
      .attr("x2", x.range()[1])
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-inset")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
      .attr("class", "track-overlay")
      .call(d3.drag()
          .on("start.interrupt", function() { slider.interrupt(); })
          .on("start drag", function() { console.log(x.invert(d3.event.x)); }));

  slider.insert("g", ".track-overlay")
      .attr("class", "ticks")
      .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
    .data(x.ticks(10))
    .enter().append("text")
      .attr("x", x)
      .attr("text-anchor", "middle")
      .text(d => d);

  var handle = slider.insert("circle", ".track-overlay")
      .attr("class", "handle")
      .attr("r", 9);

  slider.transition() // Gratuitous intro!
    .duration(750)
    .tween("hue", function() {
      var i = d3.interpolate(0, 70);
      return function(t) { hue(i(t)); };
    });

  function hue(h) {
    handle.attr("cx", x(h));
    svg.style("background-color", d3.hsl(h, 0.8, 0.8));
  }
}

export default Slider;
