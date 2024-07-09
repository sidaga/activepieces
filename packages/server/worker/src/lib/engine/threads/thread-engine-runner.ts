import { mkdir } from 'fs/promises'
import path from 'path'
import { fileExists, logger, memoryLock, networkUtls, packageManager, SharedSystemProp, system, webhookSecretsUtils, WorkerSystemProps } from '@activepieces/server-shared'
import { Action, ActionType, assertNotNullOrUndefined, EngineOperation, EngineOperationType, ExecuteFlowOperation, ExecutePropsOptions, ExecuteStepOperation, ExecuteTriggerOperation, ExecuteValidateAuthOperation, flowHelper, FlowVersion, FlowVersionState, isNil, PiecePackage, TriggerHookType } from '@activepieces/shared'
import { pieceManager } from '../../piece-manager'
import { codeBuilder } from '../../utils/code-builder'
import { engineInstaller } from '../../utils/engine-installer'
import { webhookUtils } from '../../utils/webhook-utils'
import { CodeArtifact, EngineHelperResponse, EngineHelperResult, EngineRunner, engineRunnerUtils } from '../engine-runner'
import { pieceEngineUtil } from '../flow-enginer-util'
import { EngineWorker } from './worker'

const memoryLimit = Math.floor((Number(system.getOrThrow(SharedSystemProp.SANDBOX_MEMORY_LIMIT)) / 1024))
const sandboxPath = path.resolve('cache')
const enginePath = path.join(sandboxPath, 'main.js')
// TODO seperate this to a config file from flow worker concurrency as execute step is different operation
const workerConcurrency = Math.max(5, system.getNumber(WorkerSystemProps.FLOW_WORKER_CONCURRENCY) ?? 10)
let engineWorkers: EngineWorker

export const threadEngineRunner: EngineRunner = {
    async executeFlow(engineToken, operation) {
        logger.debug({
            flowVersion: operation.flowVersion.id,
            projectId: operation.projectId,
        }, '[threadEngineRunner#executeFlow]')
        await prepareFlowSandbox(engineToken, operation.flowVersion)

        const input: ExecuteFlowOperation = {
            ...operation,
            engineToken,
            publicUrl: await networkUtls.getPublicUrl(),
            internalApiUrl: networkUtls.getInternalApiUrl(),
        }

        return execute(input, EngineOperationType.EXECUTE_FLOW)
    },
    async executeTrigger(engineToken, operation) {
        logger.debug({
            hookType: operation.hookType,
            projectId: operation.projectId,
        }, '[threadEngineRunner#executeTrigger]')

        const triggerPiece = await pieceEngineUtil.getTriggerPiece(engineToken, operation.flowVersion)
        const lockedVersion = await pieceEngineUtil.lockPieceInFlowVersion({
            engineToken,
            stepName: operation.flowVersion.trigger.name,
            flowVersion: operation.flowVersion,
        })
        const input: ExecuteTriggerOperation<TriggerHookType> = {
            projectId: operation.projectId,
            hookType: operation.hookType,
            webhookUrl: operation.webhookUrl,
            triggerPayload: operation.triggerPayload,
            flowVersion: lockedVersion,
            appWebhookUrl: await webhookUtils.getAppWebhookUrl({
                appName: triggerPiece.pieceName,
            }),
            publicUrl: await networkUtls.getPublicUrl(),
            internalApiUrl: networkUtls.getInternalApiUrl(),
            webhookSecret: await webhookSecretsUtils.getWebhookSecret(lockedVersion),
            engineToken,
        }
        await prepareSandbox([triggerPiece], [])
        return execute(input, EngineOperationType.EXECUTE_TRIGGER_HOOK)
    },
    async extractPieceMetadata(operation) {
        logger.debug({ operation }, '[threadEngineRunner#extractPieceMetadata]')

        await prepareSandbox([operation], [])

        return execute(operation, EngineOperationType.EXTRACT_PIECE_METADATA)
    },
    async executeValidateAuth(engineToken, operation) {
        logger.debug({ operation }, '[threadEngineRunner#executeValidateAuth]')

        const { piece } = operation
        const lockedPiece = await pieceEngineUtil.getExactPieceVersion(engineToken, piece)
        await prepareSandbox([lockedPiece], [])
        const input: ExecuteValidateAuthOperation = {
            ...operation,
            publicUrl: await networkUtls.getPublicUrl(),
            internalApiUrl: networkUtls.getInternalApiUrl(),
            engineToken,
        }
        return execute(input, EngineOperationType.EXECUTE_VALIDATE_AUTH)
    },
    async executeAction(engineToken, operation) {
        logger.debug({
            stepName: operation.stepName,
            flowVersion: operation.flowVersion,
        }, '[threadEngineRunner#executeAction]')

        const step = flowHelper.getStep(operation.flowVersion, operation.stepName) as (Action | undefined)
        assertNotNullOrUndefined(step, 'Step not found')
        switch (step.type) {
            case ActionType.PIECE: {
                const lockedPiece = await pieceEngineUtil.getExactPieceForStep(engineToken, step)
                await prepareSandbox([lockedPiece], [])
                break
            }
            case ActionType.CODE: {
                const codes = pieceEngineUtil.getCodeSteps(operation.flowVersion).filter((code) => code.name === operation.stepName)
                await prepareSandbox([], codes)
                break
            }
            case ActionType.BRANCH:
            case ActionType.LOOP_ON_ITEMS:
                break
        }

        const lockedFlowVersion = await pieceEngineUtil.lockPieceInFlowVersion({
            engineToken,
            flowVersion: operation.flowVersion,
            stepName: operation.stepName,
        })

        const input: ExecuteStepOperation = {
            flowVersion: lockedFlowVersion,
            stepName: operation.stepName,
            projectId: operation.projectId,
            publicUrl: await networkUtls.getPublicUrl(),
            internalApiUrl: networkUtls.getInternalApiUrl(),
            engineToken,
        }

        return execute(input, EngineOperationType.EXECUTE_STEP)
    },
    async executeProp(engineToken, operation) {
        logger.debug({
            piece: operation.piece,
            propertyName: operation.propertyName,
            stepName: operation.stepName,
            flowVersion: operation.flowVersion,
        }, '[threadEngineRunner#executeProp]')

        const { piece } = operation

        const lockedPiece = await pieceEngineUtil.getExactPieceVersion(engineToken, piece)
        await prepareSandbox([lockedPiece], [])

        const input: ExecutePropsOptions = {
            ...operation,
            publicUrl: await networkUtls.getPublicUrl(),
            internalApiUrl: networkUtls.getInternalApiUrl(),
            engineToken,
        }
        return execute(input, EngineOperationType.EXECUTE_PROPERTY)
    },
}

