import React, { Component } from 'react';

import './Edit.css';

class Edit extends Component {

    constructor(props,context) {
        super(props,context);
        
        this.state = {
            name:'',
            isLoading : false
        }
    }

    async componentDidMount(){
        this.setState({name:this.props.account.name});
    }
    
    render() {
        return (
            <div class="modal">
                <div class="container-edit">
                    <div class="row">
                        <div class="col-2 text-center">
                            <button onClick={() => {this.props.onClose()}} type="button" class="close" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="col-10 text-center"></div>
                    </div>
                    <div class="row">
                        <div class="col-1"></div>
                        <div class="col-10">
                            <label for="inp-name" class="inp">
                                <input value={this.state.name} onChange={e => {this.setState({name:e.target.value})}} type="text" id="inp-name" placeholder="&nbsp;"/>
                                <span class="label">name</span>
                                <span class="border"></span>
                            </label>
                        </div>
                        <div class="col-1"></div>
                    </div>
                    <div class="row">
                        <div class="col-1"></div>
                        <div class="col-5 text-left">
                            <div class="btn-update">Update <span class="fa fa-check"></span></div>
                        </div>
                        <div class="col-5 text-right">
                            <div class="btn-delete">Delete profile <span class="fa fa-times"></span></div>
                        </div>
                        <div class="col-1"></div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Edit;
    