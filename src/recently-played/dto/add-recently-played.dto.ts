import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class AddRecentlyPlayedDto {
  @ApiProperty({ enum: ['jamendo', 'own'], example: 'jamendo' })
  @IsIn(['jamendo', 'own'])
  @IsNotEmpty()
  source!: 'jamendo' | 'own';

  @ApiProperty({ example: '1234567' })
  @IsString()
  @IsNotEmpty()
  trackId!: string;
}
