import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';

// TODO(auth): replace with real authenticated user id once backend auth is implemented.
const STUB_USER_ID = '00000000-0000-0000-0000-000000000001';

@Injectable()
export class FavoritesService {
  constructor(private readonly supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('favorites')
      .select()
      .eq('user_id', STUB_USER_ID)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async add(trackId: string) {
    if (!trackId) {
      throw new BadRequestException('trackId is required');
    }
    // Supabase вернёт ошибку на уровне unique constraint, если трек уже лайкнут.
    // Перехватываем её и возвращаем 409 Conflict, а не 500.
    const { data, error } = await this.supabaseService
      .getClient()
      .from('favorites')
      .insert({ user_id: STUB_USER_ID, track_id: trackId })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        // '23505' is a standard PostgreSQL error code for unique_violation
        throw new ConflictException(`Track ${trackId} is already in favorites`);
      }

      throw new Error(error.message);
    }

    return data;
  }

  async remove(trackId: string) {
    // Сначала проверяем, что запись существует — иначе DELETE пройдёт тихо (0 rows affected),
    // и фронт не узнает, что трека в избранном не было.
    const { data: existing } = await this.supabaseService
      .getClient()
      .from('favorites')
      .select('id')
      .eq('user_id', STUB_USER_ID)
      .eq('track_id', trackId)
      .maybeSingle();

    if (!existing) {
      throw new NotFoundException(`Track ${trackId} is not in favorites`);
    }

    const { error } = await this.supabaseService
      .getClient()
      .from('favorites')
      .delete()
      .eq('user_id', STUB_USER_ID)
      .eq('track_id', trackId);

    if (error) {
      throw new Error(error.message);
    }
  }
}
