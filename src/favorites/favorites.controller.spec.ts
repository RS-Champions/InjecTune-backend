import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

const mockFavoritesService: jest.Mocked<FavoritesService> = {
  findAll: jest.fn(),
  add: jest.fn(),
  remove: jest.fn(),
} as any;

describe('FavoritesController', () => {
  let controller: FavoritesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoritesController],
      providers: [
        { provide: FavoritesService, useValue: mockFavoritesService },
      ],
    }).compile();

    controller = module.get<FavoritesController>(FavoritesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ──────────────────────────────────────────────
  // GET /favorites
  // ──────────────────────────────────────────────
  describe('findAll()', () => {
    it('calls FavoritesService.findAll() and returns its result', async () => {
      const favorites = [{ id: 'fav-1', track_id: 'jm-1' }];
      mockFavoritesService.findAll.mockResolvedValue(favorites as any);

      const result = await controller.findAll();

      expect(mockFavoritesService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toBe(favorites);
    });
  });

  // ──────────────────────────────────────────────
  // POST /favorites/:trackId
  // ──────────────────────────────────────────────
  describe('add()', () => {
    it('calls FavoritesService.add() with the route param trackId', async () => {
      const created = { id: 'fav-1', track_id: 'jm-42' };
      mockFavoritesService.add.mockResolvedValue(created as any);

      const result = await controller.add('jm-42');

      expect(mockFavoritesService.add).toHaveBeenCalledTimes(1);
      expect(mockFavoritesService.add).toHaveBeenCalledWith('jm-42');
      expect(result).toBe(created);
    });
  });

  // ──────────────────────────────────────────────
  // DELETE /favorites/:trackId
  // ──────────────────────────────────────────────
  describe('remove()', () => {
    it('calls FavoritesService.remove() with the route param trackId', async () => {
      mockFavoritesService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('jm-42');

      expect(mockFavoritesService.remove).toHaveBeenCalledTimes(1);
      expect(mockFavoritesService.remove).toHaveBeenCalledWith('jm-42');
      expect(result).toBeUndefined();
    });

    // Note: @HttpCode(204) is a NestJS decorator applied at the HTTP adapter layer.
    // It is not observable in a unit test — cover it in an e2e / supertest test instead.
  });
});
