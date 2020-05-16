import React, { useCallback, useState } from 'react'
import extension from 'extensionizer'
import queryString from 'query-string'
import { useDropzone } from 'react-dropzone'
import OutlinedInput from '../../../components/outlinedInput/OutlinedInput'
import Spinner from '../../../components/spinner/Spinner'
import Utils from '@pegasus/utils/utils'

const KdbxImport = props => {
  const [filename, setFilename] = useState(null)
  const [password, setPassword] = useState('')
  const [accountName, setAccountName] = useState('')
  const [filedata, setFiledata] = useState(null)
  const [seed, setSeed] = useState(null)
  const [loading, setLoading] = useState(false)

  const params = queryString.parse(window.location.search)
  if (!params['kdbx'])
    extension.tabs.create({ url: window.location.href + '?kdbx=true' })

  const onDrop = useCallback(acceptedFiles => {
    acceptedFiles.forEach(file => {
      const reader = new FileReader()

      reader.onabort = () =>
        props.setNotification({
          type: 'danger',
          text: 'File reading was aborted',
          position: 'under-bar'
        })

      reader.onerror = () =>
        props.setNotification({
          type: 'danger',
          text: 'File reading has failed',
          position: 'under-bar'
        })

      reader.onload = () => {
        setFiledata(reader.result)
      }

      if (!file.name.endsWith('.kdbx')) {
        props.setNotification({
          type: 'danger',
          text: 'Invalid File. Please use a .kdbx file.',
          position: 'under-bar'
        })
        return
      }

      setFilename(file.name)
      reader.readAsArrayBuffer(file)
    })
  }, [])
  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  const unlock = async () => {
    try {
      const seeds = await props.background.getSeedVaultContent(
        new Uint8Array(filedata),
        password
      )
      setSeed(seeds[0])
    } catch (err) {
      props.setNotification({
        type: 'danger',
        text: 'Invalid Password. Try again',
        position: 'under-bar'
      })
    }
  }

  const createAccount = async () => {
    const exists = await props.background.isAccountNameAlreadyExists(
      accountName
    )
    if (exists) {
      props.setNotification({
        type: 'danger',
        text: 'Account Name Already Exists',
        position: 'under-bar'
      })
      return
    }

    setLoading(true)
    const isCreated = await props.background.addAccount(
      {
        name: accountName,
        avatar: 0,
        seed
      },
      true
    )

    if (!isCreated) {
      this.props.setNotification({
        type: 'danger',
        text: 'Error during creating the account! Try Again!',
        position: 'under-bar'
      })
      setLoading(false)
      return
    }
    props.onTerminated()
  }

  return (
    <React.Fragment>
      {loading ? (
        <React.Fragment>
          <div className="container">
            <div className="row mt-5 mb-3">
              <div className="col-12 text-center text-lg text-blue text-bold">
                I'm creating the new Account!
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-12 text-center">
                <Spinner size={'big'} />
              </div>
            </div>
          </div>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <div className="row mt-3">
            <div className="col-12 text-center">
              <img
                src="./material/img/money.png"
                height="100"
                width="100"
                alt="money logo"
              />
            </div>
          </div>
          <div className="row">
            <div className="col-12 mt-2 text-blue font-weight-bold text-center">
              {!seed && !filename ? 'Select a Seed Vault!' : ''}
              {!seed && filename ? 'Type a password to unlock it!' : ''}
              {seed && filename ? 'Now choose an account name!' : ''}
            </div>
          </div>
          <div
            style={{ borderStyle: seed ? 'solid' : 'dotted' }}
            className="container-import-kdbx mt-3 cursor-pointer"
            {...getRootProps()}
          >
            <input {...getInputProps()} />
            {filename && !seed
              ? filename
              : seed
              ? Utils.showAddress(seed, 15, 15)
              : "Drag 'n' drop a .kdbx file here, or click to one!"}
          </div>
          {filename ? (
            <div className="row">
              <div className="col-12 mt-3">
                <OutlinedInput
                  type={!seed ? 'password' : 'text'}
                  value={!seed ? password : accountName}
                  label={!seed ? 'password' : 'account name'}
                  onChange={e =>
                    seed
                      ? setAccountName(e.target.value)
                      : setPassword(e.target.value)
                  }
                />
              </div>
            </div>
          ) : null}
          <div className={'row ' + (filename ? 'mt-6' : 'mt-13')}>
            <div className="col-12 text-center mx-auto">
              <button
                disabled={
                  !seed
                    ? password.length > 0
                      ? false
                      : true
                    : accountName.length > 0
                    ? false
                    : true
                }
                type="submit"
                className="btn btn-blue text-bold btn-big"
                onClick={() => (!seed ? unlock() : createAccount())}
              >
                {!seed ? 'Unlock' : 'Import Account'}
              </button>
            </div>
          </div>
        </React.Fragment>
      )}
    </React.Fragment>
  )
}

export default KdbxImport
