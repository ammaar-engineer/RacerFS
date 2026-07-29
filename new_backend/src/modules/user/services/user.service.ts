import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../entities/user.entity';
import { JwtService } from '../../../services/jwt.service';
import { AuthValidation } from '../validations/auth.validation';
import { UserValidation } from '../validations/user.validation';
import { FileService } from '../../file/services/file.service';
import { NotFoundException } from '../../../middleware/exceptions';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly authValidation: AuthValidation,
    private readonly userValidation: UserValidation,
    private readonly fileService: FileService,
  ) {}

  async verifyOtpAndAuthenticate(
    sessionId: string,
    otp: string,
  ): Promise<{ token: string; message: string }> {
    // Verify OTP and get session data
    const { email, action } = await this.authValidation.verifyOtp(otp, sessionId);

    let user: User;

    if (action === 'register') {
      // Create new user
      user = await this.createUser(email);
      return {
        token: this.generateAccountToken(user.id),
        message: 'register successfully',
      };
    } else {
      // Get existing user
      user = await this.userValidation.validateEmailExists(email);
      return {
        token: this.generateAccountToken(user.id),
        message: 'login successfully',
      };
    }
  }

  async createUser(email: string): Promise<User> {
    const newUser = this.userRepo.create({ email });
    await this.userRepo.save(newUser);
    return newUser;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    return await this.userRepo.findOne({
      where: { email },
    });
  }

  async deleteUserAccount(authToken: string, email: string): Promise<void> {
    // Verify token
    const tokenPayload = this.jwtService.verifyJwt<{
      user_id: number;
      type: string;
    }>(authToken);

    // Get user by email with files relation
    const user = await this.userRepo.findOne({
      where: { email },
      relations: {
        files: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify ownership
    if (user.id !== tokenPayload.user_id) {
      throw new NotFoundException('Unauthorized action');
    }

    // Delete files from MinIO storage
    if (user.files && user.files.length > 0) {
      const fileKeys = user.files.map((file) => file.file_key);
      await this.fileService.removeObjects(fileKeys);
    }

    // Delete user (cascade will delete files from DB)
    await this.userRepo.delete({ email });
  }

  async createTestAccount(email: string): Promise<{ token: string }> {
    // Check if user exists, if not create
    let user = await this.findUserByEmail(email);

    if (!user) {
      user = await this.createUser(email);
    }

    return {
      token: this.generateAccountToken(user.id),
    };
  }

  private generateAccountToken(userId: number): string {
    return this.jwtService.generateJwt({
      user_id: userId,
      type: 'account_token',
    });
  }
}
