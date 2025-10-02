/**
 * Line items inside an order, 
 * storing item snapshots (name, price, discounts, totals).
 */
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index } from 'typeorm';
import { Order } from './Order';
import { decimalTransformer } from './transformers';

@Entity({ name: 'order_item' })
@Index(['orderId'])
@Index(['menuItemId'])
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id', type: 'int' })
  orderId: number;

  @ManyToOne(() => Order, o => o.items, { onDelete: 'CASCADE' })
  order: Order;

  @Column({ name: 'menu_item_id', type: 'int' })
  menuItemId: number;

  @Column({ name: 'name_snapshot', type: 'varchar', length: 200 })
  nameSnapshot: string;

  @Column({ name: 'unit_price', type: 'numeric', precision: 10, scale: 2, transformer: decimalTransformer })
  unitPrice: number;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ name: 'percent_off', type: 'numeric', precision: 5, scale: 2, default: 0, transformer: decimalTransformer })
  percentOff: number;

  @Column({ name: 'line_total', type: 'numeric', precision: 10, scale: 2, transformer: decimalTransformer })
  lineTotal: number;
}