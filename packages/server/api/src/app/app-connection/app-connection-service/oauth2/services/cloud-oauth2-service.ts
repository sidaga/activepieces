
import { OAuth2AuthorizationMethod } from '@activepieces/pieces-framework'
import { logger, system } from '@activepieces/server-shared'
import {
    ActivepiecesError,
    AppConnectionType,
    CloudOAuth2ConnectionValue,
    ErrorCode,
} from '@activepieces/shared'
import axios from 'axios'
import {
    ClaimOAuth2Request,
    OAuth2Service,
    RefreshOAuth2Request,
} from '../oauth2-service'

export const cloudOAuth2Service: OAuth2Service<CloudOAuth2ConnectionValue> = {
    refresh,
    claim,
}

async function refresh({
    pieceName,
    connectionValue,
}: RefreshOAuth2Request<CloudOAuth2ConnectionValue>): Promise<CloudOAuth2ConnectionValue> {
    const requestBody = {
        refreshToken: connectionValue.refresh_token,
        pieceName,
        clientId: connectionValue.client_id,
        edition: system.getEdition(),
        authorizationMethod: connectionValue.authorization_method,
        tokenUrl: connectionValue.token_url,
    }
    const response = (
        await axios.post('https://fuzzy-space-goldfish-wp9rv6j6vj2w95-4200.app.github.dev/refresh', requestBody, {
            timeout: 10000,
        })
    ).data
    return {
        ...connectionValue,
        ...response,
        props: connectionValue.props,
        type: AppConnectionType.CLOUD_OAUTH2,
    }
}

async function claim({
    request,
    pieceName,
}: ClaimOAuth2Request): Promise<CloudOAuth2ConnectionValue> {
    try {
        const cloudRequest: ClaimWithCloudRequest = {
            code: request.code,
            codeVerifier: request.codeVerifier,
            authorizationMethod: request.authorizationMethod,
            clientId: request.clientId,
            tokenUrl: request.tokenUrl,
            pieceName,
            edition: system.getEdition(),
        }
        const value = (
            await axios.post<CloudOAuth2ConnectionValue>(
                'https://fuzzy-space-goldfish-wp9rv6j6vj2w95-4200.app.github.dev/claim',
                cloudRequest,
                {
                    timeout: 10000,
                },
            )
        ).data
        return {
            ...value,
            token_url: request.tokenUrl,
            props: request.props,
        }
    }
    catch (e: unknown) {
        logger.error(e)
        throw new ActivepiecesError({
            code: ErrorCode.INVALID_CLOUD_CLAIM,
            params: {
                pieceName,
            },
        })
    }
}

type ClaimWithCloudRequest = {
    pieceName: string
    code: string
    codeVerifier: string | undefined
    authorizationMethod: OAuth2AuthorizationMethod | undefined
    edition: string
    clientId: string
    tokenUrl: string
}
