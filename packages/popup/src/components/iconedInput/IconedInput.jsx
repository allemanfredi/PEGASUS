import React from 'react'

const IconedInput = props => {
  return (
    <div class="input-group">
      <div class="input-group-prepend">
        <span
          class="input-group-text input-grop-text-left"
          id={`${props.id}-prepend`}
        >
          <img
            src={`./material/img/${props.prependIcon}.png`}
            width="24"
            height="24"
          />
        </span>
      </div>
      <input
        value={props.value}
        placeholder={props.placeholder}
        type="text"
        class="form-control"
        onChange={e => props.onChange(e)}
      />
      <div
        class="input-group-append input-grop-text-right cursor-pointer"
        onClick={e => props.onClickAppendIcon(e)}
      >
        <span class="input-group-text" id={`${props.id}-append`}>
          <img
            src={`./material/img/${props.appendIcon}.png`}
            width="8"
            height="8"
          />
        </span>
      </div>
    </div>
  )
}

export default IconedInput
