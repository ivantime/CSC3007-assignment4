let width = 1000, height = 600;

let svg = d3.select("svg")
    .attr("viewBox", "0 0 " + width + " " + height)
    .attr("position", "relative")

// Load external data
Promise.all([d3.json("sgmap.json"), d3.csv("population2021.csv")]).then(data => {

    var combinedArray = data[0].features;
    var popArray = data[1];

    for (i = 0; i < combinedArray.length; i++) {
        for (j = 0; j < popArray.length; j++) {
            try {
                if (combinedArray[i].properties["Name"].toLowerCase().localeCompare(
                    popArray[j]["Subzone"].toLowerCase()) === 0 &&

                    combinedArray[i].properties["Planning Area Name"].toLowerCase().localeCompare(
                        popArray[j]["Planning Area"].toLowerCase()) === 0) {
                    if (popArray[j]["Population"] === "-") { }
                    else {
                        combinedArray[i].properties["pop"] = parseInt(popArray[j]["Population"]);
                    }
                }
                else { }
            }
            catch (excpt) { }
        }
    }

    let maxValues = -1;
    let total = 0;
    let tmp;
    data[0].features = combinedArray
    data[0].features.forEach((eachArr, __) => {
        total += (eachArr.properties.pop === undefined ? 0 : eachArr.properties.pop)
        tmp = parseInt(eachArr.properties.pop);
        if (parseInt(tmp) > parseInt(maxValues)) { maxValues = parseInt(tmp); };
    })
    let colorScale = d3.scaleLinear()
        .domain([0, maxValues])
        .range(["#eff3ff", "#084594"]);


    // Map and projection
    var projection = d3.geoMercator()
        .center([103.851959, 1.290270])
        .fitExtent([[20, 20], [980, 580]], data[0]);
    let geopath = d3.geoPath().projection(projection);

    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("width", "300px")
        .style("height", "100px")
        .style("opacity", 0)
        .style('position', 'absolute')
        .style('padding-top', '70px')
        .style("right", (200) + "px")
        .style("bottom", (150) + "px")
        .style('padding-bottom', '25px')
        .style('background', 'rgba(0,0,0,0.6)')
        .style('border-radius', '20px')
        .style('color', '#fff');


        //true for Female, false for Male (Switch)
    var switchHere = d3.select("#myCheckbox").checked===false;
    if (d3.select("#myCheckbox").on("click", function (d) {
        switchHere = this.checked;
        console.log(this.checked)

        //switch currently at Male
        if (switchHere) {
            console.log("By Female")
        }
        else {
            console.log("By Male")

        }
    }
    ));

    svg.append("g")
        .attr("id", "districts")
        .selectAll("path")
        .data(data[0].features)
        .enter()
        .append("path")
        .attr("d", geopath)
        .attr("fill", function (d) {
            //if population value not available or 0, shade fill in black, 
            //else show color shade accordingly
            return (d.properties["pop"] === undefined) ?
                "black" : colorScale(d.properties.pop)
        })

        .on("mouseover", (event, d) => {
            //show tooltip
            d3.select(".tooltip").html("<b><u><center>" + d.properties.Name + "</center></b></u></br>" +
                "<center>" +(switchHere?"Female":"Male")+ " Population: " + String(d.properties.pop).toUpperCase() + "</center>")
                .style("opacity", 1);

            //show stroke (red)
            d3.select(event.currentTarget)
                .style("stroke", "red")
                .style("stroke-width", "2px")
        })
        .on("mouseout", function (d) {
            //hide tooltip
            d3.select(".tooltip").html(null)
                .style("opacity", 0);

            //remove stroke (red)
            d3.select(event.currentTarget)
                .style("stroke", null)
        });
        console.log(data[0])

//by default set as Male
d3.select("#myCheckbox").property('checked', false);
switchHere = d3.select("#myCheckbox").checked===false;
})