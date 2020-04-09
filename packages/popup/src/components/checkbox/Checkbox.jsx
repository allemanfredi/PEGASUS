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
      <label for={props.id}>
        {props.text}
        {props.link ? (
          <a href={props.link.src} target="blank" rel="noopener noreferrer">
            {' '}
            {props.link.text}
          </a>
        ) : (
          ''
        )}
      </label>
    </React.Fragment>
  )
}

export default CheckBox
