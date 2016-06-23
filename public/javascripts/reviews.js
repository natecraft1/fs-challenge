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

  var x, y, xAxis, yAxis;
  setXYValuesForSeasonalChart(seasonalData)

  var svg = d3.select("body").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  var tooltip = d3.select("body").append("div")
      .attr("class", "tooltip reviews")
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

  svg.append("g")
        .attr("class", "bars")
        .selectAll(".bar")
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

  var minScore, maxScore, cValue, color;
  var sentimentDataAlreadySet = false

  d3.select("h1.sentiment").on("click", function() {
    
    if (!sentimentDataAlreadySet) { 
      setSentimentData()
    }
    setGraphOpacity(1)

    setXYValuesForSentimentChart(data) 

    updateAxes()

    animateSeasonalGraphOut()

    setTimeout(function() {
      animateSentimentGraphIn()
    }, 500)
    
   highlightSelectedHeader(this)

  })
  
  d3.select('h1.seasonal').on('click', function() {

    setGraphOpacity(1)

    setXYValuesForSeasonalChart(seasonalData)
    
    updateAxes()

    animateSentimentGraphOut()

    setTimeout(function() {
      animateSeasonalGraphIn()
    }, 500) 
    
    highlightSelectedHeader(this)

  })

  var wordMapCreated = false

  d3.select('h1.wordmap').on("click", function() {
    
    setGraphOpacity(0)

    highlightSelectedHeader(this)

    if (!wordMapCreated) {
      createWordMap(data)
      wordMapCreated = true
    }

    d3.select(".wordmap-containter")
      .style("opacity", 1)

  })

  function animateSeasonalGraphIn() {
    svg.selectAll(".bar")
      .transition()
      .duration(600)
      .attr("y", function(d) { return y(d.avgRating); })
      .attr("height", function(d) { return height - y(d.avgRating); })
  }

  function animateSeasonalGraphOut() {
     svg.selectAll(".bar")
      .transition()
      .duration(600)
      .attr("y", height)
      .attr("height", 0);
  }

  function animateSentimentGraphIn() {
    svg.selectAll(".dot")
      .attr("cx", function(d) { return x(d.date) })
      .attr("cy", height)
      .attr("r", 3.5)
        .transition()
      .duration(500)
      .attr("cy", function(d) { return y(d.score) })
  }

  function animateSentimentGraphOut() {
    svg.selectAll(".dot")
        .transition()
      .duration(500)
      .attr("cy", height)
      .attr("r", 0);
  }

  function highlightSelectedHeader(el) {
    d3.select(".selected").classed("selected", false)
    d3.select(el).classed("selected", true)
  }

  function setGraphOpacity(opacity) {

    d3.select(".points")
      .style("opacity", opacity)

    d3.select(".bars")
      .style("opacity", opacity)

    d3.select(".axis.x")
      .style("opacity", opacity)

    d3.select(".axis.y")
      .style("opacity", opacity)

    if (opacity) {
      d3.select(".wordmap-containter")
        .style("opacity", 0)
    }
  }

  function updateAxes() {
      // Update X Axis
    svg.select(".x.axis")
        .transition()
        .duration(500)
        .call(xAxis);

    // Update Y Axis
    svg.select(".y.axis")
        .transition()
        .duration(500)
        .call(yAxis);
  }

  function setSentimentData() {
    
    //  not necessary to set these until click

    minScore = d3.min(data, function(d) { return d.score })
    maxScore = d3.max(data, function(d) { return d.score })
    cValue = function(d) { return d.score ;},
    color = d3.scale.linear().domain([minScore, maxScore]).range(["#FFDBDB", "#97BEFC"])
    
    svg.append("g")
            .attr("class", "points")
            .selectAll(".dot")
            .data(data)
          .enter().append("circle")
            .attr("class", "dot")
            .attr("r", function(d) { return 3.5 })
            .style("fill", function(d) { return color(cValue(d));}) 
            .style("opacity", .7)
            .on("mouseover", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(d.review)
                    .style("left", (d3.event.pageX + 5) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
              })
              .on("mouseout", function(d) {
                  tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
              })

    sentimentDataAlreadySet = true
  }

  function setXYValuesForSeasonalChart(data) {
    
    x = d3.scale.ordinal()
        .domain(data.map(function (d) {return d.season; }))
        .rangeRoundBands([0, width], 0.3);

    y = d3.scale.linear()
        .range([height, 0])
        .domain([0, 5]);

    xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")

    yAxis = d3.svg.axis()
        .scale(y)
        .ticks(5)
        .orient("left");

  }

  function setXYValuesForSentimentChart(data) {

    x = d3.time.scale()
        .domain([data[0].date, data[data.length-1].date])
        .range([0, width])
        // .rangeRoundBands([0, width], 0.3);

    y = d3.scale.linear()
        .domain([minScore, maxScore])
        .range([height, 0]);

    xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")

    yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

  }

  function createWordMap(data) {
    
    var formattedData = formatWordMapData(data);

    var color = d3.scale.linear()
                .domain([0,1,2,3,4,5,6,10,15,20,100])
                .range(["#ddd", "#ccc", "#bbb", "#aaa", "#999", "#888", "#777", "#666", "#555", "#444", "#333", "#222"]);

    d3.layout.cloud().size([960, 800])
                .words(formattedData.positive)
                .rotate(0)
                .fontSize(function(d) { return d.size; })
                .on("end", draw)
                .start();

    function draw(words) {
        svg
          .append("g")
          .attr("class", "wordmap-containter")
          // without the transform, words words would get cutoff to the left and top, they would
          // appear outside of the SVG area
          .attr("transform", "translate(360, 300)")
          .selectAll("text")
          .data(words)
          .enter().append("text")
          .style("font-size", function(d) { return d.size + "px"; })
          .style("fill", function(d, i) { return color(i); })
          .attr("transform", function(d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
          })
          .text(function(d) { return d.text; });
    }

  }

  function formatWordMapData(data) {

    var wordCache = data.reduce(function(a,b) {
     
      b.positive.forEach(function(word) {
        addWordToCache(a.positive, word)
      })

      b.negative.forEach(function(word) {
        addWordToCache(a.negative, word)
      })

      return a
    }, { positive: {}, negative: {} })
    
    return { positive: formatAndRemoveItems(wordCache.positive), negative: formatAndRemoveItems(wordCache.negative) }
    
    // Helper Functions
    function formatAndRemoveItems(obj) {
      return Object.keys(obj).reduce(function(a, k) {
        if (obj[k] < 2) { 
          delete obj[k] 
        } else {
          a.push({ text: k, size: obj[k]})
        }
        return a
      }, [])
    }

    function addWordToCache(cache, word) {
      word = word.toLowerCase()
      if (cache[word]) {
        cache[word]++
      } else {
        cache[word] = 1
      }
    }

  }

}

function formatToSeasonalData(data) {

  var parseDate = d3.time.format("%Y-%m-%d").parse;
  data.forEach(function(d) { d.date = parseDate(d.date) })
  data.sort(function(a, b) { return a.date - b.date; })
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
