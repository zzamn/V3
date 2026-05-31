//import * as d3 from 'd3';
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm"; 
import visit from "/v2/chat.js";

const timer = {
    startTime: 0,
    start() {
        this.startTime = performance.now();
    },
    stop() {
        return performance.now() - this.startTime;
    }
};

timer.start();

//The bit that helps with calculating polygons
let width = document.documentElement.clientWidth;
let height = document.documentElement.clientHeight;


let quality = 6000//8000;

var loc = d3.range(quality).map(() => {
    return [Math.random() * width, Math.random() * height];
});


let delaunay = d3.Delaunay.from(loc);
let voronoi = delaunay.voronoi([0, 0, width, height]);

function getCellPolygon(i) {
    return voronoi.cellPolygon(i);
}

let polygons = loc.map((_, i) => getCellPolygon(i));


//The bit that helps with calculating the heightMap
let heightMap = new Array(quality).fill(0);

let allNeighbors = [];
for (let i = 0; i < loc.length; i++) {
    let neighbors = Array.from(voronoi.neighbors(i)); // Convert iterator to array
    allNeighbors.push(neighbors);
}




let radius = 0.999,
    initHeight=0.99,
    seaLevel=0.2,
    sharpness=0.3


function heights2(peak) { 
    let used =  new Array(quality).fill(false);

    heightMap[peak]=initHeight;
    used[peak]=true;
    let currentHeight = initHeight;
    let queue = []
    queue.push(peak)
    for (let i=0; i<queue.length && currentHeight>seaLevel; i++) {
        currentHeight=heightMap[queue[i]]*radius
        allNeighbors[queue[i]].forEach((e) => {
            if (!used[e]) {
                var mod = Math.random() * sharpness + 1.1 - sharpness;
                if (sharpness == 0) {mod = 1;}
                heightMap[e]=Math.min(1,heightMap[e]+currentHeight*mod);
                used[e]=true;
                queue.push(e);
                
            }
        })
    }

}


heights2(0)
heights2(1)



// Assign regions to land cells
const numCountries = 7; // Adjust number of countries
let regions = new Array(quality).fill(-1);
let capitals = [];

// Select random capitals on land
while (capitals.length < numCountries) {
    let candidate = Math.floor(Math.random() * quality);
    if (heightMap[candidate] >= seaLevel && !capitals.includes(candidate)) {
        capitals.push(candidate);
    }
}

// Initialize BFS queue
let queue = [];
capitals.forEach((cap, id) => {
    regions[cap] = id;
    queue.push({ cell: cap, region: id });
});

// Expand regions using BFS
while (queue.length > 0) {
    let { cell, region } = queue.shift();
    allNeighbors[cell].forEach(neighbor => {
        if (regions[neighbor] === -1 && heightMap[neighbor] >= seaLevel) {
            regions[neighbor] = region;
            queue.push({ cell: neighbor, region: region });
        }
    });
}





//////////////////////////////////////!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


//the GUI dimensions and shit
let color = d3.scaleSequential(d3.interpolateSpectral)

const countryColors = d3.schemeCategory10;
let svg = d3.select("body")
        .append('svg')
        
svg.attr("width", width)
        .attr("height", height);

let content = svg.append("g");

/*
// ZOOM
const zoom = d3.zoom()
    .scaleExtent([1, 2.5]) // Sets the zoom scale range (min, max)
    .translateExtent([[0, 0], [width, height]]) // Set the panning limits (optional)
    .on("zoom", zoomed); // Callback when zooming/panning occurs

// Apply the zoom behavior to the group element
content.call(zoom);

// Zoom event callback function
function zoomed(event) {
    content.attr("transform", event.transform);  // Update only the group (not the entire SVG)
}
// ZOOM END
*/
//Coloring in the map COUNTRIES! for color() since color(0) is blue and 1 is red, min-max represents the range of countries yk
let min = 0.25,
    max = 0.99,
    diff = max-min;
content.selectAll("path")
    .data(polygons)
    .enter().append("path")
    .attr("d", (d) => {
        return d ? `M${d.join("L")}Z` : null;
    })
    .attr("stroke", (_, i) => {
        if (heightMap[i]<seaLevel)
        {return color(1);}

        else {
            let ratio = Math.max(0,regions[i])/numCountries
            return color(1-(ratio*diff +min))
        }
    
    })
    .attr("fill", (_, i) => {
        if (heightMap[i] < seaLevel) return color(1); // Water color

        else {
            let ratio = Math.max(0,regions[i])/numCountries
            return color(1-(ratio*diff +min))
        }


        return color(1-heightMap[i])}) 
    //});
//le-end 

/*
content.selectAll("text")
    .data(loc)
    .enter()
    .append("text")
    .attr('x',(d) => d[0])
    .attr('y',(d)=> d[1])
    .text((d, i) => i);

*/




let p = timer.stop()    
console.log("Time elapsed to make this map: ", p, " ms.")
//145-100 ms mostly around 120

