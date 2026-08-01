import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Snippet } from "src/entity";
import { Repository } from "typeorm";
import { ConflictException, NotFoundException } from "src/CustomExceptionHandle";

@Injectable()
export class SnippetValidations {
    constructor(
        @InjectRepository(Snippet) private readonly snippetRepo: Repository<Snippet>,
    ) {}

    async snippetShouldBe(
        type: 'exist' | 'notexist',
        alias: string,
        user_id: number,
        {throwErr = false}: {throwErr: boolean}
    ) {
        const snippet = await this.snippetRepo.findOne({
            where: { alias, user_id },
            loadEagerRelations: false
        })
        if (type === 'exist' && !snippet && throwErr) {
            throw new NotFoundException("Snippet not found")
        }
        if (type === 'notexist' && snippet && throwErr) {
            throw new ConflictException("Snippet with this alias already exists")
        }
        return snippet
    }
}