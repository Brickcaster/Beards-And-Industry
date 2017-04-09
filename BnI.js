var Resources = {};
//var Pop = []; //Depreciated.  People are just another resource.
var Jobs = {};
var Buildings = {};
var Research = {};
var Events = [];
//var GameData = [Resources, Buildings, Events]

// Reset(); //This initializes arrays, if we have a save that will take priority.

// Core Game Loop
setInterval(function(){
	
	UpdateResources();
	
	DisplayResources();
	
	DisplayJobs(); // Updating this every tick may be causing causing some clicks to not be registered.
	
	DisplayBuildings(); // Updating this every tick may be causing causing some clicks to not be registered.
	
	UpdateResearch(); //This uses a build-once method.
	
	DisplayServices();
	
	CheckEvents();
	
	CheckOnceEvents();
	
	}, 1000);

// Data management
// Save
setInterval(function() {
	SaveGame();
}, 15000);

LoadGame();

// Old methods
/*
setInterval(function(){
	localStorage.setItem("Resources", JSON.stringify(Resources));
	localStorage.setItem("Buildings", JSON.stringify(Buildings));
	localStorage.setItem("Jobs", JSON.stringify(Jobs));
	localStorage.setItem("Research", JSON.stringify(Research));
	localStorage.setItem("Events", JSON.stringify(Events));
	//console.log("Game Saved.");
}, 15000);
*/

// Load
/*
if (localStorage.Resources) { Resources = JSON.parse(localStorage.getItem("Resources")); }
if (localStorage.Buildings) { Buildings = JSON.parse(localStorage.getItem("Buildings")); }
if (localStorage.Jobs) { Jobs = JSON.parse(localStorage.getItem("Jobs")); }
if (localStorage.Research) { Research = JSON.parse(localStorage.getItem("Research")); }
if (localStorage.Events) { Events = JSON.parse(localStorage.getItem("Events")); }
else { Reset() }
*/


