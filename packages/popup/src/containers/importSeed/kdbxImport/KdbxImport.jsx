import React, { useCallback, useState } from 'react'
import extension from 'extensionizer'
import queryString from 'query-string'
import { useDropzone } from 'react-dropzone'

const KdbxImport = props => {
  const [filename, setFilename] = useState(null)

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
    <div className="container-import-kdbx mt-5" {...getRootProps()}>
      <input {...getInputProps()} />
      {filename
        ? filename
        : "Drag 'n' drop a .kdbx file here, or click to one!"}
    </div>
  )
}

export default KdbxImport
