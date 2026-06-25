import { Test, TestingModule } from '@nestjs/testing';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';

// Standalone typed mock functions — avoids unbound-method lint errors
const mockFindAll = jest.fn<ReturnType<FavoritesService['findAll']>, []>();
const mockAdd = jest.fn<ReturnType<FavoritesService['add']>, [string]>();
const mockRemove = jest.fn<ReturnType<FavoritesService['remove']>, [string]>();

describe('FavoritesController', () => {
  let controller: FavoritesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FavoritesController],
      providers: [
        {
          provide: FavoritesService,
          useValue: {
            findAll: mockFindAll,
            add: mockAdd,
            remove: mockRemove,
          },
        },
      ],
    }).compile();

    controller = module.get<FavoritesController>(FavoritesController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll()', () => {
    it('calls FavoritesService.findAll() and returns its result', async () => {
      const favorites = [
        { id: 'fav-1', track_id: 'jm-1', user_id: 'u-1', created_at: null },
      ];
      mockFindAll.mockResolvedValue(favorites);

      const result = await controller.findAll();

      expect(mockFindAll).toHaveBeenCalledTimes(1);
      expect(result).toBe(favorites);
    });
  });

  describe('add()', () => {
    it('calls FavoritesService.add() with the route param trackId', async () => {
      const created = {
        id: 'fav-1',
        track_id: 'jm-42',
        user_id: 'u-1',
        created_at: null,
      };
      mockAdd.mockResolvedValue(created);

      const result = await controller.add('jm-42');

      expect(mockAdd).toHaveBeenCalledTimes(1);
      expect(mockAdd).toHaveBeenCalledWith('jm-42');
      expect(result).toBe(created);
    });
  });

  describe('remove()', () => {
    it('calls FavoritesService.remove() with the route param trackId', async () => {
      mockRemove.mockResolvedValue(undefined);

      const result = await controller.remove('jm-42');

      expect(mockRemove).toHaveBeenCalledTimes(1);
      expect(mockRemove).toHaveBeenCalledWith('jm-42');
      expect(result).toBeUndefined();
    });
  });
});
