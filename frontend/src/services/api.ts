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

// Initialize token from localStorage on app start
const savedToken = tokenManager.getToken();
if (savedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}