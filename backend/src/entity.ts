import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";

export enum TokenType {
  "file_access_token" = "file_access_token",
  "account_token"="account_token"
}

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

@Entity("User")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 40, unique: true })
  email!: string;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at!: Date;

  // Relations
  @OneToMany(() => Snippet, (snippet) => snippet.user, { cascade: true })
  snippets!: Snippet[];

  @OneToMany(() => Token, (token) => token.user_id)
  tokens!: Token[]

  @OneToMany(() => File, (file) => file.user, { cascade: true })
  files!: File[];
}

@Entity("Snippet")
export class Snippet {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  alias!: string;

  @Column({ type: "text", nullable: true })
  description!: string | null;

  @Column({ type: "text" })
  command!: string;

  @Column({ type: "int" })
  user_id!: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at!: Date;

  @ManyToOne(() => User, (user) => user.snippets, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;
}

@Entity("File")
export class File {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "bigint" })
  size!: number;

  @Column({type: 'boolean', default: false})
  is_public!: boolean

  @Column({type: 'varchar', length: 50})
  minio_path!: string

  @CreateDateColumn({ type: "timestamp with time zone" })
  uploaded_at!: Date;

  @Column({ type: "int" })
  user_id!: number;

  @ManyToOne(() => User, (user) => user.files, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;
}
