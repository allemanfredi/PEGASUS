import React from 'react'

const OptionsSelector = props => {
  return props.items.map((item, index) => {
    return (
      <React.Fragment>
        <div
          className="row cursor-pointer"
          onClick={() => {
            props.onClick({
              text: item.title,
              index
            })
          }}
        >
          <div className="col-9 mt-2">
            <div className="row">
              <div className="col-12 text-dark-gray font-weight-bold text-md">
                {item.title}
              </div>
            </div>
            <div className="row">
              <div className="col-12 text-gray text-xs mb-1">
                {item.description}
              </div>
            </div>
          </div>
          <div className="col-3 my-auto text-right">
            <img src="./material/img/right.png" height="50" />
          </div>
        </div>
        <hr className="mt-1" />
      </React.Fragment>
    )
  })
}

export default OptionsSelector
