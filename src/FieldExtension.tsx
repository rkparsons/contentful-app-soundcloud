import { Button, TextField } from '@contentful/forma-36-react-components'
import React, { useCallback, useEffect, useState } from 'react'

import { FieldExtensionProps } from './typings'
import axios from 'axios'

type Metadata = {
    trackUrl?: string
    streamUrl?: string
    samples?: number[]
}

type InstallationParameters = {
    clientId: string
}

type SoundCloudLocation = {
    status: string
    location: string
}

type SoundCloudTrack = {
    waveform_url: string
    stream_url: string
}

type SoundCloudWaveform = {
    samples: number[]
}

const FieldExtension = ({ sdk }: FieldExtensionProps) => {
    const { clientId } = sdk.parameters.installation as InstallationParameters
    const savedValue = (sdk.field.getValue() || {}) as Metadata
    const [trackUrl, setTrackUrl] = useState(savedValue.trackUrl)
    const [streamUrl, setStreamUrl] = useState(savedValue.streamUrl)
    const [samples, setSamples] = useState(savedValue.samples)
    const [error, setError] = useState<Error>()

    useEffect(() => {
        sdk.window.startAutoResizer()
    }, [sdk.window])

    useEffect(() => {
        sdk.field.setValue({
            trackUrl,
            streamUrl,
            samples
        })
    }, [trackUrl, streamUrl, samples, sdk.field])

    const updateTrackUrl = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setError(undefined)
        setStreamUrl(undefined)
        setSamples(undefined)
        setTrackUrl(event.target.value)
    }, [])

    const fetchMetadata = useCallback(() => {
        axios
            .get<SoundCloudLocation>(
                `https://api.soundcloud.com/resolve.json?url=${trackUrl}&client_id=${clientId}`
            )
            .then(({ data }) => {
                return axios.get<SoundCloudTrack>(data.location)
            })
            .then(({ data }) => {
                setStreamUrl(data.stream_url)
                const samplesUrl = data.waveform_url.replace('.png', '.json')
                return axios.get<SoundCloudWaveform>(samplesUrl)
            })
            .then(({ data }) => {
                const maxValue = Math.max(...data.samples)
                const samples = data.samples.map((x: number) => x / maxValue)
                setSamples(samples)
            })
            .catch((error: Error) => {
                setError(error)
            })
    }, [clientId, trackUrl])

    const handleClick = useCallback(() => {
        setError(undefined)
        setSamples(undefined)
        fetchMetadata()
    }, [setError, setSamples, fetchMetadata])

    // https://api.soundcloud.com/resolve.json?url=https%3A%2F%2Fsoundcloud.com%2Fmsmrsounds%2Fms-mr-hurricane-chvrches-remix&client_id=[your_client_id]

    return (
        <>
            <section>
                <TextField
                    id="trackUrl"
                    name="trackUrl"
                    labelText="SoundCloud URL"
                    required
                    validationMessage={error ? 'Invalid track url.' : undefined}
                    textInputProps={{ value: trackUrl, onChange: updateTrackUrl }}
                    helpText="This should be the URL of an individual track (not a playlist)"
                />
                <Button onClick={handleClick} disabled={!trackUrl} icon="Settings">
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
    )
}

export default FieldExtension
