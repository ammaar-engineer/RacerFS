import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { TokenType } from './token-type.enum';

@Entity('Token')
export class Token {
  @PrimaryGeneratedColumn()
  id!: string;

  @Column()
  token!: string;

  @Column({ type: 'int', name: 'user_id' })
  user_id!: number;

  @Column({
    type: 'enum',
    enum: TokenType,
  })
  type!: string;

  @ManyToOne(() => User, (user) => user.tokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
