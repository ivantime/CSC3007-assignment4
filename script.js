let width = 800, height = 500;

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


    let linkpath = svg.append("g")
        .attr("id", "links")
        .selectAll("path")
        .data(data[0])
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 5);

    var myColor = d3.scaleLinear().domain(["male", "female"])
        .range(["lightblue", "lightpink"])

    radius = 30;

    // console.log(combinedArray)
    let node = svg.append("g")
        .selectAll("circle")
        .data(data[1])
        .enter()
        .append("circle")
        .attr("id", function (d) { return d.id })
        .attr("r", radius)
        .attr("fill", function (d) {
            return (d.gender === "male" ? "lightblue" : "lightpink");
        })

        //add on drag of circles
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));;



    const simulation = d3.forceSimulation(data[1])
        .force("link", d3.forceLink(data[0]).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-300))
        .force("x", d3.forceX())
        .force("y", d3.forceY())
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collide', d3.forceCollide(d => 65))
        .on("tick", d => {
            node
            node.attr("cx", function (d) { return d.x = Math.max(radius, Math.min(width - radius, d.x)); })
                .attr("cy", function (d) { return d.y = Math.max(radius, Math.min(height - radius, d.y)); });

            linkpath
                .attr("d", d => "M" + d.source.x + "," + d.source.y + " " + d.target.x + "," + d.target.y);
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

    // console.log(data[0]); //links
    // console.log(data[1]); //cases

})