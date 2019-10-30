'use strict';
import * as cp from 'child_process';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import ContentProvider from './ContentProvider';
import * as utils from './osUtils';
import { supported_models, docker_images, tensorflow_binaries, tensorflow_quantization_options } from './config';
import { resolve } from 'url';
import { rejects } from 'assert';
import { dlToolkitChannel} from "./dlToolkitChannel";

export class DockerManager implements vscode.Disposable { // can dispose the vscode context?
    private _imageId: string | undefined; // declare an array of image ids, that exists on the system, conversionContainerImage, QuantizationImage
    private _imageIds: string[];
    private _containerIds: string[];
    private _workspace: vscode.WorkspaceFolder | undefined;
    private _extensionPath: string;
    private _context: vscode.ExtensionContext | undefined;

    // the constructor might need to get the required images from the docker hub too.
    constructor(extensionPath: string, context: vscode.ExtensionContext) {
        this._imageIds = [];
        this._containerIds = [];
        this._extensionPath = extensionPath;
        this._context = context;

        //TODO: Make sure that the host system has docker and this image.
        // if not, get it from docker hub? that part needs to be decided.

        const workspaceFolders: vscode.WorkspaceFolder[] = vscode.workspace.workspaceFolders || [];
        if (workspaceFolders.length != 0) {
            // Check if docker is installed and has the image that we require
            this._workspace = workspaceFolders[0];

            let containerTypeCP = cp.spawn('docker', ['info', '-f', `"{{.OSType}}"`]);
            let containerType = "";
            containerTypeCP.stdout.on("data", (data: string): void => {
                dlToolkitChannel.append(data);
                containerType = containerType + data.toString(); // this should say something like not installed so used that instead of error
            });

            containerTypeCP.on('error', (err) => {
                dlToolkitChannel.appendLine('Docker client is either not installed or not running!');

            });

            containerTypeCP.on("exit", (data: string | Buffer): void => {
                if (this._workspace) {
                    dlToolkitChannel.appendLine(`${this._workspace.uri.fsPath}, ${os.tmpdir()}, ${containerType.trim().replace(/\"/g, "")}`);
                    utils.setMountLocations(this._workspace.uri.fsPath, os.tmpdir(), containerType.trim().replace(/\"/g, ""));
                    dlToolkitChannel.appendLine('Mount locations set!');
                }
            });
        }
    }

    async executeCommand(command: string, args: string[], options: cp.SpawnOptions = { shell: true }): Promise<string> {
        return new Promise((resolve: (res: string) => void, reject: (error: string | Buffer) => void): void => {
            let result: string = "";

            const childProc: cp.ChildProcess = cp.spawn(command, args, { ...options });

            childProc.stdout.on("data", (data: string | Buffer) => {
                data = data.toString();
                dlToolkitChannel.append(data);
                result = result.concat(data);
                dlToolkitChannel.appendLine(`childProc.stdout.on ${result}`);
            });

            //childProc.stderr.on("data", (data: string | Buffer) => {reject(`Exited with error ${data}`)});

            childProc.on("error", (data: string | Buffer) => { reject(`Exited with error ${data}`) });

            childProc.on("close", (code: number) => {
                if (code !== 0) {
                    reject(`Exited with error ${code}`);
                } else {
                    resolve(result);
                }
            });
        });
    }
    async executeCommandWithProgress(doneMessage: string, message: string, command: string, args: string[], options: cp.SpawnOptions = { shell: true }): Promise<string> {
        let result: string = "";
        await vscode.window.withProgress({ location: vscode.ProgressLocation.Notification }, async (p: vscode.Progress<{}>) => {
            return new Promise(async (resolve: (res: string) => void, reject: (e: Error) => void): Promise<void> => {
                p.report({ message });
                try {
                    result = await this.executeCommand(command, args, options);
                    p.report({ increment: 100, doneMessage }); // havent figured out how to show the final message yet 
                    resolve(result);
                } catch (e) {
                    reject(e);
                }
            });
        });
        return result;
    }

    public async getImageId(): Promise<string | undefined> {
        let imageID: string | undefined;
        if (utils.g_containerType === "linux") {
            imageID = await this.executeCommand("docker", ['images', "chanchala7/mlperf_linux1:latest", '--format', '"{{.Repository}}"']);
            if (!imageID || 0 === imageID.length) { // image doesnt exist
                await this.executeCommand("docker", ["pull", "chanchala7/my_ubuntu:firsttry"]).then(async () => {
                    imageID = await this.executeCommand("docker", ['images', "chanchala7/my_ubuntu", '--format', '"{{.Repository}}"']);
                    dlToolkitChannel.appendLine(`imageID: ${imageID}`);
                }, reason => {
                    dlToolkitChannel.appendLine("Docker pull failed");
                });
            }
        }
        else if (utils.g_containerType === "windows") {
            imageID = await this.executeCommand("docker", ['images', `${docker_images["windows-mlperf"]["name"]}`, '--format', '"{{.Repository}}"']);
            if (!imageID || 0 === imageID.length) { // image doesnt exist
                await this.executeCommand("docker", ["pull", `${docker_images["windows-mlperf"]["name"]}`]).then(async () => {
                    imageID = await this.executeCommand("docker", ['images', "chanchala7/my_ubuntu", '--format', '"{{.Repository}}"']);
                    dlToolkitChannel.appendLine(`imageID: ${imageID}`);
                }, reason => {
                    dlToolkitChannel.appendLine("Docker pull failed");
                });
            }
        }
        this._imageId = imageID;
        dlToolkitChannel.appendLine(`Returning: ${imageID}`);
        return imageID;
    }

    public async runImage(): Promise<string | undefined> {
        let runningContainer: string | undefined;
        if (this._imageId && this._workspace) {
            let userWorkspaceMount: string = `source=${utils.g_hostLocation},target=${utils.g_mountLocation},type=bind`;
            let extensionMount: string = `source=${utils.g_hostOutputLocation},target=${utils.g_mountOutputLocation},type=bind`;
            let args: string[] = ['run', '-m', '8g', '-t', '-d', '--mount', userWorkspaceMount, '--mount', extensionMount, this._imageId];
            runningContainer = await this.executeCommandWithProgress("Your development environment is ready!", "Starting your development environment...", "docker", args);
            this._containerIds.push(runningContainer.substr(0, 12));
            dlToolkitChannel.appendLine(`Container id: ${this._containerIds[0]}`);
        }
        return runningContainer;

    }

    //TODO: Added default opset value in case user does not enter a value. Default is currently 8, we can add more default value
    //public async convert(inputNode: string, outputNode: string, opset: string = '8', fileuri: vscode.Uri, ...args: any[]): Promise<string | undefined> {
    public async convert(convertParams: Map<string,string>): Promise<string | undefined> {
        if (!this._workspace) {
            dlToolkitChannel.appendLine(`No workspace defined`);
            return undefined;
        }
        let modelToConvert : string | undefined = convertParams.get("input");
        if (!modelToConvert) {
            dlToolkitChannel.appendLine(`No input model provided`);
            return undefined;
        }

        let args: string[] = ['exec', '-w', `${utils.getLocationOnContainer(path.dirname(modelToConvert))}`, `${this._containerIds[0]}`, 'python3', '-m', 'tf2onnx.convert',];
        for (var [key, value] of convertParams) {
            if (value) { // value is not undefined
                if (key === 'input') {
                    args.push(`--${key}`);
                    args.push(utils.getLocationOnContainer(value));
                    dlToolkitChannel.appendLine(`Location on container: ${utils.getLocationOnContainer(value)}`)
                }
                else {
                    args.push(`--${key}`);
                    args.push(value);
                }
            }
        }

        args.push("--output");
        args.push(`${path.basename(modelToConvert).replace(".pb", ".onnx")}`);

        // if no inputs/outputs/opsets are defined, look up the supported models' inputs/outputs and default to opset 8
        if (convertParams.get("inputs") === undefined || convertParams.get("outputs") === undefined || convertParams.get("opset") === undefined)
        { // if only one is defined?
            args.push("--opset");
            args.push("8");
            if (path.basename(modelToConvert).toLowerCase().includes("resnet")) {
                args.push("--inputs");
                args.push(`${supported_models["resnet50"]["inputs"]}`);
                args.push("--outputs");
                args.push(`${supported_models["resnet50"]["outputs"]}`);
                args.push("--inputs-as-nchw");
                args.push(`${supported_models["resnet50"]["inputs"]}`);
            }
            else if (path.basename(modelToConvert).toLowerCase().includes("mobilenet")) {
                args.push("--inputs");
                args.push(`${supported_models["mobilenet"]["inputs"]}`);
                args.push("--outputs");
                args.push(`${supported_models["mobilenet"]["outputs"]}`);
                args.push("--inputs-as-nchw");
                args.push(`${supported_models["mobilenet"]["inputs"]}`);
            }
            else {
                dlToolkitChannel.appendLine("This model is not part of the supported models!");
                return undefined;
            }
        }

        dlToolkitChannel.appendLine(`Convert params ${args}`);
        return await this.executeCommandWithProgress("Finished converting", "Converting to ONNX...", "docker", args);
        }

    public async summarizeGraph(fileuri: string) : Promise<string|undefined> {
        if (!this._workspace) {
            dlToolkitChannel.appendLine(`No workspace defined`);
            return undefined;
        }
        let args: string[] = ['exec', `${tensorflow_binaries[utils.g_containerType]["summarize"]}`, '--in_graph', `${utils.getLocationOnContainer(fileuri)}`];
        return await this.executeCommand("docker", args);
    }


    public async quantizeModel(quantizeParam: Map<string, string>): Promise<string | undefined> {
        if (!this._workspace) {
            dlToolkitChannel.appendLine(`No workspace defined`);
            return undefined;
        }
        let model: string | undefined = quantizeParam.get("model");
        if (model)
        {
            let fileExt = model.split('.').pop();
            if (fileExt === 'pb') // tensorflow quantization to follow
            {
                return this.quantizeTFModel(quantizeParam);
            }
            else if (fileExt === 'onnx') // onnx quantization to follow
            {
                return this.quantizeONNXModel(quantizeParam);
            }
            else
            {
                dlToolkitChannel.appendLine("This model is not supported for quantization!");
                return "This model is not supported for quantization!";
            }
        }
        else {
            dlToolkitChannel.appendLine("Model not found!");
            return "Model not found!";
        }

    }

    public async quantizeONNXModel(quantizeParam: Map<string, string>): Promise<string | undefined> {
        if (!this._workspace) {
            dlToolkitChannel.appendLine(`No workspace defined`);
            return undefined;
        }
        let model: string | undefined = quantizeParam.get("model");
        if (model){
            let args: string[] = ['exec', '-w', `${utils.getScriptsLocationOnContainer()}`, `${this._containerIds[0]}`, 'python3', 'calibrate.py', 
                                  '--model_path='+`${utils.getLocationOnContainer(quantizeParam.get("model"))}`, 
                                  '--dataset_path='+`${utils.getLocationOnContainer(quantizeParam.get("dataset"))}` ];
                dlToolkitChannel.appendLine(`Quantize params ${args}`);
                return await this.executeCommandWithProgress("Quantization done", "Quantizing ONNX FP32 model to ONNX int8 model... ", "docker", args);
        }
        else {
            dlToolkitChannel.appendLine("Model not found!");
            return "Model not found!";
        }
    }
    
    public async quantizeTFModel(quantizeParam: Map<string, string>): Promise<string | undefined> {
        if (!this._workspace) {
            dlToolkitChannel.appendLine(`No workspace defined`);
            return undefined;
        }
        let model: string | undefined = quantizeParam.get("model");
        if (model){
            if (model.toLowerCase().includes("resnet")) {
                model = "resnet50";
            }
            else if (model.toLowerCase().includes("mobilenet")) {
                model = "mobilenet";
            }
            else {
                dlToolkitChannel.appendLine("This model is not part of the supported models!");
                return undefined;
            }
            let args: string[] = ['exec', '-w', `${utils.getLocationOnContainer(path.dirname(model))}`, `${this._containerIds[0]}`, `${tensorflow_binaries[utils.g_containerType]["transform"]}`,
                    '--in_graph=', `${path.basename(model)}`, '--out_graph=', `${path.basename(model).replace(".pb", "_quantized.pb")}`,
                    '--inputs=', `${supported_models[model]["inputs"]}`, '--outputs=', `${supported_models[model]["outputs"]}`, '--transforms=', `${tensorflow_quantization_options}`];
            dlToolkitChannel.appendLine(`Quantize params ${args}`);
                return await this.executeCommandWithProgress("Quantization done", "Quantizing TF FP32 model to TF int8 model... ", "docker", args);
        }
        else {
            dlToolkitChannel.appendLine("Model not found!");
            return "Model not found!";
        }
    }

    dockerDisplay(modeluri: vscode.Uri) {
        //let netronCP = cp.spawn('C:\\Program Files\\Netron\\Netron.exe', [`${modeluri.fsPath}`], { env: [] });
        let netronCP = cp.spawn('C:\\Program Files\\Netron\\Netron.exe', [`${modeluri.fsPath}`]);
        netronCP.on('error', (err: any) => {
            dlToolkitChannel.appendLine(`Failed to start the container with ${err}`);
        });

        netronCP.stdout.on('data', (data: string) => {
            dlToolkitChannel.appendLine(`container id is ${data.toString()}`);
            this._containerIds.push(data.toString().substr(0, 12));
        });

        netronCP.on('exit', (err: any) => {
            if (err != 0) {

                dlToolkitChannel.appendLine(`Exit with error code:  ${err}`);

            }
        })
    }

    public async validation(mlperfParams: Map<string, string>): Promise<string | undefined> { // Check this
        if (this._workspace) {
            let args: string[] = ['exec', '-w', `${utils.getMLPerfLocation()}`, `${this._containerIds[0]}`, 'python3', `${utils.getMLPerfDriver()}`,];
            for (var [key, value] of mlperfParams) {
                if (key === 'dataset-path' || key === 'model') {
                    args.push(`--${key}`);
                    args.push(utils.getLocationOnContainer(value));
                    dlToolkitChannel.appendLine(`Location on container: ${utils.getLocationOnContainer(value)}`)
                }
                else {
                    args.push(`--${key}`);
                    args.push(value);
                }

            }
            args.push("--accuracy");
            args.push("--output");

            if (utils.g_containerType === 'linux') {
                args.push(`${utils.g_mountOutputLocation}/MLPerf/`);
            }
            else {
                args.push(`${utils.g_mountOutputLocation}\\MLPerf`);
            }

            dlToolkitChannel.appendLine(`MLPerf args ${args}`);
            return await this.executeCommandWithProgress("Finished Validation", "Validating model with MLPerf... ", "docker", args);
        }


    }
    // This function can be removed.
    dockerRunMLPerfValidation(model: string, result: string, backend: string, profile: string, dataFormat: string, count: number, dataset: string, currentPanel: vscode.WebviewPanel | undefined) {
        if (this._workspace) {
            let temp = this._workspace.uri.fsPath + "\\";


            let exec = cp.spawn('docker', ['exec', '-w', `${utils.getMLPerfLocation()}`, `this._containerIds[0]`, 'python3', `${utils.getMLPerfDriver()}`,
                '--profile', `${profile}`, '--backend', `${backend}`, '--model', `${model}`, '--dataset-path', `${dataset}`,
                '--output', `/Vscode/${result}`, '--data-format', `${dataFormat}`, '--accuracy',
                '--count', `${count}`]);

            exec.on('error', (err) => {
                dlToolkitChannel.appendLine('Running validation failed.');
            });
            exec.stdout.on('data', (data: string) => {
                dlToolkitChannel.appendLine("Running validation...");

            });
            exec.on('exit', (err: any) => {
                if (err != 0) {
                    vscode.window.showInformationMessage("Running validation failed");
                    dlToolkitChannel.appendLine(`Exit with error code:  ${err}`);
                }
                else {
                    vscode.window.showInformationMessage("Validation done!");
                    dlToolkitChannel.appendLine("Validation done!");
                    let result_file = path.join(os.tmpdir(), "result.json");

                    if (currentPanel !== undefined) {
                        currentPanel.webview.postMessage({ command: 'result', payload: "DONE" });
                    }
                    if (fs.existsSync(result_file)) {
                        fs.readFile(result_file, (err, data) => {
                            if (err || data === undefined) {
                                dlToolkitChannel.appendLine('Error reading data file.');
                            } else {
                                let results = JSON.parse(data.toString());
                                try {
                                    // Be mindful that the new object created in the lambda *has* to be enclosed in brackets
                                    let forGrid: any = Object.entries(results).map(kv => ({
                                        "input": kv[0],
                                        "actual": (<any>kv[1])["actual"],
                                        "expected": (<any>kv[1])["expected"]
                                    }));
                                    dlToolkitChannel.appendLine("Results parsing worked");
                                    if (currentPanel !== undefined) {
                                        currentPanel.webview.postMessage({ command: 'result', payload: forGrid });
                                    }
                                } catch {
                                    dlToolkitChannel.appendLine("Likely pulling from array didn't work.");
                                }
                            }
                        });
                    } else {
                        dlToolkitChannel.appendLine(`Couldn't find: ${result_file} on disk.`);
                    }

                    const perfDataPath: string = path.join(os.tmpdir(), "profile.json");
                    if (fs.existsSync(perfDataPath)) {
                        fs.readFile(perfDataPath, (err, data) => {
                            if (err || data === undefined) {
                                dlToolkitChannel.appendLine('Error reading data file.');
                            } else {
                                let perfData = JSON.parse(data.toString());
                                try {
                                    let forChart: any = Array.from(perfData).filter(rec => { return ((<any>rec)["cat"] === "Node"); })
                                        .map(rec => ({
                                            "name": `${(<any>rec)["name"] / (<any>rec)["args"]["op_name"]}`,
                                            "dur": (<any>rec)["dur"]
                                        }));
                                    dlToolkitChannel.appendLine('Should be sending perfdata');
                                    if (currentPanel !== undefined) {
                                        currentPanel.webview.postMessage({ command: 'perfData', payload: forChart });
                                    }
                                    vscode.window.showInformationMessage("Apparently parsed the data!");
                                } catch {
                                    dlToolkitChannel.appendLine("Likely couldn't pull the result.");
                                }
                            }
                        });
                    } else {
                        dlToolkitChannel.appendLine(`Couldn't find: ${perfDataPath} on disk.`);
                    }


                }
            });
        }
    }

    public dispose(): void {
        this.executeCommand("docker", ["stop", `${this._containerIds[0]}`]);
    }
}
