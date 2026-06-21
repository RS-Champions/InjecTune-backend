import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class AddTrackDto {
  @ApiProperty({ enum: ['jamendo', 'own'], example: 'jamendo' })
  @IsIn(['jamendo', 'own'])
  source!: 'jamendo' | 'own';

  @ApiProperty({ example: '1234567' })
  @IsString()
  @IsNotEmpty()
  trackId!: string;

  @ApiProperty({
    example: 0,
    description: 'Position in the playlist (0-indexed)',
  })
  @IsInt()
  @Min(0)
  position!: number;
}
