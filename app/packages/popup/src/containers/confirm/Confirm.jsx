import React, { Component } from 'react';



class Confirm extends Component {
    
    constructor(props, context) {
        super(props, context);

    }


    render() {       
        return (
            <div className="container">
                
                <div className="row mt-3">
                    <div className='col-2'>
                        <img src='./material/logo/pegasus-64.png' height='30' width='30' alt='pegasus logo'/>
                    </div>
                    <div className="col-10 text-right text-blue text-md">Confirm Payment</div>
                </div>

                <hr className="mt-2 mb-2"/>

                <div className="row mt-7">
                    <div className="col-2 text-left text-xs text-blue">From</div>
                    <div className="col-10 text-right break-text">99999999999999999999999999999999999999999999999999999999999999999999999999999999</div>
                </div>

                <div className="row mt-4">
                    <div className="col-2 text-left text-xs text-blue">To</div>
                    <div className="col-10 text-right break-text"><div className="">99999999999999999999999999999999999999999999999999999999999999999999999999999999</div></div>
                </div>

                <div className="row mt-2">
                    <div className="col-12 text-center text-blue text-xs">Amount</div>
                </div>

                <div className="row mt-1">
                    <div className="col-12 text-center text-bold text-black text-md">10i</div>
                </div>

                <hr className="mt-2 mb-2"/>
                
                <div className="row ">
                    <div className="col-6">
                        <button className="btn btn-border-blue text-sm text-bold">Reject</button>
                    </div>
                    <div className="col-6">
                        <button className="btn btn-blue text-sm text-bold">Confirm</button>
                    </div>
                </div>

                <div className="row mt-2">
                    <div className="col-12 text-center text-xxs text-blue">1 transaction</div>
                </div>
            </div>
        )
    }
}

export default Confirm;