var vscode = require( 'vscode' );
var Browser = require( 'zombie' ); // https://www.npmjs.com/package/zombie#browser
var TreeView = require( "./dataProvider" );
var fs = require( 'fs' );

function activate( context )
{
    var provider = new TreeView.QunitTestResultsDataProvider( context );
    vscode.window.registerTreeDataProvider( 'qunit-test-results', provider );

    vscode.commands.registerCommand( 'vscode-qunit.revealTest', ( location, assert ) =>
    {
        // TODO: Refresh on save (not rebuild)

        var testsFile = location.file;
        vscode.workspace.openTextDocument( testsFile ).then( function( document )
        {
            vscode.window.showTextDocument( document ).then( function( editor )
            {
                var position = new vscode.Position( location.line, location.character );

                if( assert !== undefined )
                {
                    var text = editor.document.getText();
                    var remaining = text.substr( editor.document.offsetAt( position ) );
                    var assertRegex = new RegExp( "(assert\\s*)*(\\.)*(ok|notOk|equal|notEqual|deepEqual|notDeepEqual|propEqual|notPropEqual|strictEqual|notStrictEqual)\\s*\\(", 'g' );
                    var assertMatch;
                    for( var i = 0; i <= assert; ++i )
                    {
                        assertMatch = assertRegex.exec( remaining );
                    }
                    position = editor.document.positionAt( text.length - remaining.length + assertMatch.index );
                }

                editor.selection = new vscode.Selection( position, position );
                editor.revealRange( editor.selection, vscode.TextEditorRevealType.Default );
                vscode.commands.executeCommand( 'workbench.action.focusActiveEditorGroup' );
            } );
        } );
    } );

    function runTests()
    {
        provider.clear();

        var file = vscode.workspace.getConfiguration( 'vscode-qunit' ).file;

        if( !file )
        {
            vscode.window.showErrorMessage( "QUnit: Please set the HTML file which runs your tests, in your preferences (vscode-qunit.file)" );
            provider.refresh( "" );
        }
        else
        {
            var uri = vscode.Uri.file( file ).toString();

            fs.exists( file, function( exists )
            {
                if( exists )
                {
                    var browser = new Browser();
                    browser.visit( uri, function()
                    {
                        provider.refresh( browser.query( 'body' ).innerHTML );
                    } );
                }
                else
                {
                    vscode.window.showErrorMessage( "QUnit: Can't find test file '" + file + "'" );
                    provider.refresh( "" );
                }
            } );
        }
    }

    function setFile( file )
    {
        function update( file )
        {
            vscode.workspace.getConfiguration( 'vscode-qunit' ).update( 'file', file ).then( function()
            {
                runTests();
            } );
        }

        if( !file )
        {
            vscode.window.showInputBox( { prompt: "Please enter the full path to your HTML tests file:" } ).then( function( file )
            {
                if( file )
                {
                    update( file );
                }
            } );
        }
        else
        {
            vscode.window.showInformationMessage( "QUnit: Test file set to " + file.path );
            update( file.path );
        }
    }

    context.subscriptions.push(
        vscode.commands.registerCommand( 'vscode-qunit.runTests', runTests ),
        vscode.commands.registerCommand( 'vscode-qunit.refresh', runTests ),
        vscode.commands.registerCommand( 'vscode-qunit.setFile', setFile ) );

    runTests();
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;