// Reset -- Savedata is wiped elsewhere
function Reset() {
	Resources = {};
	Buildings = {};
	Jobs = {};
	Research = {};
	Events = [];
	
	// Reset message log
	document.getElementById('MessageLog').innerHTML = ''
	
	// Let's load our easier to read/edit csv
	/*
	var jobsget = new XMLHttpRequest();
	jobsget.addEventListener("load", function() { ParseCsv(Jobs, jobsget.responseText) } );
	jobsget.open("GET", "jobs.csv?1");
	jobsget.send();
	*/
	/*
	
	var buildingsget = new XMLHttpRequest();
	buildingsget.addEventListener("load", function() { ParseCsv(Buildings, buildingsget.responseText) } );
	buildingsget.open("GET", "buildings.csv");
	buildingsget.send();
	*/
	/*
	var resget = new XMLHttpRequest();
	resget.addEventListener("load", function() { ParseCsv(Resources, resget.responseText); } );
	resget.open("GET", "resources.csv");
	resget.send();
	*/
	
	/*
	var researchget = new XMLHttpRequest();
	researchget.addEventListener("load", function() { ParseCsv(Research, researchget.responseText); } );
	researchget.open("GET", "research.csv");
	researchget.send();
	*/
	
	ResetResources();
	ResetJobs();
	ResetBuildings();
	ResetResearch();
	
	Resources.population.stock = 7;
	Jobs.hunting.working = 3;
	Resources.workers.stock = 3;
	
	// We're done here.
	return;
	
	//console.log(buildingsget.responseText);
	// Build the Jobs array
	// Maybe each element should contain methods too:
	//   .do(worker, dt) which checks for requirements and, if present, deducts requirements and adds product
	// TODO: verify each row conforms to the style in the type column, e.g. services don't have storage
	function ParseCsv(out, text) {
		//console.log(xhttp.responseText);
		var csv = text.split('\r\n').map(l=>l.split(','))
		//console.log(jobsget.responseText);
		//console.log(text);

		// Row 0 is the header with keynames.
		// Column 0 contains "name" elements for identification
		// This means we have to shift indexes up to re-index to 0 after.
		for (var row = 1; row < csv.length; row++) {
			// Bypass row if col 0 is empty
			if (csv[row][0] === "") { 
				csv.splice(row, 1);
				row--;
				continue; } 
			
			var name = csv[row][0];
			out[name] = {};
			
			for (var col = 0; col < csv[row].length; col++) {
				// Bypass if header is empty.
				if (csv[0][col] === "") { continue }
				
				var elem = csv[row][col];
				
				// Ignore empty strings.
				if (elem === "") { continue }
				
				// We need numbers and bools so let's typecast them
				if (elem == +elem) {
					out[name][csv[0][col]] = +elem;
					//console.log("Found a number.  Setting " + name + "." + csv[0][col] + " to " + csv[row][col]);
				}
				else if (elem === "TRUE") {
					out[name][csv[0][col]] = true;
					console.log("Found a string.  Setting " + name + "." + csv[0][col] + " to " + csv[row][col]);
				}
				else if (elem === "FALSE") {
					out[name][csv[0][col]] = false;
					//console.log("Found a string.  Setting " + name + "." + csv[0][col] + " to " + csv[row][col]);
				}
				else { out[name][csv[0][col]] = csv[row][col] }
			}
		}
		//out.shift() //Move back to 0 index --Doesn't apply to objects.

		//console.log(csv);
		
		//Let's parse requirements into an array requirements
		// reqs[0][0] is the name of the first requirement, reqs[0][1] is the amount per unit.
		// reqs[1][0] is the name of the second, and so on.
		for (var i in out) {

			var reqs = [];
			var outputs = [];

			function tidy() {
				for (var n = 1; n <= 3; n++) {
					delete out[i]["reqres" + n];
					delete out[i]["reqresrate" + n];
					delete out[i]["output" + n];
					delete out[i]["outputrate" + n];
					
					if (reqs[n] && reqs[n][0] == "") { delete reqs[n]; }
					if (outputs[n] && outputs[n][0] == "") { delete outputs[n]; }
					
				}
			}
			
			for (var n = 1; n <= 3; n++) {
				
				/*
				if ( !("reqres" + i in out[name]) || (out[name]["reqres" + i] == 0) ) {
					continue;
				} */
				// Set up our pre-reqs
				
				var resname = out[i]["reqres" + n];
				if (resname) {
					reqs[n-1] = [];
					reqs[n-1][0] = resname
					reqs[n-1][1] = out[i]["reqresrate" + n];
				}

				//console.log(reqs[n-1][0])
				
				var resname = out[i]["output" + n];
				if (resname) {
					outputs[n-1] = [];
					outputs[n-1][0] = resname;
					outputs[n-1][1] = out[i]["outputrate" + n];
				}
								
			}
			// tidy up
			tidy();

			if (reqs[0]) { out[i]["reqs"] = reqs.slice(); } 
			if (outputs[0]) { out[i]["outputs"] = outputs.slice(); } 

			} 
				
		//console.log(out);
	}
	
	// Depreciated.
	/*
	for (var i = 0; i <3 ; i++) { Res[i] = new ResourceJob; }
	Res[0]["name"] = "Food";
	Res[0]["profession"] = "Farmer";
	Res[0]["stock"] = 500;
	Res[1]["name"] = "Wood";
	Res[1]["profession"] = "Woodcutter";
	Res[2]["name"] = "Stone";
	Res[2]["profession"] = "Quarrier";
	*/

	/*
	Resources.population.stock = 7
	Resources.workers.stock = 7
	Jobs.hunting.working = 6
	*/
	
}

