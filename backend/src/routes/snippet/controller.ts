import { Body, Controller, Delete, Get, Headers, Patch, Post, Query } from "@nestjs/common";
import { SuccessResponse } from "src/utilities/Success.Response";
import { DtoUtilites } from "src/utilities/custom.dto.validator";
import { SnippetListHeaderDTO, SnippetCreateHeaderDTO, SnippetCreateBodyDTO, SnippetDeleteHeaderDTO, SnippetDeleteQueryDTO, SnippetEditHeaderDTO, SnippetEditQueryDTO, SnippetEditBodyDTO } from "src/validation/snippet.route.dto";
import { SnippetServices } from "src/services/snippet.services";
import { TokenServices } from "src/services/token.services";

@Controller("snippet")
export class SnippetRouteController {
    constructor(
        private readonly tokenServices: TokenServices,
        private readonly dtoUtilites: DtoUtilites,
        private readonly snippetServices: SnippetServices,
    ) {}

    @Get("list")
    async getSnippetList(
        @Headers() headers: Record<string, string>
    ) {
        const headerData = await this.dtoUtilites.validateSourceDTO(SnippetListHeaderDTO, headers)
        const { user_id } = this.tokenServices.isValidAccountToken(headerData['authorization'])
        const snippets = await this.snippetServices.getSnippetList(user_id)
        return SuccessResponse("Snippet list retrieved successfully", { snippets })
    }

    @Post("create")
    async createSnippet(
        @Headers() headers: Record<string, string>,
        @Body() body: Record<string, any>
    ) {
        const headerData = await this.dtoUtilites.validateSourceDTO(SnippetCreateHeaderDTO, headers)
        const bodyData = await this.dtoUtilites.validateSourceDTO(SnippetCreateBodyDTO, body)
        const { user_id } = this.tokenServices.isValidAccountToken(headerData['authorization'])
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

    @Delete("delete")
    async deleteSnippet(
        @Headers() headers: Record<string, string>,
        @Query() query: Record<string, string>
    ) {
        const headerData = await this.dtoUtilites.validateSourceDTO(SnippetDeleteHeaderDTO, headers)
        const queryData = await this.dtoUtilites.validateSourceDTO(SnippetDeleteQueryDTO, query)
        const { user_id } = this.tokenServices.isValidAccountToken(headerData['authorization'])
        await this.snippetServices.deleteSnippet(queryData['alias'], user_id)
        return SuccessResponse(`Snippet '${queryData['alias']}' deleted successfully`)
    }

    @Patch("edit")
    async updateSnippet(
        @Headers() headers: Record<string, string>,
        @Query() query: Record<string, string>,
        @Body() body: Record<string, any>
    ) {
        const headerData = await this.dtoUtilites.validateSourceDTO(SnippetEditHeaderDTO, headers)
        const queryData = await this.dtoUtilites.validateSourceDTO(SnippetEditQueryDTO, query)
        const bodyData = await this.dtoUtilites.validateSourceDTO(SnippetEditBodyDTO, body)
        const { user_id } = this.tokenServices.isValidAccountToken(headerData['authorization'])
        const result = await this.snippetServices.updateSnippet(queryData['alias'], user_id, bodyData['command'])
        return SuccessResponse(`Snippet '${result.alias}' updated successfully`, { snippet: result })
    }
}
