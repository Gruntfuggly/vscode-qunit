QUnit.test( "locations can be compared", function()
{
    var location1 = { x: 1, y: 2 };
    var location2 = { x: 2, y: 3 };
    var location3 = { x: 1, y: 2 };
    ok( SameLocation( location1, location1 ) );
    ok( !SameLocation( location1, location2 ) );
    ok( SameLocation( location1, location3 ) );
} );
QUnit.module( "world" )
{
    QUnit.test( "world can be constructed", function()
    {
        var world = new World( 10, 20 );
        equal( world.GetWidth(), 10 );
        equal( world.GetHeight(), 20 );
    } );
    QUnit.test( "world can be constructed with alternate size", function()
    {
        var world = new World( 11, 8 );
        equal( world.GetWidth(), 11 );
        equal( world.GetHeight(), 8 );
    } );
    QUnit.test( "world is full of rock", function()
    {
        var world = new World( 2, 2 );
        world.Build();
        ok( world.GetContent( { x: 0, y: 0 } ) instanceof Rock );
        ok( world.GetContent( { x: 1, y: 0 } ) instanceof Rock );
        ok( world.GetContent( { x: 0, y: 1 } ) instanceof Rock );
        ok( world.GetContent( { x: 1, y: 1 } ) instanceof Rock );
    } );
    QUnit.test( "world is empty space surrounded by rock", function()
    {
        var world = new World( 4, 4 );
        world.Build();
        ok( world.GetContent( { x: 1, y: 1 } ) instanceof EmptySpace );
        ok( world.GetContent( { x: 2, y: 1 } ) instanceof EmptySpace );
        ok( world.GetContent( { x: 1, y: 2 } ) instanceof EmptySpace );
        ok( world.GetContent( { x: 2, y: 2 } ) instanceof EmptySpace );
    } );
}

QUnit.test( "catboy can created and placed in world", function()
{
    var world = new World( 3, 4 );
    world.Build();
    ok( world.GetContent( { x: 1, y: 1 } ) instanceof EmptySpace );
    world.AddEntity( new Catboy( { x: 1, y: 1 }, world ) );
    // ok( world.GetEntity( { x: 1, y: 1 } ) instanceof Catboy );
    ok( world.GetEntity( { x: 1, y: 1 } ) instanceof EmptySpace );
    ok( false );
} );

QUnit.test( "item can't be destroyed", function()
{
    var rock = new Content();
    ok( rock.IsPermanent() );
} );
QUnit.test( "earth can be destroyed", function()
{
    var earth = new Earth();
    ok( !earth.IsPermanent() );
} );
QUnit.test( "earth-ledge can be destroyed", function()
{
    var earthLedge = new EarthLedge();
    ok( !earthLedge.IsPermanent() );
} );
QUnit.test( "demon can be destroyed", function()
{
    var demon = new Demon( { x: 0, y: 0 }, new World() );
    ok( !demon.IsPermanent() );
} );
QUnit.test( "troll can be destroyed", function()
{
    var troll = new Troll( { x: 0, y: 0 }, new World() );
    ok( !troll.IsPermanent() );
} );
QUnit.test( "ghost can be destroyed", function()
{
    var ghost = new Ghost( { x: 0, y: 0 }, new World() );
    ok( !ghost.IsPermanent() );
} );
QUnit.test( "phantom can be destroyed", function()
{
    var phantom = new Phantom( { x: 0, y: 0 }, new World() );
    ok( !phantom.IsPermanent() );
} );

QUnit.test( "item can't be occupied", function()
{
    var item = new Content();
    ok( !item.CanBeOccupied() );
} );
QUnit.test( "empty space can be occupied", function()
{
    var emptySpace = new EmptySpace();
    ok( emptySpace.CanBeOccupied( new Player() ) );
} );
QUnit.test( "ladder can be occupied", function()
{
    var ladder = new Ladder();
    ok( ladder.CanBeOccupied( new Player() ) );
} );

