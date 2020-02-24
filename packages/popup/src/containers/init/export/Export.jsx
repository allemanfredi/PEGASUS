import React from 'react'

const Export = props => {
  return (
    <div className="container">
      <div className="row mt-3 mb-3">
        <div className="col-12 text-center text-lg text-blue">
          Let's export the seed
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-12 text-center text-bold">
          Take care to copy the seed in order to correctly reinitialize the
          wallet{' '}
        </div>
      </div>
      <div className="row mt-4">
        <div className="col-1"></div>
        <div className="col-10 text-center text-xs break-text border-light-gray pt-1 pb-1">
          {props.seed.toString().replace(/,/g, '')}
        </div>
        <div className="col-1"></div>
      </div>

      {props.isCopiedToClipboard ? (
        <div className="row mt-1">
          <div className="col-10 mx-auto text-center text-xs">
            <div class="alert alert-success" role="alert">
              Copied!
            </div>
          </div>
        </div>
      ) : null}

      <div className={'row ' + (props.isCopiedToClipboard ? 'mt-1' : 'mt-5')}>
        <div className="col-12 text-center">
          <button
            onClick={e => props.onCopyToClipboard(e)}
            className="btn btn-blue text-bold btn-big"
          >
            <span className="fa fa-clipboard"></span> Copy to clipboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default Export
