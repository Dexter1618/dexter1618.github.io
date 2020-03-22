
document.body.style.zoom = "94%";

var USER_SPEED = "medium";

var width = 800,
	height = 700,
	padding = 1,
	maxRadius = 1;


var act_codes = [
	{ "index": "0", "short": "Kitchen", "desc": "Kitchen" },
	{ "index": "1", "short": "Bedroom", "desc": "Bedroom" },
	{ "index": "2", "short": "Living Room", "desc": "Living Room" },
	{ "index": "3", "short": "Others", "desc": "Others" },
	{ "index": "4", "short": "Bathroom", "desc": "Bathroom"}
];

var time_notes = [
	{ "start_minute": 1, "stop_minute": 60, "timestamp": "12am - 1am"},
	{ "start_minute": 61, "stop_minute": 120, "timestamp": "1am - 2am"},
	{ "start_minute": 121, "stop_minute": 180, "timestamp": "2am - 3am"},
	{ "start_minute": 181, "stop_minute": 240, "timestamp": "3am - 4am"},
	{ "start_minute": 241, "stop_minute": 300, "timestamp": "4am - 5am"},
	{ "start_minute": 301, "stop_minute": 360, "timestamp": "5am - 6am"},
	{ "start_minute": 361, "stop_minute": 420, "timestamp": "6am - 7am"},
	{ "start_minute": 421, "stop_minute": 480, "timestamp": "7am - 8am"},
	{ "start_minute": 481, "stop_minute": 540, "timestamp": "8am- 9am"},
	{ "start_minute": 541, "stop_minute": 600, "timestamp": "9am - 10am"},
	{ "start_minute": 601, "stop_minute": 660, "timestamp": "10am - 11am"},
	{ "start_minute": 661, "stop_minute": 720, "timestamp": "11am - 12pm"},
	{ "start_minute": 721, "stop_minute": 780, "timestamp": "12pm - 1pm"},
	{ "start_minute": 781, "stop_minute": 840, "timestamp": "1pm - 2pm"},
	{ "start_minute": 841, "stop_minute": 900, "timestamp": "2pm - 3pm"},
	{ "start_minute": 901, "stop_minute": 960, "timestamp": "3pm - 4pm"},
	{ "start_minute": 961, "stop_minute": 1020, "timestamp": "4pm - 5pm"},
	{ "start_minute": 1021, "stop_minute": 1080, "timestamp": "5pm - 6pm"},
	{ "start_minute": 1081, "stop_minute": 1140, "timestamp": "6pm - 7pm"},
	{ "start_minute": 1141, "stop_minute": 1200, "timestamp": "7pm - 8pm"},
	{ "start_minute": 1201, "stop_minute": 1260, "timestamp": "8pm - 9pm"},
	{ "start_minute": 1261, "stop_minute": 1320, "timestamp": "9pm - 10pm"},
	{ "start_minute": 1321, "stop_minute": 1380, "timestamp": "10pm - 11pm"},
	{ "start_minute": 1380, "stop_minute": 1441, "timestamp": "11pm - 12am"}
];


var speeds = { "slow": 180, "medium": 130, "fast": 75};
var sched_objs = [], curr_minute = 0, notes_index = 0;


// Activity to put in center of circle arrangement
var center_act = "Bathroom",
	center_pt = { "x": 380, "y": 365 };


// Coordinates for activities
var foci = {};
act_codes.forEach(function (code, i)
{
	if (code.desc == center_act) {
		foci[code.index] = center_pt;
	} else {
		var theta = 2 * Math.PI / (act_codes.length - 1);
		foci[code.index] = { x: 200 * Math.cos((i - 1) * theta) + 380, y: 200 * Math.sin((i - 1) * theta) + 365 };
	}
});


// Start the SVG
var svg = d3.select("#chart").append("svg")
	.attr("width", width)
	.attr("height", height)
	.attr('position', 'relative')
	.attr('left', '150px')
	.attr('top', '190px');


