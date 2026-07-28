import { Body, Controller, Delete, Headers, Post } from "@nestjs/common";
import { ApiBody, ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { TokenServices } from "src/global_services/token.services";
import { DtoUtilites } from "src/utilities/custom.dto.validator";
import { SuccessResponse } from "src/utilities/Success.Response";
import { TokenValidations } from "src/validation/token.validations";
import { TokenDeleteAccessTokenBodyDTO, TokenDeleteAccessTokenHeaderDTO, TokenGenerateAccessTokenHeaderDTO } from "src/routes/models/token.route.dto";

@ApiTags('token')
@Controller("token")
export class TokenRouteController {
    constructor(
        private readonly tokenValidations: TokenValidations,
        private readonly tokenServices: TokenServices,
        private readonly dtoUtilites: DtoUtilites,
    ) {}

    @ApiOperation({ summary: 'Generate a new access token' })
    @ApiHeader({ name: 'authorization', description: 'JWT account token', required: true })
    @ApiResponse({
        status: 200,
        description: 'Access token generated successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                message: 'Access token generated successfully',
                errorCode: '',
                data: {
                    access_token: 'eyJhbGciOiJIUzI1NiJ9...'
                }
            }
        }
    })
    @Post("generate-access-token")
    async generateAccessToken(
        @Headers() headers: Record<string, string>,
    ) {
        const headerData = await this.dtoUtilites.validateSourceDTO(TokenGenerateAccessTokenHeaderDTO, headers)
        const { user_id } = this.tokenValidations.isValidAccountToken(headerData['authorization'])
        const token = await this.tokenServices.generateAccessToken(user_id)
        await this.tokenServices.createAccessToken(user_id, token)
        return SuccessResponse("Access token generated successfully", { access_token: token })
    }

    @ApiOperation({ summary: 'Delete an access token' })
    @ApiHeader({ name: 'authorization', description: 'JWT account token', required: true })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['token'],
            properties: {
                'token': { type: 'string', example: 'at_abc123xyz...', description: 'Access token to delete' }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Access token deleted successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                message: 'Access token deleted successfully',
                errorCode: '',
                data: null
            }
        }
    })
    @Delete("delete-access-token")
    async deleteAccessToken(
        @Headers() headers: Record<string, string>,
        @Body() body: Record<string, string>,
    ) {
        const headerData = await this.dtoUtilites.validateSourceDTO(TokenDeleteAccessTokenHeaderDTO, headers)
        const bodyData = await this.dtoUtilites.validateSourceDTO(TokenDeleteAccessTokenBodyDTO, body)
        const { user_id } = this.tokenValidations.isValidAccountToken(headerData['authorization'])
        await this.tokenServices.deleteAccessToken(bodyData['token'], user_id)
        return SuccessResponse("Access token deleted successfully")
    }
}
