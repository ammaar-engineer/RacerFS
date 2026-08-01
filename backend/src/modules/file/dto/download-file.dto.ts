import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DownloadFileDto {
  @ApiProperty({
    example: 'photo.png',
    description: 'Name of the file to download',
  })
  @IsString()
  @IsNotEmpty()
  fileName!: string;
}
