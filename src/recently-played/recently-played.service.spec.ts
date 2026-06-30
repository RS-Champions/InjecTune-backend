import { Test, TestingModule } from '@nestjs/testing';
import { RecentlyPlayedService } from './recently-played.service';

describe('RecentlyPlayedService', () => {
  let service: RecentlyPlayedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecentlyPlayedService],
    }).compile();

    service = module.get<RecentlyPlayedService>(RecentlyPlayedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
