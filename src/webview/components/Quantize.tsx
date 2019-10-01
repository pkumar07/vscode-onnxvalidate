import React, { Component } from 'react';
import Header from './Header';
import { Stack, TextField, PrimaryButton, Label, Toggle, ILabelStyles,IToggleStyles } from "office-ui-fabric-react";
import { QuantizeInputParams } from './QuantizeHelper';

interface IState {
  
    showFields:boolean |undefined
}

interface IQuantizeProps {
    inputProps:QuantizeInputParams;

    PathToRepresentativeData:(event: React.MouseEvent<HTMLButtonElement>)=>void
    startQuantization: (event: React.MouseEvent<HTMLButtonElement>) => void
    cancelQuantization: (event: React.MouseEvent<HTMLButtonElement>) => void
}


class Quantize extends Component<IQuantizeProps,IState>  {
 state:IState={
   showFields:false
};
    constructor(props: IQuantizeProps) {
        super(props)
            
    }
    
    
  

    render() {
      
        let { representativeDataPath } = this.props.inputProps;
        let {showFields}=this.state;
        return (
            <div>
                <Stack>
                    <Stack.Item >
                        <Header name={"Quantization Input Parameters"} />
                    </Stack.Item>
                </Stack>
                <Stack tokens={tokens.numericalSpacing}>
                 
                   
                       <Toggle styles={tStyles} label="Quantize with representative data?" inlineLabel checked={showFields} onChange={this._toggleShowFields} />  
                    {showFields && (
                        <>
                            <Stack horizontal gap={7}>

                                <Stack.Item grow>
                                    <Label styles={labelStyles}>Path To Representative Data </Label>
                                    <TextField placeholder="Enter path to data" value={representativeDataPath} />
                                </Stack.Item>
                                <Stack.Item align="end" >
                                    <PrimaryButton style={{ width: '200px' }} onClick={this.props.PathToRepresentativeData} >Select Path to data</PrimaryButton>
                                </Stack.Item>

                            </Stack>
                        </>
                    )}
                    <Stack horizontal tokens={tokens.customSpacing} padding="s1 35%">
                        <Stack.Item>
                            <PrimaryButton style={{ width: '200px' }} onClick={this.props.startQuantization}>Start Quantization</PrimaryButton>

                        </Stack.Item>
                        <Stack.Item >

                            <PrimaryButton style={{ width: '200px' }} onClick={this.props.cancelQuantization}>Cancel</PrimaryButton>
                        </Stack.Item>
                    </Stack>
                </Stack>
            </div>
        );
    }
     _toggleShowFields = (ev: React.MouseEvent<HTMLElement>,checked:boolean| undefined) => {
        
        console.log(checked);
        this.setState({showFields:checked});
      
        console.log(this.state.showFields);
        console.log('toggle is ' + (checked ? 'checked' : 'not checked'));
     };
}
const tokens = {
    numericalSpacing: {
        childrenGap: 10
    },
    customSpacing: {
        childrenGap: '10'
    },
};

const labelStyles: Partial<ILabelStyles > = {
    
    root: {
        textAlign:'start',
        color:'white'


    }
};
    const tStyles : Partial<IToggleStyles > = {
      label:{
          color:'white'
      }
       
};


export default Quantize;
