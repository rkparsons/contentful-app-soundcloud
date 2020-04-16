import { css } from 'emotion'
import tokens from '@contentful/forma-36-tokens'

export default {
    body: css({
        height: 'auto',
        minHeight: '65vh',
        margin: '0 auto',
        marginTop: tokens.spacingXl,
        padding: `${tokens.spacingXl} ${tokens.spacing2Xl}`,
        maxWidth: tokens.contentWidthText,
        backgroundColor: tokens.colorWhite,
        zIndex: 2,
        boxShadow: '0px 0px 20px rgba(0, 0, 0, 0.1)',
        borderRadius: '2px'
    }),
    splitter: css({
        marginTop: tokens.spacingL,
        marginBottom: tokens.spacingL,
        border: 0,
        height: '1px',
        backgroundColor: tokens.colorElementMid
    }),
    background: css({
        display: 'block',
        position: 'absolute',
        zIndex: -1,
        top: '0',
        width: '100%',
        height: '300px',
        backgroundColor: '#f8ab00'
    }),
    spaced: css({
        marginBottom: tokens.spacingL
    }),
    fullWidth: css({
        width: '100%'
    })
}
