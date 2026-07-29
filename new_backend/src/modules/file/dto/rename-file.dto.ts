import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RenameFileDto {
  @ApiProperty({
    example: 'old-filename.txt',
    description: 'Current file name',
  })
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty({
    example: 'new-filename.txt',
    description: 'New file name',
  })
  @IsString()
  @IsNotEmpty()
  newName!: string;
}
