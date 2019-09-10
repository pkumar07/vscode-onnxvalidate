import React from 'react';
import '../css/index.css';

interface HeaderName {
    name: string,
}

const Header: React.FunctionComponent<HeaderName> = (props) => {
    return (
        <div className="container-header">
            {props.name}
        </div>
    );
};

export default Header;