// Initialize current region tracking
let currentRegion = 0; // Start at region 0
visit(currentRegion);

// Function to update the appearance of capitals based on current region
function updateCapitals() {
    // Select all capital circles and update their appearance
    content.selectAll('circle.capital')
        .attr('fill', d => regions[d] === currentRegion ? 'red' : 'black') // Red for current, black for others
        .attr('r', d => regions[d] === currentRegion ? 8 : 5) // Larger radius for current
        .attr('stroke', d => regions[d] === currentRegion ? 'gold' : 'white') // Gold border for current
        .attr('stroke-width', d => regions[d] === currentRegion ? 2 : 1) // Thicker border for current
        .attr('cursor', d => regions[d] === currentRegion ? 'default' : 'pointer'); // No pointer for current*/
}

// Create the capital markers with click handlers
content.selectAll('circle.capital')
    .data(capitals)
    .enter()
    .append('circle')
    .attr('class', 'capital')
    .attr('cx', d => loc[d][0])
    .attr('cy', d => loc[d][1])
    .attr('r', 5)
    .attr('fill', 'black')
    .attr('stroke', 'white')
    .attr('stroke-width', 1)
    .attr('cursor', 'pointer')
    .on('click', (event, d) => {
        // Only respond to clicks on capitals that aren't the current region
        if (regions[d] !== currentRegion) {
            visit(regions[d]);
            //console.log("Moving from region", currentRegion, "to region", regions[d]);
            currentRegion = regions[d]; // Update current region
            updateCapitals(); // Update visuals
        }
    });

// Initialize capitals to show region 0 as current
updateCapitals();





/////////////////////////////////!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!



function drawBorders() {
    const borders = [];
    const addedEdges = new Set();

    for (let i = 0; i < regions.length; i++) {
        if (regions[i] === -1) continue; // Skip water cells
  
        allNeighbors[i].forEach(neighbor => {
            if (regions[neighbor] !== -1 && regions[i] !== regions[neighbor]) {
                // Prevent duplicate edges
                const edgeKey = [i, neighbor].sort((a, b) => a - b).join('-');
                if (!addedEdges.has(edgeKey)) {
                    addedEdges.add(edgeKey);
                    const edge = findSharedEdge(polygons[i], polygons[neighbor]);
                    if (edge.length === 2) {
                        borders.push(edge);
                    }
                }
            }
        });
    }

    // Draw borders
    content.append("g")
        .attr("class", "country-borders")
        .selectAll("path")
        .data(borders)
        .enter()
        .append("path")
        .attr("d", d => `M${d[0][0]},${d[0][1]}L${d[1][0]},${d[1][1]}`)
        .attr("stroke", "#000")
        .attr("stroke-width", 1.2)
        .attr("fill", "none");
}




///////////////////////////////////////!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!




function drawCoastline(threshold = 0.2) {
    const coastlinePaths = [];
    
    // Iterate through each polygon
    for (let i = 0; i < polygons.length; i++) {
        if (heightMap[i] >= threshold) { // Land cell
            // Get the neighbors of this cell
            const neighbors = Array.from(voronoi.neighbors(i));
        
        // Check each neighbor
            for (const neighborIdx of neighbors) {
                if (heightMap[neighborIdx] < threshold) { // Water neighbor
                // We found a coast edge - get the shared edge between these cells
                    const cellPolygon = polygons[i];
                    const neighborPolygon = polygons[neighborIdx];
            
            // Find shared vertices between the two polygons
                    const sharedVertices = findSharedEdge(cellPolygon, neighborPolygon);
            
                    if (sharedVertices.length === 2) {
                        coastlinePaths.push(sharedVertices);
                    }
                }
            }
        }
    }
    
    // Draw the collected coastline segments
    const coastline = content.append("g").attr("class", "coastline");

    coastline.selectAll("path")
        .data(coastlinePaths)
        .enter()
        .append("path")
        .attr("d", d => `M${d[0][0]},${d[0][1]}L${d[1][0]},${d[1][1]}`)
        .attr("stroke", "#000")  // Black coastline
        .attr("stroke-width", 1.5)
        .attr("fill", "none");
}
    
    // Helper function to find the shared edge between two polygons
function findSharedEdge(poly1, poly2) {
    const sharedPoints = [];
    
    // For each vertex in poly1
    for (let i = 0; i < poly1.length - 1; i++) {
        const p1 = poly1[i];
        
        // Check if this vertex is in poly2
        for (let j = 0; j < poly2.length - 1; j++) {
            const p2 = poly2[j];
        
        // If points are the same (within a small epsilon)
            if (Math.abs(p1[0] - p2[0]) < 0.001 && Math.abs(p1[1] - p2[1]) < 0.001) {
            sharedPoints.push(p1);
            break;
            }
        }
    }
    
    // If we found exactly 2 shared points, we have a shared edge
    return sharedPoints.length === 2 ? sharedPoints : [];
}
    
// Call the function with your desired sea level threshold
drawCoastline(seaLevel);
drawBorders();
