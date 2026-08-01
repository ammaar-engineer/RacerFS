import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiDocs } from '../../../decorators/api-docs.decorator';
import { CurrentToken } from '../../../decorators/current-token.decorator';
import { AccountTokenAuthGuard } from '../../../middleware/account-token-auth.guard';
import { SuccessResponse } from '../../../utilities/success.response';
import { CreateSnippetDto, DeleteSnippetDto, EditSnippetDto } from '../dto';
import { SnippetService } from '../services/snippet.service';
import {
  createSnippetDocs,
  deleteSnippetDocs,
  editSnippetDocs,
  listSnippetsDocs,
} from './docs';

@ApiTags('snippet')
@Controller('snippet')
@UseGuards(AccountTokenAuthGuard)
export class SnippetController {
  constructor(private readonly snippetService: SnippetService) {}

  @ApiDocs(listSnippetsDocs)
  @Get('list')
  async getSnippetList(@CurrentToken('user_id') userId: number) {
    const snippets = await this.snippetService.getSnippetList(userId);
    return SuccessResponse('Snippet list retrieved successfully', { snippets });
  }

  @ApiDocs({ ...createSnippetDocs, bodyType: CreateSnippetDto })
  @Post('create')
  async createSnippet(
    @CurrentToken('user_id') userId: number,
    @Body() body: CreateSnippetDto,
  ) {
    const snippet = await this.snippetService.createSnippet({
      alias: body.alias,
      description: body.description,
      command: body.command,
      userId,
    });

    return SuccessResponse('Snippet created successfully', {
      snippet: {
        id: snippet.id,
        alias: snippet.alias,
        description: snippet.description,
        command: snippet.command,
        created_at: snippet.created_at,
      },
    });
  }

  @ApiDocs({ ...deleteSnippetDocs, bodyType: DeleteSnippetDto })
  @Delete('delete')
  async deleteSnippet(
    @CurrentToken('user_id') userId: number,
    @Query() query: DeleteSnippetDto,
  ) {
    await this.snippetService.deleteSnippet(query.alias, userId);
    return SuccessResponse(`Snippet '${query.alias}' deleted successfully`);
  }

  @ApiDocs({ ...editSnippetDocs, bodyType: EditSnippetDto })
  @Patch('edit')
  async updateSnippet(
    @CurrentToken('user_id') userId: number,
    @Query('alias') alias: string,
    @Body() body: EditSnippetDto,
  ) {
    const snippet = await this.snippetService.updateSnippet(
      alias,
      userId,
      body.command,
    );

    return SuccessResponse(`Snippet '${snippet.alias}' updated successfully`, {
      snippet,
    });
  }
}
