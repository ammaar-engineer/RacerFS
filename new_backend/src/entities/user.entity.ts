import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Snippet } from './snippet.entity';
import { Token } from './token.entity';
import { File } from './file.entity';

@Entity('User')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 40, unique: true })
  email!: string;

  @Column({
    type: 'bigint',
    nullable: false,
    default: 104857600,
  })
  storage_size!: number;

  @Column({
    type: 'bigint',
    nullable: false,
    default: 0,
  })
  used_storage!: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at!: Date;

  // Relations
  @OneToMany(() => Snippet, (snippet) => snippet.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  snippets!: Snippet[];

  @OneToMany(() => Token, (token) => token.user, { onDelete: 'CASCADE' })
  tokens!: Token[];

  @OneToMany(() => File, (file) => file.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  files!: File[];
}
