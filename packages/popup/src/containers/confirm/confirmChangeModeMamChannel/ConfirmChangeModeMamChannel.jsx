import React from 'react'
import RequestHeader from '../../../components/requestHeader/RequestHeader'
import RequestAccountInfo from '../../../components/requestAccountInfo/RequestAccountInfo'

const ConfirmChangeModeMamChannel = props => {
  return (
    <div className="container-request">
      <RequestHeader title="Change mode" />
      <hr className="mt-1 mb-1" />
      <RequestAccountInfo account={props.account} />
      <hr className="mt-1" />

      <div className="row mt-4">
        <div className="col-12 text-center text-md text-blue">
          Are you sure you want to change mode for a MAM channel?
        </div>
      </div>

      <div className="row mt-4">
        <div className="col-12 text-left text-xs text-black font-weight-bold">
          Details:
        </div>
      </div>

      <div className="row mt-2">
        <div className="col-6 text-left text-xxs my-auto text-gray">from:</div>
        <div className="col-6 text-right text-sm text-gray">{props.from}</div>
      </div>

      <div className="row mt-2">
        <div className="col-6 text-left text-xxs my-auto text-gray my-auto">
          to:
        </div>
        <div className="col-6 text-right text-md text-blue font-weight-bold">
          {props.to === '' ? 'public' : props.to}
        </div>
      </div>

      <div className="row mt-2">
        <div className="col-6 text-left text-xxs my-auto text-gray my-auto">
          sidekey:
        </div>
        <div className="col-6 text-right text-sm text-blue font-weight-bold">
          {props.sidekey ? props.sidekey : '-'}
        </div>
      </div>

      <hr className="mt-2 mb-2" />

      <div className="row mt-2">
        <div className="col-6 pr-2">
          <button
            onClick={() => props.onReject(props.request)}
            className="btn btn-border-blue text-sm text-bold btn-big"
          >
            Reject
          </button>
        </div>
        <div className="col-6 pl-2">
          <button
            onClick={() => props.onConfirm(props.request)}
            className="btn btn-blue text-sm text-bold btn-big"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmChangeModeMamChannel
