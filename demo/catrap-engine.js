var Action = {
	eMove: 0,
	eDrop: 1,
	eDig: 2,
	eDespatch: 3
};

var GuiEvent = {
    eDropped: 0
};

function SameLocation(a, b) {
	return a.x === b.x && a.y === b.y;
}

var Journal = function() {
	this.entries = new Array();
	this.index = -1;
};
Journal.prototype.AtBeginning = function() {
	return this.index === -1;
};
Journal.prototype.AtEnd = function() {
	return this.index === this.entries.length - 1;
};
Journal.prototype.Add = function(entry) {
	this.index++;
	this.entries[this.index] = entry;
	this.entries.length = this.index + 1;
};
Journal.prototype.GetPrevious = function() {
	return this.entries[this.index--];
};
Journal.prototype.GetNext = function() {
	return this.entries[++this.index];
};
Journal.prototype.Peek = function() {
	return this.entries[this.index];
};
Journal.prototype.PeekNext = function() {
	return this.entries[this.index + 1];
};

var World = function(width, height, level) {
	this.cells = new Array(width);
	for (var x = 0; x < this.cells.length; x++) {
		this.cells[x] = new Array(height);
	}
	this.entities = new Array();
	this.level = level;
	this.population = 0;
	this.journal = new Journal();
	this.guiEvents = new Array();
};

World.prototype.Build = function(player) {
	var w = this.cells.length;
	for (var x = 0; x < w; ++x) {
		var h = this.cells[x].length;
		for (var y = 0; y < h; ++y) {
			if (x === 0 || x === w - 1 || y === 0 || y === h - 1) {
				this.cells[x][y] = new Rock();
			} else {
				var i = ((h - 2) - y) * (w - 2) + x - 1;
				this.cells[x][y] = new EmptySpace();
				if (this.level !== undefined) {
					switch (this.level[i]) {
					case '#':
						this.cells[x][y] = new Rock();
						break;
					case '%':
						this.cells[x][y] = new Earth();
						break;
					case '=':
						this.cells[x][y] = new Ladder();
						break;
					case '-':
						this.cells[x][y] = new Ledge();
						break;
					case '~':
						this.cells[x][y] = new EarthLedge();
						break;
					case 'o':
						this.AddEntity(new Boulder({
							x: x,
							y: y
						},
						this));
						break;
					case 'D':
						this.AddEntity(new Demon({
							x: x,
							y: y
						},
						this));
						break;
					case 'T':
						this.AddEntity(new Troll({
							x: x,
							y: y
						},
						this));
						break;
					case 'G':
						this.AddEntity(new Ghost({
							x: x,
							y: y
						},
						this));
						break;
					case 'P':
						this.AddEntity(new Phantom({
							x: x,
							y: y
						},
						this));
						break;
					default:
					}
				}
			}
		}
	}
};

World.prototype.GetWidth = function() {
	return this.cells.length;
};

World.prototype.GetHeight = function() {
	return this.cells[0].length;
};

World.prototype.PlaceContent = function(content, location) {
	this.cells[location.x][location.y] = content;
};

World.prototype.GetContent = function(location) {
	return this.cells[location.x][location.y];
};

World.prototype.AddEntity = function(entity) {
	this.entities.push(entity);
	if (entity instanceof Enemy) {
		this.population++;
	}
};

World.prototype.GetEntity = function(location) {
	for (var e = 0; e < this.entities.length; ++e) {
		if (SameLocation(this.entities[e].GetLocation(), location)) {
			return this.entities[e];
		}
	}
	return undefined;
};

World.prototype.DispatchEntity = function(location) {
	for (var e = 0; e < this.entities.length; ++e) {
		if (this.entities[e] instanceof Enemy && SameLocation(this.entities[e].GetLocation(), location)) {
			this.entities[e].Dispatch();
			this.entities[e] = undefined;
			this.entities.splice(e, 1);
		}
	}
};

World.prototype.Update = function() {
	var updated = false;
	for (var e = 0; e < this.entities.length; ++e) {
		updated = this.entities[e].Update() || updated;
	}
	return updated;
};

