import React from 'react'

const Input = props => {
  return (
    <label htmlFor={props.id} className="inp">
      <input
        value={props.value}
        onChange={e => props.onChange(e)}
        type={props.type ? props.type : 'text'}
        id={props.id}
        placeholder="&nbsp;"
      />
      <span className="label">{props.label}</span>
      <span className="border"></span>
    </label>
  )
}

export default Input