// Game logic functions
function UpdateResources() {

	// Reset and recalculate incomes
	for (var i in Resources) {
		Resources[i].income = 0;
		Resources[i].spending = 0;
	}
		
	// Workers need to eat
	Resources.food.spending -= Resources.population.stock;
	//console.log("Food eaten: " + Resources["food"].spending);
	
	for (var i in Jobs) {
		
		if (Jobs[i].type == "production") {
			var outputfactor = 1; // 1 means full steam ahead.  Otherwise we're choked by tools or inputs.
			//for (var n in Jobs[i].outputs) {

			if (Jobs[i].working <= 0) { continue; }
			
			var dwarfhours = Jobs[i].working * Jobs[i].speed * Jobs[i].eventfactor;
			
			var toolrate = Jobs[i].working * Jobs[i].toolrate;

			// Does job require tools?
			if (toolrate > 0) {
				//Clamp based on available tools.
				var tooltype = "stone tools" //Need to replace with GetBestTool() function.
				//Job displays as X ( Y ), where X is active and Y are sick/injured/training.
				var tools = Resources[tooltype].stock + Resources[tooltype].spending;
				if (tooltype == "stone tools") { toolrate *= 10; } // These break fast.
				
				// Clamp based on available tools
				outputfactor = Math.min(outputfactor, tools / toolrate);
			}
			
			// Clamp based on required materials
			for (var n in Jobs[i].inputs) {
				var required = Jobs[i].inputs[n] * dwarfhours
				if (required > 0) {
					outputfactor = Math.min(outputfactor, (Resources[n].stock + Resources[n].spending) / required)
					//outputfactor = Resources[n].stock / required
				}
			}
						
			// Now we know how much we're able to produce so let's perform it.
			for (n in Jobs[i].outputs) {
				Resources[n].income += Jobs[i].outputs[n] * dwarfhours * outputfactor;
				if (Resources[n].income === NaN) { console.log(i + " processing error, output " + n + " is NaN!") }
				//console.log(i + ": Dwarfhours: " + dwarfhours + ", outputfactor: " + outputfactor)
			}
			
			for (n in Jobs[i].inputs) {
				Resources[n].spending -= Jobs[i].inputs[n] * dwarfhours * outputfactor;
			}
			
			if (toolrate > 0) {
				Resources[tooltype].spending -= toolrate * outputfactor;
			}
		}
		
		//Other types of jobs here.
	
	}
	
	//Special rules.  Hunting depletes.  Prospecting depletes.
	
	//Need to have an event for this to notify player.
	//This formula should support a community of about 45 hunters.
	Jobs.hunting.eventfactor -= ((Jobs.hunting.eventfactor - 1) + Jobs.hunting.working/200) / 120;
	
	
	
	// Income happens here.
	for (var i in Resources) {
		Resources[i].stock += Resources[i].income; // Needs dt
		Resources[i].stock += Resources[i].spending; // Needs dt
	}
	
	CapResources(); //Constrain select resources to cap
}

/* Display functions. */
// Run this once on startup.
/* This isn't working.
function DrawResTable() {
	var target = document.getElementById('ResTable');
	
	target.innerHTML = '';
	
	var div = document.createElement("div");
	var table = document.createElement("table");
	table.style = 'width:40%';
	// var output = "<table style='width:40%'><b><tr style='font-weight:bold'><td></td><td>Stock</td><td>/</td><td>Max</td><td>Rate</td></tr></b>"; //The table header
	var row = document.createElement("row");
	row.innerHTML="<b><td></td><td>Stock</td><td>/</td><td>Max</td><td>Rate</td></b>"; //The table header
	table.appendChild(row);
	// Draw all rows, add hidden tag to not yet unlocked ones.
	for (var i in Resources) {
		var row = document.createElement("row");
		if (!Resources[i].visible) {
			row.className = 'hidden';
		}
		row.setAttribute("id", "resrow" + i);
		table.appendChild(row);
	}
	target.appendChild(div);
	
	//Moving manual buttons to sit by resources.
	var div = document.createElement("div")
	var output = document.createElement("table")
	output.style='width:40%'
	
	//Todo: add detect if we have insufficient resources and tag them.
	output.innerHTML += '<tr><div onclick="AddViaClick(1)" class="button">Gather Food</div></tr>'
	output.innerHTML += '<tr><div onclick="AddViaClick(2)" class="button">Gather Wood</div></tr>'
	output.innerHTML += '<tr><div onclick="AddViaClick(3)" class="button">Gather Stone</div></tr>'
	output.innerHTML += '<tr><div onclick="AddViaClick(4)" class="button">Build</div></tr>'
	output.innerHTML += '<tr><div onclick="AddViaClick(5)" class="button">Recruit</div></tr>'
	//output.innerHTML += '</table>'
	
	div.appendChild(output);
	target.appendChild(div);
} */

