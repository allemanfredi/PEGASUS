import React from 'react'

const CheckBox = props => {
  return (
    <React.Fragment>
      <input
        class="checkbox"
        id={props.id}
        type="checkbox"
        value={props.value}
        checked={props.checked}
        onChange={e => props.onChange(e)}
      />
      <label for={props.id}>{props.text}</label>
    </React.Fragment>
  )
}

export default CheckBox
