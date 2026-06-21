import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';

// TODO(auth): replace with real authenticated user id once backend auth is implemented.
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

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('playlists')
      .select()
      .eq('id', id)
      .eq('user_id', STUB_USER_ID)
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
    await this.findOne(id);

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
    await this.findOne(id);

    const { error } = await this.supabaseService
      .getClient()
      .from('playlists')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }
}
