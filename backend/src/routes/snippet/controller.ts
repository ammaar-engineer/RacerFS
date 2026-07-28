import { Body, Controller, Delete, Get, Headers, Patch, Post, Query } from "@nestjs/common";
import { ApiBody, ApiHeader, ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { SnippetServices } from "src/services/snippet.services";
import { SuccessResponse } from "src/utilities/Success.Response";
import { DtoUtilites } from "src/utilities/custom.dto.validator";
import { SnippetCreateBodyDTO, SnippetCreateHeaderDTO, SnippetDeleteHeaderDTO, SnippetDeleteQueryDTO, SnippetEditBodyDTO, SnippetEditHeaderDTO, SnippetEditQueryDTO, SnippetListHeaderDTO } from "src/routes/models/snippet.route.dto";
import { TokenValidations } from "src/validation/token.validations";

@ApiTags('snippet')
@Controller("snippet")
export class SnippetRouteController {
    constructor(
        private readonly tokenValidations: TokenValidations,
        private readonly dtoUtilites: DtoUtilites,
        private readonly snippetServices: SnippetServices,
    ) {}

    @ApiOperation({ summary: 'Get snippet list' })
    @ApiHeader({ name: 'authorization', description: 'JWT account token', required: true })
    @ApiResponse({
        status: 200,
        description: 'Snippet list retrieved successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                message: 'Snippet list retrieved successfully',
                errorCode: '',
                data: {
                    snippets: [
                        {
                            id: 1,
                            alias: 'gs',
                            description: 'Shows git status',
                            command: 'git status',
                            user_id: 1,
                            created_at: '2026-01-01T00:00:00.000Z'
                        }
                    ]
                }
            }
        }
    })
    @Get("list")
    async getSnippetList(
        @Headers() headers: Record<string, string>
    ) {
        const headerData = await this.dtoUtilites.validateSourceDTO(SnippetListHeaderDTO, headers)
        const { user_id } = this.tokenValidations.isValidAccountToken(headerData['authorization'])
        const snippets = await this.snippetServices.getSnippetList(user_id)
        return SuccessResponse("Snippet list retrieved successfully", { snippets })
    }

    @ApiOperation({ summary: 'Create a new snippet' })
    @ApiHeader({ name: 'authorization', description: 'JWT account token', required: true })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['alias', 'command'],
            properties: {
                alias: { type: 'string', example: 'gs', description: 'Short alias to trigger the snippet' },
                command: { type: 'string', example: 'git status', description: 'Command to execute' },
                description: { type: 'string', example: 'Shows git status', description: 'Optional description of the snippet', nullable: true }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Snippet created successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                message: 'Snippet created successfully',
                errorCode: '',
                data: {
                    snippet: {
                        id: 1,
                        alias: 'gs',
                        description: 'Shows git status',
                        command: 'git status',
                        created_at: '2026-01-01T00:00:00.000Z'
                    }
                }
            }
        }
    })
    @Post("create")
    async createSnippet(
        @Headers() headers: Record<string, string>,
        @Body() body: Record<string, any>
    ) {
        const headerData = await this.dtoUtilites.validateSourceDTO(SnippetCreateHeaderDTO, headers)
        const bodyData = await this.dtoUtilites.validateSourceDTO(SnippetCreateBodyDTO, body)
        const { user_id } = this.tokenValidations.isValidAccountToken(headerData['authorization'])
        const snippet = await this.snippetServices.createSnippet({
            alias: bodyData['alias'],
            description: bodyData['description'],
            command: bodyData['command'],
            user_id
        })
        return SuccessResponse("Snippet created successfully", {
            snippet: {
                id: snippet.id,
                alias: snippet.alias,
                description: snippet.description,
                command: snippet.command,
                created_at: snippet.created_at
            }
        })
    }

    @ApiOperation({ summary: 'Delete a snippet' })
    @ApiHeader({ name: 'authorization', description: 'JWT account token', required: true })
    @ApiQuery({ name: 'alias', description: 'Alias of the snippet to delete', example: 'gs' })
    @ApiResponse({
        status: 200,
        description: 'Snippet deleted successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                message: "Snippet 'gs' deleted successfully",
                errorCode: '',
                data: null
            }
        }
    })
    @Delete("delete")
    async deleteSnippet(
        @Headers() headers: Record<string, string>,
        @Query() query: Record<string, string>
    ) {
        const headerData = await this.dtoUtilites.validateSourceDTO(SnippetDeleteHeaderDTO, headers)
        const queryData = await this.dtoUtilites.validateSourceDTO(SnippetDeleteQueryDTO, query)
        const { user_id } = this.tokenValidations.isValidAccountToken(headerData['authorization'])
        await this.snippetServices.deleteSnippet(queryData['alias'], user_id)
        return SuccessResponse(`Snippet '${queryData['alias']}' deleted successfully`)
    }

    @ApiOperation({ summary: 'Edit a snippet command' })
    @ApiHeader({ name: 'authorization', description: 'JWT account token', required: true })
    @ApiQuery({ name: 'alias', description: 'Alias of the snippet to edit', example: 'gs' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['command'],
            properties: {
                command: { type: 'string', example: 'git status --short', description: 'New command to replace the existing one' }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Snippet updated successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                message: "Snippet 'gs' updated successfully",
                errorCode: '',
                data: {
                    snippet: {
                        id: 1,
                        alias: 'gs',
                        description: 'Shows git status',
                        command: 'git status --short',
                        user_id: 1,
                        created_at: '2026-01-01T00:00:00.000Z'
                    }
                }
            }
        }
    })
    @Patch("edit")
    async updateSnippet(
        @Headers() headers: Record<string, string>,
        @Query() query: Record<string, string>,
        @Body() body: Record<string, any>
    ) {
        const headerData = await this.dtoUtilites.validateSourceDTO(SnippetEditHeaderDTO, headers)
        const queryData = await this.dtoUtilites.validateSourceDTO(SnippetEditQueryDTO, query)
        const bodyData = await this.dtoUtilites.validateSourceDTO(SnippetEditBodyDTO, body)
        const { user_id } = this.tokenValidations.isValidAccountToken(headerData['authorization'])
        const result = await this.snippetServices.updateSnippet(queryData['alias'], user_id, bodyData['command'])
        return SuccessResponse(`Snippet '${result.alias}' updated successfully`, { snippet: result })
    }
}