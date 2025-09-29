/**
 * A scheduled shift for a specific date and template 
 * (e.g., Oct 3 Morning)
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, Unique, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ShiftTemplate } from './ShiftTemplate';
import { ShiftRequirement } from './ShiftRequirement';
import { ShiftApplication } from './ShiftApplication';
import { ShiftAssignment } from '.';

@Entity({ name: 'shift' })
@Unique(['shiftDate', 'templateId'])
export class Shift {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'shift_date', type: 'date' })
  shiftDate: string;

  @Column({ name: 'template_id', type: 'int' })
  templateId: number;

  @ManyToOne(() => ShiftTemplate, st => st.shifts, { onDelete: 'RESTRICT' })
  template: ShiftTemplate;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => ShiftRequirement, sr => sr.shift, { cascade: ['insert'] })
  requirements: ShiftRequirement[];

  @OneToMany(() => ShiftApplication, sa => sa.shift)
  applications: ShiftApplication[];

  @OneToMany(() => ShiftAssignment, sa => sa.shift)
  assignments: ShiftAssignment[];
}