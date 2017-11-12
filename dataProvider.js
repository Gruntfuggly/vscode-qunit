Object.defineProperty( exports, "__esModule", { value: true } );
var vscode = require( 'vscode' );
var path = require( "path" );
var cheerio = require( 'cheerio' ); // https://github.com/cheeriojs/cheerio

var showTimes = false;

var failed = false;

var tests = [];
var moduleList = {};
var results = {};
var asserts = {};
var times = {};
var modules = {};

class QunitTestResultsDataProvider
{
    constructor( _context, html )
    {
        this._context = _context;

        tests = [];
        moduleList = {};
        results = {};
        asserts = {};
        times = {};
        modules = {};

        var $ = cheerio.load( html );
        $( '#qunit-tests > li' ).each( function()
        {
            var test = $( this ).find( "span.test-name" ).text();
            tests.push( "test>" + test );
            // tests.push( test );
            results[ test ] = $( this ).prop( "class" );
            times[ test ] = $( this ).find( "span.runtime" ).text();
            var module = $( this ).find( "span.module-name" ).text();
            if( module )
            {
                moduleList[ "module>" + module ] = true;
                // moduleList.push( module );
                modules[ "test>" + test ] = module;
            }
            $( this ).find( ".qunit-assert-list > li" ).each( function( i )
            {
                if( asserts[ test ] === undefined )
                {
                    asserts[ test ] = [];
                }
                asserts[ test ].push( test + ":" + i + ":" + $( this ).prop( "class" ) );
            } );
        } );

        failed = parseInt( $( '#qunit-testresult > .failed' ).text() );

        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        vscode.window.onDidChangeActiveTextEditor( () =>
        {
            this._refreshTree();
        } );
        vscode.workspace.onDidChangeTextDocument( () =>
        {
            this._refreshTree();
        } );
    }
    get activeEditor()
    {
        return vscode.window.activeTextEditor || null;
    }
    getChildren( element )
    {
        if( !element )
        {
            return [ "Tests" ];
        }
        else if( element === "Tests" )
        {
            var topLevel = Object.keys( moduleList );
            tests.map( function( test )
            {
                if( modules[ test ] !== undefined )
                {
                    topLevel.push( test );
                }
            } );
            return topLevel;
        }
        else
        {
            var parts = element.split( '>' );
            var name = parts.slice( 1 ).join( '>' );
            if( parts[ 0 ] === "module" )
            {
                return undefined;
            }
            else if( parts[ 0 ] === "test" )
            {
                return asserts[ name ];
            }
            return undefined;
        }
    }

    getState( status )
    {
        if( status === "pass" )
        {
            return vscode.TreeItemCollapsibleState.Collapsed;
        }
        return vscode.TreeItemCollapsibleState.Expanded;
    }

    getTreeItem( element )
    {
        var mainparts = element.split( '>' );
        var name = mainparts.length > 1 ? mainparts.slice( 1 ).join( '>' ) : element;

        var editor = vscode.window.activeTextEditor;
        let treeItem = new vscode.TreeItem( name );
        var parts = element.split( ':' );

        if( name === "Tests" )
        {
            var status = failed > 0 ? "fail" : "pass";
            treeItem.collapsibleState = this.getState( status );
            treeItem.iconPath = this._getIcon( status );
        }
        else if( parts.length > 2 )
        {
            treeItem.label = parts[ 2 ];
            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
            treeItem.iconPath = this._getIcon( parts[ 2 ] );
            treeItem.command = {
                command: "vscode-qunit.revealTest",
                title: "",
                arguments: [
                    parts[ 0 ],
                    parts[ 1 ]
                ]
            };
        }
        else
        {
            if( showTimes )
            {
                treeItem.label += " (" + times[ element ] + ")";
            }

            treeItem.collapsibleState = this.getState( results[ name ] );
            treeItem.iconPath = this._getIcon( results[ name ] );
            treeItem.command = {
                command: "vscode-qunit.revealTest",
                title: "",
                arguments: [
                    name
                ]
            };
        }

        return treeItem;
    }

    _getIcon( status )
    {
        let icon = {
            dark: this._context.asAbsolutePath( path.join( "resources", "icons", status + ".svg" ) ),
            light: this._context.asAbsolutePath( path.join( "resources", "icons", status + ".svg" ) )
        };
        return icon;
    }

    _refreshTree()
    {
        this._onDidChangeTreeData.fire();
    }
}
exports.QunitTestResultsDataProvider = QunitTestResultsDataProvider;