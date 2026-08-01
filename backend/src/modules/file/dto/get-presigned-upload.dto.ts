import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GetPresignedUploadDto {
  @ApiProperty({
    example: 'photo.png',
    description: 'Name of the file to upload',
  })
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty({
    example: 204800,
    description: 'File size in bytes',
  })
  @IsNotEmpty()
  fileSize!: number;
}
