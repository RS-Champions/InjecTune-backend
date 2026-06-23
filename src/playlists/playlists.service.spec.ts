import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { SupabaseService } from '../supabase/supabase.service';

// Создаёт цепочный (chainable) мок Supabase query builder.
// Каждый метод возвращает сам себя (mockReturnThis), кроме финального,
// который возвращает { data, error } — как реальный Supabase-запрос после await.
function createSupabaseQueryMock(result: {
  data: unknown;
  error: { message: string } | null;
}) {
  const query: Record<string, jest.Mock> = {
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(result),
    maybeSingle: jest.fn().mockResolvedValue(result),
  };

  // .delete().eq() в реальном Supabase резолвится сам по себе (без .single()),
  // поэтому eq должен уметь либо продолжать цепочку, либо быть "thenable" в конце.
  // Проще всего — последний .eq() в delete-сценарии тоже возвращает промис данных.
  query.eq.mockImplementation(() => ({
    ...query,
    then: (resolve: (value: typeof result) => void) => resolve(result),
  }));

  return query;
}

describe('PlaylistsService', () => {
  let service: PlaylistsService;
  let mockGetClient: jest.Mock;
  let mockFrom: jest.Mock;

  beforeEach(async () => {
    mockFrom = jest.fn();
    mockGetClient = jest.fn().mockReturnValue({ from: mockFrom });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlaylistsService,
        {
          provide: SupabaseService,
          useValue: { getClient: mockGetClient },
        },
      ],
    }).compile();

    service = module.get<PlaylistsService>(PlaylistsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('creates a playlist and returns the inserted row', async () => {
      const fakePlaylist = { id: 'p1', name: 'Workout Mix', description: null };
      mockFrom.mockReturnValue(
        createSupabaseQueryMock({ data: fakePlaylist, error: null }),
      );

      const result = await service.create({ name: 'Workout Mix' });

      expect(mockFrom).toHaveBeenCalledWith('playlists');
      expect(result).toEqual(fakePlaylist);
    });

    it('throws when Supabase returns an error', async () => {
      mockFrom.mockReturnValue(
        createSupabaseQueryMock({
          data: null,
          error: { message: 'insert failed' },
        }),
      );

      await expect(service.create({ name: 'Broken' })).rejects.toThrow(
        'insert failed',
      );
    });
  });

  describe('findOne', () => {
    it('returns the playlist with its tracks when found', async () => {
      const fakePlaylist = {
        id: 'p1',
        name: 'Workout Mix',
        playlist_tracks: [],
      };
      mockFrom.mockReturnValue(
        createSupabaseQueryMock({ data: fakePlaylist, error: null }),
      );

      const result = await service.findOne('p1');

      expect(result).toEqual(fakePlaylist);
    });

    it('throws NotFoundException when playlist does not exist', async () => {
      mockFrom.mockReturnValue(
        createSupabaseQueryMock({ data: null, error: null }),
      );

      await expect(service.findOne('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('deletes the playlist after confirming ownership', async () => {
      // Первый вызов .from('playlists') — это assertOwnership (maybeSingle),
      // второй — собственно delete. Настраиваем mockFrom вызываться дважды с разным поведением.
      const ownershipCheck = createSupabaseQueryMock({
        data: { id: 'p1' },
        error: null,
      });
      const deleteCall = createSupabaseQueryMock({ data: null, error: null });

      mockFrom
        .mockReturnValueOnce(ownershipCheck)
        .mockReturnValueOnce(deleteCall);

      await expect(service.remove('p1')).resolves.toBeUndefined();
    });

    it('throws NotFoundException when trying to delete a non-owned or missing playlist', async () => {
      mockFrom.mockReturnValue(
        createSupabaseQueryMock({ data: null, error: null }),
      );

      await expect(service.remove('missing-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
