import { IsNotEmpty, IsString } from 'class-validator';

export class EditSnippetDto {
  @IsString()
  @IsNotEmpty()
  alias!: string;

  @IsString()
  @IsNotEmpty()
  command!: string;
}
