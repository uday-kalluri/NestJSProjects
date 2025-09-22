// loyalties/loyalties.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LoyaltiesController } from './loyalities.controller';
import { LoyaltiesService } from './loyalities.service';
import { LoyaltiesRepository } from './loyalties.repository';
import { Loyalty, LoyaltySchema } from './schemas/loyalty.schema';
import { User, UserSchema } from 'src/users/schemas/user.schema';

@Module({
 // imports: [MongooseModule.forFeature([{ name: Loyalty.name, schema: LoyaltySchema }])],
  imports: [MongooseModule.forFeature([{ name: Loyalty.name, schema: LoyaltySchema }, {name: User.name, schema: UserSchema}])],
  controllers: [LoyaltiesController],
  providers: [LoyaltiesService, LoyaltiesRepository]
  
})
export class LoyaltiesModule {}
