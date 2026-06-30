import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RecentlyPlayedService } from './recently-played.service';
import { RecentlyPlayedFilterDto } from './dto/recently-played-filter.dto';
import { AddRecentlyPlayedDto } from './dto/add-recently-played.dto';

@ApiTags('recently-played')
@Controller('recently-played')
export class RecentlyPlayedController {
  constructor(private readonly recentlyPlayedService: RecentlyPlayedService) {}

  @Get()
  @ApiOperation({
    summary: 'Get recently played tracks, optionally filtered by date range',
  })
  findAll(@Query() filter: RecentlyPlayedFilterDto) {
    return this.recentlyPlayedService.findAll(filter);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record a played track' })
  add(@Body() dto: AddRecentlyPlayedDto) {
    return this.recentlyPlayedService.add(dto);
  }
}
