import React from 'react';
import { Stack, TextField, PrimaryButton } from "office-ui-fabric-react";
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

declare var acquireVsCodeApi: any;
const vscode = acquireVsCodeApi();

export const OnnxValidateInput: React.SFC = () => {
    const divStyle = {
        height: '600px', width: '800px'
    };

    const tokens = {

        numericalSpacing: {
            childrenGap: 10
        },
        customSpacing: {
            childrenGap: '10'
        },
    };

    const state = {
        columnDefs: [
            { headerName: 'Inputs', field: 'input' },
            { headerName: 'Actual', field: 'actual' },
            { headerName: 'Predicted', field: 'expected' },
        ],
        rowData: [{ "input": "Toyota", "actual": "Celica", "expected": 35000 },
        { "input": "Ford", "actual": "Mondeo", "expected": 32000 },
        { "input": "Porsche", "actual": "Boxter", "expected": 72000 },
        { "input": "Toyota", "actual": "Celica", "expected": 35000 },
        { "input": "Ford", "actual": "Mondeo", "expected": 32000 },
        { "input": "Porsche", "actual": "Boxter", "expected": 72000 },
        { "input": "Toyota", "actual": "Celica", "expected": 35000 },
        { "input": "Ford", "actual": "Mondeo", "expected": 32000 },
        { "input": "Porsche", "actual": "Boxter", "expected": 72000 },
        { "input": "Toyota", "actual": "Celica", "expected": 35000 },
        ],
        barData : [
            {'name': 'Convolution28_fence_before/Conv', 'dur': 6},
            {'name': 'Convolution28_kernel_time/Conv', 'dur': 1702},
            {'name': 'Convolution28_fence_after/Conv', 'dur': 3},
            {'name': 'Plus30_fence_before/Add', 'dur': 3},
            {'name': 'Plus30_kernel_time/Add', 'dur': 24},
            {'name': 'Plus30_fence_after/Add', 'dur': 2},
            {'name': 'ReLU32_fence_before/Relu', 'dur': 3},
            {'name': 'ReLU32_kernel_time/Relu', 'dur': 9},
            {'name': 'ReLU32_fence_after/Relu', 'dur': 2},
            {'name': 'Pooling66_fence_before/MaxPool', 'dur': 2},
            {'name': 'Pooling66_kernel_time/MaxPool', 'dur': 31},
            {'name': 'Pooling66_fence_after/MaxPool', 'dur': 2},
            {'name': 'Convolution110_fence_before/Conv', 'dur': 3},
            {'name': 'Convolution110_kernel_time/Conv', 'dur': 123},
            {'name': 'Convolution110_fence_after/Conv', 'dur': 2},
            {'name': 'Plus112_fence_before/Add', 'dur': 2},
            {'name': 'Plus112_kernel_time/Add', 'dur': 13},
            {'name': 'Plus112_fence_after/Add', 'dur': 2},
            {'name': 'ReLU114_fence_before/Relu', 'dur': 2},
            {'name': 'ReLU114_kernel_time/Relu', 'dur': 6},
            {'name': 'ReLU114_fence_after/Relu', 'dur': 2},
            {'name': 'Pooling160_fence_before/MaxPool', 'dur': 2},
            {'name': 'Pooling160_kernel_time/MaxPool', 'dur': 16},
            {'name': 'Pooling160_fence_after/MaxPool', 'dur': 2},
            {'name': 'Times212_reshape0_fence_before/Reshape', 'dur': 3},
            {'name': 'Times212_reshape0_kernel_time/Reshape', 'dur': 4},
            {'name': 'Times212_reshape0_fence_after/Reshape', 'dur': 2},
            {'name': 'Times212_reshape1_fence_before/Reshape', 'dur': 2},
            {'name': 'Times212_reshape1_kernel_time/Reshape', 'dur': 3},
            {'name': 'Times212_reshape1_fence_after/Reshape', 'dur': 2},
            {'name': 'Times212_fence_before/MatMul', 'dur': 2},
            {'name': 'Times212_kernel_time/MatMul', 'dur': 13},
            {'name': 'Times212_fence_after/MatMul', 'dur': 2},
            {'name': 'Plus214_fence_before/Add', 'dur': 2},
            {'name': 'Plus214_kernel_time/Add', 'dur': 19},
            {'name': 'Plus214_fence_after/Add', 'dur': 2}
        ]
    };

    const [count, setCount] = React.useState(0);
    const [inputFile, setInputFile] = React.useState("");
    const [outputFile, setOutputFile] = React.useState("");
    const [result, setResult] = React.useState([]);
    const [perfData, setPerfData] = React.useState(false);

    React.useEffect(() => {
        window.addEventListener('message', (ev) => {
            switch (ev.data.command) {
                case "inputFile": {
                    console.log(`Got a message from the host ${ev.data}`);
                    setInputFile(ev.data.payload);
                    break;
                }
                case "outputFile": {
                    console.log(`Got a message from the host ${ev.data}`);
                    setOutputFile(ev.data.payload);
                    break;
                }
                case "result": {
                    console.log(`Got a message from the host ${ev.data}, of type: ${typeof (ev.data)}.`);
                    try {
                        //console.log(`Got object that looks like: ${ev.data}.`);
                        //let table : Array<any> = Array.from(ev.data.payload);
                        //console.log(`Found ${table.length} records in data.`);
                        setResult(ev.data.payload);
                    } catch {
                        console.log("Couldn't display keys to the element");
                    }
                    break;
                }
                case "perfData" : {
                    console.log("Got data on performance");
                    setPerfData(true);
                }
            }
        });
    }, []);

    let clickHandler = () => {
        window.console.log(`Curious to see where ${count} value is.`);
        vscode.postMessage({
            command: 'startVerification',
            text: 'check out from host'
        });
        window.console.log(`Sent message to host.`);

    };
    let inputHandler = () => {
        window.console.log("Select test input");
        vscode.postMessage({
            command: 'setInputFile',
            text: 'Select test input'
        });
        window.console.log(`Sent message to host.`);

    };
    let outputHandler = () => {
        window.console.log("Select reference output");
        vscode.postMessage({
            command: 'setOutputFile',
            text: 'Select reference output'
        });
        window.console.log(`Sent message to host.`);

    };

    let cancelHandler = () => {
        window.console.log("Select reference output");
        vscode.postMessage({
            command: 'cancel',
            text: 'Cancel'
        });
        window.console.log(`Sent message to host.`);

    };

    return (

        <div>
            <Stack tokens={tokens.numericalSpacing}>
                <Stack horizontal gap={3} >
                    <Stack.Item grow >
                        <span>Enter directory containing inputs</span>
                        <TextField value={`${inputFile}`} placeholder="Inputs..." />
                    </Stack.Item>
                    <Stack.Item align="end" >
                        <PrimaryButton style={{ width: '200px' }} onClick={inputHandler}>Select Test Input</PrimaryButton>
                    </Stack.Item>

                </Stack>

                <Stack horizontal gap={3}>
                    <Stack.Item grow >
                        <span>Enter file containing validation</span>
                        <TextField value={`${outputFile}`} placeholder="Reference outputs..." />
                    </Stack.Item>

                    <Stack.Item align="end" >
                        <PrimaryButton style={{ width: '200px' }} onClick={outputHandler}>Select Reference Output</PrimaryButton>
                    </Stack.Item>
                </Stack>

                <Stack horizontal tokens={tokens.customSpacing} padding="s1 35%">
                    <Stack.Item>
                        <PrimaryButton style={{ width: '200px' }} onClick={clickHandler}>Start Verification</PrimaryButton>
                    </Stack.Item>
                    <Stack.Item >
                        <PrimaryButton style={{ width: '200px' }} onClick={cancelHandler}>Cancel</PrimaryButton>
                    </Stack.Item>
                </Stack>

                <Stack>
                    <Stack.Item>
                        <span hidden={result.length === 0}>Validation Result</span>
                        <div className="ag-theme-balham" style={{ height: '600px', width: '600px' }} hidden={result.length === 0}>
                            <AgGridReact columnDefs={state.columnDefs} rowData={result}></AgGridReact>
                        </div>
                    </Stack.Item>
                </Stack>

                <Stack>
                    <Stack.Item align="center">
                        <span hidden={!perfData}>
                        <BarChart data={state.barData} width={1200} height={500} >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{fill: "#fff"}} />
                            <YAxis tick={{fill: "#fff"}} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="dur" fill="#8884d8" />
                        </BarChart>
                        </span>
                    </Stack.Item>
                </Stack>
            </Stack>
        </div>
    );
}