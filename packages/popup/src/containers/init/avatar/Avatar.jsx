import React from 'react'

const Avatar = props => {
  return (
    <div className="container">
      <div className="row mt-3">
        <div className="col-12 text-center text-lg text-blue text-bold">
          Choose your avatar!
        </div>
      </div>
      <div className="row mt-1">
        <div className="col-12 text-center text-sm text-gray">
          (click on the image you want to select)
        </div>
      </div>
      <div className="overflow-auto-250h mt-6">
        <div className="row">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(number => {
            return (
              <div
                className={
                  (number > 3 ? 'mt-4' : '') +
                  ' col-4 text-center cursor-pointer'
                }
                onClick={() => props.onAvatarClick(number)}
              >
                <img
                  className={
                    props.selectedAvatar === number
                      ? 'border-darkblue border-radius-50'
                      : ''
                  }
                  src={`./material/profiles/${number}.svg`}
                  height="60"
                  width="60"
                  alt={`av-${number} logo`}
                />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default Avatar
