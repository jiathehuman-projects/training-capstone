/**
 * A staff request for time off between dates, requiring manager approval.
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index } from 'typeorm';
import { User } from './User';
import { TimeOffStatus } from './enums';

@Entity({ name: 'time_off_request' })
export class TimeOffRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'staff_id', type: 'int' })
  staffId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  staff: User;

  @Column({ name: 'start_date', type: 'date' })
  startDate: string;

  @Column({ name: 'end_date', type: 'date' })
  endDate: string;

  @Column({ type: 'text', nullable: true })
  reason: string | null;

  @Index() // enum column index
  @Column({ type: 'enum', enum: TimeOffStatus, default: TimeOffStatus.PENDING })
  status: TimeOffStatus;

  @Column({ name: 'manager_id', type: 'int', nullable: true })
  managerId: number | null; // manager is also a user

  @CreateDateColumn({ name: 'requested_at', type: 'timestamptz' })
  requestedAt: Date;

  @Column({ name: 'decided_at', type: 'timestamptz', nullable: true })
  decidedAt: Date | null;
}