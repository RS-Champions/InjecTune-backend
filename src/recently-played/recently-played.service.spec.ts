import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from '../supabase/supabase.service';
import { RecentlyPlayedService } from './recently-played.service';
import { RecentlyPlayedFilterDto } from './dto/recently-played-filter.dto';
import { AddRecentlyPlayedDto } from './dto/add-recently-played.dto';

interface ChainResult {
  data: unknown;
  error: { message: string } | null;
}

interface SupabaseChain extends Promise<ChainResult> {
  from: jest.Mock<SupabaseChain>;
  select: jest.Mock<SupabaseChain>;
  insert: jest.Mock<SupabaseChain>;
  eq: jest.Mock<SupabaseChain>;
  order: jest.Mock<SupabaseChain>;
  gte: jest.Mock<SupabaseChain>;
  lte: jest.Mock<SupabaseChain>;
  single: jest.Mock<Promise<ChainResult>>;
}

function buildChain(result: ChainResult = { data: null, error: null }): SupabaseChain {
  const chain = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    gte: jest.fn().mockReturnThis(),
    lte: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue(result),
    then: (
      resolve: (value: ChainResult) => unknown,
      reject: (reason: unknown) => unknown,
    ) => Promise.resolve(result).then(resolve, reject),
  } as unknown as SupabaseChain;

  return chain;
}

describe('RecentlyPlayedService', () => {
  let service: RecentlyPlayedService;
  let mockGetClient: jest.Mock;

  beforeEach(async () => {
    mockGetClient = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecentlyPlayedService,
        { provide: SupabaseService, useValue: { getClient: mockGetClient } },
      ],
    }).compile();

    service = module.get<RecentlyPlayedService>(RecentlyPlayedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ──────────────────────────────────────────────
  // findAll()
  // ──────────────────────────────────────────────
  describe('findAll()', () => {
    it('queries recently_played for the stub user, ordered by played_at desc, with no date filters', async () => {
      const rows = [
        { id: 'rp-1', track_id: 'jm-1', source: 'jamendo', played_at: '2026-06-29T10:00:00' },
      ];
      const chain = buildChain({ data: rows, error: null });
      mockGetClient.mockReturnValue(chain);

      const filter: RecentlyPlayedFilterDto = {};
      const result = await service.findAll(filter);

      expect(chain.from).toHaveBeenCalledWith('recently_played');
      expect(chain.eq).toHaveBeenCalledWith('user_id', expect.any(String));
      expect(chain.order).toHaveBeenCalledWith('played_at', { ascending: false });
      expect(chain.gte).not.toHaveBeenCalled();
      expect(chain.lte).not.toHaveBeenCalled();
      expect(result).toBe(rows);
    });

    it('applies a gte filter on played_at when "from" is provided', async () => {
      const chain = buildChain({ data: [], error: null });
      mockGetClient.mockReturnValue(chain);

      const filter: RecentlyPlayedFilterDto = { from: '2026-06-01' };
      await service.findAll(filter);

      expect(chain.gte).toHaveBeenCalledWith('played_at', '2026-06-01');
      expect(chain.lte).not.toHaveBeenCalled();
    });

    it('applies a lte filter on played_at with end-of-day time when "to" is provided', async () => {
      const chain = buildChain({ data: [], error: null });
      mockGetClient.mockReturnValue(chain);

      const filter: RecentlyPlayedFilterDto = { to: '2026-06-30' };
      await service.findAll(filter);

      // Service appends T23:59:59 so the whole "to" day is included
      expect(chain.lte).toHaveBeenCalledWith('played_at', '2026-06-30T23:59:59');
      expect(chain.gte).not.toHaveBeenCalled();
    });

    it('applies both gte and lte filters when "from" and "to" are both provided', async () => {
      const chain = buildChain({ data: [], error: null });
      mockGetClient.mockReturnValue(chain);

      const filter: RecentlyPlayedFilterDto = { from: '2026-06-01', to: '2026-06-30' };
      await service.findAll(filter);

      expect(chain.gte).toHaveBeenCalledWith('played_at', '2026-06-01');
      expect(chain.lte).toHaveBeenCalledWith('played_at', '2026-06-30T23:59:59');
    });

    it('throws a generic Error when Supabase returns an error', async () => {
      const chain = buildChain({ data: null, error: { message: 'DB failure' } });
      mockGetClient.mockReturnValue(chain);

      await expect(service.findAll({})).rejects.toThrow('DB failure');
    });
  });

  // ──────────────────────────────────────────────
  // add()
  // ──────────────────────────────────────────────
  describe('add()', () => {
    it('inserts a recently-played row for the stub user and returns it', async () => {
      const created = {
        id: 'rp-1',
        user_id: 'stub',
        track_id: 'jm-42',
        source: 'jamendo',
        played_at: '2026-06-30T12:00:00',
      };
      const chain = buildChain({ data: created, error: null });
      mockGetClient.mockReturnValue(chain);

      const dto: AddRecentlyPlayedDto = { trackId: 'jm-42', source: 'jamendo' };
      const result = await service.add(dto);

      expect(chain.from).toHaveBeenCalledWith('recently_played');
      expect(chain.insert).toHaveBeenCalledWith(
        expect.objectContaining({ track_id: 'jm-42', source: 'jamendo' }),
      );
      expect(result).toBe(created);
    });

    it('throws a generic Error when the insert fails', async () => {
      const chain = buildChain({ data: null, error: { message: 'insert failed' } });
      mockGetClient.mockReturnValue(chain);

      const dto: AddRecentlyPlayedDto = { trackId: 'jm-42', source: 'jamendo' };
      await expect(service.add(dto)).rejects.toThrow('insert failed');
    });
  });
});
