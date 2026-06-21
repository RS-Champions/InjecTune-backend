import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { AddTrackDto } from './dto/add-track.dto';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { ReorderTracksDto } from './dto/reorder-tracks.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';

const STUB_USER_ID = '00000000-0000-0000-0000-000000000001';

@Injectable()
export class PlaylistsService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async create(createPlaylistDto: CreatePlaylistDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('playlists')
      .insert({ ...createPlaylistDto, user_id: STUB_USER_ID })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('playlists')
      .select()
      .eq('user_id', STUB_USER_ID);

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  // Теперь возвращает плейлист вместе со всеми его треками (join),
  // отсортированными по позиции — фронту не нужно делать второй запрос.
  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('playlists')
      .select('*, playlist_tracks(*)')
      .eq('id', id)
      .eq('user_id', STUB_USER_ID)
      .order('position', {
        referencedTable: 'playlist_tracks',
        ascending: true,
      })
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new NotFoundException(`Playlist #${id} not found`);
    }

    return data;
  }

  async update(id: string, updatePlaylistDto: UpdatePlaylistDto) {
    await this.assertOwnership(id);

    const { data, error } = await this.supabaseService
      .getClient()
      .from('playlists')
      .update({ ...updatePlaylistDto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async remove(id: string) {
    await this.assertOwnership(id);

    const { error } = await this.supabaseService
      .getClient()
      .from('playlists')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async addTrack(playlistId: string, addTrackDto: AddTrackDto) {
    await this.assertOwnership(playlistId);

    const { data, error } = await this.supabaseService
      .getClient()
      .from('playlist_tracks')
      .insert({
        playlist_id: playlistId,
        source: addTrackDto.source,
        track_id: addTrackDto.trackId,
        position: addTrackDto.position,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async removeTrack(
    playlistId: string,
    source: 'jamendo' | 'own',
    trackId: string,
  ) {
    await this.assertOwnership(playlistId);

    const { error } = await this.supabaseService
      .getClient()
      .from('playlist_tracks')
      .delete()
      .eq('playlist_id', playlistId)
      .eq('source', source)
      .eq('track_id', trackId);

    if (error) {
      throw new Error(error.message);
    }
  }

  async reorderTracks(playlistId: string, reorderTracksDto: ReorderTracksDto) {
    await this.assertOwnership(playlistId);

    // Supabase JS не поддерживает batch-update в одном запросе,
    // поэтому обновляем строки параллельно.
    const updates = reorderTracksDto.tracks.map(({ id, position }) =>
      this.supabaseService
        .getClient()
        .from('playlist_tracks')
        .update({ position })
        .eq('id', id)
        .eq('playlist_id', playlistId),
    );

    const results = await Promise.all(updates);
    const failed = results.find((result) => result.error);

    if (failed?.error) {
      throw new Error(failed.error.message);
    }

    return this.findOne(playlistId);
  }

  // Общая проверка владения плейлистом — переиспользуется во всех write-методах,
  // включая работу с playlist_tracks (нельзя менять чужие треки).
  private async assertOwnership(playlistId: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('playlists')
      .select('id')
      .eq('id', playlistId)
      .eq('user_id', STUB_USER_ID)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      throw new NotFoundException(`Playlist #${playlistId} not found`);
    }
  }
}
