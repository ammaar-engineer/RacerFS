import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Snippet } from "src/entity";
import { Repository } from "typeorm";
import { ConflictException, NotFoundException } from "src/CustomExceptionHandle";

@Injectable()
export class SnippetDbModules {
    constructor(
        @InjectRepository(Snippet) private readonly snippetRepo: Repository<Snippet>
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

    async getSnippetList(user_id: number) {
        const snippets = await this.snippetRepo.find({
            where: { user_id },
            order: { created_at: 'DESC' },
            loadEagerRelations: false
        })
        return snippets.map(s => ({
            id: s.id,
            alias: s.alias,
            description: s.description,
            command: s.command,
            created_at: s.created_at
        }))
    }

    async createSnippet({alias, description, command, user_id}: {
        alias: string,
        description?: string | null,
        command: string,
        user_id: number
    }) {
        await this.snippetShouldBe('notexist', alias, user_id, {throwErr: true})
        const snippet = this.snippetRepo.create({
            alias,
            description: description ?? null,
            command,
            user_id
        })
        return await this.snippetRepo.save(snippet)
    }

    async updateSnippet(alias: string, user_id: number, command: string) {
        await this.snippetShouldBe('exist', alias, user_id, {throwErr: true})
        await this.snippetRepo.update({ alias, user_id }, { command })
        return { alias, command }
    }

    async deleteSnippet(alias: string, user_id: number) {
        await this.snippetShouldBe('exist', alias, user_id, {throwErr: true})
        await this.snippetRepo.delete({ alias, user_id })
    }
}
