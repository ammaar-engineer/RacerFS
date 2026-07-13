import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";

@Entity("Users")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 40, unique: true })
  email!: string;

  @Column({ type: "varchar", length: 255 })
  password!: string;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at!: Date;

  @OneToMany(() => Bucket, (bucket) => bucket.user, { cascade: true })
  buckets!: Bucket[];

  @OneToMany(() => Snippet, (snippet) => snippet.user, { cascade: true })
  snippets!: Snippet[];

  @OneToMany(() => File, (file) => file.user, { cascade: true })
  files!: File[];
}

@Entity("Buckets")
export class Bucket {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "int" })
  user_id!: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  created_at!: Date;

  @ManyToOne(() => User, (user) => user.buckets, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @OneToMany(() => File, (file) => file.bucket, { cascade: true })
  files!: File[];
}

@Entity("Snippets")
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

@Entity("Files")
export class File {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "bigint" })
  size!: number;

  @CreateDateColumn({ type: "timestamp with time zone" })
  uploaded_at!: Date;

  @Column({ type: "int" })
  bucket_id!: number;

  @Column({ type: "int" })
  user_id!: number;

  @Column({ type: "varchar", length: 100, nullable: true })
  mime_type!: string | null;

  @ManyToOne(() => Bucket, (bucket) => bucket.files, { onDelete: "CASCADE" })
  @JoinColumn({ name: "bucket_id" })
  bucket!: Bucket;

  @ManyToOne(() => User, (user) => user.files, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;
}
