import React from 'react';
import ReactDOM from 'react-dom';
import { OnnxValidateInput } from './components/OnnxValidateInput'

const App: React.SFC = () => {

    return (
        <OnnxValidateInput />
    );
};

ReactDOM.render(<App />, document.getElementById('root'));
