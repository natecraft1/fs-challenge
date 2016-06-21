console.log("jsndfjk")
d3.json("reviews/fetch-reviews", function(data) {
  
  console.log(data)
  // drawGraph(data)

})

function drawGraph(data) {

  var margin = {top: 20, right: 20, bottom: 30, left: 60},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

  var parseDate = d3.time.format("%Y-%m-%d").parse;
  data.forEach(function(d) { d.date = parseDate(d.date) })

  var minDate = d3.min(data, function(d) { return d.date; })
  var maxDate = d3.max(data, function(d) { return d.date })

  var x = d3.time.scale()
      .domain([minDate, maxDate])
      .range([0, width]);

  var y = d3.scale.linear()
      .range([height, 0])
      .domain([0, 5]);

  var xAxis = d3.svg.axis()
      .scale(x)
      // .tickFormat(d3.time.format("%Y-%m-%d"))
      .orient("bottom")

  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left");

  var cValue = function(d) { return +d.rating ;},
       color = d3.scale.linear().domain([5, 0]).range(["#97BEFC", "red"])

  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);

  // x-axis
  svg.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0," + height + ")")
       .call(xAxis)
     .append("text")
       .attr("class", "label")
       .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", "-.55em")
      .attr("transform", "rotate(-90)" );

  // y-axis
  svg.append("g")
       .attr("class", "y axis")
       .call(yAxis)
     .append("text")
       .attr("class", "label")
       .attr("transform", "rotate(-90)")
       .attr("y", 6)
       .attr("dy", ".71em")
       .style("font-size", "20px")
       .style("text-anchor", "end")
       .text("yes");

  // svg.selectAll(".dot")
  //     .data(data)
  //   .enter().append("circle")
  //     .attr("class", "dot")
  //     .attr("r", function(d) { return circleRadiusScale(d.population) })
  //     .attr("cx", xMap)
  //     .attr("cy", yMap)
  //     .style("fill", function(d) { return color(cValue(d));}) 

}