async function prepareFlowSandbox(engineToken: string, flowVersion: FlowVersion): Promise<void> {
    const pieces = await pieceEngineUtil.extractFlowPieces({
        flowVersion,
        engineToken,
    })
    const codes = pieceEngineUtil.getCodeSteps(flowVersion)
    await prepareSandbox(pieces, codes)
}

async function execute<Result extends EngineHelperResult>(operation: EngineOperation, operationType: EngineOperationType): Promise<EngineHelperResponse<Result>> {

    const startTime = Date.now()
    if (isNil(engineWorkers)) {
        engineWorkers = new EngineWorker(workerConcurrency, enginePath, {
            env: getEnvironmentVariables(),
            resourceLimits: {
                maxOldGenerationSizeMb: memoryLimit,
                maxYoungGenerationSizeMb: memoryLimit,
                stackSizeMb: memoryLimit,
            },
        })
    }
    const { engine, stdError, stdOut } = await engineWorkers.executeTask(operationType, operation)
    return engineRunnerUtils.readResults({
        timeInSeconds: (Date.now() - startTime) / 1000,
        verdict: engine.status,
        output: engine.response,
        standardOutput: stdOut,
        standardError: stdError,
    })
}

async function prepareSandbox(pieces: PiecePackage[], codeSteps: CodeArtifact[]): Promise<void> {
    const lock = await memoryLock.acquire(sandboxPath)
    try {

        await mkdir(sandboxPath, { recursive: true })
        const buildJobs = codeSteps.map(async (archive) => {
            const indexPath = path.join(codeBuilder.buildPath({
                buildPath: sandboxPath,
                sourceCodeId: archive.name,
                flowVersionId: archive.flowVersionId,
            }), 'index.js')
            const fExists = await fileExists(indexPath)
            if (fExists && archive.flowVersionState === FlowVersionState.LOCKED) {
                return new Promise<void>((resolve) => resolve())
            }
            return prepareCode(archive, sandboxPath)
        })
        await Promise.all(buildJobs)

        logger.info({
            sandboxPath,
        }, 'Running flow in sandbox')
        await packageManager.init({
            path: sandboxPath,
        })

        logger.info({
            pieces,
            sandboxPath,
        }, 'Installing pieces in sandbox')
        await pieceManager.install({
            projectPath: sandboxPath,
            pieces,
        })

        logger.info({
            path: sandboxPath,
        }, 'Installing engine in sandbox')
        await engineInstaller.install({
            path: sandboxPath,
        })
    }
    finally {
        await lock.release()
    }

}

async function prepareCode(artifact: CodeArtifact, sandboxPath: string): Promise<void> {
    await codeBuilder.processCodeStep({
        sourceCodeId: artifact.name,
        sourceCode: artifact.sourceCode,
        flowVersionId: artifact.flowVersionId,
        buildPath: sandboxPath,
    })

}




function getEnvironmentVariables(): Record<string, string | undefined> {
    const allowedEnvVariables = system.getList(SharedSystemProp.SANDBOX_PROPAGATED_ENV_VARS)
    const propagatedEnvVars = Object.fromEntries(allowedEnvVariables.map((envVar) => [envVar, process.env[envVar]]))
    return {
        ...propagatedEnvVars,
        NODE_OPTIONS: '--enable-source-maps',
        AP_CODE_SANDBOX_TYPE: system.get(SharedSystemProp.CODE_SANDBOX_TYPE),
        AP_PIECES_SOURCE: system.getOrThrow(SharedSystemProp.PIECES_SOURCE),
        AP_BASE_CODE_DIRECTORY: `${sandboxPath}/codes`,
    }
}