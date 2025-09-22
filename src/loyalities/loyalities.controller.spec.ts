import { Test, TestingModule } from '@nestjs/testing';
import { LoyalityController } from './loyalities.controller';
import { LoyalityService } from './loyalities.service';

describe('LoyalityController', () => {
  let controller: LoyalityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LoyalityController],
      providers: [LoyalityService],
    }).compile();

    controller = module.get<LoyalityController>(LoyalityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
