import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

  staffLogin: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/portal', data);
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
  displayPrice?: number;
  description: string | null;
  photoUrl: string | null;
  preparationTimeMin: number | null;
  costOfGoods: number | null;
  allergens: string[];
  promoPercent: number | null;
  promoStartsAt: string | null;
  promoEndsAt: string | null;
  qtyOnHand: number | undefined; // Can be undefined at runtime despite backend defaults
  reorderThreshold: number | undefined; // Can be undefined at runtime despite backend defaults
  reorderStatus: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // For compatibility
  hasPromo?: boolean;
}

// Menu Management specific types
export interface MenuItemsResponse {
  menuItems: MenuItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CreateMenuItemRequest {
  name: string;
  category: string;
  price: number;
  description: string;
  preparationTimeMin?: number;
  costOfGoods?: number;
  allergens?: string[];
  qtyOnHand: number;
  reorderThreshold?: number;
}

export interface UpdateMenuItemRequest extends Partial<CreateMenuItemRequest> {
  isActive?: boolean;
}

export interface CategoriesResponse {
  categories: string[];
  predefined: string[];
  fromDatabase: string[];
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
  staffWorkerRoles: string[];
  desiredRequirementId: number | null;
  status: 'applied' | 'approved' | 'rejected' | 'withdrawn';
  appliedAt: Date;
  shift?: {
    id: number;
    shiftDate: string;
    template?: {
      name: string;
      startTime: string;
      endTime: string;
    } | null;
  } | null;
  desiredRole?: string | null;
  hasTimeConflict?: boolean;
}

export interface ShiftAssignment {
  id: number;
  staffId: number;
  staffName: string;
  roleName: string;
  assignedAt: Date;
  shift?: {
    id: number;
    shiftDate: string;
    template: string;
    startTime: string;
    endTime: string;
  } | null;
}

export interface Shift {
  id: number;
  shiftDate: string;
  template: ShiftTemplate | null;
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

export interface StaffMember {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  roles: string[];
  staffStatus: 'active' | 'unavailable' | 'inactive';
  workerRoles: string[];
  weeklyAvailability?: Record<string, any>;
  createdAt: string;
}

export interface StaffResponse {
  staff: StaffMember[];
  total: number;
}

// Order and Menu API functions
export const orderAPI = {
  getMenuItems: async (): Promise<MenuItem[]> => {
    const response = await api.get<{message: string, menuItems: MenuItem[]}>('/api/menu');
    return response.data.menuItems;
  },

  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    // FIXED: Backend expects /orders/order (router.post('/order') mounted at /orders)
    const response = await api.post<{message: string, order: Order}>('/orders/order', data);
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

// Menu Management API functions (for managers/admins)
export const menuAPI = {
  getMenuItems: async (params?: {
    category?: string;
    active?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<MenuItemsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.active !== undefined) queryParams.append('active', params.active.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const response = await api.get<MenuItemsResponse>(`/api/menu?${queryParams.toString()}`);
    return response.data;
  },

  getMenuItem: async (id: number): Promise<MenuItem> => {
    const response = await api.get<{menuItem: MenuItem}>(`/api/menu/${id}`);
    return response.data.menuItem;
  },

  createMenuItem: async (data: CreateMenuItemRequest): Promise<MenuItem> => {
    const response = await api.post<{message: string, menuItem: MenuItem}>('/api/menu', data);
    return response.data.menuItem;
  },

  updateMenuItem: async (id: number, data: UpdateMenuItemRequest): Promise<MenuItem> => {
    const response = await api.put<{message: string, menuItem: MenuItem}>(`/api/menu/${id}`, data);
    return response.data.menuItem;
  },

  deleteMenuItem: async (id: number): Promise<MenuItem> => {
    const response = await api.delete<{message: string, menuItem: MenuItem}>(`/api/menu/${id}`);
    return response.data.menuItem;
  },

  getCategories: async (): Promise<CategoriesResponse> => {
    const response = await api.get<CategoriesResponse>('/api/menu/categories');
    return response.data;
  },
};

// Staff Menu API functions (for managers)
export const staffMenuAPI = {
  getMenuItems: async (params?: {
    category?: string;
    isActive?: boolean;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  }): Promise<MenuItemsResponse> => {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const url = `/api/staff/menu${queryString ? `?${queryString}` : ''}`;
    const response = await api.get<MenuItemsResponse>(url);
    return response.data;
  },

  getMenuItem: async (id: number): Promise<MenuItem> => {
    const response = await api.get<{message: string, menuItem: MenuItem}>(`/api/staff/menu/${id}`);
    return response.data.menuItem;
  },

  createMenuItem: async (data: CreateMenuItemRequest): Promise<MenuItem> => {
    const response = await api.post<{message: string, menuItem: MenuItem}>('/api/staff/menu', data);
    return response.data.menuItem;
  },

  updateMenuItem: async (id: number, data: UpdateMenuItemRequest): Promise<MenuItem> => {
    const response = await api.put<{message: string, menuItem: MenuItem}>(`/api/staff/menu/${id}`, data);
    return response.data.menuItem;
  },

  deleteMenuItem: async (id: number): Promise<MenuItem> => {
    const response = await api.delete<{message: string, menuItem: MenuItem}>(`/api/staff/menu/${id}`);
    return response.data.menuItem;
  },

  getCategories: async (): Promise<CategoriesResponse> => {
    const response = await api.get<CategoriesResponse>('/api/staff/menu/categories');
    return response.data;
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

  getMyAssignments: async (): Promise<ShiftAssignment[]> => {
    const response = await api.get<{message: string, assignments: ShiftAssignment[]}>('/api/staff/my-assignments');
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

  getAllStaff: async (): Promise<StaffResponse> => {
    const response = await api.get<StaffResponse>('/api/staff/all');
    return response.data;
  },

  getAllApplicationsForManager: async (): Promise<ShiftApplication[]> => {
    const response = await api.get<{message: string, applications: ShiftApplication[]}>('/api/staff/applications/all');
    return response.data.applications;
  },

  approveAndAssignApplication: async (applicationId: number): Promise<void> => {
    await api.put(`/api/staff/application/${applicationId}/approve`);
  },

  declineApplication: async (applicationId: number): Promise<void> => {
    await api.put(`/api/staff/application/${applicationId}/decline`);
  },
};

// Analytics types
export interface AnalyticsMetadata {
  period: string;
  dateRange: {
    start: string;
    end: string;
  };
  [key: string]: any;
}

export interface MenuPerformanceItem {
  menuItemId: number;
  name: string;
  category: string;
  quantitySold: number;
  revenue: number;
  averageOrderValue: number;
  timesOrdered: number;
}

export interface MenuPerformanceResponse {
  message: string;
  metadata: AnalyticsMetadata & {
    totalMenuItems: number;
    totalItemsSold: number;
    totalRevenue: number;
    averageItemPrice: number;
  };
  data: MenuPerformanceItem[] | {
    topSellingItems: MenuPerformanceItem[];
    categoryBreakdown: any;
    summary: {
      bestPerformer: MenuPerformanceItem | null;
      worstPerformer: MenuPerformanceItem | null;
    };
  };
}

export interface StaffUtilizationItem {
  staffId: number;
  name: string;
  roles: string[];
  totalHours: number;
  scheduledShifts: number;
  completedShifts: number;
  attendanceRate: number;
  averageHoursPerShift: number;
}

export interface StaffUtilizationResponse {
  message: string;
  metadata: AnalyticsMetadata & {
    totalStaff: number;
    totalHoursWorked: number;
    overallAttendanceRate: number;
    averageHoursPerStaff: number;
  };
  data: StaffUtilizationItem[] | {
    summary: {
      topPerformer: StaffUtilizationItem | null;
      highestAttendance: StaffUtilizationItem | null;
      mostReliable: number;
    };
    departmentBreakdown: any;
  };
}

export interface RevenueAnalyticsResponse {
  message: string;
  metadata: AnalyticsMetadata & {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalTax: number;
    totalTips: number;
  };
  data: {
    summary?: {
      peakDay: any;
      averageDailyRevenue: number;
    };
    dailyBreakdown?: Array<{
      date: string;
      revenue: number;
    }>;
    orders?: Array<{
      id: number;
      date: Date;
      totalAmount: number;
      taxAmount: number;
      tipAmount: number;
      tableNumber: number;
    }>;
    dailyTotals?: Array<{
      date: string;
      revenue: number;
    }>;
  };
  comparison?: {
    previous: {
      period: { start: string; end: string };
      totalRevenue: number;
      totalOrders: number;
      averageOrderValue: number;
    };
    growth: {
      revenue: number;
      orders: number;
      averageOrderValue: number;
    };
  };
}

export interface SystemUsageResponse {
  message: string;
  metadata: AnalyticsMetadata;
  data: any;
}

// Analytics API functions
export const analyticsAPI = {
  getMenuPerformance: async (params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
    aggregated?: boolean;
  }): Promise<MenuPerformanceResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.aggregated !== undefined) queryParams.append('aggregated', params.aggregated.toString());
    
    const response = await api.get<MenuPerformanceResponse>(`/api/analytics/menu-performance?${queryParams.toString()}`);
    return response.data;
  },

  getStaffUtilization: async (params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
    aggregated?: boolean;
  }): Promise<StaffUtilizationResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.aggregated !== undefined) queryParams.append('aggregated', params.aggregated.toString());
    
    const response = await api.get<StaffUtilizationResponse>(`/api/analytics/staff-utilization?${queryParams.toString()}`);
    return response.data;
  },

  getRevenueAnalytics: async (params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
    aggregated?: boolean;
    compareWithPrevious?: boolean;
  }): Promise<RevenueAnalyticsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.aggregated !== undefined) queryParams.append('aggregated', params.aggregated.toString());
    if (params?.compareWithPrevious !== undefined) queryParams.append('compareWithPrevious', params.compareWithPrevious.toString());
    
    const response = await api.get<RevenueAnalyticsResponse>(`/api/analytics/revenue?${queryParams.toString()}`);
    return response.data;
  },

  getSystemUsage: async (params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
    aggregated?: boolean;
  }): Promise<SystemUsageResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.aggregated !== undefined) queryParams.append('aggregated', params.aggregated.toString());
    
    const response = await api.get<SystemUsageResponse>(`/api/analytics/system-usage?${queryParams.toString()}`);
    return response.data;
  },
};

// Initialize token from localStorage on app start
const savedToken = tokenManager.getToken();
if (savedToken) {
  api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}