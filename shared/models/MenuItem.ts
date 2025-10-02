/**
 * MenuItem
 * Represents a sellable dish/drink, 
 * including price, category, allergens, promo fields, 
 * and inventory count.
 */
import {
  Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { decimalTransformer } from './transformers';

@Entity({ name: 'menu_item' })
@Index(['name'])
@Index(['category', 'isActive'])
export class MenuItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ length: 100 })
  category: string;

  @Column({ type: 'numeric', precision: 10, scale: 2, transformer: decimalTransformer })
  price: number;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ name: 'photo_url', type: 'text', nullable: true })
  photoUrl: string | null;

  @Column({ name: 'preparation_time_min', type: 'int', nullable: true })
  preparationTimeMin: number | null;

  @Column({ name: 'cost_of_goods', type: 'numeric', precision: 10, scale: 2, nullable: true, transformer: decimalTransformer })
  costOfGoods: number | null;

  // flattened allergens
  @Column({ type: 'text', array: true, default: '{}' })
  allergens: string[];

  // time-boxed item promotion
  @Column({ name: 'promo_percent', type: 'numeric', precision: 5, scale: 2, nullable: true, transformer: decimalTransformer })
  promoPercent: number | null;

  @Column({ name: 'promo_starts_at', type: 'timestamptz', nullable: true })
  promoStartsAt: Date | null;

  @Column({ name: 'promo_ends_at', type: 'timestamptz', nullable: true })
  promoEndsAt: Date | null;

  // inventory folded in
  @Column({ name: 'qty_on_hand', type: 'int', default: 0 })
  qtyOnHand: number;

  @Column({ name: 'reorder_threshold', type: 'int', default: 0 })
  reorderThreshold: number;

  @Column({ name: 'reorder_status', type: 'boolean', default: false })
  reorderStatus: boolean;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}