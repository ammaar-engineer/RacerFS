import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteAccessTokenDto {
  @ApiProperty({
    example: 'abc123-def456-ghi789',
    description: 'The access token string to delete',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;
}
