import React, { Component } from 'react';

import './Loader.css';

export default class Loader extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    render() {
        return (
            <div className='container-loader'>
                <div className='loader'></div>
            </div>
        );
    }
}

