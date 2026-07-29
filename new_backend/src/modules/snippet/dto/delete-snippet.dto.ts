import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteSnippetDto {
  @IsString()
  @IsNotEmpty()
  alias!: string;
}
