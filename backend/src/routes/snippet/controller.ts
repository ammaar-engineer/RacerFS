import { Body, Controller, Delete, Get, Headers, Patch, Post, Query } from "@nestjs/common";
import { SuccessResponse } from "src/utilities/Success.Response";
import { SnippetRawModules, SnippetListHeaderDTO, SnippetCreateHeaderDTO, SnippetCreateBodyDTO, SnippetDeleteHeaderDTO, SnippetDeleteQueryDTO, SnippetEditHeaderDTO, SnippetEditQueryDTO, SnippetEditBodyDTO } from "./raw.main";
import { SnippetDbModules } from "./db.main";
import { PermissionGlobalBridge } from "src/global_bridge/permission.bridge";

@Controller("snippet")
export class SnippetRouteController {
    constructor(
        private readonly permissionBridge: PermissionGlobalBridge,
        private readonly rawSnippet: SnippetRawModules,
        private readonly dbSnippet: SnippetDbModules,
    ) {}

    @Get("list")
    async getSnippetList(
        @Headers() headers: Record<string, string>
    ) {
        const headerData = await this.rawSnippet.validateSourceDTO(SnippetListHeaderDTO, headers)
        const { user_id } = this.permissionBridge.isValidAccountToken(headerData['authorization'])
        const snippets = await this.dbSnippet.getSnippetList(user_id)
        return SuccessResponse("Snippet list retrieved successfully", { snippets })
    }

    @Post("create")
    async createSnippet(
        @Headers() headers: Record<string, string>,
        @Body() body: Record<string, any>
    ) {
        const headerData = await this.rawSnippet.validateSourceDTO(SnippetCreateHeaderDTO, headers)
        const bodyData = await this.rawSnippet.validateSourceDTO(SnippetCreateBodyDTO, body)
        const { user_id } = this.permissionBridge.isValidAccountToken(headerData['authorization'])
        const snippet = await this.dbSnippet.createSnippet({
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
        const headerData = await this.rawSnippet.validateSourceDTO(SnippetDeleteHeaderDTO, headers)
        const queryData = await this.rawSnippet.validateSourceDTO(SnippetDeleteQueryDTO, query)
        const { user_id } = this.permissionBridge.isValidAccountToken(headerData['authorization'])
        await this.dbSnippet.deleteSnippet(queryData['alias'], user_id)
        return SuccessResponse(`Snippet '${queryData['alias']}' deleted successfully`)
    }

    @Patch("edit")
    async updateSnippet(
        @Headers() headers: Record<string, string>,
        @Query() query: Record<string, string>,
        @Body() body: Record<string, any>
    ) {
        const headerData = await this.rawSnippet.validateSourceDTO(SnippetEditHeaderDTO, headers)
        const queryData = await this.rawSnippet.validateSourceDTO(SnippetEditQueryDTO, query)
        const bodyData = await this.rawSnippet.validateSourceDTO(SnippetEditBodyDTO, body)
        const { user_id } = this.permissionBridge.isValidAccountToken(headerData['authorization'])
        const result = await this.dbSnippet.updateSnippet(queryData['alias'], user_id, bodyData['command'])
        return SuccessResponse(`Snippet '${result.alias}' updated successfully`, { snippet: result })
    }
}
