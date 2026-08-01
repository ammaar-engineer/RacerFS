import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAccessTokenDto {
  @ApiProperty({
    example: 'my-share-token',
    description: 'Token name/label for identification',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;
}
