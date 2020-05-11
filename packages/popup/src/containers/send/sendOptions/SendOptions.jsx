import React, { useState } from 'react'
import OutlinedInput from '../../../components/outlinedInput/OutlinedInput'
import Picklist from '../../../components/picklist/Picklist'

const units = ['i', 'Ki', 'Mi', 'Gi', 'Ti']
const exponents = {
  i: 0,
  Ki: 3,
  Mi: 6,
  Gi: 9,
  Ti: 12
}

const SendOptions = props => {
  const [value, setValue] = useState(0)
  const [message, setMessage] = useState('')
  const [unit, setUnit] = useState('i')

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
        <div className="col-9 pr-0">
          <OutlinedInput
            type="number"
            label="value"
            message={value}
            value={value}
            onChange={e => setValue(e.target.value)}
          />
        </div>
        <div className="col-3">
          <Picklist
            text={unit}
            options={units}
            onSelect={index => {
              setValue(
                value * Math.pow(10, exponents[unit] - exponents[units[index]])
              )
              setUnit(units[index])
            }}
          />
        </div>
        <div className="col-2 mt-05 text-xs">
          <button
            type="button"
            style={{ height: 20, fontSize: 8, paddingTop: 0, paddingBottom: 0 }}
            class="btn btn-outline-primary"
            onClick={() => setValue(props.max / Math.pow(10, exponents[unit]))}
          >
            MAX
          </button>
        </div>
        <div className="col-2 mt-05 text-xs pl-1">
          <button
            type="button"
            style={{ height: 20, fontSize: 8, paddingTop: 0, paddingBottom: 0 }}
            class="btn btn-outline-primary"
            onClick={() => setValue(0)}
          >
            RESET
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
                value: value * Math.pow(10, exponents[unit]),
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
