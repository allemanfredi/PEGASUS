import React from 'react'

const RequestsCounter = props => {
  return props.requests.length > 0 ? (
    <div className="container">
      <div className="row mt-05">
        <div className="col-12 text-xxs text-center text-blue">
          {props.requests.length} requests
        </div>
      </div>
    </div>
  ) : null
}

export default RequestsCounter
