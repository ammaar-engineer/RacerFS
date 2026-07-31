import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import {
  ConflictException,
  NotFoundException,
} from '../../../middleware/exceptions';

@Injectable()
export class UserValidation {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async isEmailExist(email: string): Promise<User | null> {
    return await this.userRepo.findOne({
      where: { email },
      loadEagerRelations: false,
    });
  }

  async emailShouldBe(
    what: 'exist' | 'notexist',
    email: string,
  ): Promise<User | null> {
    const user = await this.userRepo.findOne({
      where: {
        email: email,
      },
      loadEagerRelations: false,
    });
    if (user && what == 'notexist') {
      throw new ConflictException('Email already exist');
    }
    if (!user && what == 'exist') {
      throw new NotFoundException('Email not found');
    }
    return user;
  }
}