QUnit.test( "catboy should drop", function()
{
    var catboy = new Catboy();
    ok( catboy.ShouldDrop() );
} );
QUnit.test( "catgirl should drop", function()
{
    var catgirl = new Catgirl();
    ok( catgirl.ShouldDrop() );
} );
QUnit.test( "boulder should drop", function()
{
    var boulder = new Boulder();
    ok( boulder.ShouldDrop() );
} );
QUnit.test( "enemy should drop", function()
{
    var enemy = new Enemy();
    ok( enemy.ShouldDrop() );
} );
QUnit.test( "ghost should not drop", function()
{
    var ghost = new Ghost( { x: 0, y: 0 }, new World() );
    ok( !ghost.ShouldDrop() );
} );
QUnit.test( "entity drops", function()
{
    var world = new World( 3, 4 );
    world.Build();
    var entity = new Entity( { x: 1, y: 2 }, world );
    world.AddEntity( entity );
    world.Update();
    deepEqual( entity.location, { x: 1, y: 1 } );
    ok( world.GetEntity( { x: 1, y: 1 } ) instanceof Entity );
} );
QUnit.test( "ghost doesn't drop", function()
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
QUnit.test( "entity doesn't drop off ladder", function()
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

QUnit.test( "catboy can move horizontally", function()
{
    var world = new World( 4, 4 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    catboy.Move( 1, 0 );
    deepEqual( catboy.location, { x: 2, y: 1 } );
    catboy.Move( -1, 0 );
    deepEqual( catboy.location, { x: 1, y: 1 } );
} );
QUnit.test( "catboy can be blocked", function()
{
    var world = new World( 4, 4 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    catboy.Move( -1, 0 );
    deepEqual( catboy.location, { x: 1, y: 1 } );
} );
QUnit.test( "catboy destroys items", function()
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
QUnit.test( "catboy goes up ladder into emptyspace", function()
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
QUnit.test( "catboy goes up ladder", function()
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
QUnit.test( "catboy can be blocked at top of ladder", function()
{
    var world = new World( 3, 4 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.PlaceContent( new Ladder(), { x: 1, y: 1 } );
    world.AddEntity( new Enemy( { x: 1, y: 2 }, world ) );
    ok( !catboy.Move( 0, 1 ) );
    deepEqual( catboy.location, { x: 1, y: 1 } );
} );

QUnit.test( "catboy goes go down ladder", function()
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
QUnit.test( "catboy can do down ladder from empty space", function()
{
    var world = new World( 3, 4 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 2 }, world );
    var ladder = new Ladder();
    world.PlaceContent( ladder, { x: 1, y: 1 } );
    catboy.Move( 0, -1 );
    deepEqual( catboy.location, { x: 1, y: 1 } );
} );

QUnit.test( "catboy can't drop off ladder into earth", function()
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
QUnit.test( "catboy drops off ladder into empty space", function()
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
QUnit.test( "entity can be added to world", function()
{
    var world = new World( 3, 3 );
    world.Build();
    world.AddEntity( new Entity( { x: 1, y: 1 }, world ) );
    ok( world.GetEntity( { x: 1, y: 1 } ) instanceof Entity );
} );
QUnit.test( "entities can be updated", function()
{
    var world = new World( 3, 4 );
    world.Build();
    world.AddEntity( new Boulder( { x: 1, y: 2 }, world ) );
    ok( world.GetEntity( { x: 1, y: 2 } ) instanceof Boulder );
    world.PlaceContent( new EmptySpace(), { x: 1, y: 1 } );
    world.Update();
    ok( world.GetEntity( { x: 1, y: 1 } ) instanceof Boulder );
} );
QUnit.test( "update world returns true until entities are static", function()
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

QUnit.test( "catboy is blocked by other entities", function()
{
    var world = new World( 5, 3 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.AddEntity( new Catgirl( { x: 2, y: 1 }, world ) );
    catboy.Move( 1, 0 );
    deepEqual( catboy.location, { x: 1, y: 1 } );
} );

QUnit.test( "entity can't push", function()
{
    var entity = new Entity( { x: 0, y: 0 }, new World() );
    ok( !entity.CanPush() );
} );
QUnit.test( "player can push", function()
{
    var player = new Player( { x: 0, y: 0 }, new World() );
    ok( player.CanPush() );
} );
QUnit.test( "only active player can push", function()
{
    var player = new Player( { x: 0, y: 0 }, new World() );
    ok( player.CanPush() );
    player.SetActive( false );
    ok( !player.CanPush() );
} );

QUnit.test( "boulders can be pushed", function()
{
    var boulder = new Boulder();
    ok( boulder.CanBePushed() );
} );
QUnit.test( "catboy pushes boulder", function()
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
QUnit.test( "catboy can't push boulder into rock", function()
{
    var world = new World( 4, 3 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.AddEntity( new Boulder( { x: 2, y: 1 }, world ) );
    catboy.Move( 1, 0 );
    deepEqual( catboy.location, { x: 1, y: 1 } );
    ok( world.GetEntity( { x: 2, y: 1 } ) instanceof Boulder );
} );
QUnit.test( "catboy can't push boulder into earth", function()
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
QUnit.test( "boulder can't push boulder", function()
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

QUnit.test( "dispatch reduces population", function()
{
    var world = new World( 1, 1 );
    var demon = new Demon( { x: 2, y: 1 }, world );
    world.AddEntity( demon );
    equal( world.population, 1 );
    demon.Dispatch();
    equal( world.population, 0 );
} );
QUnit.test( "enemy can be despatched", function()
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
QUnit.test( "world can be populated from string", function()
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

QUnit.test( "at beginning is true for empty journal", function()
{
    var world = new World( 4, 3 );
    world.Build();
    ok( world.journal.AtBeginning() );
} );
QUnit.test( "at end is true if journal has not been rewound", function()
{
    var world = new World( 4, 3 );
    world.Build();
    ok( world.journal.entries.length === 0 );
    var entity = new Entity( { x: 1, y: 1 }, world );
    ok( entity.Move( 1, 0 ) );
    ok( world.journal.AtEnd() );
} );
QUnit.test( "journal get previous returns previous entry", function()
{
    var journal = new Journal();
    journal.Add( { action: Action.eMove, entity: new Entity(), movement: { dx: 1, dy: -1 } } );
    var entry = journal.GetPrevious();
    equal( entry.action, Action.eMove );
    equal( entry.movement.dx, 1 );
    equal( entry.movement.dy, -1 );
} );

QUnit.test( "journal get next returns next entry", function()
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

QUnit.test( "entity movement is added to journal", function()
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
QUnit.test( "entity drop is added to journal", function()
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

QUnit.test( "rewind returns false when the journal is empty", function()
{
    var world = new World( 4, 3 );
    world.Build();
    ok( !world.Rewind() );
} );

QUnit.test( "rewind moves player back", function()
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
QUnit.test( "rewind lifts player back up", function()
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
QUnit.test( "fastforward replays previous moves", function()
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
QUnit.test( "journal peek returns current entry", function()
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
QUnit.test( "fastforward drops player down", function()
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
QUnit.test( "adding to journal truncates later moves", function()
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
QUnit.test( "removing earth is added to journal", function()
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
QUnit.test( "rewind restores earth and moves player", function()
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
QUnit.test( "rewind removes earth and moves player", function()
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

QUnit.test( "despatching enemy is added to journal", function()
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
QUnit.test( "rewind restores enemies", function()
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
QUnit.test( "fast forward redespaches enemies", function()
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

QUnit.test( "entity hitting ground generates gui dropped event", function()
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
