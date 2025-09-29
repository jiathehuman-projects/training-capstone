/**
 * A dine-in order tied to a table, tracking items,
 * totals, taxes, tips, and embedded payment info.
 */
import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany, Index, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { OrderItem } from './OrderItem';
import { OrderStatus, PaymentMode, PaymentStatus } from './enums';
import { decimalTransformer } from './transformers';

@Entity({ name: 'order' })
@Index(['status'])
@Index(['placedAt'])
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  // nullable on GDPR hard delete
  @Column({ name: 'customer_id', type: 'int', nullable: true })
  customerId: number | null;

  // dine-in table as simple number
  @Column({ name: 'table_number', type: 'int' })
  tableNumber: number;

  @Index() // index on enum column for status
  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.DRAFT })
  status: OrderStatus;

  // monetary fields
  @Column({ name: 'subtotal_amount', type: 'numeric', precision: 10, scale: 2, default: 0, transformer: decimalTransformer })
  subtotalAmount: number;

  @Column({ name: 'tax_amount', type: 'numeric', precision: 10, scale: 2, default: 0, transformer: decimalTransformer })
  taxAmount: number;

  @Column({ name: 'service_charge_amount', type: 'numeric', precision: 10, scale: 2, default: 0, transformer: decimalTransformer })
  serviceChargeAmount: number;

  @Column({ name: 'tip_amount', type: 'numeric', precision: 10, scale: 2, default: 0, transformer: decimalTransformer })
  tipAmount: number;

  @Column({ name: 'total_amount', type: 'numeric', precision: 10, scale: 2, default: 0, transformer: decimalTransformer })
  totalAmount: number;

  // embedded payment
  @Index()
  @Column({ name: 'payment_mode', type: 'enum', enum: PaymentMode, nullable: true })
  paymentMode: PaymentMode | null;

  @Index()
  @Column({ name: 'payment_status', type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paidAt: Date | null;

  @Column({ name: 'payment_reference', type: 'varchar', length: 255, nullable: true })
  paymentReference: string | null;

  @Column({ name: 'placed_at', type: 'timestamptz', nullable: true })
  placedAt: Date | null;

  @Column({ name: 'closed_at', type: 'timestamptz', nullable: true })
  closedAt: Date | null;

  // snapshot to keep reporting useful after GDPR deletion
  @Column({ name: 'customer_name_snapshot', type: 'varchar', length: 200, nullable: true })
  customerNameSnapshot: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => OrderItem, oi => oi.order, { cascade: ['insert'] })
  items: OrderItem[];
}