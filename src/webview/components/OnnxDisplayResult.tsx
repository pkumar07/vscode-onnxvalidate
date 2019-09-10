import React from 'react';
import { Stack, IStackStyles, IStackTokens, mergeStyles, mergeStyleSets, DefaultPalette, Fabric, ScrollablePane } from 'office-ui-fabric-react';
import { Result } from './Result'
import myData from '../../test/data/results.json'

function roundFloatValue(num: number) {
    return (Math.round(num * 100) / 100).toFixed(2);
}

const OnnxDisplayResult: React.SFC = () => {
    var result_instance = new Result().deserialize(myData);

    return (
        <div>
            <div>Test Results</div>
            <Stack styles={stackStyles} tokens={customSpacingStackTokens} >

                <Stack horizontal gap='10'>
                    <Stack.Item className={stackItemLabelStyles}>Accuracy</Stack.Item>
                    <Stack.Item className={stackItemValueStyles}>{result_instance["TestScenario.SingleStream"].accuracy}</Stack.Item>
                </Stack>

                <Stack horizontal gap='10'>
                    <Stack.Item className={stackItemLabelStyles}>Good Items</Stack.Item>
                    <Stack.Item className={stackItemValueStyles}>{result_instance["TestScenario.SingleStream"].good_items}</Stack.Item>
                </Stack>

                <Stack horizontal gap='10'>
                    <Stack.Item className={stackItemLabelStyles}>Count</Stack.Item>
                    <Stack.Item className={stackItemValueStyles}>{result_instance["TestScenario.SingleStream"].count}</Stack.Item>
                </Stack>

                <Stack horizontal gap='10'>
                    <Stack.Item className={stackItemLabelStyles}>QPS</Stack.Item>
                    <Stack.Item className={stackItemValueStyles}>{roundFloatValue(result_instance["TestScenario.SingleStream"].qps)}</Stack.Item>
                </Stack>

                <Stack horizontal gap='10'>
                    <Stack.Item className={stackItemLabelStyles}>Total execution time</Stack.Item>
                    <Stack.Item className={stackItemValueStyles}>{result_instance.time}</Stack.Item>
                </Stack>

                <Stack horizontal gap='10'>
                    <Stack.Item className={stackItemLabelStyles}>Command</Stack.Item>
                    <Stack.Item className={stackItemValueStyles}>
                        <div className={classNames.wrapper}>
                            <ScrollablePane styles={{ root: classNames.pane }}>
                                <div className={classNames.textContent}>{result_instance.cmdline}</div>
                            </ScrollablePane>
                        </div>
                    </Stack.Item>
                </Stack>
            </Stack>
        </div>
    );
}

const stackStyles: IStackStyles = {
    root: {
        background: DefaultPalette.themeTertiary,
        width: '80%'

    }
};
const stackItemLabelStyles = mergeStyles({
    alignItems: 'center',
    background: DefaultPalette.themePrimary,
    color: DefaultPalette.white,
    display: 'flex',
    height: 50,
    justifyContent: 'center',
    width: '20%'
});

const stackItemValueStyles = mergeStyles({
    alignItems: 'center',
    background: DefaultPalette.themePrimary,
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


// Tokens definition
const headingStackTokens: IStackTokens = { childrenGap: 10 }; //TODO

const customSpacingStackTokens: IStackTokens = {
    childrenGap: '10',
};

export default OnnxDisplayResult;