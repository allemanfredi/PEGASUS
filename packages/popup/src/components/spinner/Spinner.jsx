import React from 'react'

const MiniSpinner = props => {
  return (
    <div className={'spinner ' + (props.size ? props.size : '')}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  )
}

export default MiniSpinner
