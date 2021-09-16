// Global Variables
const tooltip = d3.select("body").append("div").attr("class", "tooltip");
const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");
const projection = d3
  .geoMercator()
  .scale(width / 2 / Math.PI)
  .translate([width / 2, height / 2]);
const path = d3.geoPath().projection(projection);
const zoomg = svg.append("g").attr("class", "everything");
const geoUrl = "https://enjalot.github.io/wwsd/data/world/world-110m.geojson";
let node;

// Add World Map
d3.json(geoUrl, (err, geojson) => {
  zoomg
    .append("path")
    .attr("d", path(geojson))
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.2);
});

// Add Zoom Capabilities
const zoomHandler = d3.zoom().on("zoom", zoomActions);
zoomHandler(svg);

// Add Meteor Data

const dataUrl =
  "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json";
d3.json(dataUrl, (jsonData) => {
  // Process Data
  for (let i = 0; i < jsonData.features.length; i++) {
    let entry = jsonData.features[i];
    if (entry.geometry == undefined) {
      entry.geometry = { coordinates: [-1, -1] };
    }
    let mass = Number.parseInt(entry.properties.mass);
    entry.mass = mass;
    entry.radius = circleRadius(entry);
  }

  // Node
  node = svg
    .selectAll("circle")
    .data(jsonData.features)
    .enter()
    .append("circle")
    .attr("cx", (d) => projection(d.geometry.coordinates)[0])
    .attr("cy", (d) => projection(d.geometry.coordinates)[1])
    .attr("r", (d) => d.radius + "px")
    .attr("fill", "orange")
    .attr("opacity", "0.3")
    .on("mouseover", (d) => {
      tooltip.transition().duration(0).style("opacity", 0.8);
      tooltip
        .html(
          `<div>Name: ${d.properties.name} </div>
    <div>Class: ${d.properties.recclass}</div>
    <div>Mass: ${d.properties.mass ? d.properties.mass : "NA"} </div>
    <div>Year: ${d.properties.year.slice(0, 4)} </div>`
        )
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY + "px");
    })
    .on("mouseout", (d) => {
      tooltip.html("").style("opacity", 0);
    });
});

// Helper Functions

// Zoom Functions
function zoomActions() {
  zoomg.attr("transform", d3.event.transform);
  node.attr("transform", d3.event.transform);
  node.attr("r", (d) => {
    let radius = d.radius;
    let scale = d3.event.transform.k * 0.5;

    // Adjust when Zooming In
    if (d3.event.transform < 1) {
      radius = d.radius / scale;
    }
    return d.radius / d3.event.transform.k;
  });

  tooltip.html("").style("opacity", 0);
}

// Function for Radius Based on Mass
function circleRadius(d) {
  let result;
  if (d.mass < 10) {
    result = 2;
  } else if (d.mass < 1000) {
    result = 2;
  } else if (d.mass < 100000) {
    result = 4;
  } else if (d.mass < 1000000000) {
    result = 8;
  } else {
    result = 16;
  }
  return result;
}