/* Shelved draw-once then update method.
function DisplayResources() {
	for (var i in Resources) {
		var row = document.getElementById('resrow' + i)
		var text = "<td>" + i + "</td>";
		text += "<td>" + Math.max(0, TwoDigit(Resources[i].stock)) + "</td>";
		if (Resources[i].storage) {
			text += "<td>/</td>";
			text += "<td>" + TwoDigit(Resources[i].storage) + "</td>"; }
		else { text += "<td></td><td></td>" }
		if (Resources[i].income != 0 || Resources[i].spending != 0) {
			output += "<td>" + TwoDigit(Resources[i].income + Resources[i].spending) + "/s</td>";
		}
		row.innerHTML = text
	}
} */
	
	/* Switching to a draw-once method.
	Messy.  Must clean up. */

// Switching back to draw entire table every tick.	
function DisplayResources() {
	var target = document.getElementById('ResTable');
	
	target.innerHTML = '';
	
	var div = document.createElement("span"); //Switching to span so it doens't linebreak?
	var table = document.createElement("table");
	//table.style = 'width:40%';
	//var table = "<table style='width:40%'><b><tr style='font-weight:bold'><td></td><td>Stock</td><td>/</td><td>Max</td><td>Rate</td></tr></b>"; //The table header
	var row = document.createElement("tr");
	row.innerHTML="<td></td><td>Stock</td><td>/</td><td>Max</td><td>Rate</td>"; //The table header
	row.style = "font-weight:bold";
	table.appendChild(row);	
	for (var i in Resources) {
		if (Resources[i].visible == true) {
			//output += "<tr onclick='AddWorker(" + i + ")'>";
			var row = document.createElement("tr");
			var output = "<td>" + i + "</td>";
			output += "<td>" + TwoDigit(Math.max(Resources[i].stock, 0)) + "</td>";
			if (Resources[i].storage) {
				output += "<td>/</td>";
				output += "<td>" + TwoDigit(Resources[i].storage) + "</td>"; }
			else { output += "<td></td><td></td>" }
			if (Resources[i].income != 0 || Resources[i].spending != 0) {
				output += "<td>" + TwoDigit(Resources[i].income + Resources[i].spending) + "/s</td>";
			}
			row.innerHTML = output;
			table.appendChild(row);
			//table += row.innerHTML
		}
	}
	//output += "</table>";
	//div.innerHTML = table;
	div.appendChild(table);
	target.appendChild(div);
	
	//Moving manual buttons to sit by resources.
	var div = document.createElement("span")
	div.className = "selfgather"
	var table = document.createElement("table")
	table.style='width:40%'
	
	var row = document.createElement("row");
	
	//Todo: add detect if we have insufficient resources and tag them.
	row.innerHTML = '<tr><div onclick="AddViaClick(1)" class="button">Gather Food</div></tr>'
	table.appendChild(row);
	
	row = document.createElement("row");
	row.innerHTML += '<div onclick="AddViaClick(2)" class="button">Gather Wood</div>'
	table.appendChild(row);
	
	row = document.createElement("row");
	row.innerHTML += '<div onclick="AddViaClick(3)" class="button">Gather Stone</div>'
	table.appendChild(row);
	
	row = document.createElement("row");
	row.innerHTML += '<div onclick="AddViaClick(4)" class="button">Build</div>'
	if (Resources.wood.stock < 2 || Resources.stone.stock < 1) { row.className += " disabled"; }
	table.appendChild(row);
	
	row = document.createElement("row");
	row.innerHTML += '<tr><div onclick="AddViaClick(5)" class="button">Recruit</div></tr>'
	if (Resources.population.stock >= Resources.population.storage) { row.className += " disabled"; }
	table.appendChild(row);
	
	div.appendChild(table);
	target.appendChild(div);
	
	//console.log("Updating Resource Table.");
}

/*
function DisplayWorkers() {
	var target = document.getElementById('Workers').innerHTML;
	var output = "<table style='width:40%'>"
	
	var unemployed = 0;
	var homeless = 0;
	var morale = 0;
	
	for (var i in Resources) {
		if (Resources.unlocked == true) { 
			output += "<tr>";
			output += "<td>Workers: " + Resources.workers + "</td>"
		}
	}
	output += "<tr onclick='AddDwarf()'>";
	output += "<td>Population: " + Pop.length + "</td>"
	output += "<td>Unemployed: " + unemployed + "</td>"
	if (homeless > 0) { output += "<td>Homeless: " + homeless + "</td>" }
	output += "</tr></table>";
	//target.this = output;
	document.getElementById('Workers').innerHTML = output;
	//console.log("Updating Pop Table.");
}*/

