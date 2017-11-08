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
test( "locations can be compared", function()
{
    var location1 = { x: 1, y: 2 };
    var location2 = { x: 2, y: 3 };
    var location3 = { x: 1, y: 2 };
    ok( SameLocation( location1, location1 ) );
    ok( !SameLocation( location1, location2 ) );
    ok( SameLocation( location1, location3 ) );
} );
test( "world can be constructed", function()
{
    var world = new World( 10, 20 );
    equal( world.GetWidth(), 10 );
    equal( world.GetHeight(), 20 );
} );
test( "world can be constructed with alternate size", function()
{
    var world = new World( 11, 8 );
    equal( world.GetWidth(), 11 );
    equal( world.GetHeight(), 8 );
} );
test( "world is full of rock", function()
{
    var world = new World( 2, 2 );
    world.Build();
    ok( world.GetContent( { x: 0, y: 0 } ) instanceof Rock );
    ok( world.GetContent( { x: 1, y: 0 } ) instanceof Rock );
    ok( world.GetContent( { x: 0, y: 1 } ) instanceof Rock );
    ok( world.GetContent( { x: 1, y: 1 } ) instanceof Rock );
} );
test( "world is empty space surrounded by rock", function()
{
    var world = new World( 4, 4 );
    world.Build();
    ok( world.GetContent( { x: 1, y: 1 } ) instanceof EmptySpace );
    ok( world.GetContent( { x: 2, y: 1 } ) instanceof EmptySpace );
    ok( world.GetContent( { x: 1, y: 2 } ) instanceof EmptySpace );
    ok( world.GetContent( { x: 2, y: 2 } ) instanceof EmptySpace );
} );
test( "catboy can created and placed in world", function()
{
    var world = new World( 3, 4 );
    world.Build();
    ok( world.GetContent( { x: 1, y: 1 } ) instanceof EmptySpace );
    world.AddEntity( new Catboy( { x: 1, y: 1 }, world ) );
    ok( world.GetEntity( { x: 1, y: 1 } ) instanceof Catboy );
} );

test( "item can't be destroyed", function()
{
    var rock = new Content();
    ok( rock.IsPermanent() );
} );
test( "earth can be destroyed", function()
{
    var earth = new Earth();
    ok( !earth.IsPermanent() );
} );
test( "earth-ledge can be destroyed", function()
{
    var earthLedge = new EarthLedge();
    ok( !earthLedge.IsPermanent() );
} );
test( "demon can be destroyed", function()
{
    var demon = new Demon( { x: 0, y: 0 }, new World() );
    ok( !demon.IsPermanent() );
} );
test( "troll can be destroyed", function()
{
    var troll = new Troll( { x: 0, y: 0 }, new World() );
    ok( !troll.IsPermanent() );
} );
test( "ghost can be destroyed", function()
{
    var ghost = new Ghost( { x: 0, y: 0 }, new World() );
    ok( !ghost.IsPermanent() );
} );
test( "phantom can be destroyed", function()
{
    var phantom = new Phantom( { x: 0, y: 0 }, new World() );
    ok( !phantom.IsPermanent() );
} );

test( "item can't be occupied", function()
{
    var item = new Content();
    ok( !item.CanBeOccupied() );
} );
test( "empty space can be occupied", function()
{
    var emptySpace = new EmptySpace();
    ok( emptySpace.CanBeOccupied( new Player() ) );
} );
test( "ladder can be occupied", function()
{
    var ladder = new Ladder();
    ok( ladder.CanBeOccupied( new Player() ) );
} );

