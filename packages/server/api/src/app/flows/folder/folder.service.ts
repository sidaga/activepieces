import { databaseConnection } from '../../database/database-connection'
import { buildPaginator } from '../../helper/pagination/build-paginator'
import { paginationHelper } from '../../helper/pagination/pagination-utils'
import { flowService } from '../flow/flow.service'
import { FolderEntity } from './folder.entity'
import {
    ActivepiecesError,
    apId,
    CreateOrRenameFolderRequest,

    Cursor,
    ErrorCode,
    Folder,
    FolderDto,
    FolderId,
    isNil, ProjectId } from '@activepieces/shared'

export const folderRepo = databaseConnection.getRepository(FolderEntity)

export const flowFolderService = {
    async delete({
        projectId,
        folderId,
    }: {
        projectId: ProjectId
        folderId: FolderId
    }) {
        await folderRepo.delete({
            id: folderId,
            projectId,
        })
    },
    async update({
        projectId,
        folderId,
        request,
    }: {
        projectId: ProjectId
        folderId: FolderId
        request: CreateOrRenameFolderRequest
    }): Promise<Folder> {
        const folder = await folderRepo.findOneBy({
            projectId,
            id: folderId,
        })
        const folderWithDisplayName = await folderRepo.findOneBy({
            projectId,
            displayName: request.displayName,
        })
        if (folderWithDisplayName && folderWithDisplayName.id !== folderId) {
            throw new ActivepiecesError({
                code: ErrorCode.VALIDATION,
                params: { message: 'Folder displayName is used' },
            })
        }
        if (isNil(folder)) {
            throw new ActivepiecesError({
                code: ErrorCode.ENTITY_NOT_FOUND,
                params: {
                    message: `Folder ${folderId} is not found`,
                },
            })
        }
        const updatedFolder: Folder = {
            ...folder,
            displayName: request.displayName,
        }
        await folderRepo.update(folderId, updatedFolder)
        return updatedFolder
    },
    async upsert({
        projectId,
        request,
    }: {
        projectId: ProjectId
        request: CreateOrRenameFolderRequest
    }): Promise<FolderDto> {
        const folderWithDisplayName = await folderRepo.findOneBy({
            projectId,
            displayName: request.displayName,
        })
        const folderId = isNil(folderWithDisplayName) ? apId() : folderWithDisplayName.id
        await folderRepo.upsert({
            id: folderId,
            projectId,
            displayName: request.displayName,
        }, ['displayName'])
        const folder = await folderRepo.findOneByOrFail({ projectId, id: folderId })
        return {
            ...folder,
            numberOfFlows: 0,
        }
    },
    async list({
        projectId,
        cursorRequest,
        limit,
    }: {
        projectId: ProjectId
        cursorRequest: Cursor | null
        limit: number
    }) {
        const decodedCursor = paginationHelper.decodeCursor(cursorRequest)
        const paginator = buildPaginator({
            entity: FolderEntity,
            query: {
                limit,
                order: 'ASC',
                afterCursor: decodedCursor.nextCursor,
                beforeCursor: decodedCursor.previousCursor,
            },
        })
        const paginationResponse = await paginator.paginate(
            folderRepo.createQueryBuilder('folder').where({ projectId }),
        )
        const numberOfFlowForEachFolder: Promise<number>[] = []
        const dtosList: FolderDto[] = []
        paginationResponse.data.forEach((f) => {
            numberOfFlowForEachFolder.push(
                flowService.count({ projectId, folderId: f.id }),
            )
        });
        (await Promise.all(numberOfFlowForEachFolder)).forEach((num, idx) => {
            dtosList.push({ ...paginationResponse.data[idx], numberOfFlows: num })
        })
        return paginationHelper.createPage<FolderDto>(
            dtosList,
            paginationResponse.cursor,
        )
    },
    async getOneOrThrow({
        projectId,
        folderId,
    }: {
        projectId: ProjectId
        folderId: FolderId
    }): Promise<FolderDto> {
        const folder = await folderRepo.findOneBy({ projectId, id: folderId })
        if (!folder) {
            throw new ActivepiecesError({
                code: ErrorCode.ENTITY_NOT_FOUND,
                params: {
                    message: `Folder ${folderId} is not found`,
                },
            })
        }
        const numberOfFlows = await flowService.count({ projectId, folderId })
        return {
            ...folder,
            numberOfFlows,
        }
    },
}
