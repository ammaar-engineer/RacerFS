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
    });
  }

  async validateEmailNotExists(email: string): Promise<void> {
    const user = await this.isEmailExist(email);
    if (user) {
      throw new ConflictException('Email already exists');
    }
  }

  async validateEmailExists(email: string): Promise<User> {
    const user = await this.isEmailExist(email);
    if (!user) {
      throw new NotFoundException('Email not found');
    }
    return user;
  }
}
