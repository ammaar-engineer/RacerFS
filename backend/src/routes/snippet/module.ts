import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Snippet } from "src/entity";
import { SnippetRouteController } from "./controller";
import { SnippetDbModules } from "./db.main";
import { SnippetRawModules } from "./raw.main";

@Module({
    imports: [
        TypeOrmModule.forFeature([Snippet])
    ],
    controllers: [SnippetRouteController],
    providers: [SnippetDbModules, SnippetRawModules]
})
export class SnippetRouteModule {}
