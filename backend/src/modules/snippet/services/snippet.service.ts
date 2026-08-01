import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundException } from 'src/middleware/exceptions';
import { Repository } from 'typeorm';
import { Snippet } from '../../../entities/snippet.entity';
import { SnippetValidation } from '../validations/snippet.validation';

@Injectable()
export class SnippetService {
  constructor(
    @InjectRepository(Snippet)
    private readonly snippetRepo: Repository<Snippet>,
    private readonly snippetValidation: SnippetValidation,
  ) {}

  /**
   * Get user's snippet list
   */
  async getSnippetList(userId: number): Promise<Snippet[]> {
    const snippets = await this.snippetRepo.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' },
      loadEagerRelations: false,
    });

    return snippets;
  }

  /**
   * Create a new snippet
   */
  async createSnippet(data: {
    alias: string;
    description?: string | null;
    command: string;
    userId: number;
  }): Promise<Snippet> {
    await this.snippetValidation.snippetShouldBe(
      'notexist',
      data.alias,
      data.userId,
      { throwErr: true },
    );

    const snippet = this.snippetRepo.create({
      alias: data.alias,
      description: data.description ?? null,
      command: data.command,
      user_id: data.userId,
    });

    return await this.snippetRepo.save(snippet, { reload: false });
  }

  /**
   * Update snippet command
   */
  async updateSnippet(
    alias: string,
    userId: number,
    command: string,
  ): Promise<Snippet> {
    const snippet = await this.snippetValidation.snippetShouldBe(
      'exist',
      alias,
      userId,
      { throwErr: true },
    );

    if (!snippet) {
      throw new NotFoundException('Snippet not found'); // This should never happen due to validation
    }

    snippet.command = command;
    await this.snippetRepo.save(snippet, { reload: false });

    return snippet;
  }

  /**
   * Delete snippet
   */
  async deleteSnippet(alias: string, userId: number): Promise<void> {
    await this.snippetValidation.snippetShouldBe('exist', alias, userId, {
      throwErr: true,
    });

    await this.snippetRepo.delete({ alias, user_id: userId });
  }
}
