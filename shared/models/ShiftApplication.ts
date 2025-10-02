/**
 * A staff member applies to work a given shift, optionally pointing to a role.
 */
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, CreateDateColumn, Index, JoinColumn
} from 'typeorm';
import { Shift } from './Shift';
import { User } from './User';
import { ShiftApplicationStatus } from './enums';
import { ShiftRequirement } from './ShiftRequirement';

@Entity({ name: 'shift_application' })
@Unique(['shiftId', 'staffId']) // one application per worker per shift
export class ShiftApplication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'shift_id', type: 'int' })
  shiftId: number;

  @ManyToOne(() => Shift, s => s.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shift_id' })
  shift: Shift;

  @Column({ name: 'staff_id', type: 'int' })
  staffId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'staff_id' })
  staff: User;

  // optional: the role they'd like to work (links to that shift's role row)
  @Column({ name: 'desired_requirement_id', type: 'int', nullable: true })
  desiredRequirementId: number | null;

  @ManyToOne(() => ShiftRequirement, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'desired_requirement_id' })
  desiredRequirement: ShiftRequirement | null;

  @Index()
  @Column({ type: 'enum', enum: ShiftApplicationStatus, default: ShiftApplicationStatus.APPLIED })
  status: ShiftApplicationStatus;

  @CreateDateColumn({ name: 'applied_at', type: 'timestamptz' })
  appliedAt: Date;
}