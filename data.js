function ResetResources() {
	
	Resources = {};
	
	class Resource { 
		constructor(storage) {
			this.stock = 0;
			this.income = 0;
			this.spending = 0;
			this.visible = false;
			if (typeof(storage) != "undefined") { this.storage = storage; } //This is a multiplier to Buildings.warehouses.
		}
		
		//get flux() { return this.income + this.spending; }
	}
	
	//Resources.tools = {} //This is a special resource with a getter/setter.
	
//	Resource.prototype.flux = function() { return this.income + this.spending; }
	
	Resources.food = new Resource(100);
	Resources.food.visible = true;
	Resources.wood = new Resource(100);
	Resources.wood.visible = true;
	Resources.stone = new Resource(100);
	Resources.stone.visible = true;
	Resources["build points"] = new Resource(100);
	Resources["build points"].visible = true;
	
	Resources["research points"] = new Resource();
	Resources["stone tools"] = new Resource(100);
	
	Resources["copper vein"] = new Resource();
	Resources["copper ore"] = new Resource(1000);
	Resources["copper bars"] = new Resource(100);
	Resources["copper tools"] = new Resource(100);
	
	Resources["skins"] = new Resource(100);
	Resources.leather = new Resource(100);
	
	Resources["gold vein"] = new Resource();
	Resources["gold ore"] = new Resource(100);
	Resources["gold bars"] = new Resource(10);
	
	Resources["iron vein"] = new Resource();
	Resources["iron ore"] = new Resource(1000);
	Resources["iron bars"] = new Resource(1000);
	
	Resources["coal vein"] = new Resource();
	Resources["coal"] = new Resource(100);
	
	Resources["population"] = new Resource(0);
	Resources.population.visible = true;
	Resources["workers"] = new Resource();
	Resources.workers.visible = true;
}

function ResetJobs() {
	
	Jobs = {};
	
	class Production {
		constructor(inputs, outputs, speed) {
			this.working = 0;
			this.training = 0;
			this.sick = 0;
			this.injured = 0;
			this.visible = false;
			this.obsolete = false;
			this.traintime = 0;
			this.toolrate = 0;
			this.workshopbp = 0;
			this.speed = speed;
			this.type = "production";
			this.eventfactor = 1; //For events that can modify a job's output.  Eg. hunting (game becomes scarce), prospecting (veins are hard to find, must dig deeper)
			if (typeof(inputs) == "object") {
				this.inputs = {};
				for (var i in inputs) {
					this.inputs[i] = inputs[i];
				}
			}
			if (typeof(outputs) == "object") {
				this.outputs = {};
				for (var i in outputs) {
					this.outputs[i] = outputs[i];
				}
			}
		}
		
	}
		
	//Starting jobs.
	Jobs.hunting = new Production(undefined, {food: 1, skins: 0.2}, 2.5);
	Jobs.hunting.visible = true;
//	Jobs.hunting.working = 3; //Handled in Reset()
	Jobs["wood gathering"] = new Production(undefined, {wood: 1}, 0.15);
	Jobs["wood gathering"].visible = true;
	Jobs["stone gathering"] = new Production(undefined, {stone: 1}, 0.10);
	Jobs["stone gathering"].visible = true;
	Jobs["basic builder"] = new Production({wood: 2, stone: 1}, {"build points": 1}, 0.2);
	Jobs["basic builder"].visible = true;
	
	Jobs.elder = new Production(undefined, {"research points":1}, 1);
	
	// Tier 2 jobs
	Jobs["stone toolmaker"] = new Production({wood: 1, stone:1}, {"stone tools": 1}, 0.65);
	Jobs.farming = new Production(undefined, {food:1.4, skins: 0.15}, 1);
	Jobs.farming.toolrate = 0.001;
	Jobs.farming.trainingtime = 120;

	Jobs.woodcutter = new Production(undefined, {wood:1}, 0.3);
	Jobs.woodcutter.toolrate = 0.001;
	
	Jobs.stonecutter = new Production(undefined, {stone:1}, 0.2);
	Jobs.stonecutter.toolrate = 0.005;
	
	
	//Now validate jobs according to resources.
	
	for (var i in Jobs) {
		for (var n in Jobs[i].inputs) {
			if (typeof(Resources[n]) == "undefined") {
				console.log("Jobs." + i + " has undefined input " + n + "!")
			}
		}
		for (var n in Jobs[i].outputs) {
			if (typeof(Resources[n]) == "undefined") {
				console.log("Jobs." + i + " has undefined output " + n + "!")
			}
		}
	}
	
}

