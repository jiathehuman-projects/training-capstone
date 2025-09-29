/**
 * 
 * Stores all people in the system (customers, staff, managers, admins) with their login,
 * roles, and staff-specific availability/status.
 */
import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index
} from 'typeorm';
import { StaffStatus } from './enums';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  username: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  // application-level roles (e.g., ['manager','staff','customer'])
  @Column({ type: 'text', array: true, default: '{}' })
  roles: string[];

  @Column({ name: 'first_name', length: 100 })
  firstName: string;

  @Column({ name: 'last_name', length: 100 })
  lastName: string;

  @Column({ length: 50, nullable: true })
  phone: string | null;

  @Column({ name: 'profile_url', type: 'text', nullable: true })
  profileUrl: string | null;

  // staff-only fields (nullable for customers)
  @Index() // index on enum-like column
  @Column({ name: 'staff_status', type: 'enum', enum: StaffStatus, nullable: true })
  staffStatus: StaffStatus | null;

  @Column({ name: 'worker_roles', type: 'text', array: true, nullable: true })
  workerRoles: string[] | null; // e.g., ['cook','server']

  // weekly availability JSONB: {"0":[["10:00","22:00"]], "6":[["12:00","20:00"]]}
  @Column({ name: 'weekly_availability', type: 'jsonb', nullable: true })
  weeklyAvailability: Record<string, [string, string][]> | null;

  @Column({ name: 'reset_token', type: 'varchar', length: 255, nullable: true })
  resetToken: string | null;

  @Column({ name: 'reset_token_expiry', type: 'timestamptz', nullable: true })
  resetTokenExpiry: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}