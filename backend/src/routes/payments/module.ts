import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "src/entity";
import { PaymentServices } from "src/services/payments.services";
import { DtoUtilites } from "src/utilities/custom.dto.validator";
import { TokenValidations } from "src/validation/token.validations";
import { PaymentRouteController } from "./controller";

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    controllers: [PaymentRouteController],
    providers: [PaymentServices, DtoUtilites, TokenValidations]
})
export class PaymentRouteModule {}