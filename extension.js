// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
var vscode = require('vscode');
// var simpleGit = require('simple-git')((vscode.workspace.rootPath) ? vscode.workspace.rootPath : '.');
var simpleGit = require('simple-git')("/home/bibhas/Rivendell/vscode/git-easy/");

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    var disposableTest = vscode.commands.registerCommand('extension.countChars', function () {
        var editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

        var selection = editor.selection;
        var text = editor.document.getText(selection);

        // Display a message box to the user
        vscode.window.showInformationMessage('Selected characters: ' + text.length);
    });

    var disposableOriginPull = vscode.commands.registerCommand('extension.doOriginPull', function () {
        simpleGit.branch(function(error, branchSummary) {
            if (error != null) {
                vscode.window.showErrorMessage("Something broke. Check console.")
                console.log(error);
            } else if (branchSummary.all.length == 0) {
                vscode.window.showErrorMessage("No branches found. Git add files and commit maybe?")
            } else {
                console.log(branchSummary);
            }
        })
    });

    var disposableOriginPush = vscode.commands.registerCommand('extension.doOriginPush', function () {
        simpleGit.branch(function(error, branchSummary) {
            console.log(branchSummary);
        })
    });

    var disposableAdd = vscode.commands.registerCommand('extension.doAdd', function () {
        var fileList = [];
        simpleGit.status(function(error, status) {
            fileList.push({
                'label': "Add All Untracked",
                'description': "AddAllUntracked"
            })
            fileList = fillFileList(status, fileList, true)

            var qp = vscode.window.showQuickPick(fileList);
            qp.then(function (result) {
                console.log(result);
                if (result == null) {
                    return;
                }
                if (result.description == "AddAllUntracked") {
                    simpleGit.status(function(error, status) {
                        status.not_added.forEach(function(element) {
                            simpleGit.add(element);
                        }, this);
                    });
                } else {
                    simpleGit.add(result.label, function (result) {
                        console.log(result);
                    })
                }
            })
        });
    });

    var disposableStatus = vscode.commands.registerCommand('extension.doStatus', function () {
        var fileList = [];
        simpleGit.status(function(error, status) {
            console.log(status);
            fileList = fillFileList(status, fileList, false);

            var qp = vscode.window.showQuickPick(fileList);
            qp.then(function (result) {
                console.log(result);
                if (result == null) {
                    return;
                }
                if (["Untracked", "New"].indexOf(result.description) >= 0) {
                    return;
                }
            })
        });
    });

    context.subscriptions.push(disposableTest);
    context.subscriptions.push(disposableOriginPull);
    context.subscriptions.push(disposableOriginPush);
    context.subscriptions.push(disposableAdd);
    context.subscriptions.push(disposableStatus);

    function fillFileList(status, fileList, is_gitadd=false) {
        status.modified.forEach(function(element) {
            var item = {
                'label': element,
                'description': "Modified"
            };
            fileList.push(item);
        }, this);
        status.not_added.forEach(function(element) {
            var item = {
                'label': element,
                'description': "Untracked"
            };
            fileList.push(item)
        }, this);

        if (!is_gitadd) {
            status.created.forEach(function(element) {
                var item = {
                    'label': element,
                    'description': "New"
                };
                fileList.push(item)
            }, this);
        }
        return fileList;
    }
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;