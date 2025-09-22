import { Test, TestingModule } from '@nestjs/testing';
import { LoyalityService } from './loyalities.service';

describe('LoyalityService', () => {
  let service: LoyalityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoyalityService],
    }).compile();

    service = module.get<LoyalityService>(LoyalityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
