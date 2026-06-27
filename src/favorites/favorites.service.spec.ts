import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from '../supabase/supabase.service';
import { FavoritesService } from './favorites.service';

interface ChainResult {
  data: unknown;
  error: { message: string; code?: string } | null;
}

interface SupabaseChain extends Promise<ChainResult> {
  from: jest.Mock<SupabaseChain>;
  select: jest.Mock<SupabaseChain>;
  insert: jest.Mock<SupabaseChain>;
  delete: jest.Mock<SupabaseChain>;
  eq: jest.Mock<SupabaseChain>;
  order: jest.Mock<Promise<ChainResult>>;
  single: jest.Mock<Promise<ChainResult>>;
  maybeSingle: jest.Mock<Promise<ChainResult>>;
}

function buildChain(
  result: ChainResult = { data: null, error: null },
): SupabaseChain {
  const chain = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue(result),
    single: jest.fn().mockResolvedValue(result),
    maybeSingle: jest.fn().mockResolvedValue(result),
    then: (
      resolve: (value: ChainResult) => unknown,
      reject: (reason: unknown) => unknown,
    ) => Promise.resolve(result).then(resolve, reject),
  } as unknown as SupabaseChain;

  return chain;
}

describe('FavoritesService', () => {
  let service: FavoritesService;
  let mockGetClient: jest.Mock;

  beforeEach(async () => {
    mockGetClient = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        { provide: SupabaseService, useValue: { getClient: mockGetClient } },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll()', () => {
    it('returns favorites for the stub user, ordered by created_at desc', async () => {
      const favorites = [
        { id: 'fav-1', track_id: 'jm-1' },
        { id: 'fav-2', track_id: 'jm-2' },
      ];
      const chain = buildChain({ data: favorites, error: null });
      mockGetClient.mockReturnValue(chain);

      const result = await service.findAll();

      expect(chain.from).toHaveBeenCalledWith('favorites');
      expect(chain.eq).toHaveBeenCalledWith('user_id', expect.any(String));
      expect(chain.order).toHaveBeenCalledWith('created_at', {
        ascending: false,
      });
      expect(result).toBe(favorites);
    });

    it('throws a generic Error when Supabase returns an error', async () => {
      const chain = buildChain({
        data: null,
        error: { message: 'DB failure' },
      });
      mockGetClient.mockReturnValue(chain);

      await expect(service.findAll()).rejects.toThrow('DB failure');
    });
  });

  describe('add()', () => {
    it('inserts a favorite and returns the created row', async () => {
      const created = { id: 'fav-1', user_id: 'stub', track_id: 'jm-42' };
      const chain = buildChain({ data: created, error: null });
      mockGetClient.mockReturnValue(chain);

      const result = await service.add('jm-42');

      expect(chain.from).toHaveBeenCalledWith('favorites');
      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ track_id: 'jm-42' }),
      );
      expect(result).toBe(created);
    });

    it('throws BadRequestException when trackId is an empty string', async () => {
      await expect(service.add('')).rejects.toThrow(BadRequestException);
      expect(mockGetClient).not.toHaveBeenCalled();
    });

    it('throws ConflictException (409) when the track is already in favorites', async () => {
      const chain = buildChain({
        data: null,
        error: { code: '23505', message: 'duplicate key' },
      });
      mockGetClient.mockReturnValue(chain);

      await expect(service.add('jm-42')).rejects.toThrow(ConflictException);
      await expect(service.add('jm-42')).rejects.toThrow('jm-42');
    });

    it('throws a generic Error for non-unique-violation Supabase errors', async () => {
      const chain = buildChain({
        data: null,
        error: { code: '42P01', message: 'relation does not exist' },
      });
      mockGetClient.mockReturnValue(chain);

      await expect(service.add('jm-42')).rejects.toThrow(
        'relation does not exist',
      );
    });
  });

  describe('remove()', () => {
    it('deletes the favorite when the track exists in favorites', async () => {
      const selectChain = buildChain({ data: { id: 'fav-1' }, error: null });
      const deleteChain = buildChain({ data: null, error: null });
      mockGetClient
        .mockReturnValueOnce(selectChain)
        .mockReturnValueOnce(deleteChain);

      await expect(service.remove('jm-42')).resolves.toBeUndefined();

      expect(selectChain.from).toHaveBeenCalledWith('favorites');
      expect(selectChain.maybeSingle).toHaveBeenCalled();
      expect(deleteChain.delete).toHaveBeenCalled();
      expect(deleteChain.eq).toHaveBeenCalledWith('track_id', 'jm-42');
    });

    it('throws NotFoundException when the track is not in favorites', async () => {
      mockGetClient.mockReturnValueOnce(
        buildChain({ data: null, error: null }),
      );
      await expect(service.remove('jm-42')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException with the trackId in the message', async () => {
      mockGetClient.mockReturnValueOnce(
        buildChain({ data: null, error: null }),
      );
      await expect(service.remove('jm-99')).rejects.toThrow(
        'Track jm-99 is not in favorites',
      );
    });

    it('never calls DELETE when the SELECT check finds no record', async () => {
      mockGetClient.mockReturnValueOnce(
        buildChain({ data: null, error: null }),
      );

      await service.remove('jm-42').catch(() => {});

      expect(mockGetClient).toHaveBeenCalledTimes(1);
    });

    it('throws a generic Error when the DELETE operation fails', async () => {
      const selectChain = buildChain({ data: { id: 'fav-1' }, error: null });
      const deleteChain = buildChain({
        data: null,
        error: { message: 'delete failed' },
      });
      mockGetClient
        .mockReturnValueOnce(selectChain)
        .mockReturnValueOnce(deleteChain);

      await expect(service.remove('jm-42')).rejects.toThrow('delete failed');
    });
  });
});
