import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Snippet } from "src/entity";
import { SnippetRouteController } from "./controller";
import { SnippetServices } from "src/services/snippet.services";
import { DtoUtilites } from "src/utilities/custom.dto.validator";
import { SnippetValidations } from "src/validation/snippet.validations";

@Module({
    imports: [
        TypeOrmModule.forFeature([Snippet])
    ],
    controllers: [SnippetRouteController],
    providers: [SnippetServices, DtoUtilites, SnippetValidations],
    exports: [SnippetServices]
})
export class SnippetRouteModule {}