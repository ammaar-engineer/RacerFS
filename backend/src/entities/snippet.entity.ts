import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('Snippet')
export class Snippet {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  alias!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text' })
  command!: string;

  @Column({ type: 'int' })
  user_id!: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  @ManyToOne(() => User, (user) => user.snippets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