function DisplayJobs() {
	var target = document.getElementById('Workers');
	var table = document.createElement("table")
	table.style = 'width:50%';
	
	for (var i in Jobs) {
		if (Jobs[i].visible && !Jobs[i].obsolete) {
			var row = document.createElement("tr");
			var button = document.createElement("div");
			row.key = i;
			button.className = 'button'
			button.style.float = 'left';
			//row.innerHTML = "<div class='button'>"
			if (!CanAssignWorker(i)) { button.className += " disabled"; }
			var text = i + ": " + Jobs[i].working;
			if (Jobs[i].training + Jobs[i].sick + Jobs[i].injured > 0) {
				text += " (" + (Jobs[i].training + Jobs[i].sick + Jobs[i].injured) + ")";
			}
			var plus = document.createElement("div");
			plus.className = 'button';
			plus.style.float = "right";
			plus.innerHTML = "+";
			plus.addEventListener("click", function() {AssignWorker(this.parentNode.key)}, true) //I'm sure closure will bite me.
			
			var minus = document.createElement("div");
			minus.className = 'button';
			minus.style.float = "right";
			minus.innerHTML = "-";
			minus.addEventListener("click", function() {UnassignWorker(this.parentNode.key)}, true) //I'm sure closure will bite me.
			
			button.addEventListener("click", function() {AssignWorker(this.parentNode.key);}, true)
			//(() => button.addEventListener("click", function() {AssignWorker(i);}))() 
			button.innerHTML = text;
			row.appendChild(button)
			row.appendChild(plus)
			row.appendChild(minus)
			table.appendChild(row)
		}
	}
	
	target.innerHTML = ''
	target.appendChild(table)
}

function DisplayBuildings() {
	var target = document.getElementById('Buildings');
	target.innerHTML = ''
	// Let's try a DOM approach.
	
	var table = document.createElement("table");
	table.style='width:40%'
	var row = document.createElement("tr")
	row.style = "font-weight:bold"
	row.innerHTML = "<td></td><td><b>Amount</b></td><td><b>Cost</b></td><td><b>Additional Cost</b></td>";
	table.appendChild(row)
	for (var i in Buildings) {
		if (Buildings[i].visible == true) {
			row = document.createElement("tr")
			row.key = i
			row.addEventListener("click", function() {AddBuilding(this.key);})
			row.innerHTML = "<td><div class='button'>" + i + "</div></td>" +
				"<td>" + TwoDigit(Buildings[i].amount) + "</td>" +
				"<td>" + TwoDigit(Buildings[i].cost) + "</td>" +
				"<td>";
			
			table.appendChild(row)
		}
	}
	
	
	//var output = "<table style='width:40%'><tr><td></td><td><b>Amount</b></td><td><b>Cost</b></td><td><b>Additional Cost</b></td></tr>"; //The table header
	/*
	for (var i in Buildings) {	
		if (Buildings[i].visible == true) {
			output += "<tr onclick='AddBuilding(" + i + ")'>";
			output += "<td>" + i + "</td>";
			output += "<td>" + TwoDigit(Buildings[i].amount) + "</td>";
			output += "<td>" + TwoDigit(Buildings[i].cost) + "</td>";
			output += "<td>"
			if( Buildings[i].reqs ) {
				Buildings[i].reqs.reduce(function(output, curr) {output += curr[1] + " " + curr[2]});
			}
			output += "</td>"
			output += "</tr>";
		}
	}
	output += "</table>";
	target.innerHTML = output; */
	target.appendChild(table)
	//console.log("Updating Resource Table.");
}

