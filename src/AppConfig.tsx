import * as React from 'react'

import { AppConfigParams, SavedParams } from './typings'
import { Heading, Paragraph, TextField, Typography } from '@contentful/forma-36-react-components'

import styles from './styles'

export default class AppConfig extends React.Component<AppConfigParams, SavedParams> {
    state: SavedParams = {
        clientId: ''
    }

    async componentDidMount() {
        const { sdk } = this.props

        const savedParams = ((await sdk.app.getParameters()) || {}) as SavedParams

        // eslint-disable-next-line react/no-did-mount-set-state
        this.setState(
            {
                clientId: (savedParams as SavedParams).clientId || ''
            },
            () => sdk.app.setReady()
        )

        sdk.app.onConfigure(() => this.configureApp())
    }

    async configureApp() {
        const { clientId } = this.state
        const { notifier } = this.props.sdk

        if (!clientId) {
            notifier.error('You must provide a valid client ID!')
            return false
        }

        return {
            parameters: {
                clientId
            }
        }
    }

    render() {
        return (
            <>
                <div className={styles.background} />
                <div className={styles.body}>
                    <div>
                        <Typography>
                            <Heading className={styles.spaced}>About SoundCloud</Heading>

                            <Paragraph>
                                This app allows you to fetch metadata for a SoundCloud track.
                            </Paragraph>
                        </Typography>
                    </div>

                    <hr className={styles.splitter} />

                    <Typography>
                        <Heading className={styles.spaced}>Configuration</Heading>

                        <TextField
                            labelText="Client ID"
                            name="clientId"
                            id="clientId"
                            required
                            value={this.state.clientId}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                                this.setState({ clientId: event.target.value.trim() })
                            }
                            helpText="Client ID for the SoundCloud API"
                            className={styles.spaced}
                            textInputProps={{
                                type: 'text',
                                placeholder: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'
                            }}
                        />
                    </Typography>
                </div>
            </>
        )
    }
}
