var policeDataUrl = 'json/police.json',
    crimeDataUrl = 'json/crime.json',
    wealthDataUrl = 'json/income.json';


// wish d3 had a promise API
d3.json(policeDataUrl, function(error, policeData) {
    d3.json(crimeDataUrl, function(error, crimeData) {
        d3.json(wealthDataUrl, function(error, wealthData) {
            drawGraph(mungeData(policeData, crimeData, wealthData))
        })
    })
})

function drawGraph(data) {

    var margin = {top: 20, right: 20, bottom: 30, left: 60},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;


    var xValue, xMap, xAxis, xScale = d3.scale.linear().range([0, width]);
    var yValue, yMap, yAxis, yScale = d3.scale.linear().range([0, height]);
        
    var officersValue = function(d) { return d.officersPerCapita; },
        crimeValue = function(d) { return d.crimeRate; },
        wealthValue = function(d) { return d.medianHouseholdIncome; };
    
    officersValue.title = "Police Officers Per Capita"
    crimeValue.title = "Crime Rate"
    wealthValue.title = "Median Household Income"

    setXYValues("crime officers")

    // setup fill color
    var cValue = function(d) { return d.crimeRate ;},
         color = d3.scale.linear().domain([0, 0.02]).range(["#97BEFC", "red"])

    var circleRadiusScale = d3.scale.linear().domain([10000, d3.max(data, function(d) { return d.population; })]).range([4, 40])

    // add the graph canvas to the body of the webpage
    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // add the tooltip area to the webpage
    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    svg.append("g")
         .attr("class", "x axis")
         .attr("transform", "translate(0," + height + ")")
         .call(xAxis)
       .append("text")
         .attr("class", "label")
         .attr("x", width)
         .attr("y", -6)
         .style("font-size", "20px")
         .style("text-anchor", "end")
         .text(xValue.title);

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
         .text(yValue.title);

    // draw dots
    svg.selectAll(".dot")
        .data(data)
      .enter().append("circle")
        .attr("class", "dot")
        .attr("r", function(d) { return circleRadiusScale(d.population) })
        .attr("cx", xMap)
        .attr("cy", yMap)
        .style("fill", function(d) { return color(cValue(d));}) 
        .on("mouseover", function(d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(d.city + "<br/> Officers Per Capita: " + xValue(d) 
                + "<br/> Crime Rate: " + yValue(d) 
                + "<br/> Population: " + d.population 
                + "<br/> Median Household Income: " + d.medianHouseholdIncome)
                .style("left", (d3.event.pageX + 5) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
          })
          .on("mouseout", function(d) {
              tooltip.transition()
                .duration(500)
                .style("opacity", 0);
          });

    d3.selectAll("h1").on("click", function(el) {
        
        classes = d3.select(this).attr("class")
        setXYValues(classes)

        d3.selectAll(".dot")
            .transition()
            .duration(800)
            .attr("cx", xMap)
            .attr("cy", yMap);

        // Update X Axis
        svg.select(".x.axis")
            .transition()
            .duration(500)
            .call(xAxis)
            .select(".label")
            .text(xValue.title)

        // Update Y Axis
        svg.select(".y.axis")
            .transition()
            .duration(500)
            .call(yAxis)
            .select(".label")
            .text(yValue.title)

        d3.select(".selected").classed("selected", false)
        d3.select(this).classed("selected", true)

    })

    function setXYValues(classes) {
        xValue = xValueForSelectedValues(classes)
        yValue = yValueForSelectedValues(classes)

        xScale.domain([d3.min(data, xValue), d3.max(data, xValue)])
        yScale.domain([d3.max(data, yValue), 0])

        xMap = function(d) { return xScale(xValue(d) || 0); }
        yMap = function(d) { return yScale(yValue(d) || 0); }

        xAxis = d3.svg.axis().scale(xScale).orient("bottom");
        yAxis = d3.svg.axis().scale(yScale).orient("left");
    }

    function xValueForSelectedValues(selectedValues) {
        if (selectedValues.indexOf("officers") != -1) return officersValue
        return wealthValue
    }

    function yValueForSelectedValues(selectedValues) {
        if (selectedValues.indexOf("crime") != -1) return crimeValue
        return wealthValue
    }
     
}

function mungeData(policeData, crimeData, wealthData) {
    
    var policeDataByCity = policeData.reduce(function(a, b) {
        a[b.City] = b
        return a
    }, {})

    return crimeData.reduce(function(arr, crimeData) {
        var city = crimeData.City
        var policeData = policeDataByCity[city]
        if (policeData && stringToNumber(policeData["Population"]) > 10000) {

            var medianHouseholdIncome = wealthData[city] ? stringToNumber(wealthData[city]) : wealthData[city]
            arr.push(new CityData(policeData, crimeData, medianHouseholdIncome))
        }
        return arr
    }, [])

}

function CityData(policeData, crimeData, medianHouseholdIncome) {
    
    this.population = stringToNumber(policeData["Population"])
    this.crimeRate = stringToNumber(crimeData["Violent crime"])/this.population
    this.officersPerCapita = stringToNumber(policeData["Total officers"])/this.population
    this.city = policeData["City"]
    this.medianHouseholdIncome = medianHouseholdIncome
    if (!this.crimeRate || !this.officersPerCapita || !this.population) {
        
    }

}

function stringToNumber(n) {
    if (!isNaN(n)) return n
    return Number(n.replace(/[,$]/g,''))
}

function extendProperties(objA, objB) {
    var o = {}
    for (prop in objA) {
        o[prop] = objA[prop]
    }
    for (prop in objB) {
        o[prop] = objB[prop]
    }
    return o
}
