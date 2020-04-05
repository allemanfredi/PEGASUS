import React from 'react'
import Spinner from '../spinner/Spinner'

const Loader = props => {
  return (
    <div className="container-loader">
      <div className="row mt-15">
        <div className="col-12 text-center">
          <img
            className="border-radius-50"
            src="./material/logo/pegasus-256.png"
            height="130"
            width="130"
            alt="pegasus logo"
          />
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-12 mt-4 text-center">
          <Spinner size="big" />
        </div>
      </div>
    </div>
  )
}

export default Loader