test( "catboy should drop", function()
{
    var catboy = new Catboy();
    ok( catboy.ShouldDrop() );
} );
test( "catgirl should drop", function()
{
    var catgirl = new Catgirl();
    ok( catgirl.ShouldDrop() );
} );
test( "boulder should drop", function()
{
    var boulder = new Boulder();
    ok( boulder.ShouldDrop() );
} );
test( "enemy should drop", function()
{
    var enemy = new Enemy();
    ok( enemy.ShouldDrop() );
} );
test( "ghost should not drop", function()
{
    var ghost = new Ghost( { x: 0, y: 0 }, new World() );
    ok( !ghost.ShouldDrop() );
} );
test( "entity drops", function()
{
    var world = new World( 3, 4 );
    world.Build();
    var entity = new Entity( { x: 1, y: 2 }, world );
    world.AddEntity( entity );
    world.Update();
    deepEqual( entity.location, { x: 1, y: 1 } );
    ok( world.GetEntity( { x: 1, y: 1 } ) instanceof Entity );
} );
test( "ghost doesn't drop", function()
{
    var world = new World( 3, 4 );
    world.Build();
    world.PlaceContent( new EmptySpace(), { x: 1, y: 1 } );
    var ghost = new Ghost( { x: 1, y: 2 }, world );
    world.AddEntity( ghost );
    world.Update();
    deepEqual( ghost.location, { x: 1, y: 2 } );
    ok( world.GetEntity( { x: 1, y: 2 } ) instanceof Entity );
} );
test( "entity doesn't drop off ladder", function()
{
    var world = new World( 3, 4 );
    world.Build();
    world.PlaceContent( new EmptySpace(), { x: 1, y: 1 } );
    world.PlaceContent( new Ladder(), { x: 1, y: 2 } );
    var entity = new Entity( { x: 1, y: 2 }, world );
    world.AddEntity( entity );
    world.Update();
    deepEqual( entity.location, { x: 1, y: 2 } );
    ok( world.GetEntity( { x: 1, y: 2 } ) instanceof Entity );
} );

