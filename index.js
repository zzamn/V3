import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let width = document.documentElement.clientWidth;
let height = document.documentElement.clientHeight;

let quality = 8000;

// This is definitely a horrible way to add svg to the body lol
d3.select("body")
    .selectAll("svg")
    .data([1])
    .enter()
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const svg = d3.select("svg");
const content = svg.append("g");
// ZOOM

const zoom = d3.zoom()
    .scaleExtent([1, 2.5]) // Sets the zoom scale range (min, max)
    .translateExtent([[0, 0], [width, height]]) // Set the panning limits (optional)
    .on("zoom", zoomed); // Callback when zooming/panning occurs

// Create a group element to hold the polygons


// Apply the zoom behavior to the group element
content.call(zoom);

// Zoom event callback function
function zoomed(event) {
    content.attr("transform", event.transform);  // Update only the group (not the entire SVG)
}
// ZOOM END

// picks the polygon coordinates
var loc = d3.range(quality).map(() => {
    return [Math.random() * width, Math.random() * height];
});

// makes graphs for them
let delaunay = d3.Delaunay.from(loc);
let voronoi = delaunay.voronoi([0, 0, width, height]);
let polygons = loc.map((_, i) => voronoi.cellPolygon(i));

// normalizes them so that..yk... the polygons don't look all clumpy and weird
function normalize(amt) {
    for (let i = 0; i < amt; i += 1) {
        loc = polygons.map((x) => { return d3.polygonCentroid(x) });
        delaunay = d3.Delaunay.from(loc);
        voronoi = delaunay.voronoi([0, 0, width, height]);
        polygons = loc.map((_, i) => voronoi.cellPolygon(i));
    }
}
normalize(2);

// const color = d3.scaleSequential(d3.interpolateSpectral);
let color = d3.scaleSequential(d3.interpolateSpectral);

// now I gotta make a heightmap :c
// alright now that i made a new array....
let heightMap = new Array(quality).fill(0);

let allNeighbors = [];
// Loop over each point and store its neighbors
for (let i = 0; i < loc.length; i++) {
    let neighbors = delaunay.neighbors(i); // Get neighbors of the point i
    allNeighbors.push(neighbors); // Store neighbors in the array
}

function sharpness(decrement, probability) {
    let ans = 0;
    if (Math.random() <= probability) {
        ans = decrement;
    }
    return ans;
}

function heights(peak) {
    let decay = 0.98,
        max = 1,
        waterLine = 0.2,
        queue = [peak],
        visited = new Set(); // Faster lookup for visited nodes

    heightMap[peak] = max;

    visited.add(peak);

    while (queue.length !== 0) {
        let target = queue.pop(); // Faster than shift()

        heightMap[target] = Math.max(0, heightMap[target] * decay - sharpness(0.65, 0.1));

        if (heightMap[target] > waterLine) {
            for (let x of allNeighbors[target]) {
                if (!visited.has(x)) {
                    queue.push(x);
                    heightMap[x] = heightMap[target];
                    visited.add(x);
                }
            }
        } else {
            heightMap[target] = waterLine;
        }
    }
}

heights(0);
heights(69);
//heights(420);
//heights(690);
//heights(6969);

// Draws the stuff inside the group element
content.selectAll("path")
    .data(polygons)
    .enter().append("path")
    .attr("d", (d) => {
        return d ? `M${d.join("L")}Z` : null;
    })
    .attr("stroke", (_, i) => color(heightMap[i])) // Apply color based on heightMap
    .attr("fill", (_, i) => color(heightMap[i])); // Apply color based on heightMap
