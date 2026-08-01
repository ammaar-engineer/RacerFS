import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Snippet } from '../../entities/snippet.entity';
import { SnippetController } from './controllers/snippet.controller';
import { SnippetService } from './services/snippet.service';
import { SnippetValidation } from './validations/snippet.validation';

@Module({
  imports: [TypeOrmModule.forFeature([Snippet])],
  controllers: [SnippetController],
  providers: [SnippetService, SnippetValidation],
  exports: [SnippetService],
})
export class SnippetModule {}
