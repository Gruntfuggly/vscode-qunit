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
    vscode.commands.registerCommand( 'vscode-qunit.revealTest', ( type, name, assert ) =>
    {
        // TODO: Refresh on save (not rebuild)

        var testsFile = vscode.workspace.getConfiguration( 'vscode-qunit' ).testsFile;
        if( !testsFile )
        {
            testsFile = vscode.workspace.getConfiguration( 'vscode-qunit' ).executeFile;
        }

        if( !testsFile )
        {
            vscode.window.showErrorMessage( "Please set the file which contains your tests, in your preferences (vscode-qunit.testsFile)" );
        }
        else
        {
            vscode.workspace.openTextDocument( testsFile ).then( function( document )
            {
                vscode.window.showTextDocument( document ).then( function( editor )
                {
                    var regex = new RegExp( type + "\\s*\\(\\s*(\"|')" + name + "(\"|')", 'g' );
                    var text = editor.document.getText();
                    var match;
                    if( match = regex.exec( text ) )
                    {
                        var startPos;
                        var endPos;
                        if( assert !== undefined )
                        {
                            var remaining = text.substr( match.index + match[ 0 ].length );
                            var assertRegex = new RegExp( "(assert\\s*)*(\\.)*(ok|notOk|equal|notEqual|deepEqual|notDeepEqual|propEqual|notPropEqual|strictEqual|notStrictEqual)\\s*\\(", 'g' );
                            var assertMatch;
                            for( var i = 0; i <= assert; ++i )
                            {
                                assertMatch = assertRegex.exec( remaining );
                            }
                            var sp = text.length - remaining.length + assertMatch.index;
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
        }
    } );

    var disposable = vscode.commands.registerCommand( 'vscode-qunit.runTests', function()
    {
        var executeFile = vscode.workspace.getConfiguration( 'vscode-qunit' ).executeFile;

        if( !executeFile )
        {
            vscode.window.showErrorMessage( "Please set the file which runs your tests, in your preferences (vscode-qunit.executeFile)" );
        }
        else
        {
            // var uri = vscode.Uri.file( getExtensionFilePath( context, "test.html" ) ).toString();
            var uri = vscode.Uri.file( executeFile ).toString();

            var browser = new Browser();
            browser.visit( uri, function()
            {
                vscode.window.registerTreeDataProvider( 'qunit-test-results', new TreeView.QunitTestResultsDataProvider( context, browser.query( 'body' ).innerHTML ) );
            } );
        }
    } );

    context.subscriptions.push( disposable );
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;