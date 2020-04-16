import '@contentful/forma-36-react-components/dist/styles.css'
import './index.css'

import { AppExtensionSDK, FieldExtensionSDK, init, locations } from 'contentful-ui-extensions-sdk'

import AppConfig from './AppConfig'
import FieldExtension from './FieldExtension'
import React from 'react'
import { render } from 'react-dom'

init(sdk => {
    if (sdk.location.is(locations.LOCATION_APP_CONFIG)) {
        render(<AppConfig sdk={sdk as AppExtensionSDK} />, document.getElementById('root'))
    } else if (sdk.location.is(locations.LOCATION_ENTRY_FIELD)) {
        render(<FieldExtension sdk={sdk as FieldExtensionSDK} />, document.getElementById('root'))
    }
})
