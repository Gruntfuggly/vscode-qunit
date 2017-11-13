Object.defineProperty( exports, "__esModule", { value: true } );
var vscode = require( 'vscode' );
var path = require( "path" );
var cheerio = require( 'cheerio' ); // https://github.com/cheeriojs/cheerio

var failed = false;
var overallTime;
var elements = [];

const PASS = "pass";
const FAIL = "fail";
const TEST = "test";
const MODULE = "module";
const ASSERT = "assert";
const ASSERTS = "asserts";
const OVERALL = "overall";

class QunitTestResultsDataProvider
{
    constructor( _context, html )
    {
        this._context = _context;

        failed = false;
        elements = [];

        var $ = cheerio.load( html );
        $( '#qunit-tests > li' ).each( function()
        {
            var test = $( this ).find( "span.test-name" ).text();
            var result = $( this ).prop( "class" );
            var time = $( this ).find( "> span.runtime" ).text();
            var module = $( this ).find( "span.module-name" ).text();
            var source = $( this ).find( "p.qunit-source" ).text();

            var location = {};
            var uriRegex = /file\:\/\/(.*):(\d*):(\d*)/;
            var match;
            if( match = uriRegex.exec( source ) )
            {
                location.file = match[ 1 ];
                location.line = parseInt( match[ 2 ] ) - 1;
                location.character = parseInt( match[ 3 ] ) - 1;
            }

            var asserts = [];

            if( result === FAIL )
            {
                failed = true;
            }

            $( this ).find( ".qunit-assert-list > li" ).each( function( i )
            {
                var assertName = $( this ).prop( "class" );
                var assertTime = $( this ).find( "> span.runtime" ).text().substr( 2 );
                asserts.push( { type: ASSERT, location: location, name: assertName, time: assertTime, index: i } );
            } );

            var testElement = {
                type: TEST, name: test, result: result, asserts: asserts, time: time, location: location
            };

            if( !module )
            {
                elements.push( testElement );
            }
            else
            {
                function findModule( e )
                {
                    return e.type === MODULE && e.name === this;
                }

                var moduleElement;
                var parent = elements;
                module.split( '>' ).map( function( m )
                {
                    var child = parent.find( findModule, m.trim() );
                    if( !child )
                    {
                        moduleElement = {
                            type: MODULE, name: m.trim(), result: result, elements: []
                        };
                        parent.push( moduleElement );
                        parent = moduleElement.elements;
                    }
                    else
                    {
                        moduleElement = child;
                        parent = moduleElement.elements;
                    }
                    if( result === FAIL )
                    {
                        moduleElement.result = result;
                    }
                } );

                moduleElement.elements.push( testElement );
            }
        } );

        if( elements.length === 0 )
        {
            failed = true;
        }

        var timeRegex = /tests completed in (\d* .*?),/;
        var timeInfo = $( "#qunit-testresult-display" ).text();
        var match;
        if( match = timeRegex.exec( timeInfo ) )
        {
            overallTime = match[ 1 ];
        }

        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    getChildren( element )
    {
        if( !element )
        {
            if( elements.length > 0 )
            {
                return [ { type: OVERALL, name: "Overall", time: overallTime }];
            }
            else
            {
                return [ { type: OVERALL, name: "No tests found" }];
            }
        }
        else if( element.type === OVERALL )
        {
            return elements;
        }
        else if( element.type === MODULE )
        {
            return element.elements;
        }
        else if( element.type === TEST )
        {
            return element.asserts;
        }
        else if( element.type === ASSERTS )
        {
            return element.results;
        }
    }

    getState( status )
    {
        if( status === PASS )
        {
            return vscode.TreeItemCollapsibleState.Collapsed;
        }
        else if( status === FAIL )
        {
            return vscode.TreeItemCollapsibleState.Expanded;
        }
        return vscode.TreeItemCollapsibleState.None;
    }

    getTreeItem( element )
    {
        let treeItem = new vscode.TreeItem( element.name );

        if( element.type === OVERALL )
        {
            if( vscode.workspace.getConfiguration( 'vscode-qunit' ).showExecutionTimes && element.time )
            {
                treeItem.label += " (" + element.time + ")";
            }

            var status;
            if( elements.length > 0 )
            {
                status = failed > 0 ? FAIL : PASS;
                treeItem.iconPath = this._getIcon( status );
            }
            else
            {
                treeItem.iconPath = this._getIcon( FAIL );
            }
            treeItem.collapsibleState = this.getState( status );
        }
        else if( element.type === TEST )
        {
            if( vscode.workspace.getConfiguration( 'vscode-qunit' ).showExecutionTimes && element.time )
            {
                treeItem.label += " (" + element.time + ")";
            }

            treeItem.collapsibleState = this.getState( element.result );
            treeItem.iconPath = this._getIcon( element.result );
            treeItem.command = {
                command: "vscode-qunit.revealTest",
                title: "",
                arguments: [
                    element.location
                ]
            };
        }
        else if( element.type === MODULE )
        {
            treeItem.collapsibleState = this.getState( element.result );
            treeItem.iconPath = this._getIcon( element.result );
        }
        else if( element.type === ASSERTS )
        {
            treeItem.collapsibleState = this.getState( element.result );
            treeItem.iconPath = this._getIcon( element.name );
        }
        else if( element.type === ASSERT )
        {
            if( vscode.workspace.getConfiguration( 'vscode-qunit' ).showExecutionTimes && element.time )
            {
                treeItem.label += " (" + element.time + ")";
            }

            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
            treeItem.iconPath = this._getIcon( element.name );
            treeItem.command = {
                command: "vscode-qunit.revealTest",
                title: "",
                arguments: [
                    element.location,
                    element.index
                ]
            };
        }

        return treeItem;
    }

    _getIcon( status )
    {
        let icon = {
            dark: this._context.asAbsolutePath( path.join( "resources/icons", "dark", status + ".svg" ) ),
            light: this._context.asAbsolutePath( path.join( "resources/icons", "light", status + ".svg" ) )
        };
        return icon;
    }

    _refreshTree()
    {
        this._onDidChangeTreeData.fire();
    }
}
exports.QunitTestResultsDataProvider = QunitTestResultsDataProvider;