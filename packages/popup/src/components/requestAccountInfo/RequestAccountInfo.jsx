import React from 'react'
import Utils from '@pegasus/utils/utils'

const RequestAccountInfo = props => {
  return (
    <div className="row">
      <div className="col-4">
        <img
          className="border-radius-50 box-shadow cursor-pointer"
          src={`./material/profiles/${
            props.account.avatar ? props.account.avatar : 1
          }.svg`}
          height="30"
          width="30"
          alt="avatar logo"
          onClick={() => props.onChangeAccount()}
        />
      </div>
      <div className="col-4 text-center my-auto text-xs font-weight-bold">
        {Utils.showAddress(
          Utils.checksummed(
            props.account.data[props.network.type].latestAddress
          ),
          4,
          6
        )}
      </div>
      <div className="col-4 text-right my-auto text-xs">
        {props.account.name}
      </div>
    </div>
  )
}

export default RequestAccountInfo
