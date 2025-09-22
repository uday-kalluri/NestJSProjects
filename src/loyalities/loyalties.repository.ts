// loyalties/loyalties.repository.ts
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Loyalty, LoyaltyDocument } from './schemas/loyalty.schema'
import { User, UserDocument } from 'src/users/schemas/user.schema';

export class LoyaltiesRepository {
  constructor(@InjectModel(Loyalty.name) private model: Model<LoyaltyDocument>
    , @InjectModel(User.name) private userModel: Model<UserDocument>) { }
  findByUserId(userId: string) { return this.model.findOne({ userId }); }
  upsertForUser(userId: string) {
    return this.model.findOneAndUpdate({ userId }, { $setOnInsert: { userId } }, { new: true, upsert: true });
  }
  // listWithUsers(skip = 0, limit = 50) {
  //   // return this.model.aggregate([
  //   //   { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
  //   //   { $unwind: '$user' },
  //   //   { $project: { points:1, status:1, 'user.username':1, 'user.email':1 } },
  //   //   { $skip: skip }, { $limit: limit },
  //   // ]);

  //   return this.userModel.aggregate([
  //     {
  //       $lookup: {
  //         from: 'loyalties',
  //         localField: '_id',
  //         foreignField: 'userId',
  //         as: 'loyalty',
  //       },
  //     },
  //     {
  //       $unwind: {
  //         path: '$loyalty',
  //         preserveNullAndEmptyArrays: true,
  //       },
  //     },
  //     {
  //       $project: {
  //         username: 1,
  //         email: 1,
  //         role: 1,
  //         points: { $ifNull: ['$loyalty.points', 0] },
  //         status: { $ifNull: ['$loyalty.status', 'SILVER'] },
  //       },
  //     },
  //     { $skip: skip },
  //     { $limit: limit },
  //   ]);
  // }

  async listWithUsers(skip = 0, limit = 50) {
   return this.userModel.aggregate([
  {
    $lookup: {
      from: 'loyalties',
      let: { uid: { $toString: '$_id' } },   // convert user._id to string
      pipeline: [
        { $match: { $expr: { $eq: ['$userId', '$$uid'] } } }
      ],
      as: 'loyalty'
    }
  },
  { $unwind: { path: '$loyalty', preserveNullAndEmptyArrays: true } },
  {
    $project: {
      username: 1,
      email: 1,
      role: 1,
      points: { $ifNull: ['$loyalty.points', 0] },
      status: { $ifNull: ['$loyalty.status', 'SILVER'] }
    }
  }
])
  }

  
  async applyDelta(userId: string, delta: number, reason: string) {
    return this.model.findOneAndUpdate(
      { userId },
      { $inc: { points: delta }, $push: { history: { delta, reason, at: new Date() } } },
      { new: true, upsert: true }
    );
  }
}
