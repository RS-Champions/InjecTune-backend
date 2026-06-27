import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistsController } from './playlists.controller';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { AddTrackDto } from './dto/add-track.dto';
import { ReorderTracksDto } from './dto/reorder-tracks.dto';

const mockCreate = jest.fn<
  ReturnType<PlaylistsService['create']>,
  [CreatePlaylistDto]
>();
const mockFindAll = jest.fn<ReturnType<PlaylistsService['findAll']>, []>();
const mockFindOne = jest.fn<
  ReturnType<PlaylistsService['findOne']>,
  [string]
>();
const mockUpdate = jest.fn<
  ReturnType<PlaylistsService['update']>,
  [string, UpdatePlaylistDto]
>();
const mockRemove = jest.fn<ReturnType<PlaylistsService['remove']>, [string]>();
const mockAddTrack = jest.fn<
  ReturnType<PlaylistsService['addTrack']>,
  [string, AddTrackDto]
>();
const mockRemoveTrack = jest.fn<
  ReturnType<PlaylistsService['removeTrack']>,
  [string, 'jamendo' | 'own', string]
>();
const mockReorderTracks = jest.fn<
  ReturnType<PlaylistsService['reorderTracks']>,
  [string, ReorderTracksDto]
>();

describe('PlaylistsController', () => {
  let controller: PlaylistsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaylistsController],
      providers: [
        {
          provide: PlaylistsService,
          useValue: {
            create: mockCreate,
            findAll: mockFindAll,
            findOne: mockFindOne,
            update: mockUpdate,
            remove: mockRemove,
            addTrack: mockAddTrack,
            removeTrack: mockRemoveTrack,
            reorderTracks: mockReorderTracks,
          },
        },
      ],
    }).compile();

    controller = module.get<PlaylistsController>(PlaylistsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('calls PlaylistsService.create() with the DTO and returns its result', async () => {
      const dto: CreatePlaylistDto = { name: 'Chill Vibes' };
      const created = {
        id: 'pl-1',
        name: 'Chill Vibes',
        user_id: 'u-1',
        description: null,
        created_at: null,
        updated_at: null,
      };
      mockCreate.mockResolvedValue(created);

      const result = await controller.create(dto);

      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(mockCreate).toHaveBeenCalledWith(dto);
      expect(result).toBe(created);
    });
  });

  describe('findAll()', () => {
    it('calls PlaylistsService.findAll() and returns the list', async () => {
      const list = [
        {
          id: 'pl-1',
          name: 'A',
          user_id: 'u-1',
          description: null,
          created_at: null,
          updated_at: null,
        },
        {
          id: 'pl-2',
          name: 'B',
          user_id: 'u-1',
          description: null,
          created_at: null,
          updated_at: null,
        },
      ];
      mockFindAll.mockResolvedValue(list);

      const result = await controller.findAll();

      expect(mockFindAll).toHaveBeenCalledTimes(1);
      expect(result).toBe(list);
    });
  });

  describe('findOne()', () => {
    it('calls PlaylistsService.findOne() with the route param id', async () => {
      const playlist = {
        id: 'pl-1',
        name: 'A',
        user_id: 'u-1',
        description: null,
        created_at: null,
        updated_at: null,
        playlist_tracks: [],
      };
      mockFindOne.mockResolvedValue(playlist);

      const result = await controller.findOne('pl-1');

      expect(mockFindOne).toHaveBeenCalledWith('pl-1');
      expect(result).toBe(playlist);
    });
  });

  describe('update()', () => {
    it('calls PlaylistsService.update() with id and DTO', async () => {
      const dto: UpdatePlaylistDto = { name: 'Renamed Playlist' };
      const updated = {
        id: 'pl-1',
        name: 'Renamed Playlist',
        user_id: 'u-1',
        description: null,
        created_at: null,
        updated_at: null,
      };
      mockUpdate.mockResolvedValue(updated);

      const result = await controller.update('pl-1', dto);

      expect(mockUpdate).toHaveBeenCalledWith('pl-1', dto);
      expect(result).toBe(updated);
    });
  });

  describe('remove()', () => {
    it('calls PlaylistsService.remove() with id and returns void', async () => {
      mockRemove.mockResolvedValue(undefined);

      const result = await controller.remove('pl-1');

      expect(mockRemove).toHaveBeenCalledWith('pl-1');
      expect(result).toBeUndefined();
    });
  });

  describe('addTrack()', () => {
    it('calls PlaylistsService.addTrack() with playlist id and DTO', async () => {
      const dto: AddTrackDto = {
        source: 'jamendo',
        trackId: 'jm-42',
        position: 0,
      };
      const track = {
        id: 'pt-1',
        playlist_id: 'pl-1',
        source: 'jamendo',
        track_id: 'jm-42',
        position: 0,
      };
      mockAddTrack.mockResolvedValue(track);

      const result = await controller.addTrack('pl-1', dto);

      expect(mockAddTrack).toHaveBeenCalledWith('pl-1', dto);
      expect(result).toBe(track);
    });
  });

  describe('removeTrack()', () => {
    it('passes explicit source from query param to the service', async () => {
      mockRemoveTrack.mockResolvedValue(undefined);

      await controller.removeTrack('pl-1', 'jm-42', 'own');

      expect(mockRemoveTrack).toHaveBeenCalledWith('pl-1', 'own', 'jm-42');
    });

    it('defaults source to "jamendo" when the query param is omitted', async () => {
      mockRemoveTrack.mockResolvedValue(undefined);

      await controller.removeTrack('pl-1', 'jm-42');

      expect(mockRemoveTrack).toHaveBeenCalledWith('pl-1', 'jamendo', 'jm-42');
    });
  });

  describe('reorderTracks()', () => {
    it('calls PlaylistsService.reorderTracks() with id and DTO, returns updated playlist', async () => {
      const dto: ReorderTracksDto = {
        tracks: [
          { id: 'pt-1', position: 0 },
          { id: 'pt-2', position: 1 },
        ],
      };
      const updated = {
        id: 'pl-1',
        name: 'A',
        user_id: 'u-1',
        description: null,
        created_at: null,
        updated_at: null,
        playlist_tracks: [
          {
            id: 'pt-1',
            playlist_id: 'pl-1',
            source: 'jamendo',
            track_id: 'jm-1',
            position: 0,
          },
          {
            id: 'pt-2',
            playlist_id: 'pl-1',
            source: 'jamendo',
            track_id: 'jm-2',
            position: 1,
          },
        ],
      };
      mockReorderTracks.mockResolvedValue(updated);

      const result = await controller.reorderTracks('pl-1', dto);

      expect(mockReorderTracks).toHaveBeenCalledWith('pl-1', dto);
      expect(result).toBe(updated);
    });
  });
});
