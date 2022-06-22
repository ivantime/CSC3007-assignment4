let width = 800, height = 800;

d3.select("#m").property('checked', false);
d3.select("#f").property('checked', false);
d3.select("#a").property('checked', true);

function drawDiagram(data) {


    let svg = d3.select("svg")
        // .attr("viewBox", "0 0 " + width + " " + height)
        .attr("viewBox", `${-width / 4} ${-height / 8} ${width * 2} ${height * 2}`)
        .attr("preserveAspectRatio", "xMinYMin meet")

    data[0].forEach((d0) => {
        d0.target = d0.infectee
        d0.source = d0.infector
    })

    radius = 30;

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

    var groups = svg.selectAll("g.nodes")
        .data(data[1])
        .enter()
        .append("g")
        .attr('class', 'nodes')
        .attr("gender", function (d) { return d.gender })

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

    svg.selectAll("g.nodes")
        .each(function (d, i) {


            d3.select(this)
                .append("circle")
                .attr("id", "icons")
                .attr("id", function (d) { return d.id })
                .attr("stroke", "black")
                .attr("stroke-width", 3)
                .attr("pointer-events", "visible")

                .attr("r", radius)
                .attr("fill", function (d) {
                    return (d.gender === "male" ? "lightblue" : "lightpink");
                })

            d3.select(this)
                .append("image")
                .attr("xlink:href", 
                "https://icon-library.com/images/person-icon-transparent-background/person-icon-transparent-background-9.jpg")
                .attr("width", radius + 25)
                .attr("height", radius + 25)



        });

    let node = svg.selectAll("g.nodes").selectAll("circle")
    let svgIcons = svg.selectAll("g.nodes").selectAll("image")


    groups
        .on("mousemove", function (d, i) {
            //add stroke for circle nodes to be more distinguished
            d3.selectAll("circle").attr("stroke", "gray")
            d3.selectAll("circle").attr("fill", "gray")

            d3.select(this).select("circle").attr("stroke", "red")
            d3.select(this).select("circle").attr("fill", function (d) { return (d.gender === "male" ? "lightblue" : "lightpink") })

            div
                .style("left", (event.pageX) + "px")
                .style("top", (event.pageY) + "px")
                .html(
                    "Patient ID: " + i.id + "<br>" +
                    "Age: " + i.age + "<br>" +
                    "Gender: " + i.gender.toUpperCase() + "<br>" +
                    "Nationality: " + i.nationality.toUpperCase() + "<br>" +
                    "Occupation: " + i.occupation.toUpperCase() + "<br>" +
                    "Organization: " + i.organization.toUpperCase() + "<br>" +
                    "Date: " + i.date + "<br>" +
                    "Vaccinated: " + i.vaccinated.toUpperCase() + "")
                .style("opacity", 1);
        })
        .on("mouseout", function (d) {
            d3.selectAll("circle").attr("fill", function (d) { return (d.gender === "male" ? "lightblue" : "lightpink") })
            d3.select(this).select("circle").attr("stroke", "black")

            div
                .style("opacity", 0);
        })
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

    const simulation = d3.forceSimulation()
        .nodes(data[1])
        .force("link", d3.forceLink(data[0]).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collide', d3.forceCollide(65))
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


}
// Load external data
Promise.all([d3.json("links-sample.json"), d3.json("cases-sample.json")]).then(data => {
    drawDiagram(data)
})