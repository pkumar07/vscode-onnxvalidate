import React from 'react';
import { Stack, IStackStyles, IStackTokens, PrimaryButton, mergeStyles, mergeStyleSets, DefaultPalette, ScrollablePane } from 'office-ui-fabric-react';
import { Result } from './Result'
import Header from './Header';
import myData from '../../test/data/results.json'

function roundFloatValue(num: number) {
    return (Math.round(num * 100) / 100).toFixed(2);
}

export const OnnxDisplayResult: React.FunctionComponent = () => {
    var result_instance = new Result().deserialize(myData);

    return (
        <div>
        <Stack verticalFill gap='10'>
            <Stack.Item>
                <Header name={"ONNX Validation Results"} />
            </Stack.Item>

            <Stack.Item>
                <Stack styles={stackStyles} tokens={customSpacingStackTokens} >

                    <Stack horizontal gap='5'>
                        <Stack.Item grow className={stackItemLabelStyles}>Accuracy</Stack.Item>
                        <Stack.Item className={stackItemValueStyles}>{result_instance["TestScenario.SingleStream"].accuracy}</Stack.Item>
                    </Stack>

                    <Stack horizontal gap='5'>
                        <Stack.Item grow className={stackItemLabelStyles}>Good Items</Stack.Item>
                        <Stack.Item className={stackItemValueStyles}>{result_instance["TestScenario.SingleStream"].good_items}</Stack.Item>
                    </Stack>

                    <Stack horizontal gap='5'>
                        <Stack.Item grow className={stackItemLabelStyles}>Count</Stack.Item>
                        <Stack.Item className={stackItemValueStyles}>{result_instance["TestScenario.SingleStream"].count}</Stack.Item>
                    </Stack>

                    <Stack horizontal gap='5'>
                        <Stack.Item grow className={stackItemLabelStyles}>QPS</Stack.Item>
                        <Stack.Item className={stackItemValueStyles}>{roundFloatValue(result_instance["TestScenario.SingleStream"].qps)}</Stack.Item>
                    </Stack>

                    <Stack horizontal gap='5'>
                        <Stack.Item grow className={stackItemLabelStyles}>Total execution time</Stack.Item>
                        <Stack.Item className={stackItemValueStyles}>{result_instance.time}</Stack.Item>
                    </Stack>

                    <Stack horizontal gap='5'>
                        <Stack.Item grow className={stackItemLabelStyles}>Command</Stack.Item>
                        <Stack.Item className={stackItemValueStyles}>
                            <div className={classNames.wrapper}>
                                <ScrollablePane styles={{ root: classNames.pane }}>
                                    <div className={classNames.textContent}>{result_instance.cmdline}</div>
                                </ScrollablePane>
                            </div>
                        </Stack.Item>
                    </Stack>
                </Stack>
            </Stack.Item>

            <Stack.Item>
                <PrimaryButton style={{ width: '200px', display: 'flex' }}>Download Test Result</PrimaryButton>
            </Stack.Item>

        </Stack>

    </div>
    );
}

const stackStyles: IStackStyles = {
    root: {
        background: DefaultPalette.neutralLight,
        width: 'auto',
        padding: '5px'
    }
};

const stackItemLabelStyles = mergeStyles({
    alignItems: 'center',
    background: DefaultPalette.themeDarker,
    color: DefaultPalette.white,
    display: 'flex',
    height: 50,
    justifyContent: 'center',
    width: '20%'
});

const stackItemValueStyles = mergeStyles({
    alignItems: 'center',
    background: DefaultPalette.themeDark,
    color: DefaultPalette.white,
    display: 'flex',
    height: 50,
    justifyContent: 'center',
    width: '80%'
});

const classNames = mergeStyleSets({
    wrapper: {
        height: 'inherit',
        position: 'relative',
        maxHeight: 'inherit',
        width: '100%'
    },
    pane: {
        border: '1px solid'
    },
    textContent: {
        padding: '5px 5px'
    }
});

const customSpacingStackTokens: IStackTokens = {
    childrenGap: '10',
};

export default OnnxDisplayResult;