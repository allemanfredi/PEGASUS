import React, { Component } from 'react';


export default class Loader extends Component {
    constructor(props) {
        super(props);

        this.state = {

        };
    }

    render() {
        return (
            <div className='container-center-absolute'>
                <div class="lds-ring"><div></div><div></div><div></div><div></div></div>
            </div>
        );
    }
}

