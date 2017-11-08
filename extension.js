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
    var disposable = vscode.commands.registerCommand( 'vscode-qunit.runTests', function()
    {
        var uri = vscode.Uri.file( getExtensionFilePath( context, "test.html" ) ).toString();

        var browser = new Browser();
        browser.visit( uri, function()
        {
            vscode.window.registerTreeDataProvider( 'qunit-test-results', new TreeView.QunitTestResultsDataProvider( context, browser.query( 'body' ).innerHTML ) );

        } );

        //     // Opens the html in a preview window
        //     // vscode.commands.executeCommand( 'vscode.previewHtml', vscode.Uri.file( getExtensionFilePath( context, "test.html" ) ), 2 );
    } );

    context.subscriptions.push( disposable );
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate()
{
}
exports.deactivate = deactivate;