World.prototype.Rewind = function() {
	if (!this.journal.AtBeginning()) {
		var entry = this.journal.GetPrevious();
		var action = entry.action;
		if (action === Action.eMove || action === Action.eDrop) {
			var entity = entry.entity;
			var movement = entry.movement;
			entity.location.x -= movement.dx;
			entity.location.y -= movement.dy;
			return action === Action.eDrop;
		} else if (action === Action.eDig) {
			this.PlaceContent(entry.content, entry.location);
			return true;
		} else if (action == Action.eDespatch) {
			this.AddEntity(entry.entity);
			return true;
		}
		return false;
	}
	return false;
};

World.prototype.FastForward = function() {
	if (!this.journal.AtEnd()) {
		var entry = this.journal.GetNext();
		var action = entry.action;
		if (action === Action.eMove || action === Action.eDrop) {
			var entity = entry.entity;
			var movement = entry.movement;
			entity.location.x += movement.dx;
			entity.location.y += movement.dy;
			if (this.journal.AtEnd()) {
				return false;
			}
			return this.journal.PeekNext().action === Action.eDrop || this.journal.PeekNext().action === Action.eDig || this.journal.PeekNext().action === Action.eDespatch;
		} else if (action === Action.eDig) {
			this.PlaceContent(new EmptySpace(), entry.location);
			if (this.journal.AtEnd()) {
				return false;
			}
			return this.journal.PeekNext().action === Action.eDrop;
		} else if (action === Action.eDespatch) {
			this.DispatchEntity(entry.location);
			return false;
		}
		return false;
	}
	return false;
};

var Content = function() {};
Content.prototype.IsPermanent = function() {
	return true;
};

Content.prototype.CanBeOccupied = function(entity) {
	return (entity instanceof Player);
};

var Entity = function(location, world) {
	this.location = location;
	this.world = world;
};

function CanDrop( entity )
{
	var below = {
		x: entity.location.x,
		y: entity.location.y - 1
	};
	var contentBelow = entity.world.GetContent(below);
	var entityBelow = entity.world.GetEntity(below);
	return ((contentBelow instanceof EmptySpace) && (entityBelow === undefined));
};

Entity.prototype.Update = function() {
	if (this.ShouldDrop()) {
		if (! (this.world.GetContent({
			x: this.location.x,
			y: this.location.y
		}) instanceof Ladder)) {
			var below = {
				x: this.location.x,
				y: this.location.y - 1
			};
			if( CanDrop( this ) ) {
				this.location.y -= 1;
				this.world.journal.Add({
					action: Action.eDrop,
					entity: this,
					movement: {
						dx: 0,
						dy: -1
					}
				});
				if( ! CanDrop( this ) ) {
				    this.world.guiEvents.push( { event: GuiEvent.eDropped } );
				}
				return true;
			}
		}
	}
	return false;
};
Entity.prototype.GetLocation = function() {
	return this.location;
};
Entity.prototype.ShouldDrop = function() {
	return true;
};
Entity.prototype.CanPush = function() {
	return false;
};
Entity.prototype.CanBePushed = function() {
	return false;
};
Entity.prototype.CanBeDispatched = function() {
	return false;
};
Entity.prototype.Move = function(dx, dy) {
	if (dy > 0) {
		if (! (this.world.GetContent(this.location) instanceof Ladder)) {
			return false;
		}
		var above = {
			x: this.location.x,
			y: this.location.y + dy
		};
		var contentAbove = this.world.GetContent(above);
		var entityAbove = this.world.GetEntity(above);
		if (entityAbove !== undefined || !(contentAbove instanceof Ladder || contentAbove instanceof EmptySpace)) {
			return false;
		}
	} else if (dy < 0) {
		var below = {
			x: this.location.x,
			y: this.location.y + dy
		};
		var contentBelow = this.world.GetContent(below);
		var entityBelow = this.world.GetEntity(below);
		if (entityBelow !== undefined || (!(contentBelow instanceof EmptySpace) && !(contentBelow instanceof Ladder))) {
			return false;
		}
	}

	var targetLocation = {
		x: this.location.x + dx,
		y: this.location.y + dy
	};
	var content = this.world.GetContent(targetLocation);
	var entity = this.world.GetEntity(targetLocation);

	var shouldMove = (entity === undefined) && (content.CanBeOccupied(this));
	var despatched = false;

	if (this.CanPush()) {
		if (entity !== undefined) {
			if (entity.CanBePushed()) {
				return entity.Move(dx, dy);
			}
			if (entity.CanBeDispatched()) {
				this.world.DispatchEntity(targetLocation);
				despatched = true;
				shouldMove = true;
			}
		}
	}

	if (shouldMove) {
		this.location.x += dx;
		this.location.y += dy;
		this.world.journal.Add({
			action: Action.eMove,
			entity: this,
			movement: {
				dx: dx,
				dy: dy
			}
		});
		if (despatched) {
			this.world.journal.Add({
				action: Action.eDespatch,
				entity: entity,
				location: targetLocation
			});
		}
		if (!content.IsPermanent() && !(content instanceof EmptySpace)) {
			this.world.PlaceContent(new EmptySpace, this.location);
			this.world.journal.Add({
				action: Action.eDig,
				content: content,
				location: this.location
			});
		}
		return true;
	}
	return false;
};

