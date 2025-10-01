import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for API requests and responses
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  repeat_password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profileUrl?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  staffStatus?: string;
  workerRoles?: string[] | null;
  phone?: string;
  profileUrl?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
  message?: string;
}

// Auth API functions
export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },
};

// Token management functions
export const tokenManager = {
  setToken: (token: string) => {
    localStorage.setItem('auth_token', token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  getToken: (): string | null => {
    return localStorage.getItem('auth_token');
  },

  removeToken: () => {
    localStorage.removeItem('auth_token');
    delete api.defaults.headers.common['Authorization'];
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },
};

// Order and Menu related types
export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  displayPrice: number;
  description: string;
  photoUrl: string | null;
  preparationTimeMin: number;
  isAvailable: boolean;
  hasPromo: boolean;
  promoPercent: number | null;
}

export interface CartItem {
  menuItemId: number;
  quantity: number;
  customizations?: string;
  menuItem?: MenuItem;
}

export interface OrderItem {
  id: number;
  orderId: number;
  menuItemId: number;
  nameSnapshot: string;
  quantity: number;
  unitPrice: number;
  percentOff: number;
  lineTotal: number;
  customizations?: string | null;
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

export interface CreateOrderRequest {
  items: CartItem[];
  tableNumber: number;
}

export interface ConfirmOrderRequest {
  confirmed: boolean;
}

// Shift related types
export interface ShiftTemplate {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
}

export interface ShiftRequirement {
  id: number;
  roleName: string;
  requiredCount: number;
  assignedCount: number;
}

export interface ShiftApplication {
  id: number;
  staffId: number;
  staffName: string;
  desiredRequirementId: number | null;
  status: 'applied' | 'approved' | 'rejected' | 'withdrawn';
  appliedAt: Date;
}

export interface ShiftAssignment {
  id: number;
  staffId: number;
  staffName: string;
  roleName: string;
  assignedAt: Date;
}

export interface Shift {
  id: number;
  shiftDate: string;
  template: ShiftTemplate;
  notes: string | null;
  requirements: ShiftRequirement[];
  applications: ShiftApplication[];
  assignments: ShiftAssignment[];
}

export interface ApplyToShiftRequest {
  desiredRequirementId?: number;
}

export interface TimeOffRequest {
  id: number;
  staffId: number;
  staffName: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: 'pending' | 'approved' | 'denied';
  requestedAt: Date;
  decidedAt: Date | null;
}

// Order and Menu API functions
export const orderAPI = {
  getMenuItems: async (): Promise<MenuItem[]> => {
    const response = await api.get<{message: string, menuItems: MenuItem[]}>('/orders/menu');
    return response.data.menuItems;
  },

  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const response = await api.post<{message: string, order: Order}>('/orders', data);
    return response.data.order;
  },

  confirmOrder: async (orderId: number, data: ConfirmOrderRequest): Promise<Order> => {
    const response = await api.put<Order>(`/orders/${orderId}/confirm`, data);
    return response.data;
  },

  getCustomerOrders: async (customerId: number): Promise<Order[]> => {
    const response = await api.get<{message: string, orders: Order[]}>(`/orders/customer/${customerId}`);
    return response.data.orders;
  },

  getOrder: async (orderId: number): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${orderId}`);
    return response.data;
  },

  updateOrderStatus: async (orderId: number, status: string): Promise<Order> => {
    const response = await api.put<Order>(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  getStaffOrders: async (): Promise<Order[]> => {
    const response = await api.get<{message: string, orders: Order[]}>('/orders/staff/orders');
    return response.data.orders;
  },
};

// Shift and Staff API functions
export const shiftAPI = {
  getShifts: async (startDate?: string, endDate?: string): Promise<Shift[]> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get<{message: string, shifts: Shift[]}>(`/api/staff/shift?${params.toString()}`);
    return response.data.shifts;
  },

  applyToShift: async (shiftId: number, data: ApplyToShiftRequest): Promise<void> => {
    await api.post(`/api/staff/shift/${shiftId}/apply`, data);
  },

  getApplications: async (): Promise<ShiftApplication[]> => {
    const response = await api.get<{message: string, applications: ShiftApplication[]}>('/api/staff/application');
    return response.data.applications;
  },

  withdrawApplication: async (applicationId: number): Promise<void> => {
    await api.delete(`/api/staff/application/${applicationId}`);
  },

  getAssignments: async (): Promise<ShiftAssignment[]> => {
    const response = await api.get<{message: string, assignments: ShiftAssignment[]}>('/api/staff/assignment');
    return response.data.assignments;
  },

  getTimeOffRequests: async (status?: string, startDate?: string, endDate?: string): Promise<TimeOffRequest[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await api.get<{message: string, requests: TimeOffRequest[]}>(`/api/staff/timeoff?${params.toString()}`);
    return response.data.requests;
  },

  createTimeOffRequest: async (startDate: string, endDate: string, reason?: string): Promise<void> => {
    await api.post('/api/staff/timeoff', { startDate, endDate, reason });
  },

  withdrawTimeOffRequest: async (requestId: number): Promise<void> => {
    await api.delete(`/api/staff/timeoff/${requestId}`);
  },
};

// Initialize token from localStorage on app start
const savedToken = tokenManager.getToken();
if (savedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}