import React from 'react'

class Notifications extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.setNotification = this.setNotification.bind(this)

    this.state = {
      notification: null
    }
  }

  componentDidMount() {
    this.props.duplex.on('setNotification', notification =>
      this.setNotification(notification)
    )
  }

  setNotification(notification) {
    this.setState({ notification })

    setTimeout(() => {
      this.setState({ notification: null })
    }, 3000)
  }

  render() {
    return (
      <React.Fragment>
        {React.cloneElement(this.props.children, {
          setNotification: notification => this.setNotification(notification)
        })}
        {this.state.notification ? (
          <div className={`notification ${this.state.notification.position}`}>
            <div
              className={`alert alert-${this.state.notification.type} alert-dismissible fade show text-xs`}
              role="alert"
            >
              <i className="mr-2 fa fa-bell" />
              <strong>{this.state.notification.text}</strong>
              <button
                type="button"
                className="close"
                onClick={() => this.setState({ notification: null })}
              >
                <span>&times;</span>
              </button>
            </div>
          </div>
        ) : null}
      </React.Fragment>
    )
  }
}

export default Notifications