function UpdateResearch() {
	var target = document.getElementById('Research');
	if (target.innerHTML == '') {
		for (var i in Research) {
			var button = document.createElement("div")
			button.className = "button";
			button.setAttribute("id","Res" + i);
			button.innerHTML = i;
			button.style = "display:none"
			button.addEventListener("click", function() { DoResearch(this.innerHTML); });
			target.appendChild(button);
		}
	}
	
	for (var i in Research) {
		var button = document.getElementById("Res" + i);
		if (!button) {
			//console.log("Research button " + i + " not found.");
			continue;
		}
		if (Research[i].visible == true && !Research[i].completed ) { button.style = '' }
		if (Research[i].completed) { button.style = "display:none"; }
		if (CanResearch(i)) { button.className = "button"; }
			else { button.className = "button disabled"; }
	}
}

function DisplayServices() {
	var target = document.getElementById('Services')
	var output = "<table style='width:40%'>"
	
}

function DisplayMessage(msg) {
	var target = document.getElementById('MessageLog');
	var message = document.createElement("div");
	var inner = document.createElement("span");
	var count = document.createElement("span");
	var last;
	
	if  (target.lastChild) {
		last = target.lastChild.firstChild;
	} else {
		last = {innerHTML: undefined}
	}
	
	message.className = "message";
	inner.innerHTML = msg;
	if (last.innerHTML == inner.innerHTML) {
		count = target.lastChild.lastChild
		//Increase count.
		var countnum = count.innerHTML;
		if (countnum == "") {
			target.lastChild.lastChild.innerHTML = " x2"
		} else {
			countnum = +countnum.replace(" x", "") + 1;
			count.innerHTML = " x" + countnum;
		}
	} else {
		message.appendChild(inner);
		message.appendChild(count);
		target.appendChild(message);
	
		// Now clean old messages.
		var messages = document.querySelectorAll("div.message");
		// messages[0].
		if (messages.length > 20) { messages[0].remove(); }
	}
}

// Gonna shelve this.  AddViaClick manipulates stock directly and UpdateResources() relies on +income -spending first then modifies stock.
function DoJob(job, dwarfpower) {
	//Turn an input of dwarfhours*workrate into outputs.
	// For clicks, dwarfpower is 1 so one click on buildings produces 1 build point and consumes 2 wood and 1 stone.
	
}

// If there is a cap, resources cannot exceed them.
function CapResources() {
	for (var i in Resources) {
		if (Resources[i].storage) {
			//Some resources are exempt from the rule.  Maybe I should add a flag for this.
			if (i == "population") { continue; }
			if (i == "workers") { continue; }
			if (Resources[i].stock > Resources[i].storage) {
				Resources[i].stock = Resources[i].storage;
			}
		}
	}
}

// Note: Need to handle what happens during game load as the timers will get dropped.
function WorkerTrained(job, count) {
	if (typeof(count)==='undefined') { count = 1; }
	if (count > Jobs[job].training) { console.log("Worker training - Converting more workers than we have training."); }
	
	Jobs[job].training -= count;
	Jobs[job].working += count;
}

function WorkerCured(job, count) {
	if (typeof(count)==='undefined') { count = 1; }
	if (count > Jobs[job].sick) { console.log("Worker cured - Converting more workers than we have sick."); }
	
	Jobs[job].sick -= count;
	Jobs[job].working += count;
}

function Workerhealed(job, count) {
	if (typeof(count)==='undefined') { count = 1; }
	if (count > Jobs[job].injured) { console.log("Worker healed - Converting more workers than we have injured."); }
	
	Jobs[job].injured -= count;
	Jobs[job].working += count;
}

// Not used.  Probably won't use this.
function CanClickJob() {
	if ( Resources[Jobs["basic builder"].reqs[0][0]].stock > Jobs["basic builder"].reqs[0][1] && Resources[Jobs["basic builder"].reqs[1][0]].stock > Jobs["basic builder"].reqs[1][1] ) {
		return true;
	}
}

function AddViaClick(x) {
	if (x == 1) {
		Resources.food.stock += 1;
		Math.round(Resources.food.stock * 100) / 100
	}
	if (x == 2) {
		//console.log("Incrementing wood from " + Resources.wood.stock)
		Resources.wood.stock += 1;
		Math.round(Resources.wood.stock * 100) / 100
	}
	if (x == 3) {
		Resources.stone.stock += 1;
		Math.round(Resources.stone.stock * 100) / 100
	}
	if (x == 4) {
		if ( Resources.wood.stock >= 2 && Resources.stone.stock >= 1 ) {
			Resources.wood.stock -= 2;
			Resources.stone.stock -= 1;
			Resources["build points"].stock += 1;
			Math.round(Resources["build points"].stock * 100) / 100
		} else { DisplayMessage("Not enough wood and stone!") }
	}
	if (x == 5) {
		if (Resources.population.storage <= Resources.population.stock) {
			DisplayMessage("Not enough housing!");
		} else {
			AddDwarf();
		}
	}
	CapResources();
	DisplayResources();
}