test( "catboy can move horizontally", function()
{
    var world = new World( 4, 4 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    catboy.Move( 1, 0 );
    deepEqual( catboy.location, { x: 2, y: 1 } );
    catboy.Move( -1, 0 );
    deepEqual( catboy.location, { x: 1, y: 1 } );
} );
test( "catboy can be blocked", function()
{
    var world = new World( 4, 4 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    catboy.Move( -1, 0 );
    deepEqual( catboy.location, { x: 1, y: 1 } );
} );
test( "catboy destroys items", function()
{
    var world = new World( 4, 4 );
    world.Build();
    world.PlaceContent( new Earth(), { x: 2, y: 1 } );
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    ok( world.GetContent( { x: 2, y: 1 } ) instanceof Earth );
    catboy.Move( 1, 0 );
    deepEqual( catboy.location, { x: 2, y: 1 } );
    ok( world.GetContent( { x: 2, y: 1 } ) instanceof EmptySpace );
} );
test( "catboy goes up ladder into emptyspace", function()
{
    var world = new World( 3, 4 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    catboy.Move( 0, 1 );
    deepEqual( catboy.location, { x: 1, y: 1 } );
    var ladder = new Ladder();
    world.PlaceContent( ladder, { x: 1, y: 1 } );
    catboy.Move( 0, 1 );
    deepEqual( catboy.location, { x: 1, y: 2 } );
} );
test( "catboy goes up ladder", function()
{
    var world = new World( 3, 4 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    ok( !catboy.Move( 0, 1 ) );
    deepEqual( catboy.location, { x: 1, y: 1 } );
    var ladder = new Ladder();
    world.PlaceContent( ladder, { x: 1, y: 2 } );
    ok( !catboy.Move( 0, 1 ) );
    deepEqual( catboy.location, { x: 1, y: 1 } );
    world.PlaceContent( ladder, { x: 1, y: 1 } );
    ok( catboy.Move( 0, 1 ) );
    deepEqual( catboy.location, { x: 1, y: 2 } );
} );
test( "catboy can be blocked at top of ladder", function()
{
    var world = new World( 3, 4 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.PlaceContent( new Ladder(), { x: 1, y: 1 } );
    world.AddEntity( new Enemy( { x: 1, y: 2 }, world ) );
    ok( !catboy.Move( 0, 1 ) );
    deepEqual( catboy.location, { x: 1, y: 1 } );
} );

test( "catboy goes go down ladder", function()
{
    var world = new World( 3, 4 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 2 }, world );
    var ladder = new Ladder();
    world.PlaceContent( ladder, { x: 1, y: 2 } );
    world.PlaceContent( ladder, { x: 1, y: 1 } );
    catboy.Move( 0, -1 );
    deepEqual( catboy.location, { x: 1, y: 1 } );
} );
test( "catboy can do down ladder from empty space", function()
{
    var world = new World( 3, 4 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 2 }, world );
    var ladder = new Ladder();
    world.PlaceContent( ladder, { x: 1, y: 1 } );
    catboy.Move( 0, -1 );
    deepEqual( catboy.location, { x: 1, y: 1 } );
} );

test( "catboy can't drop off ladder into earth", function()
{
    var world = new World( 3, 4 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 2 }, world );
    var ladder = new Ladder();
    world.PlaceContent( ladder, { x: 1, y: 2 } );
    var earth = new Earth();
    world.PlaceContent( earth, { x: 1, y: 1 } );
    catboy.Move( 0, -1 );
    deepEqual( catboy.location, { x: 1, y: 2 } );
} );
test( "catboy drops off ladder into empty space", function()
{
    var world = new World( 3, 4 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 2 }, world );
    var ladder = new Ladder();
    world.PlaceContent( ladder, { x: 1, y: 2 } );
    var emptySpace = new EmptySpace();
    world.PlaceContent( emptySpace, { x: 1, y: 1 } );
    catboy.Move( 0, -1 );
    deepEqual( catboy.location, { x: 1, y: 1 } );
} );
test( "entity can be added to world", function()
{
    var world = new World( 3, 3 );
    world.Build();
    world.AddEntity( new Entity( { x: 1, y: 1 }, world ) );
    ok( world.GetEntity( { x: 1, y: 1 } ) instanceof Entity );
} );
test( "entities can be updated", function()
{
    var world = new World( 3, 4 );
    world.Build();
    world.AddEntity( new Boulder( { x: 1, y: 2 }, world ) );
    ok( world.GetEntity( { x: 1, y: 2 } ) instanceof Boulder );
    world.PlaceContent( new EmptySpace(), { x: 1, y: 1 } );
    world.Update();
    ok( world.GetEntity( { x: 1, y: 1 } ) instanceof Boulder );
} );
test( "update world returns true until entities are static", function()
{
    var world = new World( 3, 5 );
    world.Build();
    world.AddEntity( new Boulder( { x: 1, y: 3 }, world ) );
    ok( world.GetEntity( { x: 1, y: 3 } ) instanceof Boulder );
    world.PlaceContent( new EmptySpace(), { x: 1, y: 2 } );
    world.PlaceContent( new EmptySpace(), { x: 1, y: 1 } );
    ok( world.Update() );
    ok( world.GetEntity( { x: 1, y: 2 } ) instanceof Boulder );
    ok( world.Update() );
    ok( world.GetEntity( { x: 1, y: 1 } ) instanceof Boulder );
    ok( !world.Update() );
} );

test( "catboy is blocked by other entities", function()
{
    var world = new World( 5, 3 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.AddEntity( new Catgirl( { x: 2, y: 1 }, world ) );
    catboy.Move( 1, 0 );
    deepEqual( catboy.location, { x: 1, y: 1 } );
} );

test( "entity can't push", function()
{
    var entity = new Entity( { x: 0, y: 0 }, new World() );
    ok( !entity.CanPush() );
} );
test( "player can push", function()
{
    var player = new Player( { x: 0, y: 0 }, new World() );
    ok( player.CanPush() );
} );
test( "only active player can push", function()
{
    var player = new Player( { x: 0, y: 0 }, new World() );
    ok( player.CanPush() );
    player.SetActive( false );
    ok( !player.CanPush() );
} );

test( "boulders can be pushed", function()
{
    var boulder = new Boulder();
    ok( boulder.CanBePushed() );
} );
test( "catboy pushes boulder", function()
{
    var world = new World( 5, 3 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.AddEntity( new Boulder( { x: 2, y: 1 }, world ) );
    world.PlaceContent( new EmptySpace(), { x: 3, y: 1 } );
    catboy.Move( 1, 0 );
    deepEqual( catboy.location, { x: 1, y: 1 } );
    ok( world.GetEntity( { x: 3, y: 1 } ) instanceof Boulder );
} );
test( "catboy can't push boulder into rock", function()
{
    var world = new World( 4, 3 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.AddEntity( new Boulder( { x: 2, y: 1 }, world ) );
    catboy.Move( 1, 0 );
    deepEqual( catboy.location, { x: 1, y: 1 } );
    ok( world.GetEntity( { x: 2, y: 1 } ) instanceof Boulder );
} );
test( "catboy can't push boulder into earth", function()
{
    var world = new World( 5, 3 );
    world.Build();
    world.PlaceContent( new Earth(), { x: 3, y: 1 } );
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.AddEntity( new Boulder( { x: 2, y: 1 }, world ) );
    catboy.Move( 1, 0 );
    deepEqual( catboy.location, { x: 1, y: 1 } );
    ok( world.GetEntity( { x: 2, y: 1 } ) instanceof Boulder );
} );
test( "boulder can't push boulder", function()
{
    var world = new World( 6, 3 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.AddEntity( new Boulder( { x: 2, y: 1 }, world ) );
    world.AddEntity( new Boulder( { x: 3, y: 1 }, world ) );
    catboy.Move( 1, 0 );
    deepEqual( catboy.location, { x: 1, y: 1 } );
    ok( world.GetEntity( { x: 2, y: 1 } ) instanceof Boulder );
    ok( world.GetEntity( { x: 3, y: 1 } ) instanceof Boulder );
    ok( world.GetEntity( { x: 4, y: 1 } ) === undefined );
} );

test( "dispatch reduces population", function()
{
    var world = new World( 1, 1 );
    var demon = new Demon( { x: 2, y: 1 }, world );
    world.AddEntity( demon );
    equal( world.population, 1 );
    demon.Dispatch();
    equal( world.population, 0 );
} );
test( "enemy can be despatched", function()
{
    var world = new World( 4, 3 );
    world.Build();
    world.AddEntity( new Demon( { x: 2, y: 1 }, world ) );
    equal( world.population, 1 );
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.AddEntity( catboy );
    catboy.Move( 1, 0 );
    deepEqual( catboy.location, { x: 2, y: 1 } );
    ok( world.GetEntity( { x: 2, y: 1 } ) instanceof Catboy );
    equal( world.population, 0 );
} );
test( "world can be populated from string", function()
{
    var world1 = new World( 3, 3, "" );
    world1.Build();
    ok( world1.GetContent( { x: 1, y: 1 } ) instanceof EmptySpace );
    var world2 = new World( 3, 3, " " );
    world2.Build();
    ok( world2.GetContent( { x: 1, y: 1 } ) instanceof EmptySpace );
    var world3 = new World( 3, 3, "%" );
    world3.Build();
    ok( world3.GetContent( { x: 1, y: 1 } ) instanceof Earth );
    var world4 = new World( 3, 3, "=" );
    world4.Build();
    ok( world4.GetContent( { x: 1, y: 1 } ) instanceof Ladder );
    var world5 = new World( 3, 3, "-" );
    world5.Build();
    ok( world5.GetContent( { x: 1, y: 1 } ) instanceof Ledge );
    var world6 = new World( 3, 3, "~" );
    world6.Build();
    ok( world6.GetContent( { x: 1, y: 1 } ) instanceof EarthLedge );
    var world7 = new World( 3, 3, "o" );
    world7.Build();
    ok( world7.GetEntity( { x: 1, y: 1 } ) instanceof Boulder );
    var world8 = new World( 3, 3, "D" );
    world8.Build();
    ok( world8.GetEntity( { x: 1, y: 1 } ) instanceof Demon );
    var world9 = new World( 3, 3, "T" );
    world9.Build();
    ok( world9.GetEntity( { x: 1, y: 1 } ) instanceof Troll );
    var world10 = new World( 3, 3, "G" );
    world10.Build();
    ok( world10.GetEntity( { x: 1, y: 1 } ) instanceof Ghost );
    var world11 = new World( 3, 3, "P" );
    world11.Build();
    ok( world11.GetEntity( { x: 1, y: 1 } ) instanceof Phantom );
    var world14 = new World( 3, 3, "#" );
    world14.Build();
    ok( world14.GetContent( { x: 1, y: 1 } ) instanceof Rock );
    var level = " %  =  - "
        + " 1 D o ~T"
        + "##G### #P";
    var world15 = new World( 11, 5, level );
    world15.Build();
    ok( world15.GetContent( { x: 1, y: 1 } ) instanceof Rock );
    ok( world15.GetEntity( { x: 3, y: 1 } ) instanceof Ghost );
    ok( world15.GetContent( { x: 7, y: 1 } ) instanceof EmptySpace );
    ok( world15.GetEntity( { x: 9, y: 1 } ) instanceof Phantom );
    ok( world15.GetEntity( { x: 4, y: 2 } ) instanceof Demon );
    ok( world15.GetEntity( { x: 6, y: 2 } ) instanceof Boulder );
    ok( world15.GetContent( { x: 8, y: 2 } ) instanceof EarthLedge );
    ok( world15.GetEntity( { x: 9, y: 2 } ) instanceof Troll );
    ok( world15.GetContent( { x: 2, y: 3 } ) instanceof Earth );
    ok( world15.GetContent( { x: 5, y: 3 } ) instanceof Ladder );
    ok( world15.GetContent( { x: 8, y: 3 } ) instanceof Ledge );
} );

test( "at beginning is true for empty journal", function()
{
    var world = new World( 4, 3 );
    world.Build();
    ok( world.journal.AtBeginning() );
} );
test( "at end is true if journal has not been rewound", function()
{
    var world = new World( 4, 3 );
    world.Build();
    ok( world.journal.entries.length === 0 );
    var entity = new Entity( { x: 1, y: 1 }, world );
    ok( entity.Move( 1, 0 ) );
    ok( world.journal.AtEnd() );
} );
test( "journal get previous returns previous entry", function()
{
    var journal = new Journal();
    journal.Add( { action: Action.eMove, entity: new Entity(), movement: { dx: 1, dy: -1 } } );
    var entry = journal.GetPrevious();
    equal( entry.action, Action.eMove );
    equal( entry.movement.dx, 1 );
    equal( entry.movement.dy, -1 );
} );

test( "journal get next returns next entry", function()
{
    var journal = new Journal();
    journal.Add( { action: Action.eMove, entity: new Entity(), movement: { dx: 1, dy: -1 } } );
    journal.Add( { action: Action.eMove, entity: new Entity(), movement: { dx: 0, dy: 0 } } );
    var entry = journal.GetPrevious();
    entry = journal.GetPrevious();
    ok( journal.AtBeginning() );
    equal( entry.action, Action.eMove );
    equal( entry.movement.dx, 1 );
    equal( entry.movement.dy, -1 );
    entry = journal.GetNext();
    equal( entry.action, Action.eMove );
    equal( entry.movement.dx, 1 );
    equal( entry.movement.dy, -1 );
    ok( !journal.AtEnd() );
} );

test( "entity movement is added to journal", function()
{
    var world = new World( 4, 3 );
    world.Build();
    ok( world.journal.entries.length === 0 );
    var entity = new Entity( { x: 1, y: 1 }, world );
    ok( entity.Move( 1, 0 ) );
    ok( world.journal.entries.length === 1 );
    var lastEntry = world.journal.entries[ world.journal.entries.length - 1 ];
    equal( lastEntry.action, Action.eMove );
    ok( lastEntry.entity instanceof Entity );
    equal( lastEntry.movement.dx, 1 );
    equal( lastEntry.movement.dy, 0 );
} );
test( "entity drop is added to journal", function()
{
    var world = new World( 3, 4 );
    world.Build();
    ok( world.journal.entries.length === 0 );
    var entity = new Entity( { x: 1, y: 2 }, world );
    ok( entity.Update() );
    ok( world.journal.entries.length === 1 );
    var lastEntry = world.journal.entries[ world.journal.entries.length - 1 ];
    equal( lastEntry.action, Action.eDrop );
    ok( lastEntry.entity instanceof Entity );
    equal( lastEntry.movement.dx, 0 );
    equal( lastEntry.movement.dy, -1 );
} );

test( "rewind returns false when the journal is empty", function()
{
    var world = new World( 4, 3 );
    world.Build();
    ok( !world.Rewind() );
} );

test( "rewind moves player back", function()
{
    var world = new World( 4, 3 );
    world.Build();
    ok( world.journal.entries.length === 0 );
    var entity = new Entity( { x: 1, y: 1 }, world );
    ok( entity.Move( 1, 0 ) );
    deepEqual( entity.location, { x: 2, y: 1 } );
    ok( !world.Rewind() );
    deepEqual( entity.location, { x: 1, y: 1 } );
    ok( !world.Rewind() );
} );
test( "rewind lifts player back up", function()
{
    var world = new World( 4, 3 );
    world.Build();
    ok( world.journal.entries.length === 0 );
    var entity = new Entity( { x: 1, y: 2 }, world );
    ok( entity.Update() );
    deepEqual( entity.location, { x: 1, y: 1 } );
    ok( world.Rewind() );
    deepEqual( entity.location, { x: 1, y: 2 } );
    ok( !world.Rewind() );
} );
test( "fastforward replays previous moves", function()
{
    var world = new World( 4, 3 );
    world.Build();
    ok( world.journal.entries.length === 0 );
    var entity = new Entity( { x: 1, y: 1 }, world );
    ok( entity.Move( 1, 0 ) );
    deepEqual( entity.location, { x: 2, y: 1 } );
    ok( !world.Rewind() );
    deepEqual( entity.location, { x: 1, y: 1 } );
    ok( !world.FastForward() );
    deepEqual( entity.location, { x: 2, y: 1 } );
} );
test( "journal peek returns current entry", function()
{
    var world = new World( 4, 4 );
    world.Build();
    ok( world.journal.entries.length === 0 );
    var entity = new Entity( { x: 1, y: 3 }, world );
    ok( entity.Update() );
    var lastEntry = world.journal.Peek();
    equal( lastEntry.action, Action.eDrop );
    ok( lastEntry.entity instanceof Entity );
    equal( lastEntry.movement.dx, 0 );
    equal( lastEntry.movement.dy, -1 );
} );
test( "fastforward drops player down", function()
{
    var world = new World( 4, 4 );
    world.Build();
    ok( world.journal.entries.length === 0 );
    var entity = new Entity( { x: 1, y: 3 }, world );
    ok( entity.Update() );
    ok( entity.Update() );
    ok( !entity.Update() );
    deepEqual( entity.location, { x: 1, y: 1 } );
    ok( world.Rewind() );
    ok( world.Rewind() );
    ok( !world.Rewind() );
    deepEqual( entity.location, { x: 1, y: 3 } );
    ok( world.FastForward() );
} );
test( "adding to journal truncates later moves", function()
{
    var world = new World( 6, 3 );
    world.Build();
    ok( world.journal.entries.length === 0 );
    var entity = new Entity( { x: 1, y: 1 }, world );
    ok( entity.Move( 1, 0 ) );
    ok( entity.Move( 1, 0 ) );
    ok( entity.Move( 1, 0 ) );
    deepEqual( entity.location, { x: 4, y: 1 } );
    ok( !world.Rewind() );
    ok( !world.Rewind() );
    ok( !world.Rewind() );
    deepEqual( entity.location, { x: 1, y: 1 } );
    entity.Move( 1, 0 );
    equal( world.journal.entries.length, 1 );
    deepEqual( entity.location, { x: 2, y: 1 } );
} );
test( "removing earth is added to journal", function()
{
    var world = new World( 4, 3 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.PlaceContent( new Earth(), { x: 2, y: 1 } );
    ok( catboy.Move( 1, 0 ) );
    deepEqual( world.journal.entries.length, 2 );
    deepEqual( world.journal.Peek().action, Action.eDig );
    ok( world.journal.Peek().content instanceof Earth );
    deepEqual( world.journal.Peek().location, { x: 2, y: 1 } );
} );
test( "rewind restores earth and moves player", function()
{
    var world = new World( 4, 3 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.PlaceContent( new Earth(), { x: 2, y: 1 } );
    ok( catboy.Move( 1, 0 ) );
    world.Rewind();
    world.Rewind();
    ok( world.GetContent( { x: 2, y: 1 } ) instanceof Earth );
    deepEqual( catboy.location, { x: 1, y: 1 } );
} );
test( "rewind removes earth and moves player", function()
{
    var world = new World( 4, 3 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.PlaceContent( new Earth(), { x: 2, y: 1 } );
    ok( catboy.Move( 1, 0 ) );
    ok( world.Rewind() );
    ok( !world.Rewind() );
    ok( world.GetContent( { x: 2, y: 1 } ) instanceof Earth );
    deepEqual( catboy.location, { x: 1, y: 1 } );
    ok( world.FastForward() );
    deepEqual( catboy.location, { x: 2, y: 1 } );
    ok( !world.FastForward() );
    ok( world.GetContent( { x: 2, y: 1 } ) instanceof EmptySpace );
} );

test( "despatching enemy is added to journal", function()
{
    var world = new World( 4, 3 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.AddEntity( new Enemy( { x: 2, y: 1 }, world ) );
    ok( catboy.Move( 1, 0 ) );
    equal( world.journal.entries.length, 2 );
    deepEqual( world.journal.entries[ 0 ].action, Action.eMove );
    ok( world.journal.entries[ 0 ].entity instanceof Catboy );
    deepEqual( world.journal.entries[ 0 ].movement, { dx: 1, dy: 0 } );
    deepEqual( world.journal.entries[ 1 ].action, Action.eDespatch );
    ok( world.journal.entries[ 1 ].entity instanceof Enemy );
    deepEqual( world.journal.entries[ 1 ].location, { x: 2, y: 1 } );
} );
test( "rewind restores enemies", function()
{
    var world = new World( 4, 3 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.AddEntity( catboy );
    world.AddEntity( new Enemy( { x: 2, y: 1 }, world ) );
    ok( catboy.Move( 1, 0 ) );
    ok( world.Rewind() );
    ok( !world.Rewind() );
    deepEqual( catboy.location, { x: 1, y: 1 } );
    ok( world.GetEntity( { x: 2, y: 1 } ) instanceof Enemy );
} );
test( "fast forward redespaches enemies", function()
{
    var world = new World( 4, 3 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.AddEntity( catboy );
    world.AddEntity( new Enemy( { x: 2, y: 1 }, world ) );
    ok( catboy.Move( 1, 0 ) );
    ok( world.Rewind() );
    ok( !world.Rewind() );
    equal( world.population, 1 );
    deepEqual( catboy.location, { x: 1, y: 1 } );
    ok( world.GetEntity( { x: 2, y: 1 } ) instanceof Enemy );
    ok( world.FastForward() );
    deepEqual( catboy.location, { x: 2, y: 1 } );
    ok( !world.FastForward() );
    ok( world.GetEntity( { x: 2, y: 1 } ) instanceof Catboy );
    equal( world.population, 0 );
} );

test( "entity hitting ground generates gui dropped event", function()
{
    var world = new World( 3, 4 );
    world.Build();
    ok( world.journal.entries.length === 0 );
    var entity = new Entity( { x: 1, y: 2 }, world );
    ok( entity.Update() );
    ok( world.guiEvents.length == 1 );
    equal( world.guiEvents[ world.guiEvents.length - 1 ].event, GuiEvent.eDropped );
} );
// test keyhandling
