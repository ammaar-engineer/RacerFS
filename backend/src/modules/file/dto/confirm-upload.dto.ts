import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ConfirmUploadDto {
  @ApiProperty({
    example: 'photo.png',
    description: 'Name of the uploaded file',
  })
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    description: 'File key returned from upload-url endpoint',
  })
  @IsString()
  @IsNotEmpty()
  fileKey!: string;

  @ApiProperty({
    example: 204800,
    description: 'File size in bytes',
  })
  @IsNotEmpty()
  fileSize!: number;

  @ApiProperty({
    example: 'SUCCESS',
    description: 'Upload result status',
    enum: ['SUCCESS', 'FAILED'],
  })
  @IsString()
  @IsIn(['SUCCESS', 'FAILED'])
  @IsNotEmpty()
  status!: 'SUCCESS' | 'FAILED';
}
