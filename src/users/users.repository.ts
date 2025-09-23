// users/users.repository.ts
import { InjectModel } from '@nestjs/mongoose';
import { Model,Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

export class UsersRepository {
  constructor(@InjectModel(User.name) private model: Model<UserDocument>) { }
  create(data: Partial<User>) { return this.model.create(data); }
  findByEmailOrUsername(identity: string) {
    return this.model.findOne({ $or: [{ email: identity }, { username: identity }] }).exec();
  }
  async hashPassword(raw: string)
   { return bcrypt.hash(raw, 10); }


  async findByFirebaseUid(uid: string) {
    // Example using mongoose:
    return this.model.findOne({ firebaseUid: uid }).exec();
  }

  async attachFirebaseUid(userId: string | Types.ObjectId, uid: string) {
    return this.model.findByIdAndUpdate(userId, { firebaseUid: uid }).exec();
  }

  async createLoyaltyForUser(userId: any) {
    // call Loyalty repository upsert for new user
  }

  // helper to ensure unique username (optional)
  async makeUniqueUsername(base: string) {
    let candidate = base;
    let i = 0;
    while (await this.model.exists({ username: candidate })) {
      i++;
      candidate = `${base}${i}`;
    }
    return candidate;
  }

  // create method should accept firebaseUid and phone

}



