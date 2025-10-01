/**
 * Defines the three recurring daily shift slots 
 * (Morning, Afternoon, Evening) with start and end times.
 */
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, Unique } from 'typeorm';
import { Shift } from './Shift';
import { ShiftTiming } from './enums';

@Entity({ name: 'shift_template' })
@Unique(['name'])
export class ShiftTemplate {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: ShiftTiming, default: ShiftTiming.EVENING })
  name: string; 

  @Column({ name: 'start_time', type: 'time without time zone' })
  startTime: string; // '10:00:00'

  @Column({ name: 'end_time', type: 'time without time zone' })
  endTime: string; // '14:00:00'

  @OneToMany(() => Shift, s => s.template)
  shifts: Shift[];
}