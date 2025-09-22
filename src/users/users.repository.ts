// users/users.repository.ts
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

export class UsersRepository {
  constructor(@InjectModel(User.name) private model: Model<UserDocument>) {}
  create(data: Partial<User>) { return this.model.create(data); }
  findByEmailOrUsername(identity: string) {
    return this.model.findOne({ $or: [{ email: identity }, { username: identity }] });
  }
  async hashPassword(raw: string) { return bcrypt.hash(raw, 10); }
}
