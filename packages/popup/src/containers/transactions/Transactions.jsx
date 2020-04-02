import React, { Component } from 'react'
import Utils from '@pegasus/utils/utils'
import Details from './details/Details'
import Spinner from '../../components/spinner/Spinner'
import Filters from './filters/Filters'

class Transactions extends Component {
  constructor(props, context) {
    super(props, context)

    this.state = {
      opened: {},
      settings: {
        filters: {
          hide0Txs: false,
          hidePendingTxs: false,
          hideReattachedTxs: false
        }
      },
      showFilters: false
    }

    this.promoteTransaction = this.promoteTransaction.bind(this)
    this.replayBundle = this.replayBundle.bind(this)
    this.handleShowDetails = this.handleShowDetails.bind(this)
    this.clickShowDetails = this.clickShowDetails.bind(this)
    this.handleFilter = this.handleFilter.bind(this)
  }

  async promoteTransaction(hash) {
    const { success, response } = await this.props.background.executeRequest({
      method: 'promoteTransaction',
      args: [hash, 3, 14],
      connection: {
        enabled: true
      }
    })

    if (success) {
      this.props.setNotification({
        type: 'success',
        text: 'Transaction promoted succesfully!',
        position: 'under-bar'
      })
    } else {
      this.props.setNotification({
        type: 'danger',
        text: response,
        position: 'under-bar'
      })
    }
  }

  async replayBundle(hash) {
    const { success, response } = await this.props.background.executeRequest({
      method: 'replayBundle',
      args: [hash, 3, 14],
      connection: {
        enabled: true
      }
    })

    if (success) {
      this.props.setNotification({
        type: 'success',
        text: 'Transaction reattached succesfully!',
        position: 'under-bar'
      })
    } else {
      this.props.setNotification({
        type: 'danger',
        text: response,
        position: 'under-bar'
      })
    }
  }

  async componentWillMount() {
    this.handleShowDetails()

    const settings = await this.props.background.getSettings()
    if (!settings) return

    this.setState({ settings })
  }

  componentWillReceiveProps() {
    this.handleShowDetails()
  }

  //keep open the opened cards
  handleShowDetails() {
    const opened = this.state.opened
    this.props.account.data.transactions.forEach(transaction => {
      if (!opened[`${transaction.bundle}-${transaction.timestamp}`]) {
        opened[`${transaction.bundle}-${transaction.timestamp}`] = false
      } else opened[`${transaction.bundle}-${transaction.timestamp}`] = true
    })
    this.setState({ opened })
  }

  clickShowDetails(transaction) {
    this.setState(prevState => {
      const opened = prevState.opened
      opened[`${transaction.bundle}-${transaction.timestamp}`] = !opened[
        `${transaction.bundle}-${transaction.timestamp}`
      ]
      return {
        opened
      }
    })
  }

  handleFilter(filter) {
    const settings = this.state.settings
    settings.filters[filter] = !settings.filters[filter]
    this.setState({ settings })
    this.props.background.setSettings(settings)
  }

  render() {
    return (
      <React.Fragment>
        {this.state.showFilters ? (
          <Filters
            filters={this.state.settings.filters}
            onFilter={this.handleFilter}
            onClose={() => this.setState({ showFilters: false })}
          />
        ) : null}
        <div className="container">
          <div className="row">
            <div className="col-3 text-left text-black text-gray text-xs pl-0">
              History
            </div>
            <div className="col-6 text-center">
              {this.props.isLoading ? (
                <Spinner />
              ) : (
                <button
                  onClick={() => this.props.onReload()}
                  className="btn btn-icon-inverted mb-05"
                >
                  <i className="fa fa-refresh"></i>
                </button>
              )}
            </div>
            <div className="col-3 text-right pr-0">
              <button
                className="btn btn-icon-inverted mb-05"
                onClick={() => {
                  this.setState({ showFilters: !this.state.showFilters })
                }}
              >
                <i className="fa fa-sliders"></i>
              </button>
            </div>
          </div>
        </div>
        <hr />
        <div className="transaction-list">
          {this.props.account.data.transactions.length > 0 ? (
            this.props.account.data.transactions
              .filter(
                transaction => transaction.network === this.props.network.type
              )
              .filter(transaction =>
                this.state.settings.filters.hidePendingTxs
                  ? transaction.status
                  : true
              )
              .filter(transaction =>
                this.state.settings.filters.hide0Txs
                  ? transaction.value !== 0
                  : true
              )
              .filter(transaction =>
                this.state.settings.filters.hideReattachedTxs
                  ? !transaction.isReattached
                  : true
              )
              .sort((t1, t2) => (t1.timestamp < t2.timestamp ? 1 : -1))
              .map((transaction, index) => {
                return (
                  <div key={index} className="transaction-list-item mt-1">
                    <div className="row">
                      <div className="col-4 text-left text-xxs text-blue my-auto">
                        {Utils.timestampToDate(transaction.timestamp)}
                      </div>
                      <div className="col-4 text-center my-auto">
                        <div
                          className={
                            transaction.status
                              ? 'text-xxs text-bold text-blue'
                              : 'text-xxs text-bold text-gray'
                          }
                        >
                          {transaction.status ? 'confirmed ' : 'pending'}
                          <a className="text-green">
                            <br />
                            {transaction.isReattached ? 'reattached ' : ''}
                          </a>
                        </div>
                      </div>
                      <div className="col-4 text-right">
                        <div className="text-sm text-bold">
                          {transaction.value > 0
                            ? '+' + Utils.iotaReducer(transaction.value)
                            : Utils.iotaReducer(transaction.value)}
                        </div>
                      </div>
                    </div>
                    <div className="row mt-1">
                      <div className="col-6 text-left text-xxs text-blue">
                        <a
                          href={
                            this.props.network.link +
                            'bundle/' +
                            transaction.bundle
                          }
                          target="_blank"
                        >
                          View on the explorer
                        </a>
                      </div>
                      <div className="col-6 text-right text-xxs text-underline">
                        <a
                          className="cursor-pointer"
                          onClick={() => this.clickShowDetails(transaction)}
                        >
                          View details{' '}
                          <i
                            className={
                              this.state.opened[
                                `${transaction.bundle}-${transaction.timestamp}`
                              ]
                                ? 'fa fa-eye'
                                : 'fa fa-eye-slash'
                            }
                          ></i>
                        </a>
                      </div>
                    </div>
                    {this.state.opened[
                      `${transaction.bundle}-${transaction.timestamp}`
                    ] ? (
                      <Details
                        details={transaction}
                        promoteTransaction={this.promoteTransaction}
                        replayBundle={this.replayBundle}
                      />
                    ) : (
                      ''
                    )}
                  </div>
                )
              })
          ) : (
            <div className="row mt-9">
              <div className="col-12 text-center text-xs text-gray">
                No Transactions
              </div>
            </div>
          )}
        </div>
      </React.Fragment>
    )
  }
}

export default Transactions
