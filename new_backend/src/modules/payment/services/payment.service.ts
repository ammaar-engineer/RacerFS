import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { NotFoundException } from '../../../middleware/exceptions';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  /**
   * Add storage to user account
   */
  async addStorage(userId: number, additionalSize: number): Promise<void> {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      loadEagerRelations: false,
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.storage_size = Number(user.storage_size) + additionalSize;
    await this.userRepo.save(user, { reload: false });
  }
}
