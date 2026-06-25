import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from '../supabase/supabase.service';
import { FavoritesService } from './favorites.service';

// Builds a chainable Supabase mock. Every intermediate method returns `this`;
// terminal methods (order/single/maybeSingle) resolve the provided result.
// The object is also thenable so `await chain.eq(...)` works for DELETE chains
// that end with a raw .eq() call.
function buildChain(
  result: { data: any; error: any } = { data: null, error: null },
) {
  const chain: any = {
    _result: result,
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockImplementation(() => Promise.resolve(chain._result)),
    single: jest.fn().mockImplementation(() => Promise.resolve(chain._result)),
    maybeSingle: jest
      .fn()
      .mockImplementation(() => Promise.resolve(chain._result)),
    // Makes the chain itself awaitable for DELETE chains that end with .eq()
    then: (resolve: any, reject: any) =>
      Promise.resolve(chain._result).then(resolve, reject),
  };
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

  // ──────────────────────────────────────────────
  // findAll()
  // ──────────────────────────────────────────────
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

  // ──────────────────────────────────────────────
  // add()
  // ──────────────────────────────────────────────
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
      // Empty string is falsy — guard fires before any Supabase call
      await expect(service.add('')).rejects.toThrow(BadRequestException);
      expect(mockGetClient).not.toHaveBeenCalled();
    });

    it('throws ConflictException (409) when the track is already in favorites (unique_violation)', async () => {
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

  // ──────────────────────────────────────────────
  // remove()
  // ──────────────────────────────────────────────
  describe('remove()', () => {
    // remove() calls getClient() twice: once for the SELECT existence check,
    // once for the DELETE. We use mockReturnValueOnce to simulate both.

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

    it('throws NotFoundException with the trackId in the message', async () => {
      const selectChain = buildChain({ data: null, error: null });
      mockGetClient.mockReturnValueOnce(selectChain);

      await expect(service.remove('jm-99')).rejects.toThrow(
        'Track jm-99 is not in favorites',
      );
    });

    it('never calls DELETE when the SELECT check finds no record', async () => {
      const selectChain = buildChain({ data: null, error: null });
      mockGetClient.mockReturnValueOnce(selectChain);

      await service.remove('jm-42').catch(() => {});

      // Only one getClient() call happened (for SELECT) — DELETE was skipped
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
