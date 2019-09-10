import React from 'react';
import ReactDOM from 'react-dom';
import OnnxValidateInput from './components/OnnxValidateInput'
import OnnxDisplayResult from './components/OnnxDisplayResult'
import './css/index.css';

const App: React.SFC = () => {

    return (
        <div className="container">
            <OnnxValidateInput />
            <OnnxDisplayResult />
        </div>
    )
};

ReactDOM.render(<App />, document.getElementById('root'));
