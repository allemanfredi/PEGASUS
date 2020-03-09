import React from 'react'

class Filters extends React.Component {
  constructor(props, context) {
    super(props, context)

    this.handleClickOutside = this.handleClickOutside.bind(this)

    this.state = {}
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside)
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside)
  }

  handleClickOutside(event) {
    if (this.wrapperRef && !this.wrapperRef.contains(event.target)) {
      this.props.onClose()
    }
  }

  render() {
    return (
      <div
        ref={ref => (this.wrapperRef = ref)}
        className="container-filters container"
      >
        <div
          className="row mt-05 cursor-pointer text-bold"
          onClick={() => this.props.onFilter('hide0Txs')}
        >
          <div
            className={
              'col-2 ' +
              (this.props.filters.hide0Txs ? 'text-white' : 'text-transparent')
            }
          >
            <span className="fa fa-check" />
          </div>
          <div className="col-10 text-white text-xxs text-right my-auto mx-auto">
            hide 0 transactions
          </div>
        </div>
        <div
          className="row mt-05 cursor-pointer text-bold"
          onClick={() => this.props.onFilter('hidePendingTxs')}
        >
          <div
            className={
              'col-2 ' +
              (this.props.filters.hidePendingTxs
                ? 'text-white'
                : 'text-transparent')
            }
          >
            <span className="fa fa-check" />
          </div>
          <div className="col-10 text-white text-xxs text-right my-auto text-bold">
            hide pending transactions
          </div>
        </div>
        <div
          className="row mt-05 cursor-pointer"
          onClick={() => this.props.onFilter('hideReattachedTxs')}
        >
          <div
            className={
              'col-2 ' +
              (this.props.filters.hideReattachedTxs
                ? 'text-white'
                : 'text-transparent')
            }
          >
            <span className="fa fa-check" />
          </div>
          <div className="col-10 text-white text-xxs text-right pl-0 my-auto text-bold">
            hide reattached transactions
          </div>
        </div>
      </div>
    )
  }
}

export default Filters
