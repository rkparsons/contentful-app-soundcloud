import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField
} from '@contentful/forma-36-react-components'
import React, { useCallback, useEffect, useState } from 'react'

import { FieldExtensionProps } from './typings'
import axios from 'axios'

type Metadata = {
    duration?: number
    samples?: number[]
    streamUrl?: string
    trackUrl?: string
}

type InstallationParameters = {
    clientId: string
}

type SoundCloudTrack = {
    duration: number
    stream_url: string
    waveform_url: string
}

type SoundCloudWaveform = {
    samples: number[]
}

const FieldExtension = ({ sdk }: FieldExtensionProps) => {
    const { clientId } = sdk.parameters.installation as InstallationParameters
    const savedValue = (sdk.field.getValue() || {}) as Metadata
    const [trackUrl, setTrackUrl] = useState(savedValue.trackUrl)
    const [streamUrl, setStreamUrl] = useState(savedValue.streamUrl)
    const [duration, setDuration] = useState(savedValue.duration)
    const [samples, setSamples] = useState(savedValue.samples)
    const [error, setError] = useState<Error>()

    useEffect(() => {
        sdk.window.startAutoResizer()
    }, [sdk.window])

    useEffect(() => {
        sdk.field.setValue({
            trackUrl,
            streamUrl,
            duration,
            samples
        })
    }, [trackUrl, streamUrl, duration, samples, sdk.field])

    const updateTrackUrl = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setError(undefined)
        setStreamUrl(undefined)
        setDuration(undefined)
        setSamples(undefined)
        setTrackUrl(event.target.value)
    }, [])

    const fetchMetadata = useCallback(() => {
        axios
            .get<SoundCloudTrack>(
                `https://api.soundcloud.com/resolve.json?url=${trackUrl}&client_id=${clientId}`
            )
            .then(({ data }) => {
                setStreamUrl(data.stream_url)
                setDuration(data.duration)
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
                />
                <Button onClick={handleClick} disabled={!trackUrl} icon="Settings">
                    Generate Metadata
                </Button>

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Stream URL</TableCell>
                            <TableCell>Duration (ms)</TableCell>
                            <TableCell>Waveform Samples</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>{streamUrl}</TableCell>
                            <TableCell>{duration}</TableCell>
                            <TableCell>{samples && samples.length}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </section>
        </>
    )
}

export default FieldExtension
