QUnit.test( "locations can be compared", function( assert )
{
    var location1 = { x: 1, y: 2 };
    var location2 = { x: 2, y: 3 };
    var location3 = { x: 1, y: 2 };
    assert.ok( SameLocation( location1, location1 ) );
    assert.ok( !SameLocation( location1, location2 ) );
    assert.ok( SameLocation( location1, location3 ) );
} );
QUnit.module( "world", function()
{
    QUnit.test( "world can be constructed", function( assert )
    {
        var world = new World( 10, 20 );
        assert.equal( world.GetWidth(), 10 );
        assert.equal( world.GetHeight(), 20 );
    } );
    QUnit.test( "world can be constructed with alternate size", function( assert )
    {
        var world = new World( 11, 8 );
        assert.equal( world.GetWidth(), 11 );
        assert.equal( world.GetHeight(), 8 );
    } );
    QUnit.module( "rock", function()
    {
        QUnit.test( "world is full of rock", function( assert )
        {
            var world = new World( 2, 2 );
            world.Build();
            assert.ok( world.GetContent( { x: 0, y: 0 } ) instanceof Rock );
            assert.ok( world.GetContent( { x: 1, y: 0 } ) instanceof Rock );
            assert.ok( world.GetContent( { x: 0, y: 1 } ) instanceof Rock );
            assert.ok( world.GetContent( { x: 1, y: 1 } ) instanceof Rock );
        } );
        QUnit.test( "world is empty space surrounded by rock", function( assert )
        {
            var world = new World( 4, 4 );
            world.Build();
            assert.ok( world.GetContent( { x: 1, y: 1 } ) instanceof EmptySpace );
            assert.ok( world.GetContent( { x: 2, y: 1 } ) instanceof EmptySpace );
            assert.ok( world.GetContent( { x: 1, y: 2 } ) instanceof EmptySpace );
            assert.ok( world.GetContent( { x: 2, y: 2 } ) instanceof EmptySpace );
        } );
    } );
} );
QUnit.test( "catboy can created and placed in world", function( assert )
{
    var world = new World( 3, 4 );
    world.Build();
    assert.ok( world.GetContent( { x: 1, y: 1 } ) instanceof EmptySpace );
    world.AddEntity( new Catboy( { x: 1, y: 1 }, world ) );
    assert.ok( world.GetEntity( { x: 1, y: 1 } ) instanceof Catboy );
} );

QUnit.test( "item can't be destroyed", function( assert )
{
    var rock = new Content();
    assert.ok( rock.IsPermanent() );
} );
QUnit.test( "earth can be destroyed", function( assert )
{
    var earth = new Earth();
    assert.ok( !earth.IsPermanent() );
} );
QUnit.test( "earth-ledge can be destroyed", function( assert )
{
    var earthLedge = new EarthLedge();
    assert.ok( !earthLedge.IsPermanent() );
} );
QUnit.test( "earth-ledge can be destroyed", function( assert )
{
    var earthLedge = new EarthLedge();
    assert.ok( !earthLedge.IsPermanent() );
} );
QUnit.test( "demon can be destroyed", function( assert )
{
    var demon = new Demon( { x: 0, y: 0 }, new World() );
    assert.ok( !demon.IsPermanent() );
} );
QUnit.test( "troll can be destroyed", function( assert )
{
    var troll = new Troll( { x: 0, y: 0 }, new World() );
    assert.ok( !troll.IsPermanent() );
} );
QUnit.test( "ghost can be destroyed", function( assert )
{
    var ghost = new Ghost( { x: 0, y: 0 }, new World() );
    assert.ok( !ghost.IsPermanent() );
} );
QUnit.test( "phantom can be destroyed", function( assert )
{
    var phantom = new Phantom( { x: 0, y: 0 }, new World() );
    assert.ok( !phantom.IsPermanent() );
} );

