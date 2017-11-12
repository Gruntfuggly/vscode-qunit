var vscode = require( 'vscode' );
var path = require( "path" );
var Browser = require( 'zombie' ); // https://www.npmjs.com/package/zombie#browser
var TreeView = require( "./dataProvider" );

function getExtensionFilePath( context, extensionfile )
{
    return path.resolve( context.extensionPath, extensionfile );
}

function activate( context )
{
    vscode.commands.registerCommand( 'vscode-qunit.revealTest', ( test, assert ) =>
    {
        // TODO: Refresh on save (not rebuild)
        // TODO: Get files from config

        vscode.workspace.openTextDocument( "/Users/nige/Projects/vscode-qunit/tests.js" ).then( function( document )
        {
            vscode.window.showTextDocument( document ).then( function( editor )
            {
                var regex = new RegExp( test, 'g' );
                var text = editor.document.getText();
                var match;
                if( match = regex.exec( text ) )
                {
                    var startPos;
                    var endPos;
                    if( assert !== undefined )
                    {
                        var remaining = text.substr( match.index + match[ 0 ].length );
                        var assertRegex = new RegExp( "[\n\r]\\s*(ok|notOk|equal|notEqual|deepEqual|notDeepEqual|propEqual|notPropEqual|strictEqual|notStrictEqual)\\s*\\(", 'g' );
                        var assertMatch;
                        for( var i = 0; i <= parseInt( assert ); ++i )
                        {
                            assertMatch = assertRegex.exec( remaining );
                        }
                        var sp = text.length - remaining.length + assertMatch.index + 1;
                        var ep = text.length - remaining.length + assertMatch.index + assertMatch[ 0 ].length - 1;
                        startPos = editor.document.positionAt( sp );
                        endPos = editor.document.positionAt( ep );
                    } else
                    {
                        startPos = editor.document.positionAt( match.index );
                        endPos = editor.document.positionAt( match.index + match[ 0 ].length );
                    }
                    editor.selection = new vscode.Selection( startPos, endPos );
                    vscode.commands.executeCommand( 'workbench.action.focusActiveEditorGroup' );
                }
            } );
        } );
    } );

    var disposable = vscode.commands.registerCommand( 'vscode-qunit.runTests', function()
    {
        var uri = vscode.Uri.file( getExtensionFilePath( context, "test.html" ) ).toString();

        var browser = new Browser();
        browser.visit( uri, function()
        {
            vscode.window.registerTreeDataProvider( 'qunit-test-results', new TreeView.QunitTestResultsDataProvider( context, browser.query( 'body' ).innerHTML ) );

        } );
    } );

    context.subscriptions.push( disposable );
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;