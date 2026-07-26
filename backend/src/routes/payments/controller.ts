import { Controller, Get, Headers } from "@nestjs/common";
import { ApiHeader, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { PaymentServices } from "src/services/payments.services";
import { DtoUtilites } from "src/utilities/custom.dto.validator";
import { SuccessResponse } from "src/utilities/Success.Response";
import { BuyStorageHeadersDTO } from "src/validation/payment.route.dto";
import { TokenValidations } from "src/validation/token.validations";

@ApiTags('payment')
@Controller("payment")
export class PaymentRouteController {
    constructor(
        private readonly tokenValidation: TokenValidations,
        private readonly dtoValidation: DtoUtilites,
        private readonly paymentServices: PaymentServices
    ) {}

    @ApiOperation({ summary: 'Add 100MB to user storage' })
    @ApiHeader({ name: 'authorization', description: 'JWT account token', required: true })
    @ApiResponse({
        status: 200,
        description: 'Storage added successfully',
        schema: {
            example: {
                success: true,
                statusCode: 200,
                message: 'Added 100mb+ to storage',
                errorCode: '',
                data: null
            }
        }
    })
    @Get("buy-storage")
    async buyStorageEndpoint(
        @Headers() headers: Record<string, string>,
    ) {
        const headersData = await this.dtoValidation.validateSourceDTO(BuyStorageHeadersDTO, headers)
        const {user_id} = this.tokenValidation.isValidAccountToken(headersData['authorization'])
        await this.paymentServices.addStorage(user_id, 104857600)
        return SuccessResponse("Added 100mb+ to storage")
    }

    // Callback / webhook
}