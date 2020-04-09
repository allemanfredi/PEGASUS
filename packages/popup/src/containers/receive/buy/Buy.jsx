import React from 'react'
import { BUY_INFO } from '../../../texts'

const Buy = props => {
  return BUY_INFO.items.map(item => {
    return (
      <React.Fragment>
        <div
          className="row cursor-pointer"
          onClick={() => {
            window.open(
              `${item.link}${props.account.data.latestAddress}`,
              '_blank'
            )
          }}
        >
          <div className="col-3 text-center my-auto">
            <img
              src={`./material/img/${item.img}`}
              height="70"
              width="70"
              alt={`${item.img} logo`}
            />
          </div>
          <div className="col-9 mt-2 pl-1">
            <div className="row">
              <div className="col-12 text-dark-gray font-weight-bold text-md">
                {item.name}
              </div>
            </div>
            <div className="row">
              <div className="col-12 text-gray text-xs mb-1">
                {item.description}
              </div>
            </div>
          </div>
        </div>
        <hr className="mt-1" />
      </React.Fragment>
    )
  })
}

export default Buy
