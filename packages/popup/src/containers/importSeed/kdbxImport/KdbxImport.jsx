import React, { useCallback, useState } from 'react'
import extension from 'extensionizer'
import queryString from 'query-string'
import { useDropzone } from 'react-dropzone'
import OutlinedInput from '../../../components/outlinedInput/OutlinedInput'

const KdbxImport = props => {
  const [filename, setFilename] = useState(null)
  const [password, setPassword] = useState('')
  const [filedata, setFiledata] = useState(null)

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
      const seeds = await props.background.importSeedVault(
        new Uint8Array(filedata),
        password
      )
      console.log(seeds)
    } catch (err) {
      props.setNotification({
        type: 'danger',
        text: 'Invalid Password. Try again',
        position: 'under-bar'
      })
    }
  }

  return (
    <React.Fragment>
      <div className="row mt-4">
        <div className="col-12 text-center">
          <img
            src="./material/img/money.png"
            height="100"
            width="100"
            alt="money logo"
          />
        </div>
      </div>
      <div
        style={{ borderStyle: 'dotted' }}
        className="container-import-kdbx mt-6 cursor-pointer"
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {filename
          ? filename
          : "Drag 'n' drop a .kdbx file here, or click to one!"}
      </div>
      {filename ? (
        <div className="row">
          <div className="col-12 mt-3">
            <OutlinedInput
              type="password"
              value={password}
              label={'password'}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
        </div>
      ) : null}
      <div className={'row ' + (filename ? 'mt-6' : 'mt-13')}>
        <div className="col-12 text-center mx-auto">
          <button
            disabled={password.length > 0 ? false : true}
            type="submit"
            className="btn btn-blue text-bold btn-big"
            onClick={unlock}
          >
            Unlock
          </button>
        </div>
      </div>
    </React.Fragment>
  )
}

export default KdbxImport
