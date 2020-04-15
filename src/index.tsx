import '@contentful/forma-36-react-components/dist/styles.css';
import './index.css';

import { AppExtensionSDK, FieldExtensionSDK, init, locations } from 'contentful-ui-extensions-sdk';
import { Button, Note, TextInput, ValidationMessage } from '@contentful/forma-36-react-components';
import React, { useCallback, useEffect, useState } from 'react';

import AppConfig from './AppConfig';
import { FieldExtensionProps } from './typings';
import axios from 'axios';
import { render } from 'react-dom';

type Metadata = {
  trackId?: string;
  streamUrl?: string;
  samples?: number[];
};

type InstallationParameters = {
  clientId: string;
};

type SoundCloudTrack = {
  waveform_url: string;
  stream_url: string;
};

type SoundCloudWaveform = {
  samples: number[];
};

export const FieldExtension = ({ sdk }: FieldExtensionProps) => {
  const { clientId } = sdk.parameters.installation as InstallationParameters;
  const savedValue = sdk.field.getValue() as Metadata;
  const [trackId, setTrackId] = useState(savedValue.trackId);
  const [streamUrl, setStreamUrl] = useState(savedValue.streamUrl);
  const [samples, setSamples] = useState(savedValue.samples);
  const [error, setError] = useState<Error>();

  useEffect(() => {
    sdk.window.startAutoResizer();
  }, [sdk.window]);

  useEffect(() => {
    sdk.field.setValue({
      trackId,
      streamUrl,
      samples
    });
  }, [trackId, streamUrl, samples, sdk.field]);

  const updateTrackId = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => setTrackId(event.target.value),
    []
  );

  const fetchMetadata = useCallback(() => {
    axios
      .get<SoundCloudTrack>(`https://api.soundcloud.com/tracks/${trackId}?client_id=${clientId}`)
      .then(({ data }) => {
        setStreamUrl(data.stream_url);
        const samplesUrl = data.waveform_url.replace('.png', '.json');
        return axios.get<SoundCloudWaveform>(samplesUrl);
      })
      .then(({ data }) => {
        const maxValue = Math.max(...data.samples);
        const samples = data.samples.map((x: number) => x / maxValue);
        setSamples(samples);
      })
      .catch((error: Error) => {
        setError(error);
      });
  }, [clientId, trackId]);

  const handleClick = useCallback(() => {
    setError(undefined);
    setSamples(undefined);
    fetchMetadata();
  }, [setError, setSamples, fetchMetadata]);

  return (
    <>
      <section>
        <TextInput
          name="trackId"
          type="number"
          value={trackId}
          className="f36-margin-bottom--m"
          onChange={updateTrackId}
        />
        {error && <ValidationMessage>Invalid track id</ValidationMessage>}

        <Button onClick={handleClick} disabled={!trackId}>
          Fetch Metadata
        </Button>
      </section>
      {samples && (
        <Note noteType="positive">Audio waveform retrieved with {samples.length} samples</Note>
      )}
    </>
  );
};

init(sdk => {
  if (sdk.location.is(locations.LOCATION_APP_CONFIG)) {
    render(<AppConfig sdk={sdk as AppExtensionSDK} />, document.getElementById('root'));
  } else if (sdk.location.is(locations.LOCATION_ENTRY_FIELD)) {
    render(<FieldExtension sdk={sdk as FieldExtensionSDK} />, document.getElementById('root'));
  }
});
