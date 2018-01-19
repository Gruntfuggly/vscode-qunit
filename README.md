# VSCode QUnit

This extension allows you to run your <a href="http://qunitjs.com/">QUnit</a> unit tests from inside Visual Studio Code, displaying the results in a tree view in the explorer pane. Clicking on the results in the tree view will attempt to reveal the tests and assertions in the tests file.

To get started, either right click your tests file in the exlorer window and select **Set as file to run QUnit tests**, or visit your preferences and set the file manually (see Configuration below). *Note: If you use the context menu, the file is stored in your workspace preferences.*

To run your tests, press F1, and select or enter `Run QUnit tests`, or simply click the refresh button on the QUNIT TEST RESULTS title bar. The tree will be automatically expanded to show any failing tests.

<img src="https://raw.githubusercontent.com/Gruntfuggly/vscode-qunit/master/resources/screenshot.png">

## Installing

You can install the latest version of the extension via the Visual Studio Marketplace [here](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.vscode-qunit).

Alternatively, open Visual Studio code, press `Ctrl+P` or `Cmd+P` and type:

    > ext install vscode-qunit

The extension is designed to work with version 2.4.1 of QUnit. It may possibly work with older versions.

### Source Code

The source code is available on GitHub [here](https://github.com/Gruntfuggly/vscode-qunit).

## Configuration

To make it work, you'll need to define the path to your test HTML file:

`vscode-qunit.file`

This should be set to the full path of the file you would normally load in the browser to execute your tests and view the results. This extension runs the file in a headless browser in order to parse the results and populate the tree.

There is also a setting to control display of test execution times (off by default):

`vscode-qunit.showExecutionTimes`

## Known Issues

Currently, revealing the assertions is done using a search with regular expressions. This works fine as long as your assertions are defined in order. If you put assertions into local functions within the test, it won't work. Sorry.

The view currently can't be refreshed without rebuilding the tree. This means that the expansion state of the tree is not preserved.

There are probably lots of use cases where it doesn't work properly. Please let me know and I'll try and accomodate them. Any feedback is welcome!

### Credits

"Pass" and "Fail" icons made by <a href="https://www.flaticon.com/authors/maxim-basinski" title="Maxim Basinski">Maxim Basinski</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>, licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a>

"Refresh" icon stolen from Patryk Zawadzki's <a href="https://marketplace.visualstudio.com/items?itemName=patrys.vscode-code-outline">Code Outline</a> extension, which was also used as inspiriation and guidance for this one.

"QUnit" icon stolen from the QUnit twitter account.
