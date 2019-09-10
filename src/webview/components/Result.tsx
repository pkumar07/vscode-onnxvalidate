//This file contains the type definition for Result.json file
interface Serializable<T> {
    deserialize(input: Object): T;
}

class Percentiles implements Serializable<Percentiles> {
    "50.0": number;
    "80.0": number;
    "90.0": number;
    "95.0": number;
    "99.0": number;
    "99.9": number;

    deserialize(input: any) {
        this["50.0"] = input["50.0"];
        this["80.0"] = input["80.0"];
        this["90.0"] = input["90.0"];
        this["95.0"] = input["95.0"];
        this["99.0"] = input["99.0"];
        this["99.9"] = input["99.9"];
        return this;
    }
}

class TestScenarioSingleStream implements Serializable<TestScenarioSingleStream>{
    "accuracy": number;
    "count": number;
    "good_items": number;
    "mean": number;
    "percentiles": Percentiles;
    "qps": number;
    "took": number;
    "total_items": number;

    deserialize(input: any) {
        this.accuracy = input.accuracy;
        this.count = input.count;
        this.good_items = input.good_items;
        this.mean = input.mean;
        this.percentiles = new Percentiles().deserialize(input.percentiles);
        this.qps = input.qps;
        this.took = input.took;
        this.total_items = input.total_items;
        return this;
    }
}

export class Result implements Serializable<Result>{

    "TestScenario.SingleStream": TestScenarioSingleStream;
    "cmdline": string;
    "runtime": string;
    "time": number;
    "version": string;

    deserialize(input: any) {
        this["TestScenario.SingleStream"] = new TestScenarioSingleStream().deserialize(input["TestScenario.SingleStream"]);
        this.cmdline = input.cmdline;
        this.runtime = input.runtime;
        this.time = input.time;
        this.version = input.version;
        return this;
    }

}
