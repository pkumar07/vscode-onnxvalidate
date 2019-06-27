import * as vscode from 'vscode';
import ContentProvider from './ContentProvider';
import { DockerManager } from './dockerManager';
import { basename, join } from 'path';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    console.log(`Extension "first-extension" is now active from path ${context.extensionPath}!!`);
    let currentPanel: vscode.WebviewPanel | undefined = undefined;


    let dockerManager: DockerManager = new DockerManager(context.extensionPath, context);  // constructor gets all the images in the host. This needs to get the 
    // images from dockerhub if the images that we need arent there in the host.
    // The on.exit is when we have all the images. So that needs to ha


    let startDocker = vscode.commands.registerCommand('extension.startOnnxEcosystem', () => {
        // tell the user that the development/deployment env is getting ready
        // using a pop up.
        vscode.window.showInformationMessage("Starting the target development environment...\n \
											  This might take a minute.\n ");

    });


    let convert = vscode.commands.registerCommand('extension.Convert', (fileuri: any) => {
        // get the file name with which the right click command was executed
        dockerManager.dockerExec(fileuri);
        vscode.window.showInformationMessage(`Converting ${basename(fileuri.fsPath)} to ONNX...`);
        console.log(`Converting....${basename(fileuri.fsPath)}`);
    });


    let quantize = vscode.commands.registerCommand('extension.Quantize', () => {
        console.log("Quantize....");
    });


    let runValidation = vscode.commands.registerCommand('extension.RunValidation', () => {
        dockerManager.dockerExec("dockerRun_command");
        console.log("Running validation....");
    });

    let validate = vscode.commands.registerCommand('extension.Validate', () => {

        let userMountLocation: string = "";
        if (vscode.workspace.workspaceFolders && vscode.window.activeTextEditor) {
            let folder = vscode.workspace.getWorkspaceFolder(vscode.window.activeTextEditor.document.uri);
            if (folder) {
                userMountLocation = folder.uri.fsPath;
            }
        }
        else {
            console.log("No workspace folders found... ");
        }
        const contentProvider = new ContentProvider(userMountLocation);

        if (currentPanel) {
            currentPanel.reveal(vscode.ViewColumn.Two);
        } else {
            currentPanel = vscode.window.createWebviewPanel(
                "onnxvalidate",
                "ONNXValidate",
                vscode.ViewColumn.One,
                {
                    enableScripts: true,
                    retainContextWhenHidden: true
                }
            );
            let inputFolders: string = "";
            let refFolders: string = "";
            currentPanel.webview.onDidReceiveMessage(msg => {
                let txtMessage = "generic command";
                switch (msg.command) {
                    case "setInputFile": {
                        vscode.window.showOpenDialog({
                            canSelectFolders: true, canSelectFiles: true, canSelectMany: true,
                            openLabel: 'Select folder(s) containing input files'
                        }).then((folderUris) => {
                            if (folderUris) {
                                folderUris.forEach(function (value) {
                                    console.log(value.fsPath);
                                    // TODO: fix this for the case when multiple folders are selected
                                    //inputFolders = value.path.toString() + ',' + inputFolders;
                                    inputFolders = value.fsPath;
                                });
                            }
                            if (currentPanel) {
                                currentPanel.webview.postMessage({ command: "inputFile", payload: inputFolders });
                            }
                            vscode.window.showInformationMessage(`Seems like I should be opening ${folderUris}!`);
                        });
                        break;
                    }
                    case "setOutputFile": {
                        vscode.window.showOpenDialog({
                            canSelectFolders: true, canSelectFiles: true, canSelectMany: true,
                            openLabel: 'Select folder(s) containing reference output files'
                        }).then((folderUris) => {
                            if (folderUris) {
                                folderUris.forEach(function (value) {
                                    console.log(value.fsPath);
                                    // TODO: fix this for the case when multiple folders are selected
                                    //refFolders = value.path.toString() + ',' + refFolders;
                                    refFolders = value.fsPath;
                                });
                            }
                            if (currentPanel) {
                                currentPanel.webview.postMessage({ command: "outputFile", payload: refFolders });
                            }
                            vscode.window.showInformationMessage(`Seems like I should be opening ${folderUris}!`);
                        });
                        break;
                    }
                    case "startVerification": {
                        if (inputFolders !== "" && refFolders !== "") {
                            // TODO -- uncomment this 
                            //dockerManager.dockerRunValidation(inputFolders, refFolders, currentPanel);
                            testResultsHandler();
                            vscode.window.showInformationMessage("Should be showing the results of validation");
                        }
                        else {
                            console.log("Something went wrong! Input or/and ref output folder are empty");
                            inputFolders = "";
                            refFolders = "";
                        }
                        break;
                    }
                    case "cancel": {
                        inputFolders = "";
                        refFolders = "";
                        console.log("Canceling verification");
                    }
                }

            }, undefined, context.subscriptions);
        }
        currentPanel.webview.html = contentProvider.getProdContent(context);

        vscode.window.showInformationMessage('Panel should be displayed');
        console.log("Validate....");

    });

    let testResultsHandler = () => {
        //const unBundleDiskPath = Uri.file(join(context.extensionPath, "out", "webview", "webview.bundle.js"));

        const testDataPath: string = join(context.extensionPath, 'src', 'test', 'data', 'verification_data.json');
        if (fs.existsSync(testDataPath)) {
            fs.readFile(testDataPath, (err, data) => {
                if (err || data === undefined) {
                    console.log('Error reading data file.');
                } else {
                    let results = JSON.parse(data.toString());
                    try {
                        // Be mindful that the new object created in the lambda *has* to be enclosed in brackets
                        let forGrid : any = Object.entries(results).map(kv => ({ "input" : kv[0], 
                                                                                "actual" : (<any>kv[1])["actual"],
                                                                                "expected" : (<any>kv[1])["expected"]
                                                                            }));
                        console.log("Results parsing worked");
                        if (currentPanel !== undefined) {
                            currentPanel.webview.postMessage({ command: 'result', payload: forGrid });
                        }
                    } catch {
                        console.log("Likely pulling from array didn't work.");
                    }
                }
            });
        } else {
            console.log(`Couldn't find: ${testDataPath} on disk.`);
        }

        vscode.window.showInformationMessage("Should be reading results");
    };

    let testResults = vscode.commands.registerCommand('firstextension.tryResults', testResultsHandler);

    context.subscriptions.push(startDocker);
    context.subscriptions.push(convert);
    context.subscriptions.push(quantize);
    context.subscriptions.push(dockerManager);
    context.subscriptions.push(validate);
    context.subscriptions.push(testResults);



    context.subscriptions.push(vscode.commands.registerCommand('firstextension.addCountToPanel', () => {
        if (currentPanel !== undefined) {
            currentPanel.webview.postMessage({ command: 'testCommand', payload: 'just some data' });
        }
        vscode.window.showInformationMessage("Just sent message to view, check console");
    }));
}

// this method is called when your extension is deactivated
export function deactivate() { }
