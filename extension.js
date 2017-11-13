var vscode = require( 'vscode' );
var Browser = require( 'zombie' ); // https://www.npmjs.com/package/zombie#browser
var TreeView = require( "./dataProvider" );

function activate( context )
{
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
                vscode.commands.executeCommand( 'workbench.action.focusActiveEditorGroup' );
            } );
        } );
    } );

    function runTests()
    {
        var file = vscode.workspace.getConfiguration( 'vscode-qunit' ).file;

        if( !file )
        {
            vscode.window.showErrorMessage( "Please set the file which runs your tests, in your preferences (vscode-qunit.executeFile)" );
        }
        else
        {
            var uri = vscode.Uri.file( file ).toString();

            var browser = new Browser();
            browser.visit( uri, function()
            {
                vscode.window.registerTreeDataProvider( 'qunit-test-results', new TreeView.QunitTestResultsDataProvider( context, browser.query( 'body' ).innerHTML ) );
            } );
        }
    }

    var disposable = vscode.commands.registerCommand( 'vscode-qunit.runTests', runTests );
    var disposable = vscode.commands.registerCommand( 'vscode-qunit.rerunTests', runTests );

    context.subscriptions.push( disposable );
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;