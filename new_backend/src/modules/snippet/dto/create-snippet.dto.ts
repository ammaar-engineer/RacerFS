import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSnippetDto {
  @IsString()
  @IsNotEmpty()
  alias!: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsString()
  @IsNotEmpty()
  command!: string;
}
