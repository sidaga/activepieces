import {
    ConfigureRepoRequest,
    GitRepoWithoutSensitiveData,
    ProjectSyncPlan,
    PullGitRepoFromProjectRequest,
    PullGitRepoRequest,
    PushGitRepoRequest,
} from '@activepieces/ee-shared'
import { Permission, PrincipalType, SeekPage, SERVICE_KEY_SECURITY_OPENAPI } from '@activepieces/shared'
import {
    FastifyPluginCallbackTypebox,
    Type,
} from '@fastify/type-provider-typebox'
import { FastifyPluginAsync } from 'fastify'
import { StatusCodes } from 'http-status-codes'
import { entitiesMustBeOwnedByCurrentProject } from '../../authentication/authorization'
import { platformService } from '../../platform/platform.service'
import { platformMustHaveFeatureEnabled } from '../authentication/ee-authorization'
import { gitRepoService } from './git-repo.service'

export const gitRepoModule: FastifyPluginAsync = async (app) => {
    app.addHook('preSerialization', entitiesMustBeOwnedByCurrentProject)
    app.addHook('preHandler', platformMustHaveFeatureEnabled((platform) => platform.gitSyncEnabled))
    await app.register(gitRepoController, { prefix: '/v1/git-repos' })
}

export const gitRepoController: FastifyPluginCallbackTypebox = (
    app,
    _options,
    done,
): void => {

    app.post('/pull', PullRepoFromProjectRequestSchema, async (request) => {
        const platform = await platformService.getOneOrThrow(request.principal.platform.id)
        const gitRepo = await gitRepoService.getOneByProjectOrThrow({ projectId: request.body.projectId })
        const userId = platform.ownerId
        await gitRepoService.pull({
            gitRepo,
            userId,
            dryRun: false,
        })
    })

    app.post('/', ConfigureRepoRequestSchema, async (request, reply) => {
        await reply
            .status(StatusCodes.CREATED)
            .send(await gitRepoService.upsert(request.body))
    })

    app.get('/', ListRepoRequestSchema, async (request) => {
        return gitRepoService.list(request.query)
    })

    app.post('/:id/push', PushRepoRequestSchema, async (request) => {
        return gitRepoService.push({
            id: request.params.id,
            userId: request.principal.id,
            request: request.body,
        })
    })

    app.post('/:id/pull', PullRepoRequestSchema, async (request) => {
        const gitRepo = await gitRepoService.getOrThrow({
            id: request.params.id,
        })
        return gitRepoService.pull({
            gitRepo,
            dryRun: request.body.dryRun ?? false,
            userId: request.principal.id,
        })
    })

    app.delete('/:id', DeleteRepoRequestSchema, async (request, reply) => {
        await gitRepoService.delete({
            id: request.params.id,
            projectId: request.principal.projectId,
        })
        await reply.status(StatusCodes.NO_CONTENT).send()
    })

    done()
}

const PullRepoFromProjectRequestSchema = {
    config: {
        allowedPrincipals: [PrincipalType.SERVICE],
        permission: Permission.WRITE_GIT_REPO,
    },
    schema: {
        description:
            'Pull all changes from the git repository and overwrite any conflicting changes in the project.',
        body: PullGitRepoFromProjectRequest,
        tags: ['git-repo'],
        security: [SERVICE_KEY_SECURITY_OPENAPI],
        response: {
            [StatusCodes.OK]: Type.Object({}),
        },
    },
}

const DeleteRepoRequestSchema = {
    config: {
        allowedPrincipals: [PrincipalType.USER],
        permission: Permission.WRITE_GIT_REPO,
    },
    schema: {
        description: 'Delete a git repository information for a project.',
        params: Type.Object({
            id: Type.String(),
        }),
        response: {
            [StatusCodes.NO_CONTENT]: Type.Never(),
        },
    },
}

const PullRepoRequestSchema = {
    config: {
        allowedPrincipals: [PrincipalType.USER],
        permission: Permission.WRITE_GIT_REPO,
    },
    schema: {
        description:
            'Pull all changes from the git repository and overwrite any conflicting changes in the project.',
        params: Type.Object({
            id: Type.String(),
        }),
        body: PullGitRepoRequest,
        security: [],
        response: {
            [StatusCodes.OK]: ProjectSyncPlan,
        },
    },
}

const PushRepoRequestSchema = {
    config: {
        allowedPrincipals: [PrincipalType.USER],
        permission: Permission.WRITE_GIT_REPO,
    },
    schema: {
        description:
            'Push single flow to the git repository',
        body: PushGitRepoRequest,
        params: Type.Object({
            id: Type.String(),
        }),
        response: {
            [StatusCodes.OK]: Type.Never(),
        },
    },
}

const ConfigureRepoRequestSchema = {
    config: {
        allowedPrincipals: [PrincipalType.USER],
        permission: Permission.WRITE_GIT_REPO,
    },
    schema: {
        description: 'Upsert a git repository information for a project.',
        body: ConfigureRepoRequest,
        response: {
            [StatusCodes.CREATED]: GitRepoWithoutSensitiveData,
        },
    },
}

const ListRepoRequestSchema = {
    config: {
        allowedPrincipals: [PrincipalType.USER, PrincipalType.SERVICE],
        permission: Permission.READ_GIT_REPO,
    },
    schema: {
        querystring: Type.Object({
            projectId: Type.String(),
        }),
        response: {
            [StatusCodes.OK]: SeekPage(GitRepoWithoutSensitiveData),
        },
    },
}