// Load data 
d3.tsv("data/ROUTINE_SIMULATION_JAVASCRIPT_BACKEND.tsv", function (error, data)
{
	data.forEach(function (d)
	{
		var day_array = d.day.split(",");
		var activities = [];
		for (var i = 0; i < day_array.length; i++) {
			// Duration
			if (i % 2 == 1) {
				activities.push({'act': day_array[i - 1], 'duration': +day_array[i] });
			}
		}
		sched_objs.push(activities);
	});

	// Used for percentages by minute
	var act_counts = {"0": 0, "1": 0, "2": 0, "3": 0, "4": 0};

	// A node for each person's schedule
	var nodes = sched_objs.map(function (o, i) {
		var act = o[0].act;
		act_counts[act] += 1;
		var init_x = foci[act].x + Math.random();
		var init_y = foci[act].y + Math.random();
		return {
			act: act,
			radius: 3,
			x: init_x,
			y: init_y,
			color: color(act),
			moves: 0,
			next_move_time: o[0].duration,
			sched: o,
		}
	});

	var force = d3.layout.force()
		.nodes(nodes)
		.size([width, height])
		// .links([])
		.gravity(0)
		.charge(0)
		.friction(.9)
		.on("tick", tick)
		.start();

	var circle = svg.selectAll("circle")
		.data(nodes)
		.enter().append("circle")
		.attr("r", function (d) { return d.radius; })
		.style("fill", function (d) { return d.color; });
	// .call(force.drag);

	// Activity labels
	var label = svg.selectAll("text")
		.data(act_codes)
		.enter().append("text")
		.attr("class", "actlabel")
		.attr("x", function (d, i) {
			if (d.desc == center_act) {
				return center_pt.x;
			} else {
				var theta = 2 * Math.PI / (act_codes.length - 1);
				return 300 * Math.cos((i - 1) * theta) + 380;
			}

		})
		.attr("y", function (d, i) {
			if (d.desc == center_act) {
				return center_pt.y;
			} else {
				var theta = 2 * Math.PI / (act_codes.length - 1);
				return 300 * Math.sin((i - 1) * theta) + 365;
			}
		});

	//if ()

	
	label.append("tspan")
		.attr("x", function () { return d3.select(this.parentNode).attr("x"); })
		//.attr("dy", "1.3em")
		.attr("text-anchor", "middle")
		.style("font-size", "150%")
		//.attr("style", "outline: thin solid black;")
		.text(function (d) {return d.short;});
	
	label.append("tspan")
		.attr("dy", "1.3em")
		.attr("x", function () { return d3.select(this.parentNode).attr("x"); })
		.attr("text-anchor", "middle")
		.style("font-size", "120%")
		.attr("class", "actpct")
		.text(function (d) {
			return act_counts[d.index] + "%";
		});


	// Update nodes based on activity and duration
	function timer() {
		d3.range(nodes.length).map(function (i) {
			var curr_node = nodes[i],
				curr_moves = curr_node.moves;

			// Time to go to next activity
			if (curr_node.next_move_time == curr_minute) {
				if (curr_node.moves == curr_node.sched.length - 1) {
					curr_moves = 0;
				} else {
					curr_moves += 1;
				}

				// Subtract from current activity count
				act_counts[curr_node.act] -= 1;

				// Move on to next activity
				curr_node.act = curr_node.sched[curr_moves].act;

				// Add to new activity count
				act_counts[curr_node.act] += 1;

				curr_node.moves = curr_moves;
				curr_node.cx = foci[curr_node.act].x;
				curr_node.cy = foci[curr_node.act].y;

				nodes[i].next_move_time += nodes[i].sched[curr_node.moves].duration;
			}

		});

		force.resume();
		curr_minute += 1;

		// Update percentages
		label.selectAll("tspan.actpct")
			.text(function (d) {
				return readablePercent(act_counts[d.index]);
			});

		// Update timestamps
		var true_minute = curr_minute % 1440;
		
		if (true_minute == time_notes[notes_index].start_minute) {
			d3.select("#timestamp")
				.style("color", "#808080")
				.style("text-align", "center")
				.style("font-size", "200%")
				.style("font-family", "segoe ui")
				.text(time_notes[notes_index].timestamp)
				.transition()
				.duration(500)
				.style("text-align", "center")
				.style("color", "#808080");
		}

		if (true_minute == time_notes[notes_index].stop_minute) 
		{
			notes_index += 1;
			if (notes_index == time_notes.length - 1)
			{
				notes_index = 0;
			}
		}

		setTimeout(timer, speeds[USER_SPEED]);
	}
	setTimeout(timer, speeds[USER_SPEED]);


	function tick(e) {
		var k = 0.04 * e.alpha;

		// Push nodes toward their designated focus.
		nodes.forEach(function (o, i) {
			var curr_act = o.act;
			var damper = 1;
			o.color = color(curr_act);
			o.y += (foci[curr_act].y - o.y) * k * damper;
			o.x += (foci[curr_act].x - o.x) * k * damper;
		});

		circle
			.each(collide(.5))
			.style("fill", function (d) { return d.color; })
			.attr("cx", function (d) { return d.x; })
			.attr("cy", function (d) { return d.y; });
	}


	// Resolve collisions between nodes.
	function collide(alpha) {
		var quadtree = d3.geom.quadtree(nodes);
		return function (d) {
			var r = d.radius + maxRadius + padding,
				nx1 = d.x - r,
				nx2 = d.x + r,
				ny1 = d.y - r,
				ny2 = d.y + r;
			quadtree.visit(function (quad, x1, y1, x2, y2) {
				if (quad.point && (quad.point !== d)) {
					var x = d.x - quad.point.x,
						y = d.y - quad.point.y,
						l = Math.sqrt(x * x + y * y),
						r = d.radius + quad.point.radius + (d.act !== quad.point.act) * padding;
					if (l < r) {
						l = (l - r) / l * alpha;
						d.x -= x *= l;
						d.y -= y *= l;
						quad.point.x += x;
						quad.point.y += y;
					}
				}
				return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
			});
		};
	}




	// Speed toggle
	d3.selectAll(".togglebutton")
		.on("click", function () {
			if (d3.select(this).attr("data-val") == "slow") {
				d3.select(".slow").classed("current", true);
				d3.select(".medium").classed("current", false);
				d3.select(".fast").classed("current", false);
			} else if (d3.select(this).attr("data-val") == "medium") {
				d3.select(".slow").classed("current", false);
				d3.select(".medium").classed("current", true);
				d3.select(".fast").classed("current", false);
			}
			else {
				d3.select(".slow").classed("current", false);
				d3.select(".medium").classed("current", true);
				d3.select(".fast").classed("current", false);
			}

			USER_SPEED = d3.select(this).attr("data-val");
		});
}); // @end d3.tsv



function color(activity) {

	var colorByActivity = {
		"0": "blue",
		"1": "red",
		"2": "green",
		"3": "#da09e6",
		"4": "cyan"
	}

	return colorByActivity[activity];

}



// Output readable percent based on count.
function readablePercent(n) {

	var pct = 100 * n / 1000;
	if (pct < 10 && pct > 0) {
		pct = "<10%";
	} else {
		pct = Math.round(pct) + "%";
	}

	return pct;
}

