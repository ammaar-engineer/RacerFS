import { Controller, Get, Headers } from "@nestjs/common";
import { PaymentServices } from "src/services/payments.services";
import { DtoUtilites } from "src/utilities/custom.dto.validator";
import { SuccessResponse } from "src/utilities/Success.Response";
import { BuyStorageHeadersDTO } from "src/validation/payment.route.dto";
import { TokenValidations } from "src/validation/token.validations";

@Controller("payment")
export class PaymentRouteController {
    constructor(
        private readonly tokenValidation: TokenValidations,
        private readonly dtoValidation: DtoUtilites,
        private readonly paymentServices: PaymentServices
    ) {}
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