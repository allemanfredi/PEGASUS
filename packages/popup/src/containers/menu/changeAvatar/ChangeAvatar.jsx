import React, { Component } from 'react'

class ChangeAvatar extends Component {
  constructor(props) {
    super(props)

    this.confirm = this.confirm.bind(this)

    this.state = {
      selectedAvatar: null
    }
  }

  async confirm() {
    await this.props.background.updateAvatarAccount(this.state.selectedAvatar)
    this.props.onClose()
  }

  render() {
    return (
      <div className="modal">
        <div className="container-change-avatar container bg-white container border-radius-5">
          <div className="row mt-05">
            <div className="col-2">
              <button
                onClick={() => this.props.onClose()}
                type="button"
                className="close mt-05 mr-05"
              >
                <span className="fa fa-times"></span>
              </button>
            </div>
          </div>
          <div className="overflow-auto-250h">
            <div className="row mt-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(
                number => {
                  return (
                    <div
                      className={
                        (number > 3 ? 'mt-4' : '') +
                        ' col-4 text-center cursor-pointer'
                      }
                      onClick={() => this.setState({ selectedAvatar: number })}
                    >
                      <img
                        className={
                          this.state.selectedAvatar === number
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
                }
              )}
            </div>
          </div>
          <div className="row mt-5 mb-1">
            <div className="col-6 pr-5 pl-5">
              <button
                onClick={() => this.props.onClose()}
                className="btn btn-border-blue btn-big"
              >
                Cancel
              </button>
            </div>
            <div className="col-6 pr-5 pl-5">
              <button onClick={this.confirm} className="btn btn-blue btn-big">
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default ChangeAvatar
