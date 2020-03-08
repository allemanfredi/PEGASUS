import React from 'react'
import Input from '../../../components/input/Input'

const Name = props => {
  return (
    <div className="container">
      <div className="row mt-3 mb-3">
        <div className="col-12 text-center text-lg text-blue text-bold">
          Let's add a name
        </div>
      </div>
      <div className="row mt-11">
        <div className="col-12">
          <Input
            value={props.value}
            onChange={e => props.onChange(e)}
            label="name"
            id="inp-name"
          />
        </div>
      </div>
    </div>
  )
}

export default Name
