import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePlaylistDto {
  @ApiProperty({ example: 'Workout Mix' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @ApiPropertyOptional({ example: 'Songs to lift to' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