QUnit.test( "item can't be occupied", function( assert )
{
    var item = new Content();
    assert.ok( !item.CanBeOccupied() );
} );
QUnit.test( "empty space can be occupied", function( assert )
{
    var emptySpace = new EmptySpace();
    assert.ok( emptySpace.CanBeOccupied( new Player() ) );
} );
QUnit.test( "ladder can be occupied", function( assert )
{
    var ladder = new Ladder();
    assert.ok( ladder.CanBeOccupied( new Player() ) );
} );

QUnit.test( "catboy should drop", function( assert )
{
    var catboy = new Catboy();
    assert.ok( catboy.ShouldDrop() );
} );
QUnit.test( "catgirl should drop", function( assert )
{
    var catgirl = new Catgirl();
    assert.ok( catgirl.ShouldDrop() );
} );
QUnit.test( "boulder should drop", function( assert )
{
    var boulder = new Boulder();
    assert.ok( boulder.ShouldDrop() );
} );
QUnit.test( "enemy should drop", function( assert )
{
    var enemy = new Enemy();
    assert.ok( enemy.ShouldDrop() );
} );
QUnit.test( "ghost should not drop", function( assert )
{
    var ghost = new Ghost( { x: 0, y: 0 }, new World() );
    assert.ok( !ghost.ShouldDrop() );
} );
QUnit.test( "entity drops", function( assert )
{
    var world = new World( 3, 4 );
    world.Build();
    var entity = new Entity( { x: 1, y: 2 }, world );
    world.AddEntity( entity );
    world.Update();
    assert.deepEqual( entity.location, { x: 1, y: 1 } );
    assert.ok( world.GetEntity( { x: 1, y: 1 } ) instanceof Entity );
} );
QUnit.test( "ghost doesn't drop", function( assert )
{
    var world = new World( 3, 4 );
    world.Build();
    world.PlaceContent( new EmptySpace(), { x: 1, y: 1 } );
    var ghost = new Ghost( { x: 1, y: 2 }, world );
    world.AddEntity( ghost );
    world.Update();
    assert.deepEqual( ghost.location, { x: 1, y: 2 } );
    assert.ok( world.GetEntity( { x: 1, y: 2 } ) instanceof Entity );
} );
QUnit.test( "entity doesn't drop off ladder", function( assert )
{
    var world = new World( 3, 4 );
    world.Build();
    world.PlaceContent( new EmptySpace(), { x: 1, y: 1 } );
    world.PlaceContent( new Ladder(), { x: 1, y: 2 } );
    var entity = new Entity( { x: 1, y: 2 }, world );
    world.AddEntity( entity );
    world.Update();
    assert.deepEqual( entity.location, { x: 1, y: 2 } );
    assert.ok( world.GetEntity( { x: 1, y: 2 } ) instanceof Entity );
} );

