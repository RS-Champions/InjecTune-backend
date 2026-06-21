import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { AddTrackDto } from './dto/add-track.dto';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { ReorderTracksDto } from './dto/reorder-tracks.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';

@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  create(@Body() createPlaylistDto: CreatePlaylistDto) {
    return this.playlistsService.create(createPlaylistDto);
  }

  @Get()
  findAll() {
    return this.playlistsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.playlistsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePlaylistDto: UpdatePlaylistDto,
  ) {
    return this.playlistsService.update(id, updatePlaylistDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.playlistsService.remove(id);
  }

  @Post(':id/tracks')
  addTrack(@Param('id') id: string, @Body() addTrackDto: AddTrackDto) {
    return this.playlistsService.addTrack(id, addTrackDto);
  }

  @Delete(':id/tracks/:trackId')
  removeTrack(
    @Param('id') id: string,
    @Param('trackId') trackId: string,
    @Query('source') source: 'jamendo' | 'own' = 'jamendo',
  ) {
    return this.playlistsService.removeTrack(id, source, trackId);
  }

  @Patch(':id/reorder')
  reorderTracks(
    @Param('id') id: string,
    @Body() reorderTracksDto: ReorderTracksDto,
  ) {
    return this.playlistsService.reorderTracks(id, reorderTracksDto);
  }
}
