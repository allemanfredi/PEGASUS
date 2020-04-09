import React, { useState } from 'react'
import CheckBox from '../../../components/checkbox/Checkbox'

const Welcome = props => {
  const [accepted, setAccepted] = useState(false)

  return (
    <div className={'container'}>
      <div className="container-logo-login mt-5">
        <img
          className="border-radius-50"
          src="./material/logo/pegasus-256.png"
          height="130"
          width="130"
          alt="pegasus logo"
        />
      </div>
      <div className="row mt-1">
        <div className="col-12 text-center text-xl text-blue text-bold text-bold">
          Welcome to Pegasus!
        </div>
      </div>
      <div className="row mt-2">
        <div className="col-12 text-gray text-sm text-center">
          Start exploring 'the Tangle' from your browser!
        </div>
      </div>
      <div className="row mt-7">
        <div className="col-12 text-center">
          <CheckBox
            id="accept-terms-of-use"
            checked={accepted}
            value={accepted}
            onChange={() => setAccepted(!accepted)}
            link={{
              src:
                'https://github.com/allemanfredi/PEGASUS/blob/integration-omoku/TERMS_OF_USE.md',
              text: 'terms of use'
            }}
            text="By clicking here you will agree the"
          />
        </div>
      </div>
      <div className="row mt-1">
        <div className="col-12">
          <button
            type="submit"
            className="btn btn-blue text-bold btn-big"
            onClick={() => props.onModeSelected('new')}
            disabled={!accepted}
          >
            Create New Wallet
          </button>
        </div>
      </div>
      <div className="row mt-1">
        <div className="col-12 text-center">
          <button
            type="submit"
            className="btn  btn-border-blue text-bold btn-big"
            onClick={() => props.onModeSelected('import')}
            disabled={!accepted}
          >
            Import Existing Seed
          </button>
        </div>
      </div>
      <div className="row mt-1">
        <div className="col-12 text-center">
          <button
            onClick={e => {
              this.props.onRestore()
            }}
            type="submit"
            className="btn btn-white "
          ></button>
        </div>
      </div>
    </div>
  )
}

export default Welcome