QUnit.test( "catboy can move horizontally", function( assert )
{
    var world = new World( 4, 4 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    catboy.Move( 1, 0 );
    assert.deepEqual( catboy.location, { x: 2, y: 1 } );
    catboy.Move( -1, 0 );
    assert.deepEqual( catboy.location, { x: 1, y: 1 } );
} );
QUnit.test( "catboy can be blocked", function( assert )
{
    var world = new World( 4, 4 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    catboy.Move( -1, 0 );
    assert.deepEqual( catboy.location, { x: 1, y: 1 } );
} );
QUnit.test( "catboy destroys items", function( assert )
{
    var world = new World( 4, 4 );
    world.Build();
    world.PlaceContent( new Earth(), { x: 2, y: 1 } );
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    assert.ok( world.GetContent( { x: 2, y: 1 } ) instanceof Earth );
    catboy.Move( 1, 0 );
    assert.deepEqual( catboy.location, { x: 2, y: 1 } );
    assert.ok( world.GetContent( { x: 2, y: 1 } ) instanceof EmptySpace );
} );
QUnit.test( "catboy goes up ladder into emptyspace", function( assert )
{
    var world = new World( 3, 4 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    catboy.Move( 0, 1 );
    assert.deepEqual( catboy.location, { x: 1, y: 1 } );
    var ladder = new Ladder();
    world.PlaceContent( ladder, { x: 1, y: 1 } );
    catboy.Move( 0, 1 );
    assert.deepEqual( catboy.location, { x: 1, y: 2 } );
} );
QUnit.test( "catboy goes up ladder", function( assert )
{
    var world = new World( 3, 4 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    assert.ok( !catboy.Move( 0, 1 ) );
    assert.deepEqual( catboy.location, { x: 1, y: 1 } );
    var ladder = new Ladder();
    world.PlaceContent( ladder, { x: 1, y: 2 } );
    assert.ok( !catboy.Move( 0, 1 ) );
    assert.deepEqual( catboy.location, { x: 1, y: 1 } );
    world.PlaceContent( ladder, { x: 1, y: 1 } );
    assert.ok( catboy.Move( 0, 1 ) );
    assert.deepEqual( catboy.location, { x: 1, y: 2 } );
} );
QUnit.test( "catboy can be blocked at top of ladder", function( assert )
{
    var world = new World( 3, 4 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.PlaceContent( new Ladder(), { x: 1, y: 1 } );
    world.AddEntity( new Enemy( { x: 1, y: 2 }, world ) );
    assert.ok( !catboy.Move( 0, 1 ) );
    assert.deepEqual( catboy.location, { x: 1, y: 1 } );
} );

QUnit.test( "catboy goes go down ladder", function( assert )
{
    var world = new World( 3, 4 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 2 }, world );
    var ladder = new Ladder();
    world.PlaceContent( ladder, { x: 1, y: 2 } );
    world.PlaceContent( ladder, { x: 1, y: 1 } );
    catboy.Move( 0, -1 );
    assert.deepEqual( catboy.location, { x: 1, y: 1 } );
} );
QUnit.test( "catboy can do down ladder from empty space", function( assert )
{
    var world = new World( 3, 4 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 2 }, world );
    var ladder = new Ladder();
    world.PlaceContent( ladder, { x: 1, y: 1 } );
    catboy.Move( 0, -1 );
    assert.deepEqual( catboy.location, { x: 1, y: 1 } );
} );

QUnit.test( "catboy can't drop off ladder into earth", function( assert )
{
    var world = new World( 3, 4 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 2 }, world );
    var ladder = new Ladder();
    world.PlaceContent( ladder, { x: 1, y: 2 } );
    var earth = new Earth();
    world.PlaceContent( earth, { x: 1, y: 1 } );
    catboy.Move( 0, -1 );
    assert.deepEqual( catboy.location, { x: 1, y: 2 } );
} );
QUnit.test( "catboy drops off ladder into empty space", function( assert )
{
    var world = new World( 3, 4 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 2 }, world );
    var ladder = new Ladder();
    world.PlaceContent( ladder, { x: 1, y: 2 } );
    var emptySpace = new EmptySpace();
    world.PlaceContent( emptySpace, { x: 1, y: 1 } );
    catboy.Move( 0, -1 );
    assert.deepEqual( catboy.location, { x: 1, y: 1 } );
} );
QUnit.test( "entity can be added to world", function( assert )
{
    var world = new World( 3, 3 );
    world.Build();
    world.AddEntity( new Entity( { x: 1, y: 1 }, world ) );
    assert.ok( world.GetEntity( { x: 1, y: 1 } ) instanceof Entity );
} );
QUnit.test( "entities can be updated", function( assert )
{
    var world = new World( 3, 4 );
    world.Build();
    world.AddEntity( new Boulder( { x: 1, y: 2 }, world ) );
    assert.ok( world.GetEntity( { x: 1, y: 2 } ) instanceof Boulder );
    world.PlaceContent( new EmptySpace(), { x: 1, y: 1 } );
    world.Update();
    assert.ok( world.GetEntity( { x: 1, y: 1 } ) instanceof Boulder );
} );
QUnit.test( "update world returns true until entities are static", function( assert )
{
    var world = new World( 3, 5 );
    world.Build();
    world.AddEntity( new Boulder( { x: 1, y: 3 }, world ) );
    assert.ok( world.GetEntity( { x: 1, y: 3 } ) instanceof Boulder );
    world.PlaceContent( new EmptySpace(), { x: 1, y: 2 } );
    world.PlaceContent( new EmptySpace(), { x: 1, y: 1 } );
    assert.ok( world.Update() );
    assert.ok( world.GetEntity( { x: 1, y: 2 } ) instanceof Boulder );
    assert.ok( world.Update() );
    assert.ok( world.GetEntity( { x: 1, y: 1 } ) instanceof Boulder );
    assert.ok( !world.Update() );
} );

QUnit.test( "catboy is blocked by other entities", function( assert )
{
    var world = new World( 5, 3 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.AddEntity( new Catgirl( { x: 2, y: 1 }, world ) );
    catboy.Move( 1, 0 );
    assert.deepEqual( catboy.location, { x: 1, y: 1 } );
} );

QUnit.test( "entity can't push", function( assert )
{
    var entity = new Entity( { x: 0, y: 0 }, new World() );
    assert.ok( !entity.CanPush() );
} );
QUnit.test( "player can push", function( assert )
{
    var player = new Player( { x: 0, y: 0 }, new World() );
    assert.ok( player.CanPush() );
} );
QUnit.test( "only active player can push", function( assert )
{
    var player = new Player( { x: 0, y: 0 }, new World() );
    assert.ok( player.CanPush() );
    player.SetActive( false );
    assert.ok( !player.CanPush() );
} );

QUnit.test( "boulders can be pushed", function( assert )
{
    var boulder = new Boulder();
    assert.ok( boulder.CanBePushed() );
} );
QUnit.test( "catboy pushes boulder", function( assert )
{
    var world = new World( 5, 3 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.AddEntity( new Boulder( { x: 2, y: 1 }, world ) );
    world.PlaceContent( new EmptySpace(), { x: 3, y: 1 } );
    catboy.Move( 1, 0 );
    assert.deepEqual( catboy.location, { x: 1, y: 1 } );
    assert.ok( world.GetEntity( { x: 3, y: 1 } ) instanceof Boulder );
} );
QUnit.test( "catboy can't push boulder into rock", function( assert )
{
    var world = new World( 4, 3 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.AddEntity( new Boulder( { x: 2, y: 1 }, world ) );
    catboy.Move( 1, 0 );
    assert.deepEqual( catboy.location, { x: 1, y: 1 } );
    assert.ok( world.GetEntity( { x: 2, y: 1 } ) instanceof Boulder );
} );
QUnit.test( "catboy can't push boulder into earth", function( assert )
{
    var world = new World( 5, 3 );
    world.Build();
    world.PlaceContent( new Earth(), { x: 3, y: 1 } );
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.AddEntity( new Boulder( { x: 2, y: 1 }, world ) );
    catboy.Move( 1, 0 );
    assert.deepEqual( catboy.location, { x: 1, y: 1 } );
    assert.ok( world.GetEntity( { x: 2, y: 1 } ) instanceof Boulder );
} );
QUnit.test( "boulder can't push boulder", function( assert )
{
    var world = new World( 6, 3 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.AddEntity( new Boulder( { x: 2, y: 1 }, world ) );
    world.AddEntity( new Boulder( { x: 3, y: 1 }, world ) );
    catboy.Move( 1, 0 );
    assert.deepEqual( catboy.location, { x: 1, y: 1 } );
    assert.ok( world.GetEntity( { x: 2, y: 1 } ) instanceof Boulder );
    assert.ok( world.GetEntity( { x: 3, y: 1 } ) instanceof Boulder );
    assert.ok( world.GetEntity( { x: 4, y: 1 } ) === undefined );
} );

QUnit.test( "dispatch reduces population", function( assert )
{
    var world = new World( 1, 1 );
    var demon = new Demon( { x: 2, y: 1 }, world );
    world.AddEntity( demon );
    assert.equal( world.population, 1 );
    demon.Dispatch();
    assert.equal( world.population, 0 );
} );
QUnit.test( "enemy can be despatched", function( assert )
{
    var world = new World( 4, 3 );
    world.Build();
    world.AddEntity( new Demon( { x: 2, y: 1 }, world ) );
    assert.equal( world.population, 1 );
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.AddEntity( catboy );
    catboy.Move( 1, 0 );
    assert.deepEqual( catboy.location, { x: 2, y: 1 } );
    assert.ok( world.GetEntity( { x: 2, y: 1 } ) instanceof Catboy );
    assert.equal( world.population, 0 );
} );
QUnit.test( "world can be populated from string", function( assert )
{
    var world1 = new World( 3, 3, "" );
    world1.Build();
    assert.ok( world1.GetContent( { x: 1, y: 1 } ) instanceof EmptySpace );
    var world2 = new World( 3, 3, " " );
    world2.Build();
    assert.ok( world2.GetContent( { x: 1, y: 1 } ) instanceof EmptySpace );
    var world3 = new World( 3, 3, "%" );
    world3.Build();
    assert.ok( world3.GetContent( { x: 1, y: 1 } ) instanceof Earth );
    var world4 = new World( 3, 3, "=" );
    world4.Build();
    assert.ok( world4.GetContent( { x: 1, y: 1 } ) instanceof Ladder );
    var world5 = new World( 3, 3, "-" );
    world5.Build();
    assert.ok( world5.GetContent( { x: 1, y: 1 } ) instanceof Ledge );
    var world6 = new World( 3, 3, "~" );
    world6.Build();
    assert.ok( world6.GetContent( { x: 1, y: 1 } ) instanceof EarthLedge );
    var world7 = new World( 3, 3, "o" );
    world7.Build();
    assert.ok( world7.GetEntity( { x: 1, y: 1 } ) instanceof Boulder );
    var world8 = new World( 3, 3, "D" );
    world8.Build();
    assert.ok( world8.GetEntity( { x: 1, y: 1 } ) instanceof Demon );
    var world9 = new World( 3, 3, "T" );
    world9.Build();
    assert.ok( world9.GetEntity( { x: 1, y: 1 } ) instanceof Troll );
    var world10 = new World( 3, 3, "G" );
    world10.Build();
    assert.ok( world10.GetEntity( { x: 1, y: 1 } ) instanceof Ghost );
    var world11 = new World( 3, 3, "P" );
    world11.Build();
    assert.ok( world11.GetEntity( { x: 1, y: 1 } ) instanceof Phantom );
    var world14 = new World( 3, 3, "#" );
    world14.Build();
    assert.ok( world14.GetContent( { x: 1, y: 1 } ) instanceof Rock );
    var level = " %  =  - "
        + " 1 D o ~T"
        + "##G### #P";
    var world15 = new World( 11, 5, level );
    world15.Build();
    assert.ok( world15.GetContent( { x: 1, y: 1 } ) instanceof Rock );
    assert.ok( world15.GetEntity( { x: 3, y: 1 } ) instanceof Ghost );
    assert.ok( world15.GetContent( { x: 7, y: 1 } ) instanceof EmptySpace );
    assert.ok( world15.GetEntity( { x: 9, y: 1 } ) instanceof Phantom );
    assert.ok( world15.GetEntity( { x: 4, y: 2 } ) instanceof Demon );
    assert.ok( world15.GetEntity( { x: 6, y: 2 } ) instanceof Boulder );
    assert.ok( world15.GetContent( { x: 8, y: 2 } ) instanceof EarthLedge );
    assert.ok( world15.GetEntity( { x: 9, y: 2 } ) instanceof Troll );
    assert.ok( world15.GetContent( { x: 2, y: 3 } ) instanceof Earth );
    assert.ok( world15.GetContent( { x: 5, y: 3 } ) instanceof Ladder );
    assert.ok( world15.GetContent( { x: 8, y: 3 } ) instanceof Ledge );
} );

QUnit.test( "at beginning is true for empty journal", function( assert )
{
    var world = new World( 4, 3 );
    world.Build();
    assert.ok( world.journal.AtBeginning() );
} );
QUnit.test( "at end is true if journal has not been rewound", function( assert )
{
    var world = new World( 4, 3 );
    world.Build();
    assert.ok( world.journal.entries.length === 0 );
    var entity = new Entity( { x: 1, y: 1 }, world );
    assert.ok( entity.Move( 1, 0 ) );
    assert.ok( world.journal.AtEnd() );
} );
QUnit.test( "journal get previous returns previous entry", function( assert )
{
    var journal = new Journal();
    journal.Add( { action: Action.eMove, entity: new Entity(), movement: { dx: 1, dy: -1 } } );
    var entry = journal.GetPrevious();
    assert.equal( entry.action, Action.eMove );
    assert.equal( entry.movement.dx, 1 );
    assert.equal( entry.movement.dy, -1 );
} );

QUnit.test( "journal get next returns next entry", function( assert )
{
    var journal = new Journal();
    journal.Add( { action: Action.eMove, entity: new Entity(), movement: { dx: 1, dy: -1 } } );
    journal.Add( { action: Action.eMove, entity: new Entity(), movement: { dx: 0, dy: 0 } } );
    var entry = journal.GetPrevious();
    entry = journal.GetPrevious();
    assert.ok( journal.AtBeginning() );
    assert.equal( entry.action, Action.eMove );
    assert.equal( entry.movement.dx, 1 );
    assert.equal( entry.movement.dy, -1 );
    entry = journal.GetNext();
    assert.equal( entry.action, Action.eMove );
    assert.equal( entry.movement.dx, 1 );
    assert.equal( entry.movement.dy, -1 );
    assert.ok( !journal.AtEnd() );
} );

QUnit.test( "entity movement is added to journal", function( assert )
{
    var world = new World( 4, 3 );
    world.Build();
    assert.ok( world.journal.entries.length === 0 );
    var entity = new Entity( { x: 1, y: 1 }, world );
    assert.ok( entity.Move( 1, 0 ) );
    assert.ok( world.journal.entries.length === 1 );
    var lastEntry = world.journal.entries[ world.journal.entries.length - 1 ];
    assert.equal( lastEntry.action, Action.eMove );
    assert.ok( lastEntry.entity instanceof Entity );
    assert.equal( lastEntry.movement.dx, 1 );
    assert.equal( lastEntry.movement.dy, 0 );
} );
QUnit.test( "entity drop is added to journal", function( assert )
{
    var world = new World( 3, 4 );
    world.Build();
    assert.ok( world.journal.entries.length === 0 );
    var entity = new Entity( { x: 1, y: 2 }, world );
    assert.ok( entity.Update() );
    assert.ok( world.journal.entries.length === 1 );
    var lastEntry = world.journal.entries[ world.journal.entries.length - 1 ];
    assert.equal( lastEntry.action, Action.eDrop );
    assert.ok( lastEntry.entity instanceof Entity );
    assert.equal( lastEntry.movement.dx, 0 );
    assert.equal( lastEntry.movement.dy, -1 );
} );

QUnit.test( "rewind returns false when the journal is empty", function( assert )
{
    var world = new World( 4, 3 );
    world.Build();
    assert.ok( !world.Rewind() );
} );

QUnit.test( "rewind moves player back", function( assert )
{
    var world = new World( 4, 3 );
    world.Build();
    assert.ok( world.journal.entries.length === 0 );
    var entity = new Entity( { x: 1, y: 1 }, world );
    assert.ok( entity.Move( 1, 0 ) );
    assert.deepEqual( entity.location, { x: 2, y: 1 } );
    assert.ok( !world.Rewind() );
    assert.deepEqual( entity.location, { x: 1, y: 1 } );
    assert.ok( !world.Rewind() );
} );
QUnit.test( "rewind lifts player back up", function( assert )
{
    var world = new World( 4, 3 );
    world.Build();
    assert.ok( world.journal.entries.length === 0 );
    var entity = new Entity( { x: 1, y: 2 }, world );
    assert.ok( entity.Update() );
    assert.deepEqual( entity.location, { x: 1, y: 1 } );
    assert.ok( world.Rewind() );
    assert.deepEqual( entity.location, { x: 1, y: 2 } );
    assert.ok( !world.Rewind() );
} );
QUnit.test( "fastforward replays previous moves", function( assert )
{
    var world = new World( 4, 3 );
    world.Build();
    assert.ok( world.journal.entries.length === 0 );
    var entity = new Entity( { x: 1, y: 1 }, world );
    assert.ok( entity.Move( 1, 0 ) );
    assert.deepEqual( entity.location, { x: 2, y: 1 } );
    assert.ok( !world.Rewind() );
    assert.deepEqual( entity.location, { x: 1, y: 1 } );
    assert.ok( !world.FastForward() );
    assert.deepEqual( entity.location, { x: 2, y: 1 } );
} );
QUnit.test( "journal peek returns current entry", function( assert )
{
    var world = new World( 4, 4 );
    world.Build();
    assert.ok( world.journal.entries.length === 0 );
    var entity = new Entity( { x: 1, y: 3 }, world );
    assert.ok( entity.Update() );
    var lastEntry = world.journal.Peek();
    assert.equal( lastEntry.action, Action.eDrop );
    assert.ok( lastEntry.entity instanceof Entity );
    assert.equal( lastEntry.movement.dx, 0 );
    assert.equal( lastEntry.movement.dy, -1 );
} );
QUnit.test( "fastforward drops player down", function( assert )
{
    var world = new World( 4, 4 );
    world.Build();
    assert.ok( world.journal.entries.length === 0 );
    var entity = new Entity( { x: 1, y: 3 }, world );
    assert.ok( entity.Update() );
    assert.ok( entity.Update() );
    assert.ok( !entity.Update() );
    assert.deepEqual( entity.location, { x: 1, y: 1 } );
    assert.ok( world.Rewind() );
    assert.ok( world.Rewind() );
    assert.ok( !world.Rewind() );
    assert.deepEqual( entity.location, { x: 1, y: 3 } );
    assert.ok( world.FastForward() );
} );
QUnit.test( "adding to journal truncates later moves", function( assert )
{
    var world = new World( 6, 3 );
    world.Build();
    assert.ok( world.journal.entries.length === 0 );
    var entity = new Entity( { x: 1, y: 1 }, world );
    assert.ok( entity.Move( 1, 0 ) );
    assert.ok( entity.Move( 1, 0 ) );
    assert.ok( entity.Move( 1, 0 ) );
    assert.deepEqual( entity.location, { x: 4, y: 1 } );
    assert.ok( !world.Rewind() );
    assert.ok( !world.Rewind() );
    assert.ok( !world.Rewind() );
    assert.deepEqual( entity.location, { x: 1, y: 1 } );
    entity.Move( 1, 0 );
    assert.equal( world.journal.entries.length, 1 );
    assert.deepEqual( entity.location, { x: 2, y: 1 } );
} );
QUnit.test( "removing earth is added to journal", function( assert )
{
    var world = new World( 4, 3 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.PlaceContent( new Earth(), { x: 2, y: 1 } );
    assert.ok( catboy.Move( 1, 0 ) );
    assert.deepEqual( world.journal.entries.length, 2 );
    assert.deepEqual( world.journal.Peek().action, Action.eDig );
    assert.ok( world.journal.Peek().content instanceof Earth );
    assert.deepEqual( world.journal.Peek().location, { x: 2, y: 1 } );
} );
QUnit.test( "rewind restores earth and moves player", function( assert )
{
    var world = new World( 4, 3 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.PlaceContent( new Earth(), { x: 2, y: 1 } );
    assert.ok( catboy.Move( 1, 0 ) );
    world.Rewind();
    world.Rewind();
    assert.ok( world.GetContent( { x: 2, y: 1 } ) instanceof Earth );
    assert.deepEqual( catboy.location, { x: 1, y: 1 } );
} );
QUnit.test( "rewind removes earth and moves player", function( assert )
{
    var world = new World( 4, 3 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.PlaceContent( new Earth(), { x: 2, y: 1 } );
    assert.ok( catboy.Move( 1, 0 ) );
    assert.ok( world.Rewind() );
    assert.ok( !world.Rewind() );
    assert.ok( world.GetContent( { x: 2, y: 1 } ) instanceof Earth );
    assert.deepEqual( catboy.location, { x: 1, y: 1 } );
    assert.ok( world.FastForward() );
    assert.deepEqual( catboy.location, { x: 2, y: 1 } );
    assert.ok( !world.FastForward() );
    assert.ok( world.GetContent( { x: 2, y: 1 } ) instanceof EmptySpace );
} );

QUnit.test( "despatching enemy is added to journal", function( assert )
{
    var world = new World( 4, 3 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.AddEntity( new Enemy( { x: 2, y: 1 }, world ) );
    assert.ok( catboy.Move( 1, 0 ) );
    assert.equal( world.journal.entries.length, 2 );
    assert.deepEqual( world.journal.entries[ 0 ].action, Action.eMove );
    assert.ok( world.journal.entries[ 0 ].entity instanceof Catboy );
    assert.deepEqual( world.journal.entries[ 0 ].movement, { dx: 1, dy: 0 } );
    assert.deepEqual( world.journal.entries[ 1 ].action, Action.eDespatch );
    assert.ok( world.journal.entries[ 1 ].entity instanceof Enemy );
    assert.deepEqual( world.journal.entries[ 1 ].location, { x: 2, y: 1 } );
} );
QUnit.test( "rewind restores enemies", function( assert )
{
    var world = new World( 4, 3 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.AddEntity( catboy );
    world.AddEntity( new Enemy( { x: 2, y: 1 }, world ) );
    assert.ok( catboy.Move( 1, 0 ) );
    assert.ok( world.Rewind() );
    assert.ok( !world.Rewind() );
    assert.deepEqual( catboy.location, { x: 1, y: 1 } );
    assert.ok( world.GetEntity( { x: 2, y: 1 } ) instanceof Enemy );
} );
QUnit.test( "fast forward redespaches enemies", function( assert )
{
    var world = new World( 4, 3 );
    world.Build();
    var catboy = new Catboy( { x: 1, y: 1 }, world );
    world.AddEntity( catboy );
    world.AddEntity( new Enemy( { x: 2, y: 1 }, world ) );
    assert.ok( catboy.Move( 1, 0 ) );
    assert.ok( world.Rewind() );
    assert.ok( !world.Rewind() );
    assert.equal( world.population, 1 );
    assert.deepEqual( catboy.location, { x: 1, y: 1 } );
    assert.ok( world.GetEntity( { x: 2, y: 1 } ) instanceof Enemy );
    assert.ok( world.FastForward() );
    assert.deepEqual( catboy.location, { x: 2, y: 1 } );
    assert.ok( !world.FastForward() );
    assert.ok( world.GetEntity( { x: 2, y: 1 } ) instanceof Catboy );
    assert.equal( world.population, 0 );
} );

QUnit.test( "entity hitting ground generates gui dropped event", function( assert )
{
    var world = new World( 3, 4 );
    world.Build();
    assert.ok( world.journal.entries.length === 0 );
    var entity = new Entity( { x: 1, y: 2 }, world );
    assert.ok( entity.Update() );
    assert.ok( world.guiEvents.length == 1 );
    assert.equal( world.guiEvents[ world.guiEvents.length - 1 ].event, GuiEvent.eDropped );
} );
// test keyhandling