function ResetBuildings() {
	Buildings = {};
	
	class Building {
		constructor(cost, addedcost) {
			this.amount = 0;
			this.cost = cost;
			this.visible = false;
			if (addedcost !== undefined) {
				this.addeccost = {}
				for (var i in addedcost) {
					this.addedcost[i] = addedcost[i];
				}
			}
			this.description = "";
		}
	}
	
	Buildings.hut = new Building(10);
	Buildings.hut.visible = true;
	Buildings.hut.description = "Simple housing for one";
	
	Buildings.warehouse = new Building(20); // This one increases every time it's built.  Need to figure out how ot bypass bp cap to build it eventually.
	Buildings.warehouse.description = "A place to store extra goods";
	
}

function ResetResearch() {
	Research = {};
	
	class Res {
		constructor(cost, nextresearch, newjobs, newbuildings) {
			this.cost = cost
			this.visible = false;
			this.completed = false;
			// These are what the research unlocks.
			if (nextresearch !== undefined) {
				this.nextresearch = [];
				for (var i in nextresearch) {
					this.nextresearch[i] = nextresearch[i];
				}
			}
			if (newjobs !== undefined) {
				this.newjobs = [];
				for (var i in newjobs) {
					this.newjobs[i] = newjobs[i];
				}
			}
			if (newbuildings !== undefined) {
				this.newbuildings = [];
				for (var i in newbuildings) {
					this.newbuildings[i] = newbuildings[i];
				}
			}
		}
	}
	
	Research.tools = new Res(10, {"writing":undefined}, {"stone toolmaker":undefined});
	//Research.tools.visible = true;
	
	Research.writing = new Res(20, ["metal working"]);
}

function SaveGame() {
	var SaveGame = {};
	var ResourceSave = {};
	var SaveJobs = {};
	var SaveBuildings = {};
	var SaveResearch = {};

	SaveGame.version = 0.001;
	SaveGame.Resources = ResourceSave;
	SaveGame.Jobs = SaveJobs;
	SaveGame.Buildings = SaveBuildings;
	SaveGame.Research = SaveResearch;
	SaveGame.Events = Events; // This is an array so that's all that's needed.
	
	for (var i in Resources) {
		ResourceSave[i] = {};
		ResourceSave[i].stock = Resources[i].stock;
		ResourceSave[i].visible = Resources[i].visible;
	}
	
	for (var i in Jobs) {
		SaveJobs[i] = {};
		SaveJobs[i].working = Jobs[i].working;
		SaveJobs[i].training = Jobs[i].training;
		SaveJobs[i].sick = Jobs[i].sick;
		SaveJobs[i].injured = Jobs[i].injured;
		SaveJobs[i].eventfactor = Jobs[i].eventfactor;
		SaveJobs[i].visible = Jobs[i].visible;
		SaveJobs[i].obsolete = Jobs[i].obsolete;
	}

	for (var i in Buildings) {
		SaveBuildings[i] = {};
		SaveBuildings[i].amount = Buildings[i].amount;
		SaveBuildings[i].visible = Buildings[i].visible;
	}

	for (var i in Research) {
		SaveResearch[i] = {};
		SaveResearch[i].completed = Research[i].completed;
		SaveResearch[i].visible = Research[i].visible;
	}
	
	localStorage.setItem("SaveGame", JSON.stringify(SaveGame));
	
}

function LoadGame() {

	var SaveGame;
	if (localStorage.SaveGame) { SaveGame = JSON.parse(localStorage.getItem("SaveGame")); }
	else { console.log( "Savegame data doesn't exist!" ); }

	Reset();

	var ResourceSave = SaveGame.Resources;
	var JobsSave = SaveGame.Jobs;
	var ResearchSave = SaveGame.Research;
	
	/* This does not work.  ResourceSave.food overwrites Resources.food, dropping Resources.stock, for example.
	Object.assign(Resources, ResourceSave); //This should simplify loading.
	Object.assign(Jobs, JobsSave);
	Object.assign(Buildings, SaveGame.Buildings);
	Object.assign(Research, SaveGame.Research);
	*/

	Events = SaveGame.Events;
	
	
	for (var i in ResourceSave) {
		Object.assign(Resources[i], ResourceSave[i]);
	}
	
	for (var i in JobsSave) {
		Object.assign(Jobs[i], JobsSave[i]);
	}

	for (var i in ResearchSave) {
		Object.assign(Research[i], ResearchSave[i]);
	}

	// Need to rebuild our timeouts for workers in training, sick, injured, etc
	Object.keys(Jobs).forEach( function(job) {
		if (Jobs[job].training > 0) {
			setTimeout( function() {WorkerTrained(job)}, time ); // Need to detect jobs in training on load and restart timeout.
		}
	});
}
