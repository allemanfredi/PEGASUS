import React, { useState } from 'react'
import OutlinedInput from '../../../components/outlinedInput/OutlinedInput'

const SendOptions = props => {
  const [value, setValue] = useState(0)
  const [message, setMessage] = useState('')

  return (
    <React.Fragment>
      <div className="row mt-5">
        <div className="col-12">
          <OutlinedInput
            label="message"
            message={message}
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-12">
          <OutlinedInput
            type="number"
            label="value"
            message={value}
            value={value}
            onChange={e => setValue(e.target.value)}
          />
        </div>
        <div className="col-12 mt-05 text-xs text">
          <button
            type="button"
            style={{ height: 20, fontSize: 8, paddingTop: 0, paddingBottom: 0 }}
            class="btn btn-outline-primary"
            onClick={() => setValue(props.max)}
          >
            MAX
          </button>
        </div>
      </div>
      <div className="row mt-13">
        <div className="col-6 text-center mx-auto">
          <button
            onClick={() => props.onCancel()}
            type="submit"
            className="btn btn-border-blue text-bold btn-big"
          >
            Cancel
          </button>
        </div>
        <div className="col-6 text-center mx-auto">
          <button
            disabled={!value && !message}
            onClick={() =>
              props.onSend({
                value,
                message
              })
            }
            type="submit"
            className="btn btn-blue text-bold btn-big"
          >
            Send
          </button>
        </div>
      </div>
    </React.Fragment>
  )
}

export default SendOptions
