import React from 'react'
import Utils from '@pegasus/utils/utils'

const SelectWalletAccount = props => {
  return (
    <div className="container-accounts">
      {props.accounts
        .filter(account =>
          props.filter
            ? account.data[props.network.type].latestAddress.includes(
                props.filter.toUpperCase()
              )
            : true
        )
        .map(account => {
          return (
            <React.Fragment>
              <div
                className="row cursor-pointer"
                onClick={() =>
                  props.onSelect(account.data[props.network.type].latestAddress)
                }
              >
                <div className="col-2 my-auto">
                  <img
                    className="border-radius-50 cursor-pointer"
                    src={`./material/profiles/${
                      account.avatar ? account.avatar : 1
                    }.svg`}
                    height="40"
                    width="40"
                    alt={`avatar logo ${account.name}`}
                  />
                </div>
                <div className="col-10 my-auto mx-auto">
                  <div className="row">
                    <div className="col-12 text-xs text-gray font-weight-bold">
                      {account.name}
                    </div>
                    <div className="col-12 text-xxs text-gray">
                      {Utils.showAddress(
                        Utils.checksummed(
                          account.data[props.network.type].latestAddress
                        ),
                        10,
                        19
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <hr className="mt-2 mb-2" />
            </React.Fragment>
          )
        })}
    </div>
  )
}

export default SelectWalletAccount
