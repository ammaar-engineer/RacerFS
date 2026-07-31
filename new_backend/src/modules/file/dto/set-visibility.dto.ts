import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetVisibilityDto {
  @ApiProperty({
    example: 'photo.png',
    description: 'Name of the file',
  })
  @IsString()
  @IsNotEmpty()
  fileName!: string;

  @ApiProperty({
    example: true,
    description: 'Set file visibility to public (true) or private (false)',
  })
  @IsBoolean()
  @IsNotEmpty()
  isPublic!: boolean;
}
