import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';

import { AppExtensionSDK, FieldExtensionSDK, init, locations } from 'contentful-ui-extensions-sdk';
import { Button, TextInput } from '@contentful/forma-36-react-components';
import React, { useCallback, useEffect, useState } from 'react';

import AppConfig from './AppConfig';
import { FieldExtensionProps } from './typings';
import { render } from 'react-dom';

export const FieldExtension = ({ sdk }: FieldExtensionProps) => {
  const [trackId, setTrackId] = useState<string>();
  const [waveformUrl, setWaveformUrl] = useState<string>();
  useEffect(() => {
    sdk.window.startAutoResizer();
  }, [sdk.window]);

  const updateTrackId = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setTrackId(event.target.value),
    []
  );

  const fetchMetadata = useCallback(() => {
    setWaveformUrl(`www.example.com/tracks/${trackId}`);
  }, [sdk.field, trackId]);

  useEffect(() => {
    sdk.field.setValue({
      trackId: trackId,
      waveformUrl: `www.example.com/tracks/${trackId}`
    });
  }, [trackId, waveformUrl, sdk.field]);

  return (
    <section>
      <TextInput
        name="trackId"
        type="number"
        value={trackId}
        className="f36-margin-bottom--m"
        onChange={updateTrackId}
      />
      <Button onClick={fetchMetadata} disabled={!trackId}>
        Fetch Metadata
      </Button>
      <TextInput type="url" value={waveformUrl} />
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
