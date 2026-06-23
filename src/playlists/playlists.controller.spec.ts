import { Test, TestingModule } from '@nestjs/testing';
import { PlaylistsController } from './playlists.controller';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { AddTrackDto } from './dto/add-track.dto';
import { ReorderTracksDto } from './dto/reorder-tracks.dto';

// The controller is a pure routing layer — it must delegate every call to
// PlaylistsService unchanged. We mock the service so tests are isolated
// from Supabase entirely.
const mockPlaylistsService: jest.Mocked<PlaylistsService> = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  addTrack: jest.fn(),
  removeTrack: jest.fn(),
  reorderTracks: jest.fn(),
} as any;

describe('PlaylistsController', () => {
  let controller: PlaylistsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlaylistsController],
      providers: [
        { provide: PlaylistsService, useValue: mockPlaylistsService },
      ],
    }).compile();

    controller = module.get<PlaylistsController>(PlaylistsController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ──────────────────────────────────────────────
  // POST /playlists
  // ──────────────────────────────────────────────
  describe('create()', () => {
    it('calls PlaylistsService.create() with the DTO and returns its result', async () => {
      const dto: CreatePlaylistDto = { name: 'Chill Vibes' };
      const created = { id: 'pl-1', name: 'Chill Vibes', user_id: 'u-1' };
      mockPlaylistsService.create.mockResolvedValue(created as any);

      const result = await controller.create(dto);

      expect(mockPlaylistsService.create).toHaveBeenCalledTimes(1);
      expect(mockPlaylistsService.create).toHaveBeenCalledWith(dto);
      expect(result).toBe(created);
    });
  });

  // ──────────────────────────────────────────────
  // GET /playlists
  // ──────────────────────────────────────────────
  describe('findAll()', () => {
    it('calls PlaylistsService.findAll() and returns the list', async () => {
      const list = [{ id: 'pl-1' }, { id: 'pl-2' }];
      mockPlaylistsService.findAll.mockResolvedValue(list as any);

      const result = await controller.findAll();

      expect(mockPlaylistsService.findAll).toHaveBeenCalledTimes(1);
      expect(result).toBe(list);
    });
  });

  // ──────────────────────────────────────────────
  // GET /playlists/:id
  // ──────────────────────────────────────────────
  describe('findOne()', () => {
    it('calls PlaylistsService.findOne() with the route param id', async () => {
      const playlist = { id: 'pl-1', playlist_tracks: [] };
      mockPlaylistsService.findOne.mockResolvedValue(playlist as any);

      const result = await controller.findOne('pl-1');

      expect(mockPlaylistsService.findOne).toHaveBeenCalledWith('pl-1');
      expect(result).toBe(playlist);
    });
  });

  // ──────────────────────────────────────────────
  // PATCH /playlists/:id
  // ──────────────────────────────────────────────
  describe('update()', () => {
    it('calls PlaylistsService.update() with id and DTO', async () => {
      const dto: UpdatePlaylistDto = { name: 'Renamed Playlist' };
      const updated = { id: 'pl-1', name: 'Renamed Playlist' };
      mockPlaylistsService.update.mockResolvedValue(updated as any);

      const result = await controller.update('pl-1', dto);

      expect(mockPlaylistsService.update).toHaveBeenCalledWith('pl-1', dto);
      expect(result).toBe(updated);
    });
  });

  // ──────────────────────────────────────────────
  // DELETE /playlists/:id
  // ──────────────────────────────────────────────
  describe('remove()', () => {
    it('calls PlaylistsService.remove() with id and returns void', async () => {
      mockPlaylistsService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('pl-1');

      expect(mockPlaylistsService.remove).toHaveBeenCalledWith('pl-1');
      expect(result).toBeUndefined();
    });
  });

  // ──────────────────────────────────────────────
  // POST /playlists/:id/tracks
  // ──────────────────────────────────────────────
  describe('addTrack()', () => {
    it('calls PlaylistsService.addTrack() with playlist id and DTO', async () => {
      const dto: AddTrackDto = {
        source: 'jamendo',
        trackId: 'jm-42',
        position: 0,
      };
      const track = { id: 'pt-1', playlist_id: 'pl-1', ...dto };
      mockPlaylistsService.addTrack.mockResolvedValue(track as any);

      const result = await controller.addTrack('pl-1', dto);

      expect(mockPlaylistsService.addTrack).toHaveBeenCalledWith('pl-1', dto);
      expect(result).toBe(track);
    });
  });

  // ──────────────────────────────────────────────
  // DELETE /playlists/:id/tracks/:trackId
  // ──────────────────────────────────────────────
  describe('removeTrack()', () => {
    it('passes explicit source from query param to the service', async () => {
      mockPlaylistsService.removeTrack.mockResolvedValue(undefined);

      await controller.removeTrack('pl-1', 'jm-42', 'own');

      // Note argument order: (playlistId, source, trackId) — matches service signature
      expect(mockPlaylistsService.removeTrack).toHaveBeenCalledWith(
        'pl-1',
        'own',
        'jm-42',
      );
    });

    it('defaults source to "jamendo" when the query param is omitted', async () => {
      mockPlaylistsService.removeTrack.mockResolvedValue(undefined);

      // Calling without the 3rd argument triggers the TS default parameter
      await controller.removeTrack('pl-1', 'jm-42');

      expect(mockPlaylistsService.removeTrack).toHaveBeenCalledWith(
        'pl-1',
        'jamendo',
        'jm-42',
      );
    });
  });

  // ──────────────────────────────────────────────
  // PATCH /playlists/:id/reorder
  // ──────────────────────────────────────────────
  describe('reorderTracks()', () => {
    it('calls PlaylistsService.reorderTracks() with id and DTO, returns updated playlist', async () => {
      const dto: ReorderTracksDto = {
        tracks: [
          { id: 'pt-1', position: 0 },
          { id: 'pt-2', position: 1 },
        ],
      };
      const updated = { id: 'pl-1', playlist_tracks: dto.tracks };
      mockPlaylistsService.reorderTracks.mockResolvedValue(updated as any);

      const result = await controller.reorderTracks('pl-1', dto);

      expect(mockPlaylistsService.reorderTracks).toHaveBeenCalledWith(
        'pl-1',
        dto,
      );
      expect(result).toBe(updated);
    });
  });
});
