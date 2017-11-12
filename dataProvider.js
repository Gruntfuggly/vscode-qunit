Object.defineProperty( exports, "__esModule", { value: true } );
var vscode = require( 'vscode' );
var path = require( "path" );
var cheerio = require( 'cheerio' ); // https://github.com/cheeriojs/cheerio

var failed = false;

var elements = [];

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
            var asserts = [];

            if( result === "fail" )
            {
                failed = true;
            }

            $( this ).find( ".qunit-assert-list > li" ).each( function( i )
            {
                asserts.push( { type: "assert", test: test, name: $( this ).prop( "class" ), index: i } );
            } );

            var testElement = {
                type: "test", name: test, result: result, asserts: asserts, time: time
            };

            if( !module )
            {
                elements.push( testElement );
            }
            else
            {
                function findModule( e )
                {
                    return e.type === "module" && e.name === this;
                }

                var moduleElement;
                var parent = elements;
                module.split( '>' ).map( function( m )
                {
                    var child = parent.find( findModule, m.trim() );
                    if( child === undefined )
                    {
                        moduleElement = {
                            type: "module", name: m.trim(), result: result, elements: []
                        };
                        parent.push( moduleElement );
                        parent = moduleElement.elements;
                    }
                    else
                    {
                        moduleElement = child;
                        parent = moduleElement.elements;
                    }
                    if( result === "fail" )
                    {
                        moduleElement.result = result;
                    }
                } );

                moduleElement.elements.push( testElement );
            }
        } );

        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    getChildren( element )
    {
        if( !element )
        {
            return [ { type: "overall", name: "Overall" }];
        }
        else if( element.type === "overall" )
        {
            return elements;
        }
        else if( element.type === "module" )
        {
            return element.elements;
        }
        else if( element.type === "test" )
        {
            return element.asserts;
        }
        else if( element.type === "asserts" )
        {
            return element.results;
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
        let treeItem = new vscode.TreeItem( element.name );

        if( element.type === "overall" )
        {
            var status = failed > 0 ? "fail" : "pass";
            treeItem.collapsibleState = this.getState( status );
            treeItem.iconPath = this._getIcon( status );
        }
        else if( element.type === "test" )
        {
            if( vscode.workspace.getConfiguration( 'vscode-qunit' ).showExecutionTimes )
            {
                treeItem.label += " (" + element.time + ")";
            }

            treeItem.collapsibleState = this.getState( element.result );
            treeItem.iconPath = this._getIcon( element.result );
            treeItem.command = {
                command: "vscode-qunit.revealTest",
                title: "",
                arguments: [
                    "test",
                    element.name
                ]
            };
        }
        else if( element.type === "module" )
        {
            treeItem.collapsibleState = this.getState( element.result );
            treeItem.iconPath = this._getIcon( element.result );
            treeItem.command = {
                command: "vscode-qunit.revealTest",
                title: "",
                arguments: [
                    "module",
                    element.name
                ]
            };
        }
        else if( element.type === "asserts" )
        {
            treeItem.collapsibleState = this.getState( element.result );
            treeItem.iconPath = this._getIcon( element.name );
        }
        else if( element.type === "assert" )
        {
            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
            treeItem.iconPath = this._getIcon( element.name );
            treeItem.command = {
                command: "vscode-qunit.revealTest",
                title: "",
                arguments: [
                    "test",
                    element.test,
                    element.index
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