import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('File')
export class File {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'bigint' })
  size!: number;

  @Column({ type: 'boolean', default: false })
  is_public!: boolean;

  @Column({ type: 'varchar', length: 50 })
  file_key!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  file_type!: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  uploaded_at!: Date;

  @Column({ type: 'int' })
  user_id!: number;

  @ManyToOne(() => User, (user) => user.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
