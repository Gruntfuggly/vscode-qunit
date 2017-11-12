# VSCode QUnit

This extension allows you to run your <a href="http://qunitjs.com/">QUnit</a> unit tests from inside vscode, displaying the results in a tree view in the explorer pane. Clicking on the results in the tree view will attempt to reveal the test in the tests file.

To run your tests, press F1, and select or enter `Run qunit tests`.

_Note: Currently, revealing the test is done using a search with regular expressions. This works best if your tests and module names are unique. If not, it will probably just find the first instance of the test. This will be improved in the next version._

## Installing

You can install the latest version of the extension via the Visual Studio Marketplace [here](https://marketplace.visualstudio.com/items?itemName=Gruntfuggly.vscode-qunit).

Alternatively, open Visual Studio code, press `Ctrl+P` or `Cmd+P` and type:

    > ext install vscode-qunit

The extension is designed to work with version 2.4.1 of QUnit. It may possibly work with older versions.

### Source Code

The source code is available on GitHub [here](https://github.com/Gruntfuggly/vscode-qunit).

## Configuration

To make it work, you'll need to define one or two file paths:

`vscode-quint.executeFile`

This should be set to the full path of the file you would normally load in the browser to execute your tests and view the results. This extension runs the file in a headless browser in order to parse the results and populate the tree.

`vscode-qunit.testsFile`

This should be set to the full path of the file which contains the javascript test definitions. This is used when clicking on the results in the tree to reveal the test. Note: This may be the same as the executeFile. If it is the same file, you can leave this setting empty.

There is also a setting to control display of test execution times (off by default):

`vscode-qunit.showExecutionTimes`

### Credits

<div>Icons made by <a href="https://www.flaticon.com/authors/maxim-basinski" title="Maxim Basinski">Maxim Basinski</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a> is licensed by <a href="http://creativecommons.org/licenses/by/3.0/" title="Creative Commons BY 3.0" target="_blank">CC 3.0 BY</a></div>