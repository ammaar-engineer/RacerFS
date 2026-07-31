import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Snippet } from '../../../entities/snippet.entity';
import {
  ConflictException,
  NotFoundException,
} from '../../../middleware/exceptions';

@Injectable()
export class SnippetValidation {
  constructor(
    @InjectRepository(Snippet)
    private readonly snippetRepo: Repository<Snippet>,
  ) {}

  /**
   * Validate snippet existence or non-existence
   */
  async snippetShouldBe(
    type: 'exist' | 'notexist',
    alias: string,
    userId: number,
    { throwErr = false }: { throwErr: boolean },
  ): Promise<Snippet | null> {
    const snippet = await this.snippetRepo.findOne({
      where: { alias, user_id: userId },
      loadEagerRelations: false,
    });

    if (type === 'exist' && !snippet && throwErr) {
      throw new NotFoundException('Snippet not found');
    }

    if (type === 'notexist' && snippet && throwErr) {
      throw new ConflictException('Snippet with this alias already exists');
    }

    return snippet;
  }
}
