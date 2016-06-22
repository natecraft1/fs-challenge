// d3.json("/reviews/scrape-reviews", function(data) {
  // this was the call to scrape Yelp
// })

d3.json("/reviews/sentiment", function(data) {
  
  console.log(data)
  drawGraph(data)

});

function drawGraph(data) {

  var margin = {top: 20, right: 20, bottom: 30, left: 60},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
  
  var seasonalData = formatToSeasonalData(data)

  var x = d3.scale.ordinal()
      .domain(seasonalData.map(function (d) {return d.season; }))
      .rangeRoundBands([0, width], 0.3);

  var y = d3.scale.linear()
      .range([height, 0])
      .domain([0, 5]);

  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")

  var yAxis = d3.svg.axis()
      .scale(y)
      .ticks(5)
      .orient("left");

  var xMap = function(d) { return x(d.date); }
  var yMap = function(d) { return y(+d.rating); }

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
       .text("Rating");

  svg.selectAll(".bar")
        .data(seasonalData)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.season); })
        .attr("width", x.rangeBand())
        .attr("y", height)
        .attr("height", 0)
        .transition()
        .duration(1000)
        .attr("y", function(d) { return y(d.avgRating); })
        .attr("height", function(d) { return height - y(d.avgRating); })

  var sentimentData;

  d3.select("h1.sentiment").on("click", function() {
    
    svg.selectAll(".bar")
        .transition()
        .duration(600)
        .attr("y", height)
        .attr("height", 0);

    if (!sentimentData) sentimentData = formatToSentimentData(data)

    svg.selectAll(".dot")
          .data(sentimentData)
        .enter().append("circle")
          .attr("class", "dot")
          .attr("r", function(d) { return circleRadiusScale(d.population) })
          .attr("cx", xMap)
          .attr("cy", yMap)

  })

}

function formatToSentimentData(data) {

  return data

}

function formatToSeasonalData(data) {

  var parseDate = d3.time.format("%Y-%m-%d").parse;
  data.forEach(function(d) { d.date = parseDate(d.date) })

  var seasonalData = { "Winter": [], "Spring": [], "Summer": [], "Fall": [] }
  
  data.reduce(function(a, b) {
    a[getSeason(b.date)].push(b)
    return a
  }, seasonalData)

  var seasons = [] 
  
  Object.keys(seasonalData).forEach(function(seasonKey) {

    var avgRating = seasonalData[seasonKey].reduce(function(a, b) {
      return a + +b.rating
    }, 0)/seasonalData[seasonKey].length
    seasons.push({ "season": seasonKey, avgRating: avgRating })
    
  })
  return seasons
}

function getSeason (d) { 
  var month = d.getMonth()
  switch(month) {
    case 11:
    case 0:
    case 1:
        return 'Winter'
    break;
    case 2:
    case 3:
    case 4:
        return 'Spring'
    break;
    case 5:
    case 6:
    case 7:
        return 'Summer'
    break;
    case 8:
    case 9: 
    case 10:
        return 'Fall'
    break;
  }
}
