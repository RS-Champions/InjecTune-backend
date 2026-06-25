import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePlaylistDto {
  @ApiProperty({ example: '1234567', description: 'Jamendo track ID' })
  @IsString()
  @IsNotEmpty()
  trackId!: string;
}
