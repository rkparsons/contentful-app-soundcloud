import { Button, Notification, TextField } from '@contentful/forma-36-react-components';
import React, { useCallback, useEffect, useState } from 'react';

import { FieldExtensionProps } from './typings';
import axios from 'axios';

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

const FieldExtension = ({ sdk }: FieldExtensionProps) => {
    const { clientId } = sdk.parameters.installation as InstallationParameters;
    const savedValue = (sdk.field.getValue() || {}) as Metadata;
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

    const updateTrackId = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setError(undefined);
        setStreamUrl(undefined);
        setSamples(undefined);
        setTrackId(event.target.value);
    }, []);

    const fetchMetadata = useCallback(() => {
        axios
            .get<SoundCloudTrack>(
                `https://api.soundcloud.com/tracks/${trackId}?client_id=${clientId}`
            )
            .then(({ data }) => {
                setStreamUrl(data.stream_url);
                const samplesUrl = data.waveform_url.replace('.png', '.json');
                return axios.get<SoundCloudWaveform>(samplesUrl);
            })
            .then(({ data }) => {
                const maxValue = Math.max(...data.samples);
                const samples = data.samples.map((x: number) => x / maxValue);
                setSamples(samples);

                if (samples.length) {
                    Notification.success(`${samples.length} audio peaks detected`);
                } else {
                    Notification.error(`No audio peaks detected`);
                }
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
                <TextField
                    id="trackId"
                    name="trackId"
                    labelText="Track ID"
                    required
                    validationMessage={error ? 'Invalid track id.' : undefined}
                    textInputProps={{ value: trackId, type: 'number', onChange: updateTrackId }}
                />

                <Button onClick={handleClick} disabled={!trackId} icon="Settings">
                    Generate Metadata
                </Button>

                <TextField
                    id="streamUrl"
                    name="streamUrl"
                    labelText="Stream URL"
                    required
                    textInputProps={{ value: streamUrl, disabled: true }}
                />

                <TextField
                    id="samples"
                    name="samples"
                    labelText="Audio Peaks"
                    required
                    textInputProps={{
                        value: samples ? `${samples.length}` : undefined,
                        disabled: true
                    }}
                />
            </section>
        </>
    );
};

export default FieldExtension;
