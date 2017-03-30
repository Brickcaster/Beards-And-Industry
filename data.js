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
	Resources.population.stock = 7;
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
			this.injured = [[]];
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
	Jobs.hunting = new Production(undefined, {food: 1.2, skins: 0.2}, 1);
	Jobs.hunting.visible = true;
	Jobs.hunting.working = 6;
	Jobs["wood gathering"] = new Production(undefined, {wood: 1}, 0.15);
	Jobs["wood gathering"].visible = true;
	Jobs["stone gathering"] = new Production(undefined, {stone: 1}, 0.10);
	Jobs["stone gathering"].visible = true;
	Jobs["basic builder"] = new Production({wood: 2, stone: 1}, {"build points": 1}, 0.2);
	Jobs["basic builder"].visible = true;
	
	Jobs.elder = new Production(undefined, {"research points":1}, 1);
	
	Jobs["stone toolmaker"] = new Production({wood: 1, stone:1}, {"stone tools": 1}, 0.65);
	
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
	
	Research.tools = new Res(10, ["writing"], ["stone toolmaker"]);
	Research.tools.visible = true;
	
	Research.writing = new Res(20, ["metal working"]);
}