var Rock = function() {};
Rock.prototype = new Content();
Rock.prototype.CanBeOccupied = function() {
	return false;
};

var Player = function(Location, world) {
	this.location = location;
	this.world = world;
	this.active = true;
};
Player.prototype = new Entity(this.location, this.world);
Player.prototype.CanPush = function() {
	return this.active;
};
Player.prototype.SetActive = function(active) {
	this.active = active;
};

var Catboy = function(location, world) {
	this.location = location;
	this.world = world;
};
Catboy.prototype = new Player(this.location, this.world);

var Catgirl = function(location, world) {
	this.location = location;
	this.world = world;
};
Catgirl.prototype = new Player(this.location, this.world);

var Earth = function() {};
Earth.prototype = new Content();
Earth.prototype.IsPermanent = function() {
	return false;
};

var EarthLedge = function() {};
EarthLedge.prototype = new Content();
EarthLedge.prototype.IsPermanent = function() {
	return false;
};

var Ladder = function() {};
Ladder.prototype = new Content();

var Ledge = function() {};
Ledge.prototype = new Content();
Ledge.prototype.CanBeOccupied = function() {
	return false;
};

var Boulder = function(location, world) {
	this.location = location;
	this.world = world;
};
Boulder.prototype = new Entity(this.location, this.world);
Boulder.prototype.CanBePushed = function() {
	return true;
};

var Enemy = function(location, world, population) {
	this.location = location;
	this.world = world;
	this.population = population;
};
Enemy.prototype = new Entity(this.location, this.world);
Enemy.prototype.IsPermanent = function() {
	return false;
};
Enemy.prototype.ShouldDrop = function() {
	return true;
};
Enemy.prototype.CanBeDispatched = function() {
	return true;
};
Enemy.prototype.Dispatch = function() {
	this.world.population--;
};
var Demon = function(location, world) {
	this.location = location;
	this.world = world;
};
Demon.prototype = new Enemy(this.location, this.world, this.population);

var Troll = function(location, world) {
	this.location = location;
	this.world = world;
};
Troll.prototype = new Enemy(this.location, this.world, this.population);

var Ghost = function(location, world) {
	this.location = location;
	this.world = world;
};
Ghost.prototype = new Enemy(this.location, this.world, this.population);
Ghost.prototype.ShouldDrop = function() {
	return false;
};

var Phantom = function(location, world) {
	this.location = location;
	this.world = world;
};
Phantom.prototype = new Enemy(this.location, this.world, this.population);

var EmptySpace = function() {};
EmptySpace.prototype = new Content();
EmptySpace.prototype.IsPermanent = function() {
	return false;
};
EmptySpace.prototype.CanBeOccupied = function() {
	return true;
};
