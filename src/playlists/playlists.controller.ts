import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { AddTrackDto } from './dto/add-track.dto';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { ReorderTracksDto } from './dto/reorder-tracks.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('playlists')
@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new playlist to playlists' })
  create(@Body() createPlaylistDto: CreatePlaylistDto) {
    return this.playlistsService.create(createPlaylistDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all playlists for the current user' })
  findAll() {
    return this.playlistsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a playlist specified by id' })
  @ApiParam({ name: 'id', description: 'playlist ID' })
  findOne(@Param('id') id: string) {
    return this.playlistsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a playlist specified by id' })
  @ApiParam({ name: 'id', description: 'playlist ID' })
  update(
    @Param('id') id: string,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
  ) {
    return this.playlistsService.update(id, updatePlaylistDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a playlist specified by id' })
  @ApiParam({ name: 'id', description: 'playlist ID' })
  remove(@Param('id') id: string) {
    return this.playlistsService.remove(id);
  }

  @Post(':id/tracks')
  @ApiOperation({ summary: 'Add a track to a playlist specified by id' })
  @ApiParam({ name: 'id', description: 'playlist ID' })
  addTrack(@Param('id') id: string, @Body() addTrackDto: AddTrackDto) {
    return this.playlistsService.addTrack(id, addTrackDto);
  }

  @Delete(':id/tracks/:trackId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a track from a playlist specified by id' })
  @ApiParam({ name: 'id', description: 'playlist ID' })
  @ApiParam({ name: 'trackId', description: 'track ID' })
  @ApiQuery({
    name: 'source',
    enum: ['jamendo', 'own'],
    required: false,
    description: 'Track source (defaults to jamendo)',
  })
  removeTrack(
    @Param('id') id: string,
    @Param('trackId') trackId: string,
    @Query('source') source: 'jamendo' | 'own' = 'jamendo',
  ) {
    return this.playlistsService.removeTrack(id, source, trackId);
  }

  @Patch(':id/reorder')
  @ApiOperation({ summary: 'Reorder tracks in a playlist specified by id' })
  @ApiParam({ name: 'id', description: 'playlist ID' })
  reorderTracks(
    @Param('id') id: string,
    @Body() reorderTracksDto: ReorderTracksDto,
  ) {
    return this.playlistsService.reorderTracks(id, reorderTracksDto);
  }
}
