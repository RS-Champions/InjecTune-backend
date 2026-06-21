import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsUUID, Min, ValidateNested } from 'class-validator';

class TrackPositionDto {
  @ApiProperty({ description: 'playlist_tracks row id' })
  @IsUUID()
  id!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(0)
  position!: number;
}

export class ReorderTracksDto {
  @ApiProperty({ type: [TrackPositionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TrackPositionDto)
  tracks!: TrackPositionDto[];
}
