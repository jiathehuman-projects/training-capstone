// /models/ShiftRequirement.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, Index } from 'typeorm';
import { Shift } from './Shift';

@Entity({ name: 'shift_requirement' })
@Unique(['shiftId', 'roleName'])
export class ShiftRequirement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'shift_id', type: 'int' })
  shiftId: number;

  @ManyToOne(() => Shift, s => s.requirements, { onDelete: 'CASCADE' })
  shift: Shift;

  @Index()
  @Column({ name: 'role_name', type: 'varchar', length: 100 })
  roleName: string; // e.g., 'cook','server','host'

  @Column({ name: 'required_count', type: 'int', default: 0 })
  requiredCount: number;
}