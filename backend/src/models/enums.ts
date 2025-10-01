/**
 * Enums used for the database
 */
export enum StaffStatus {
  ACTIVE = 'active',
  UNAVAILABLE = 'unavailable', 
  INACTIVE = 'inactive',
}

export enum ShiftApplicationStatus {
  APPLIED = 'applied',
  WITHDRAWN = 'withdrawn',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export enum ShiftTiming {
  EVENING = 'evening',
  NIGHT = 'night',
  EARLY_MORNING = 'early_morning'
}

export enum OrderStatus {
  DRAFT = 'draft',        // replaces cart
  PLACED = 'placed',
  IN_KITCHEN = 'in_kitchen',
  READY = 'ready',
  SERVED = 'served',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
}

export enum PaymentMode {
  CARD = 'card',
  CASH = 'cash',
  QR = 'qr',
}

export enum TimeOffStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  DENIED = 'denied',
}