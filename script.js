let width = 800, height = 800;

let svg = d3.select("svg")
    // .attr("viewBox", "0 0 " + width + " " + height)
    .attr("viewBox", `${-width / 4} ${-height / 8} ${width * 2} ${height * 2}`)
    .attr("preserveAspectRatio", "xMinYMin meet")

// Load external data
Promise.all([d3.json("links-sample.json"), d3.json("cases-sample.json")]).then(data => {

    // Data preprocessing
    data[0].forEach((e) => {
        e.source = e.infector;
        e.target = e.infectee;
    });
    svg.append("svg:defs").selectAll("marker")
        .data(["point-arrow"])      // Different link/path types can be defined here
        .enter().append("svg:marker")    // This section adds in the arrows
        .attr("id", String)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 17)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

    let linkpath = svg.append("g")
        .attr("id", "links")
        .selectAll("path")
        .data(data[0])
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 5)
        .attr("marker-end", "url(#point-arrow)");


    radius = 30;

    let node = svg.append("g")
        .selectAll("circle")
        .data(data[1])
        .attr("id", "icons")
        .enter()
        .append("circle")
        .attr("id", function (d) { return d.id })
        .attr("pointer-events", "visible")

        .attr("r", radius)
        .attr("fill", function (d) {
            return (d.gender === "male" ? "lightblue" : "lightpink");
        })

        //add stroke for circle nodes to be more distinguished
        .attr("stroke", "gray")
        .attr("stroke-width", 4)
        //add on drag of circles
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))


    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style('position', 'absolute')
        .style('z-index', '10')
        .style('padding', '10px')
        .style('background', 'rgba(0,0,0,0.6)')
        .style('border-radius', '4px')
        .style('color', '#fff');


    let svgIcons = svg.append("g")
        .selectAll("image")
        .data(data[1])
        .enter()
        .append("image")
        .attr("id", function (d) { return d.id })
        .attr("age", function (d) { return d.age })
        .attr("gender", function (d) { return d.gender })
        .attr("nationality", function (d) { return d.nationality })
        .attr("occupation", function (d) { return d.occupation })
        .attr("organization", function (d) { return d.organization })
        .attr("date", function (d) { return d.date })
        .attr("vaccinated", function (d) { return d.vaccinated })
        .attr("xlink:href", "https://icon-library.com/images/person-icon-transparent-background/person-icon-transparent-background-9.jpg")
        .attr("width", radius + 25)
        .attr("height", radius + 25)
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended))
        .on('mousemove', function (d, i) {
            div
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY) + "px")
                .html(
                    "Patient ID: " + d3.select(this).attr("id") + "<br>" +
                    "Age: " + d3.select(this).attr("age") + "<br>" +
                    "Gender: " + d3.select(this).attr("gender").toUpperCase() + "<br>" +
                    "Nationality: " + d3.select(this).attr("nationality").toUpperCase() + "<br>" +
                    "Occupation: " + d3.select(this).attr("occupation").toUpperCase() + "<br>" +
                    "Organization: " + d3.select(this).attr("organization").toUpperCase() + "<br>" +
                    "Date: " + d3.select(this).attr("date") + "<br>" +
                    "Vaccinated: " + d3.select(this).attr("vaccinated").toUpperCase() + "")
                .style("opacity", 1);
        })
        // d3.select(this)
        //     .attr('fill', 'red')

        //     //add outline
        //     .attr("stroke", "red")
        //     .attr("stroke-width", 5)
        .on("mouseout", function (d) {
            div
                .style("opacity", 0);

            // d3.select(this)
            //     .attr('opacity', '1')
            //     //add outline
            //     .attr("stroke", "gray")
            //     .attr("stroke-width", 5)



        });


    const simulation = d3.forceSimulation(data[1])
        .force("link", d3.forceLink(data[0]).id(d => d.id))
        .force("charge", function (d) {
            return d3.forceManyBody().strength(-300)

        })
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collide', d3.forceCollide(d => 65))
        .on("tick", d => {

            node
                .attr("cx", function (d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
                .attr("cy", function (d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });

            linkpath
                .attr("d", function (d) {
                    dx = d.target.x - d.source.x
                    dy = d.target.y - d.source.y
                    dr = Math.sqrt(dx * dx + dy * dy)
                    return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
                })

            svgIcons
                .attr("transform", function (d) {
                    return "translate(" + (d.x - 27) + "," + (d.y - 27) + ")";
                })
        })
        .alphaTarget(0.1);

    function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }

})