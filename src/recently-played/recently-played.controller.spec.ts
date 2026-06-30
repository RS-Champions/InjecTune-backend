import { Test, TestingModule } from '@nestjs/testing';
import { RecentlyPlayedController } from './recently-played.controller';

describe('RecentlyPlayedController', () => {
  let controller: RecentlyPlayedController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecentlyPlayedController],
    }).compile();

    controller = module.get<RecentlyPlayedController>(RecentlyPlayedController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