function CanAssignWorker(job, count) { 
	if (typeof(count)==='undefined') { count = 1; }
	
	if (!Jobs[job]) {
		//Invalid job
		console.log("CanAssignWorker(x) -- Invalid job.");
		return false;
	}
	
	var canAssign = count;
	
	canAssign = Math.min(Resources.workers.stock, canAssign);
	
	if (Jobs[job].toolrate) {
		//Costs one tool to start.
		// TODO: Replace with get best tool.
		canAssign = Math.min(Math.floor(Resources["stone tools"].stock), canAssign);
	}
	if (Jobs[job].workshopbp) {
		canAssign = Math.min( Math.floor(Resources["build points"].stock / Jobs[job].workshopbp), canAssign );
	}
	
	//Still here?  Good!
	if (canAssign >= 1) { return canAssign; }
	else {
		//console.log("CanAssign for job " + job + " is " + canAssign);
		return false;
	}
}

// Assigns up to count workers.  
function AssignWorker(job, count) {
	if (typeof(count)==='undefined') { count = 1; }
	
	var assigned = CanAssignWorker(job, count);
	if (assigned === false) {
		//Invalid request
		console.log("AssignWorker() -- Invalid request.");
		return false;
	}

	if (Jobs[job].toolrate > 0) {
		//Costs one tool to start.
		// TODO: Replace with get best tool.
		Resources["stone tools"].stock -= assigned;
	}
	if (Jobs[job].workshopbp > 0) {
		resources["build points"].stock -= Jobs[job].workshopbp * assigned;
	}
	if (Jobs[job].trainingtime > 0) {
		var time = Jobs[job].trainingtime * 1000;
		
		Jobs[job].training += assigned;
		setTimeout( function() {WorkerTrained(job)}, time ); // Need to detect jobs in training on load and restart timeout.
	} else {
		Jobs[job].working += assigned;
	}
	Resources.workers.stock -= assigned;
	
	//Now update display.
	DisplayJobs();
}

function UnassignWorker(job, count) {
	if (typeof(count) === 'undefined') { count = 1; }
	
	var unassigned = count;
	unassigned = Math.min(Jobs[job].working, unassigned);
	
	if (unassigned < 0) { 
		console.log("UnassignWorker(), invalid request.");
		return;
	}
	Jobs[job].working -= unassigned;
	Resources.workers.stock += unassigned;
}

function CanBuild(building) {
	if ( !Buildings[building] ) {
		//Invalid building.
		console.log("CanBuild(x) -- Invalid building.")
		return false;
	}
	
	if (Resources["build points"].stock < Buildings[building].cost) { return false; }
	for (i in Buildings[building].reqs) {
		if (Buildings[building].reqs[i][1] > Resources[Buildings[building].reqs[i][0]].stock) { return false; }
	}
	
	//Still here?  Good!
	return true;
}

function AddBuilding(building, count) {
	if (typeof(count)==='undefined') { count = 1; }
	
	var bldg = Buildings[building];
	var CanBuild = true;
	if (Resources["build points"].stock < bldg.cost * count) { CanBuild = false; }
	for (i in bldg.addedcost) {
		if (bldg.addedcost[i] * count > Resources[i].stock) { CanBuild = false; }
	}
	if (CanBuild == false) { return; }
	// Are we still here?  Good!
	Resources["build points"].stock -= bldg.cost * count;
	for (i in bldg.reqs) {
		Resources[bldg.reqs[i][0]].stock -= bldgs.reqs[i][1] * count;
	}
	bldg.amount += count;
	// Here we do special stuff depending on the building.
	if (building == "hut") {
		Resources.population.storage += 1;
	}
		
	//Now update display.
	DisplayBuildings();
}

