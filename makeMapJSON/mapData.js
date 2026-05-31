import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
function MapData() {

    //The bit that helps with calculating polygons
    let width = document.documentElement.clientWidth;
    let height = document.documentElement.clientHeight;


    let quality = 6900//8000;

    var loc = d3.range(quality).map(() => {
        return [Math.random() * width, Math.random() * height];
    });


    let delaunay = d3.Delaunay.from(loc);
    let voronoi = delaunay.voronoi([0, 0, width, height]);

    function getCellPolygon(i) {
        return voronoi.cellPolygon(i);
    }

    let polygons = loc.map((_, i) => getCellPolygon(i));

    function normalize(amt) {
        for (let i = 0; i < amt; i += 1) {
            loc = polygons.map((x) => { return d3.polygonCentroid(x) });
            delaunay = d3.Delaunay.from(loc);
            voronoi = delaunay.voronoi([0, 0, width, height]);
            polygons = loc.map((_,i) => getCellPolygon(i))
        }
    }



    normalize(2);
    //polygons calculated :D





    //The bit that helps with calculating the heightMap
    let heightMap = new Array(quality).fill(0);

    let allNeighbors = [];
    for (let i = 0; i < loc.length; i++) {
        let neighbors = Array.from(voronoi.neighbors(i)); // Convert iterator to array
        allNeighbors.push(neighbors);
    }

    


    //this function calculates heightMap
    let radius = 0.6,
        initHeight=0.7,
        seaLevel=0.2,
        sharpness=0.4
    
    


    function heights3(peak, options = {}) { 
        // Default options
        const config = {
            jaggedness: 0.1,         // 0-1: Higher values = more jagged
            directionalBias: 0.7,    // 0-1: How much direction matters
            branchingChance: 0.15,   // 0-1: Chance to create branches
            windiness: 0.5,          // 0-1: How much the terrain "snakes" around
            targetCoverage: 0.13,     // 0-1: Target percentage of map to fill with land
            sizeVariance: 0.1,       // 0-1: How much variation in size is allowed
            ...options
        };
        
        let used = new Array(quality).fill(false);
        heightMap[peak] = initHeight;
        used[peak] = true;
        
        // Use a priority queue
        let queue = [{index: peak, priority: 1, direction: [Math.random() - 0.5, Math.random() - 0.5]}];
        let landCells = 1; // Start with one land cell (the peak)
        
        // Track the "flow" direction
        let flowDirection = [Math.random() * 2 - 1, Math.random() * 2 - 1];
        
        // Calculate target number of land cells based on coverage percentage
        const minLandCells = Math.floor(quality * (config.targetCoverage - config.sizeVariance));
        const maxLandCells = Math.floor(quality * (config.targetCoverage + config.sizeVariance));
        const targetLandCells = Math.floor(quality * config.targetCoverage);
        
        // Dynamically adjust height decay based on target size
        let dynamicRadius = radius;
        
        while (queue.length > 0) {
            // Sort by priority
            queue.sort((a, b) => b.priority - a.priority);
            const current = queue.shift();
            const i = current.index;
            const currentDirection = current.direction;
            
            // Check if we've reached our target size
            if (landCells >= maxLandCells) {
                break; // Stop generation once we hit the maximum target
            }
            
            // Dynamically adjust radius based on how close we are to target
            const progress = landCells / targetLandCells;
            if (progress > 0.7) {
                // Start slowing growth as we approach target
                dynamicRadius = radius * (1 - (progress - 0.7) / 0.6);
            }
            
            // Update flow direction with windiness
            flowDirection = [
                flowDirection[0] * (1 - config.windiness) + (Math.random() - 0.5) * config.windiness,
                flowDirection[1] * (1 - config.windiness) + (Math.random() - 0.5) * config.windiness
            ];
            
            // Normalize flow direction
            const magnitude = Math.sqrt(flowDirection[0]**2 + flowDirection[1]**2);
            if (magnitude > 0) {
                flowDirection[0] /= magnitude;
                flowDirection[1] /= magnitude;
            }
            
            // For each neighbor
            const neighbors = allNeighbors[i];
            for (const e of neighbors) {
                if (!used[e]) {
                    // Calculate directional alignment
                    const neighborPos = loc[e];
                    const currentPos = loc[i];
                    const toNeighbor = [
                        neighborPos[0] - currentPos[0],
                        neighborPos[1] - currentPos[1]
                    ];
                    
                    // Normalize
                    const toNeighborMag = Math.sqrt(toNeighbor[0]**2 + toNeighbor[1]**2);
                    if (toNeighborMag > 0) {
                        toNeighbor[0] /= toNeighborMag;
                        toNeighbor[1] /= toNeighborMag;
                    }
                    
                    // Calculate alignment with flow direction
                    const alignment = toNeighbor[0] * flowDirection[0] + toNeighbor[1] * flowDirection[1];
                    
                    // Random jaggedness factor
                    const jaggedness = 1 + (Math.random() * 2 - 1) * config.jaggedness;
                    
                    // Directional bias
                    const dirBias = 1 + alignment * config.directionalBias;
                    
                    // Calculate new height with dynamic radius
                    const newHeight = heightMap[i] * dynamicRadius * jaggedness * dirBias;
                    
                    // Only add to land mass if above sea level
                    if (newHeight >= seaLevel) {
                        // Set the height
                        heightMap[e] = Math.min(1, heightMap[e] + newHeight);
                        used[e] = true;
                        landCells++; // Increment land cell count
                        
                        // Add to queue with priority based on height
                        queue.push({
                            index: e, 
                            priority: newHeight,
                            direction: [
                                currentDirection[0] * 0.8 + (Math.random() - 0.5) * 0.4,
                                currentDirection[1] * 0.8 + (Math.random() - 0.5) * 0.4
                            ]
                        });
                        
                        // Branching - reduced chance as we approach target size
                        const branchFactor = Math.max(0, 1 - landCells / targetLandCells);
                        if (Math.random() < config.branchingChance * branchFactor * (newHeight / initHeight)) {
                            const branchDirection = [Math.random() * 2 - 1, Math.random() * 2 - 1];
                            const nearbyNeighbors = allNeighbors[e];
                            if (nearbyNeighbors.length > 0) {
                                const branchIndex = nearbyNeighbors[Math.floor(Math.random() * nearbyNeighbors.length)];
                                if (!used[branchIndex] && landCells < maxLandCells) {
                                    heightMap[branchIndex] = newHeight * 0.9;
                                    used[branchIndex] = true;
                                    landCells++;
                                    queue.push({
                                        index: branchIndex,
                                        priority: newHeight * 0.9,
                                        direction: branchDirection
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // Final check to ensure we have minimum land coverage
        if (landCells < minLandCells) {
            console.log(`Warning: Generated only ${landCells} land cells, which is below the minimum target of ${minLandCells}`);
        }
        
        console.log(`Generated ${landCells} land cells (${(landCells/quality*100).toFixed(2)}% of map)`);
        return landCells;
    }

    heights3(0)
    heights3(1)
    heights3(2)
    heights3(3)






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



    let borders = []
    function drawBorders() {
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
        /*
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
        */
    }

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
    drawBorders();


    let send = {loc, heightMap, regions};

    return send;
}

MapData();
export default MapData;