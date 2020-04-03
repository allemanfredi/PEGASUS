import React from 'react'

const RequestHeader = props => {
  return (
    <div className="row mt-1">
      <div className="col-9 text-blue font-weight-bold my-auto">
        {props.title}
      </div>
      <div className="col-3 text-right">
        <img
          className="border-radius-50"
          src="./material/logo/pegasus-64.png"
          height="50"
          width="50"
          alt="pegasus logo"
        />
      </div>
    </div>
  )
}

export default RequestHeader