function CanResearch(research) {
	if (Resources["research points"].stock < Research[research].cost) { return false; }
	
	return true;
}

function DoResearch(research) {
	if (CanResearch(research)) { UnlockResearch(research); }
}

function UnlockResearch(research) {
	Research[research].completed = true;
	//Unlock the next tech in the tree.
	for (var n in Research[research].nextresearch) {
		Research[n].visible = true;
	}
	for (var n in Research[research].newjobs) {
		Jobs[n].visible = true;
	}
	for (var n in Research[research].newbuildings) {
		Buildings[n].visible = true;
	}
	
	//Specific rules for specific techs.
}

//So janky.
immigration = false;

function CheckEvents() {
	// Check for immigration
	var immigration = false;
	if (immigration == false) {
		if (Resources.population.stock < Resources.population.storage) {
			setTimeout(function() { 
				AddDwarf();
				immigration = false;
			}, 4000);
			immigration = true;
		}
	}
	// Check for starvation warning
	if (Resources.food.income + Resources.food.spending < 0 && Resources.food.stock / (Resources.food.income + Resources.food.spending) > -120 ) {
		DisplayMessage("Our people are in danger of starving.");
	}
		
}

function CheckOnceEvents() {

	// Game start
	if (!Events[0]) {
		Events[0] = true;
		DisplayMessage("You are seven highly motivated dwarves ready to tame the mountain inside and out.");
	}
	if (!Events[1]) {
		if (Resources.population.storage > 7) {
			Events[1] = true;
			DisplayMessage("With enough housing, immigrants will arrive at a steady pace.  Research new building and techniques to grow your settlement further.");
			Resources["research points"].visible = true;
			Jobs.elder.visible = true;
		}
	}
	if (!Events[2]) {
		if (Resources["research points"].stock > 1) {
			//Show research
			Events[2] = true;
			document.getElementById("Research").className = "" //Unhide research
			Research["tools"].visible = true;
		}
	}
	if (!Events[3]) {
		if (Jobs.hunting.working >= 40) {
			Events[3] = true;
			DisplayMessage("Game is becoming more scarce.  We must find other sources of food.");
		}
	}
	
			

	// Helper functions.
	function MakeResourceVisible(resname) {
		Resources[resname].visible = true;
	}
	
	function ForceResource(resname, amount) {
		Resources[resname].stock = amount;
	}
			
}

function AddDwarf() {
	Resources.population.stock += 1;
	Resources.workers.stock += 1; //Should rename this function.  May want to add population without adding workers (births, refugees)
}

// Game Helper Functions
// Depreciated
/*
function Dwarf() {
	this.name = "Bob";
	this.experience = 0;
	this.productivity = 0;
	this.job = -1;
	this.morale = 100;
	this.house = -1;
	this.type = "Dwarf";
}*/

// Depreciated
/* 
function Job() {
	this.name = "";
	this.profession = "";
}

function ResourceJob() {
	Job.call(this);
	this.type = "resource";
	this.stock = 0;
	this.rate = 0;
	this.workers = 0;
	this.productrate = 1;
}
*/

// General Helper Functions

function TwoDigit(x) {
	if (x > 1e7) {
		return( (x / 1e6).toFixed(2) + "M" );
	}
	if (x > 10000) {
		return( (x / 1000).toFixed(2) + "k" );
	}
	// This doesn't work in IE 10 or earlier
	//if (Number.isInteger(x)) { return(x) }
	if (x == x.toFixed(0)) { return(x) }
	
	return( x.toFixed(2) );
}

//Close Modal
window.onclick = function(event) {
	if (event.target != document.getElementById('myModal')) {
		//document.getElementById('myModal').style.visibility = "hidden";
		document.getElementById('myModal').style.display = "none";
	}
}

// Open Modal
window.onmouseover = function(event) {
	if (event.target == document.getElementById('FoodRow')) {
		//document.getElementById('myModal').style.visibility = "visible";
		document.getElementById('myModal').style.display = "block";
	}
}

//Open Modal
/*window.onclick = function(event) {
	if (event.target == document.getElementById('FoodRow')) {
		document.getElementById('myModal').style.display = "block";
	}
}*/
