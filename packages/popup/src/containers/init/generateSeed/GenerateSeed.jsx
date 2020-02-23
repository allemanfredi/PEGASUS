import React from 'react'

const GenerateSeed = props => {
  return (
    <div className="container">
      <div className="row mt-2">
        <div className="col-12 text-center text-lg text-blue">
          Let's generate a seed
        </div>
      </div>
      <div className="row mb-2 mt-1">
        <div className="col-12 text-center">
          Press{' '}
          <i className="text-blue text-bold">
            {props.randomLetters >= 0 ? props.randomLetters : 0}
          </i>{' '}
          more letters to randomise them
        </div>
      </div>
      {[0, 9, 18, 27, 36, 45, 54, 63, 72].map(item => {
        return (
          <div className="row pl-3">
            <div className="col-1"></div>
            {Array.from(new Array(9), (x, i) => i + item).map(index => {
              return (
                <div className="col-1">
                  <div
                    onClick={() => props.onLetterClick(index)}
                    className="container-letter"
                  >
                    {props.seed[index]}
                  </div>
                </div>
              )
            })}
            <div className="col-1"></div>
          </div>
        )
      })}
    </div>
  )
}

export default GenerateSeed
