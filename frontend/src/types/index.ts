import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Order and Menu related types for frontend
export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  displayPrice?: number;
  description: string;
  photoUrl?: string;
  preparationTimeMin: number;
  isAvailable: boolean;
  hasPromo?: boolean;
  promoPercent?: number;
  promoStartsAt?: string;
  promoEndsAt?: string;
}

export interface CartItem {
  menuItemId: number;
  quantity: number;
  customizations?: string;
  menuItem?: MenuItem;
}

export interface OrderItem {
  id: number;
  menuItemId: number;
  quantity: number;
  customizations: string | null;
  unitPrice: number;
  totalPrice: number;
  menuItem?: MenuItem;
}

export interface Order {
  id: number;
  customerId: number | null;
  tableNumber: number;
  status: string;
  subtotalAmount: number;
  taxAmount: number;
  serviceChargeAmount: number;
  tipAmount: number;
  totalAmount: number;
  paymentMode: string | null;
  paymentStatus: string | null;
  placedAt: Date | null;
  confirmedAt: Date | null;
  items: OrderItem[];
}
