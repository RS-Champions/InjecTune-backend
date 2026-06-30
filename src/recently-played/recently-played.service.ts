import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { RecentlyPlayedFilterDto } from './dto/recently-played-filter.dto';
import { AddRecentlyPlayedDto } from './dto/add-recently-played.dto';

// TODO(auth): replace with real authenticated user id once backend auth is implemented.
const STUB_USER_ID = '00000000-0000-0000-0000-000000000001';

@Injectable()
export class RecentlyPlayedService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll(filter: RecentlyPlayedFilterDto) {
    let query = this.supabaseService
      .getClient()
      .from('recently_played')
      .select()
      .eq('user_id', STUB_USER_ID)
      .order('played_at', { ascending: false });

    if (filter.from) {
      query = query.gte('played_at', filter.from);
    }

    if (filter.to) {
      // Add T23:59:59 to include whole day "to"
      query = query.lte('played_at', `${filter.to}T23:59:59`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async add(dto: AddRecentlyPlayedDto) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('recently_played')
      .insert({
        user_id: STUB_USER_ID,
        track_id: dto.trackId,
        source: dto.source,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}
