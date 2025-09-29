/**
 * A manager’s confirmed placement of a staff member into a specific role requirement within a shift.
 */
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, CreateDateColumn, Index
} from 'typeorm';
import { Shift } from './Shift';
import { User } from './User';
import { ShiftRequirement } from './ShiftRequirement';

@Entity({ name: 'shift_assignment' })
@Unique(['shiftId', 'staffId'])          // worker appears at most once in a shift
@Unique(['requirementId', 'staffId'])    // same worker can’t fill the same role twice
@Index(['shiftId', 'requirementId'])
export class ShiftAssignment {
  @PrimaryGeneratedColumn()
  id: number;

  // redundant but useful for quick per-shift queries & uniqueness
  @Column({ name: 'shift_id', type: 'int' })
  shiftId: number;

  @ManyToOne(() => Shift, s => s.assignments, { onDelete: 'CASCADE' })
  shift: Shift;

  // the specific role slot (e.g., Oct-3 Morning, role=server)
  @Column({ name: 'requirement_id', type: 'int' })
  requirementId: number;

  @ManyToOne(() => ShiftRequirement, { onDelete: 'CASCADE' })
  requirement: ShiftRequirement;

  @Column({ name: 'staff_id', type: 'int' })
  staffId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  staff: User;

  @CreateDateColumn({ name: 'assigned_at', type: 'timestamptz' })
  assignedAt: Date;
}
