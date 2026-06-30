import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';

@ApiTags('favorites')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all liked tracks for the current user' })
  findAll() {
    return this.favoritesService.findAll();
  }

  @Post(':trackId')
  @ApiOperation({ summary: 'Add a track to favorites (like)' })
  @ApiParam({ name: 'trackId', description: 'Jamendo track ID' })
  add(@Param('trackId') trackId: string) {
    return this.favoritesService.add(trackId);
  }

  @Delete(':trackId')
  @HttpCode(HttpStatus.NO_CONTENT) // 204 — for DELETE without response body
  @ApiOperation({ summary: 'Remove a track from favorites (unlike)' })
  @ApiParam({ name: 'trackId', description: 'Jamendo track ID' })
  remove(@Param('trackId') trackId: string) {
    return this.favoritesService.remove(trackId);
  }
}
