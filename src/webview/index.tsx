import React from 'react';
import ReactDOM from 'react-dom';
import Header from './components/Header'
import OnnxValidateInput from './components/OnnxValidateInput'
import OnnxDisplayResult from './components/OnnxDisplayResult'

const App: React.SFC = () => {

    return (
        <div>
            <Header />
            {/* <OnnxValidateInput /> */}
            <OnnxDisplayResult />
        </div>
    )
};

ReactDOM.render(<App />, document.getElementById('root'));
