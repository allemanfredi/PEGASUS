import React from 'react'
import Input from '../../../components/input/Input'

const Password = props => {
  return (
    <div className="container">
      <div className="row mt-3">
        <div className="col-12 text-center text-lg text-blue text-bold">
          Let's add a password
        </div>
      </div>
      <div className="row mt-5">
        <div className="col-12">
          <Input
            value={props.password}
            onChange={e => props.onChangePassword(e)}
            label="password"
            type="password"
            id="inp-psw"
          />
        </div>
      </div>
      <div className="row mt-3 mb-3">
        <div className="col-12">
          <Input
            value={props.repassword}
            onChange={e => props.onChangeRePassword(e)}
            label="re password"
            id="inp-repsw"
            type="password"
          />
        </div>
      </div>
      {props.errors.map(error => {
        return (
          <div className="row mt-1">
            <div className="col-12 text-center text-red text-xxs">{error}</div>
          </div>
        )
      })}
    </div>
  )
}

export default Password
