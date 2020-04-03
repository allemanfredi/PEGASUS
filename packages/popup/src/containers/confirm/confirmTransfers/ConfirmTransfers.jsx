import React, { useState } from 'react'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import ReactJson from 'react-json-view'
import Utils from '@pegasus/utils/utils'
import Loader from '../../../components/loader/Loader'
import RequestHeader from '../../../components/requestHeader/RequestHeader'
import RequestAccountInfo from '../../../components/requestAccountInfo/RequestAccountInfo'
import { asTransactionObject } from '@iota/transaction-converter/'
import { extractJson } from '@iota/extract-json'
import { trytesToAscii } from '@iota/converter'
import { isTrytes } from '@iota/validators'
import AccountSelection from '../../header/accountSelection/AccountSelection'

/*const extractMessage = _bundle => {
  try {
    console.log(extractJson(_bundle))
    return extractJson(_bundle)
  } catch (err) {
    console.log(err)
    return null
  }
}*/

const ConfirmTransfers = props => {
  const [isSelectingAccount, setIsSelectingAccount] = useState(false)

  let transfers = props.transfer.args[0]
  let bundle = null
  if (props.isTrytes) {
    bundle = transfers.map(singleTransfer =>
      asTransactionObject(singleTransfer)
    )
    transfers = bundle
      .filter(
        singleTransfer =>
          singleTransfer.currentIndex <= props.transfer.args[0].length - 4
      )
      .map(singleTransfer => {
        return {
          address: singleTransfer.address,
          value: singleTransfer.value,
          message: null // TODO parse msg (know why extractJson gives invalid encoded message)
        }
      })
  }

  return !props.isLoading ? (
    <React.Fragment>
      <div className="container">
        <RequestHeader title={props.title} />
        <hr className="mt-1 mb-1" />
        <RequestAccountInfo
          account={props.account}
          onChangeAccount={() => setIsSelectingAccount(true)}
        />
        <hr className="mt-1" />
        <Tabs>
          <TabList>
            <Tab>Transfers</Tab>
            {bundle ? <Tab>Bundle</Tab> : null}
          </TabList>
          <TabPanel>
            <div class="container-confirm-transfers">
              {transfers.map((singleTransfer, index) => {
                return (
                  <React.Fragment>
                    {index > 0 ? <hr className="mt-1 mb-1" /> : ''}
                    <div className="row">
                      <div className="col-12 text-left text-xs text-light">
                        #{index}
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-2 text-left text-xxs text-blue">
                        To
                      </div>
                      <div className="col-10 text-right text-sm break-text font-weight-bold">
                        {Utils.showAddress(singleTransfer.address, 10, 10)}
                      </div>
                    </div>
                    <div className="row mt-2">
                      <div className="col-2 text-left text-xxs text-blue">
                        Message
                      </div>
                      <div className="col-10 text-right text-xs break-text">
                        {singleTransfer.message
                          ? isTrytes(singleTransfer.message)
                            ? trytesToAscii(singleTransfer.message)
                            : singleTransfer.message
                          : '-'}
                      </div>
                    </div>
                    <div className="row mt-2">
                      <div className="col-2 text-left text-xxs text-blue">
                        Amount
                      </div>
                      <div className="col-10 text-right text-md break-text">
                        {Utils.iotaReducer(singleTransfer.value)}
                      </div>
                    </div>
                  </React.Fragment>
                )
              })}
            </div>
          </TabPanel>

          <TabPanel>
            <div className="container-confirm-transfers">
              <ReactJson src={bundle} />
            </div>
          </TabPanel>
        </Tabs>

        {props.error ? (
          <div className="row">
            <div className="col-12 text-xs">
              <div class="alert alert-danger" role="alert">
                {props.error}
              </div>
            </div>
          </div>
        ) : (
          ''
        )}
        <hr className={props.error ? 'row mt-1' : 'row mt-4 mb-2'} />
        <div className={'row mt-1'}>
          <div className="col-6 pr-2">
            <button
              onClick={() => props.onReject(props.transfer)}
              className="btn btn-border-blue text-sm text-bold btn-big"
            >
              Reject
            </button>
          </div>
          <div className="col-6 pl-2">
            <button
              onClick={() => props.onConfirm(props.transfer)}
              className="btn btn-blue text-sm text-bold btn-big"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
      {isSelectingAccount && props.canChangeAccount ? (
        <AccountSelection
          account={props.account}
          network={props.network}
          background={props.background}
          onClose={() => setIsSelectingAccount(false)}
        />
      ) : null}
    </React.Fragment>
  ) : (
    <Loader />
  )
}

export default ConfirmTransfers
