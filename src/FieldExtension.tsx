import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextInput,
    ValidationMessage
} from '@contentful/forma-36-react-components'
import React, { useCallback, useEffect, useState } from 'react'

import { FieldExtensionProps } from './typings'
import axios from 'axios'
import styles from './styles'

type Metadata = {
    duration?: number
    samples?: number[]
    streamUrl?: string
    title?: string
    trackUrl?: string
}

type InstallationParameters = {
    clientId: string
}

type SoundCloudTrack = {
    duration: number
    stream_url: string
    title: string
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
    const [title, setTitle] = useState(savedValue.title)
    const [error, setError] = useState<Error>()

    useEffect(() => {
        sdk.window.startAutoResizer()
    }, [sdk.window])

    useEffect(() => {
        sdk.field.setValue({
            trackUrl,
            streamUrl,
            duration,
            samples,
            title
        })
    }, [trackUrl, streamUrl, duration, samples, title, sdk.field])

    const updateTrackUrl = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setError(undefined)
        setStreamUrl(undefined)
        setDuration(undefined)
        setSamples(undefined)
        setTitle(undefined)
        setTrackUrl(event.target.value)
    }, [])

    const fetchMetadata = useCallback(() => {
        axios
            .get<SoundCloudTrack>(
                `https://api.soundcloud.com/resolve.json?url=${trackUrl}&client_id=${clientId}`
            )
            .then(({ data }) => {
                if (!data.stream_url) {
                    throw new Error('Stream URL not found')
                }
                setStreamUrl(data.stream_url)
                setDuration(data.duration)
                setTitle(data.title)
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
        setTitle(undefined)
        setStreamUrl(undefined)
        setDuration(undefined)
        fetchMetadata()
    }, [setError, setSamples, fetchMetadata])

    return (
        <>
            <section>
                <TextInput
                    id="trackUrl"
                    name="trackUrl"
                    value={trackUrl}
                    onChange={updateTrackUrl}
                    placeholder="Enter SoundCloud track URL and click 'Generate Metadata'"
                    required
                />
                <br />
                {error && <ValidationMessage>Invalid track url</ValidationMessage>}
                <Button
                    onClick={handleClick}
                    disabled={!trackUrl}
                    icon="Settings"
                    className={styles.fullWidth}>
                    Generate Metadata
                </Button>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Title</TableCell>
                            <TableCell>Stream URL</TableCell>
                            <TableCell>Duration (ms)</TableCell>
                            <TableCell>Waveform Samples</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>{title}</TableCell>
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
