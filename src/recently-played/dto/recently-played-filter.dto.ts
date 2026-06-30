import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class RecentlyPlayedFilterDto {
  @ApiPropertyOptional({
    example: '2026-06-01',
    description: 'Filter tracks played on or after this date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({
    example: '2026-06-28',
    description: 'Filter tracks played on or before this date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  to?: string;
}
