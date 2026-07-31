import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteFileDto {
  @ApiProperty({
    example: 'photo.png',
    description: 'Name of the file to delete',
  })
  @IsString()
  @IsNotEmpty()
  fileName!: string;
}
