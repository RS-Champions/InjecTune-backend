import { Test, TestingModule } from '@nestjs/testing';
import { RecentlyPlayedController } from './recently-played.controller';
import { RecentlyPlayedService } from './recently-played.service';
import { RecentlyPlayedFilterDto } from './dto/recently-played-filter.dto';
import { AddRecentlyPlayedDto } from './dto/add-recently-played.dto';

const mockFindAll = jest.fn<ReturnType<RecentlyPlayedService['findAll']>, [RecentlyPlayedFilterDto]>();
const mockAdd = jest.fn<ReturnType<RecentlyPlayedService['add']>, [AddRecentlyPlayedDto]>();

describe('RecentlyPlayedController', () => {
  let controller: RecentlyPlayedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecentlyPlayedController],
      providers: [
        {
          provide: RecentlyPlayedService,
          useValue: {
            findAll: mockFindAll,
            add: mockAdd,
          },
        },
      ],
    }).compile();

    controller = module.get<RecentlyPlayedController>(RecentlyPlayedController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ──────────────────────────────────────────────
  // GET /recently-played
  // ──────────────────────────────────────────────
  describe('findAll()', () => {
    it('calls RecentlyPlayedService.findAll() with the query filter and returns its result', async () => {
      const rows = [
        {
          id: 'rp-1',
          user_id: 'u-1',
          track_id: 'jm-1',
          source: 'jamendo',
          played_at: '2026-06-29T10:00:00',
        },
      ];
      mockFindAll.mockResolvedValue(rows);

      const filter: RecentlyPlayedFilterDto = { from: '2026-06-01', to: '2026-06-30' };
      const result = await controller.findAll(filter);

      expect(mockFindAll).toHaveBeenCalledTimes(1);
      expect(mockFindAll).toHaveBeenCalledWith(filter);
      expect(result).toBe(rows);
    });

    it('passes an empty filter through unchanged when no query params are given', async () => {
      mockFindAll.mockResolvedValue([]);

      const filter: RecentlyPlayedFilterDto = {};
      await controller.findAll(filter);

      expect(mockFindAll).toHaveBeenCalledWith({});
    });
  });

  // ──────────────────────────────────────────────
  // POST /recently-played
  // ──────────────────────────────────────────────
  describe('add()', () => {
    it('calls RecentlyPlayedService.add() with the body DTO and returns the created row', async () => {
      const dto: AddRecentlyPlayedDto = { trackId: 'jm-42', source: 'jamendo' };
      const created = {
        id: 'rp-1',
        user_id: 'u-1',
        track_id: 'jm-42',
        source: 'jamendo',
        played_at: '2026-06-30T12:00:00',
      };
      mockAdd.mockResolvedValue(created);

      const result = await controller.add(dto);

      expect(mockAdd).toHaveBeenCalledTimes(1);
      expect(mockAdd).toHaveBeenCalledWith(dto);
      expect(result).toBe(created);
    });

    // Note: @HttpCode(201) is a NestJS decorator at the HTTP adapter layer,
    // not observable in a unit test — cover it in an e2e/supertest test instead.
  });
});
