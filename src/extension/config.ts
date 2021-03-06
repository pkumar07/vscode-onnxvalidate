// Configs for the supported models
export const supported_models : { [key: string]: {inputs: string, outputs: string}} = {
    // resnet
    "resnet50": {
        "inputs": "input_tensor:0",
        "outputs" : "ArgMax:0",
    },
    // mobilenet
    "mobilenet": {
        "inputs": "input:0",
        "outputs": "MobilenetV1/Predictions/Reshape_1:0",
    },
}
// Configs for MLPerf
export const mlperf :  { [key: string]: {location: string, driver: string}} = {
    // windows container
    "windows" : {
        "location" : "C:\\inference\\v0.5\\classification_and_detection",
        "driver" : "python\\main.py"
    },
    // linux container
    "linux" : {
        "location" : "/inference/v0.5/classification_and_detection",
        "driver" : "python/main.py"
    }
}
// Configs for scripts
export const scriptsLocation: { [key: string]: {location: string}} = {
        // windows container
        "windows" : {
            "location" : "C:\\scripts",
        },
        // linux container
        "linux" : {
            "location" : "/scripts",
        }
}
// Configs for the docker container run
export const docker_images : { [key: string]: {name: string, memory: string, cpu: string}} = {
    "windows-onnxruntime": {
        "name": "onnxruntime_win:latest",
        "memory" : "",
        "cpu": ""
    },
    "linux-onnxruntime": {
        "name": "onnxruntime_linux:latest",
        "memory" : "",
        "cpu": ""
    },
    "windows-mlperf": {
        "name": "mlperf_win:latest",
        "memory" : "",
        "cpu": ""
    },
    "linux-mlperf": {
        "name": "chanchala7/mlperf_linux1:latest",
        "memory" : "",
        "cpu": ""
    },
}

// Configs for tensorflow binaries based on the docker container
export const tensorflow_binaries : { [key: string]: {transform: string, summarize: string, benchmark: string}} = {
    "linux" : {
        "transform": "/root/tensorflow/bazel-bin/tensorflow/tools/graph_transforms/transform_graph",
        "summarize": "/root/tensorflow/bazel-bin/tensorflow/tools/graph_transforms/summarize_graph",
        "benchmark" : ""
    },
    "windows" : {
        "transform": "C:\\tensorflow\\bazel-bin\\tensorflow\\tools\\graph_transforms\\transform_graph",
        "summarize": "C:\\tensorflow\\bazel-bin\\tensorflow\\tools\\graph_transforms\\summarize_graph",
        "benchmark" : ""
    }
}

export const tensorflow_quantization_options : string  =
    'add_default_attributes \
    fold_batch_norms \
    fold_old_batch_norms \
    quantize_weights \
    quantize_nodes \
    strip_unused_nodes' ;

