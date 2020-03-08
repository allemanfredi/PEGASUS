import React from 'react'

const ImportSeed = props => {
  return (
    <div className="container">
      <div className={'row mt-2 mb-3'}>
        <div className="col-12 text-center text-lg text-blue text-bold text-bold">
          Let's import a seed
        </div>
      </div>
      <div className={'row mt-8'}>
        <div className="col-12 text-xs text-gray">seed</div>
      </div>
      <div className="row mt-05">
        <div className="col-12">
          <textarea
            rows={3}
            value={props.seed}
            onChange={e => props.onChangeSeed(e.target.value)}
          />
        </div>
      </div>
      {props.error ? (
        <div className="row mt-2">
          <div className="col-12 text-xs">
            <div class="alert alert-danger" role="alert">
              {props.error}
            </div>
          </div>
        </div>
      ) : (
        ''
      )}
    </div>
  )
}

export default ImportSeed
