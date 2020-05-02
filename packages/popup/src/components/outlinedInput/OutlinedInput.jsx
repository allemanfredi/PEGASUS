import React from 'react'

const OutlinedInput = props => {
  return (
    <input
      value={props.value}
      onChange={e => props.onChange(e)}
      type={props.type ? props.type : 'text'}
      id={props.id}
      placeholder={props.label}
      className="outlined-input"
    />
  )
}

export default OutlinedInput
