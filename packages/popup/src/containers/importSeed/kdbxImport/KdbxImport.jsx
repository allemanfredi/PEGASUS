import React, { useCallback, useState } from 'react'
import extension from 'extensionizer'
import queryString from 'query-string'
import { useDropzone } from 'react-dropzone'
import OutlinedInput from '../../../components/outlinedInput/OutlinedInput'

const KdbxImport = props => {
  const [filename, setFilename] = useState(null)
  const [password, setPassword] = useState('')

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
        // Do whatever you want with the file contents
        const binaryStr = reader.result
        console.log(binaryStr)
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
              value={password}
              label={'password'}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
        </div>
      ) : null}
      <div className={'row ' + (filename ? 'mt-6' : 'mt-13')}>
        <div className="col-6 text-center mx-auto">
          <button
            type="submit"
            className="btn btn-border-blue text-bold btn-big"
          >
            Cancel
          </button>
        </div>
        <div className="col-6 text-center mx-auto">
          <button
            disabled={password.length > 0 ? false : true}
            type="submit"
            className="btn btn-blue text-bold btn-big"
          >
            Unlock
          </button>
        </div>
      </div>
    </React.Fragment>
  )
}

export default KdbxImport
