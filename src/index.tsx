import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';

import { AppExtensionSDK, FieldExtensionSDK, init, locations } from 'contentful-ui-extensions-sdk';
import { FormLabel, TextInput } from '@contentful/forma-36-react-components';
import React, { useCallback, useEffect, useState } from 'react';

import AppConfig from './AppConfig';
import { FieldExtensionProps } from './typings';
import { render } from 'react-dom';

export const FieldExtension = ({ sdk }: FieldExtensionProps) => {
  const [trackId, setTrackId] = useState<string>();
  useEffect(() => {
    sdk.window.startAutoResizer();
  }, [sdk.window]);

  const updateTrackId = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setTrackId(event.target.value),
    []
  );

  useEffect(() => {
    sdk.field.setValue({ waveformUrl: `www.example.com/tracks/${trackId}` });
  }, [trackId, sdk.field]);

  return (
    <section>
      <FormLabel htmlFor="trackId" required>
        Track ID
      </FormLabel>
      <TextInput
        name="trackId"
        type="number"
        value={trackId}
        className="f36-margin-bottom--m"
        onChange={updateTrackId}
      />
      <span>Track ID: {trackId}</span>
    </section>
  );
};

init(sdk => {
  if (sdk.location.is(locations.LOCATION_APP_CONFIG)) {
    render(<AppConfig sdk={sdk as AppExtensionSDK} />, document.getElementById('root'));
  } else if (sdk.location.is(locations.LOCATION_ENTRY_FIELD)) {
    render(<FieldExtension sdk={sdk as FieldExtensionSDK} />, document.getElementById('root'));
  }
});
