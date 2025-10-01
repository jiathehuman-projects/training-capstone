import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Order, OrderItem, MenuItem, User, Shift, ShiftAssignment } from '../models';
import { OrderStatus, PaymentStatus, StaffStatus } from '../models/enums';
import { Between, MoreThanOrEqual, LessThanOrEqual, In } from 'typeorm';

const orderRepository = AppDataSource.getRepository(Order);
const orderItemRepository = AppDataSource.getRepository(OrderItem);
const menuItemRepository = AppDataSource.getRepository(MenuItem);
const userRepository = AppDataSource.getRepository(User);
const shiftRepository = AppDataSource.getRepository(Shift);
const shiftAssignmentRepository = AppDataSource.getRepository(ShiftAssignment);

interface AnalyticsRequest extends Request {
  query: {
    period?: string;
    startDate?: string;
    endDate?: string;
    aggregated?: string;
    compareWithPrevious?: string;
  };
}

// Helper function to calculate date ranges
const getDateRange = (period: string = 'month', startDate?: string, endDate?: string) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let start: Date;
  let end: Date = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1); // End of today

  switch (period) {
    case 'today':
      start = today;
      break;
    case 'yesterday':
      start = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      end = new Date(today.getTime() - 1);
      break;
    case 'week':
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      start = startOfWeek;
      break;
    case 'last_week':
      const lastWeekStart = new Date(today);
      lastWeekStart.setDate(today.getDate() - today.getDay() - 7);
      const lastWeekEnd = new Date(lastWeekStart);
      lastWeekEnd.setDate(lastWeekStart.getDate() + 6);
      start = lastWeekStart;
      end = new Date(lastWeekEnd.getTime() + 24 * 60 * 60 * 1000 - 1);
      break;
    case 'month':
      start = new Date(today.getFullYear(), today.getMonth(), 1);
      break;
    case 'last_month':
      start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      end = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59, 999);
      break;
    case 'year':
      start = new Date(today.getFullYear(), 0, 1);
      break;
    case 'custom':
      if (!startDate || !endDate) {
        throw new Error('Custom period requires both startDate and endDate');
      }
      start = new Date(startDate);
      end = new Date(new Date(endDate).getTime() + 24 * 60 * 60 * 1000 - 1);
      break;
    default:
      // Default to last month
      start = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
      break;
  }

  return { start, end };
};

// Helper function to get previous period for comparison
const getPreviousPeriodRange = (start: Date, end: Date) => {
  const duration = end.getTime() - start.getTime();
  const previousEnd = new Date(start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - duration);
  
  return { start: previousStart, end: previousEnd };
};

export const getMenuPerformance = async (req: AnalyticsRequest, res: Response) => {
  try {
    const { period, startDate, endDate, aggregated } = req.query;
    const isAggregated = aggregated === 'true';
    
    const { start, end } = getDateRange(period, startDate, endDate);

    // Get completed orders within date range
    const orders = await orderRepository.find({
      where: {
        status: In([OrderStatus.SERVED, OrderStatus.CLOSED]),
        placedAt: Between(start, end)
      },
      relations: ['items']
    });

    // Get all order items from these orders
    const orderItems = await orderItemRepository
      .createQueryBuilder('orderItem')
      .innerJoin('orderItem.order', 'order')
      .where('order.status IN (:...statuses)', { 
        statuses: [OrderStatus.SERVED, OrderStatus.CLOSED] 
      })
      .andWhere('order.placedAt BETWEEN :start AND :end', { start, end })
      .getMany();

    // Get menu items for category information
    const menuItemIds = [...new Set(orderItems.map(item => item.menuItemId))];
    const menuItems = await menuItemRepository.findByIds(menuItemIds);
    const menuItemMap = new Map(menuItems.map(item => [item.id, item]));

    // Calculate menu performance metrics
    const menuPerformance = new Map<number, {
      menuItemId: number;
      name: string;
      category: string;
      quantitySold: number;
      revenue: number;
      averageOrderValue: number;
      timesOrdered: number;
    }>();

    orderItems.forEach(item => {
      const key = item.menuItemId;
      const existing = menuPerformance.get(key);
      
      if (existing) {
        existing.quantitySold += item.quantity;
        existing.revenue += item.lineTotal;
        existing.timesOrdered += 1;
        existing.averageOrderValue = existing.revenue / existing.timesOrdered;
      } else {
        const menuItem = menuItemMap.get(key);
        menuPerformance.set(key, {
          menuItemId: key,
          name: item.nameSnapshot,
          category: menuItem?.category || 'Unknown',
          quantitySold: item.quantity,
          revenue: item.lineTotal,
          averageOrderValue: item.lineTotal,
          timesOrdered: 1
        });
      }
    });

    const performanceArray = Array.from(menuPerformance.values())
      .sort((a, b) => b.quantitySold - a.quantitySold);

    const totalRevenue = performanceArray.reduce((sum, item) => sum + item.revenue, 0);
    const totalItemsSold = performanceArray.reduce((sum, item) => sum + item.quantitySold, 0);

    const response = {
      message: 'Menu performance analytics retrieved successfully',
      metadata: {
        period: period || 'month',
        dateRange: { start, end },
        totalMenuItems: performanceArray.length,
        totalItemsSold,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        averageItemPrice: totalItemsSold > 0 ? Number((totalRevenue / totalItemsSold).toFixed(2)) : 0
      },
      data: isAggregated ? {
        topSellingItems: performanceArray.slice(0, 10),
        categoryBreakdown: getMenuCategoryBreakdown(performanceArray),
        summary: {
          bestPerformer: performanceArray[0] || null,
          worstPerformer: performanceArray[performanceArray.length - 1] || null
        }
      } : performanceArray
    };

    return res.status(200).json(response);

  } catch (err) {
    const error = err as Error;
    console.error('Menu performance analytics error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve menu performance analytics',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const getStaffUtilization = async (req: AnalyticsRequest, res: Response) => {
  try {
    const { period, startDate, endDate, aggregated } = req.query;
    const isAggregated = aggregated === 'true';
    
    const { start, end } = getDateRange(period, startDate, endDate);

    // Get all staff users
    const staffUsers = await userRepository
      .createQueryBuilder('user')
      .where('user.roles && :roles', { roles: ['staff', 'manager'] })
      .andWhere('user.staffStatus = :status', { status: StaffStatus.ACTIVE })
      .getMany();

    // Get shift assignments for the period
    const shiftAssignments = await shiftAssignmentRepository
      .createQueryBuilder('assignment')
      .innerJoinAndSelect('assignment.shift', 'shift')
      .innerJoinAndSelect('assignment.staff', 'staff')
      .where('shift.shiftDate BETWEEN :start AND :end', { start, end })
      .getMany();

    // Calculate staff utilization metrics
    const staffMetrics = staffUsers.map(staff => {
      const userAssignments = shiftAssignments.filter(a => a.staff.id === staff.id);
      
      const totalHours = userAssignments.reduce((sum, assignment) => {
        // For now, assume standard 8-hour shifts since we don't have actual time tracking
        // In a real system, you'd track actual start/end times
        return sum + 8;
      }, 0);

      const scheduledShifts = userAssignments.length;
      const completedShifts = userAssignments.length; // Assume all scheduled shifts are completed for now
      
      const attendanceRate = scheduledShifts > 0 ? (completedShifts / scheduledShifts) * 100 : 0;

      return {
        staffId: staff.id,
        name: `${staff.firstName} ${staff.lastName}`,
        roles: staff.workerRoles || [],
        totalHours: Number(totalHours.toFixed(2)),
        scheduledShifts,
        completedShifts,
        attendanceRate: Number(attendanceRate.toFixed(2)),
        averageHoursPerShift: completedShifts > 0 ? Number((totalHours / completedShifts).toFixed(2)) : 0
      };
    });

    const totalStaffHours = staffMetrics.reduce((sum, staff) => sum + staff.totalHours, 0);
    const totalScheduledShifts = staffMetrics.reduce((sum, staff) => sum + staff.scheduledShifts, 0);
    const totalCompletedShifts = staffMetrics.reduce((sum, staff) => sum + staff.completedShifts, 0);
    const overallAttendanceRate = totalScheduledShifts > 0 ? (totalCompletedShifts / totalScheduledShifts) * 100 : 0;

    const response = {
      message: 'Staff utilization analytics retrieved successfully',
      metadata: {
        period: period || 'month',
        dateRange: { start, end },
        totalStaff: staffMetrics.length,
        totalHoursWorked: Number(totalStaffHours.toFixed(2)),
        overallAttendanceRate: Number(overallAttendanceRate.toFixed(2)),
        averageHoursPerStaff: staffMetrics.length > 0 ? Number((totalStaffHours / staffMetrics.length).toFixed(2)) : 0
      },
      data: isAggregated ? {
        summary: {
          topPerformer: staffMetrics.sort((a, b) => b.totalHours - a.totalHours)[0] || null,
          highestAttendance: staffMetrics.sort((a, b) => b.attendanceRate - a.attendanceRate)[0] || null,
          mostReliable: staffMetrics.filter(s => s.attendanceRate === 100).length
        },
        departmentBreakdown: getStaffDepartmentBreakdown(staffMetrics)
      } : staffMetrics
    };

    return res.status(200).json(response);

  } catch (err) {
    const error = err as Error;
    console.error('Staff utilization analytics error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve staff utilization analytics',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const getRevenueAnalytics = async (req: AnalyticsRequest, res: Response) => {
  try {
    const { period, startDate, endDate, aggregated, compareWithPrevious } = req.query;
    const isAggregated = aggregated === 'true';
    const includeComparison = compareWithPrevious === 'true';
    
    const { start, end } = getDateRange(period, startDate, endDate);

    // Get completed orders within date range
    const orders = await orderRepository.find({
      where: {
        status: In([OrderStatus.SERVED, OrderStatus.CLOSED]),
        placedAt: Between(start, end)
      },
      order: {
        placedAt: 'ASC'
      }
    });

    // Calculate revenue metrics
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const totalTax = orders.reduce((sum, order) => sum + order.taxAmount, 0);
    const totalTips = orders.reduce((sum, order) => sum + order.tipAmount, 0);

    // Daily revenue breakdown
    const dailyRevenue = new Map<string, number>();
    orders.forEach(order => {
      const dateKey = order.placedAt!.toISOString().split('T')[0];
      dailyRevenue.set(dateKey, (dailyRevenue.get(dateKey) || 0) + order.totalAmount);
    });

    let comparisonData = null;
    if (includeComparison) {
      const { start: prevStart, end: prevEnd } = getPreviousPeriodRange(start, end);
      const previousOrders = await orderRepository.find({
        where: {
          status: In([OrderStatus.SERVED, OrderStatus.CLOSED]),
          placedAt: Between(prevStart, prevEnd)
        }
      });

      const prevTotalRevenue = previousOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const prevTotalOrders = previousOrders.length;
      const prevAverageOrderValue = prevTotalOrders > 0 ? prevTotalRevenue / prevTotalOrders : 0;

      comparisonData = {
        previous: {
          period: { start: prevStart, end: prevEnd },
          totalRevenue: Number(prevTotalRevenue.toFixed(2)),
          totalOrders: prevTotalOrders,
          averageOrderValue: Number(prevAverageOrderValue.toFixed(2))
        },
        growth: {
          revenue: prevTotalRevenue > 0 ? Number(((totalRevenue - prevTotalRevenue) / prevTotalRevenue * 100).toFixed(2)) : 0,
          orders: prevTotalOrders > 0 ? Number(((totalOrders - prevTotalOrders) / prevTotalOrders * 100).toFixed(2)) : 0,
          averageOrderValue: prevAverageOrderValue > 0 ? Number(((averageOrderValue - prevAverageOrderValue) / prevAverageOrderValue * 100).toFixed(2)) : 0
        }
      };
    }

    const response = {
      message: 'Revenue analytics retrieved successfully',
      metadata: {
        period: period || 'month',
        dateRange: { start, end },
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalOrders,
        averageOrderValue: Number(averageOrderValue.toFixed(2)),
        totalTax: Number(totalTax.toFixed(2)),
        totalTips: Number(totalTips.toFixed(2))
      },
      data: isAggregated ? {
        summary: {
          peakDay: getPeakRevenueDay(dailyRevenue),
          averageDailyRevenue: dailyRevenue.size > 0 ? Number((totalRevenue / dailyRevenue.size).toFixed(2)) : 0
        },
        dailyBreakdown: Array.from(dailyRevenue.entries()).map(([date, revenue]) => ({
          date,
          revenue: Number(revenue.toFixed(2))
        }))
      } : {
        orders: orders.map(order => ({
          id: order.id,
          date: order.placedAt,
          totalAmount: order.totalAmount,
          taxAmount: order.taxAmount,
          tipAmount: order.tipAmount,
          tableNumber: order.tableNumber
        })),
        dailyTotals: Array.from(dailyRevenue.entries()).map(([date, revenue]) => ({
          date,
          revenue: Number(revenue.toFixed(2))
        }))
      },
      comparison: comparisonData
    };

    return res.status(200).json(response);

  } catch (err) {
    const error = err as Error;
    console.error('Revenue analytics error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve revenue analytics',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const getSystemUsage = async (req: AnalyticsRequest, res: Response) => {
  try {
    const { period, startDate, endDate, aggregated } = req.query;
    const isAggregated = aggregated === 'true';
    
    const { start, end } = getDateRange(period, startDate, endDate);

    // Get user statistics
    const totalUsers = await userRepository.count();
    const activeStaff = await userRepository
      .createQueryBuilder('user')
      .where('user.roles && :roles', { roles: ['staff', 'manager'] })
      .andWhere('user.staffStatus = :status', { status: StaffStatus.ACTIVE })
      .getCount();

    const customers = await userRepository
      .createQueryBuilder('user')
      .where('user.roles && :roles', { roles: ['customer'] })
      .getCount();

    // Get order activity within period
    const orders = await orderRepository.find({
      where: {
        createdAt: Between(start, end)
      }
    });

    const completedOrders = orders.filter(order => 
      order.status === OrderStatus.SERVED || order.status === OrderStatus.CLOSED
    );

    // Get user engagement metrics
    const uniqueCustomers = new Set(orders.map(order => order.customerId).filter(Boolean));
    const averageOrdersPerCustomer = uniqueCustomers.size > 0 ? orders.length / uniqueCustomers.size : 0;

    // Calculate daily activity
    const dailyActivity = new Map<string, {
      date: string;
      newOrders: number;
      completedOrders: number;
      activeUsers: Set<number>;
    }>();

    orders.forEach(order => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      if (!dailyActivity.has(dateKey)) {
        dailyActivity.set(dateKey, {
          date: dateKey,
          newOrders: 0,
          completedOrders: 0,
          activeUsers: new Set()
        });
      }
      
      const dayData = dailyActivity.get(dateKey)!;
      dayData.newOrders++;
      
      if (order.status === OrderStatus.SERVED || order.status === OrderStatus.CLOSED) {
        dayData.completedOrders++;
      }
      
      if (order.customerId) {
        dayData.activeUsers.add(order.customerId);
      }
    });

    const systemMetrics = {
      totalUsers,
      activeStaff,
      customers,
      ordersInPeriod: orders.length,
      completedOrdersInPeriod: completedOrders.length,
      uniqueActiveCustomers: uniqueCustomers.size,
      averageOrdersPerCustomer: Number(averageOrdersPerCustomer.toFixed(2)),
      orderCompletionRate: orders.length > 0 ? Number((completedOrders.length / orders.length * 100).toFixed(2)) : 0
    };

    const response = {
      message: 'System usage analytics retrieved successfully',
      metadata: {
        period: period || 'month',
        dateRange: { start, end },
        ...systemMetrics
      },
      data: isAggregated ? {
        summary: {
          peakActivityDay: getPeakActivityDay(dailyActivity),
          averageDailyOrders: dailyActivity.size > 0 ? Number((orders.length / dailyActivity.size).toFixed(2)) : 0,
          customerRetentionIndicator: averageOrdersPerCustomer > 1 ? 'Good' : 'Needs Improvement'
        },
        trends: Array.from(dailyActivity.entries()).map(([date, data]) => ({
          date,
          newOrders: data.newOrders,
          completedOrders: data.completedOrders,
          activeUsers: data.activeUsers.size
        }))
      } : {
        dailyActivity: Array.from(dailyActivity.entries()).map(([date, data]) => ({
          date,
          newOrders: data.newOrders,
          completedOrders: data.completedOrders,
          activeUsers: data.activeUsers.size
        })),
        userBreakdown: {
          totalUsers,
          activeStaff,
          customers,
          inactiveStaff: await userRepository
            .createQueryBuilder('user')
            .where('user.roles && :roles', { roles: ['staff', 'manager'] })
            .andWhere('user.staffStatus IN (:...statuses)', { statuses: [StaffStatus.INACTIVE, StaffStatus.UNAVAILABLE] })
            .getCount()
        }
      }
    };

    return res.status(200).json(response);

  } catch (err) {
    const error = err as Error;
    console.error('System usage analytics error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve system usage analytics',
      message: error.message || 'An unknown error occurred'
    });
  }
};

// Helper functions
const getMenuCategoryBreakdown = (performanceData: any[]) => {
  const categoryMap = new Map<string, { revenue: number; quantity: number; items: number }>();
  
  performanceData.forEach(item => {
    const existing = categoryMap.get(item.category);
    if (existing) {
      existing.revenue += item.revenue;
      existing.quantity += item.quantitySold;
      existing.items += 1;
    } else {
      categoryMap.set(item.category, {
        revenue: item.revenue,
        quantity: item.quantitySold,
        items: 1
      });
    }
  });

  return Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    ...data,
    revenue: Number(data.revenue.toFixed(2))
  }));
};

const getStaffDepartmentBreakdown = (staffMetrics: any[]) => {
  const deptMap = new Map<string, { staff: number; totalHours: number; avgAttendance: number }>();
  
  staffMetrics.forEach(staff => {
    const dept = staff.roles.length > 0 ? staff.roles[0] : 'General';
    const existing = deptMap.get(dept);
    
    if (existing) {
      existing.staff += 1;
      existing.totalHours += staff.totalHours;
      existing.avgAttendance = (existing.avgAttendance + staff.attendanceRate) / 2;
    } else {
      deptMap.set(dept, {
        staff: 1,
        totalHours: staff.totalHours,
        avgAttendance: staff.attendanceRate
      });
    }
  });

  return Array.from(deptMap.entries()).map(([department, data]) => ({
    department,
    staffCount: data.staff,
    totalHours: Number(data.totalHours.toFixed(2)),
    averageAttendance: Number(data.avgAttendance.toFixed(2))
  }));
};

const getPeakRevenueDay = (dailyRevenue: Map<string, number>) => {
  let peakDay = { date: '', revenue: 0 };
  
  for (const [date, revenue] of dailyRevenue.entries()) {
    if (revenue > peakDay.revenue) {
      peakDay = { date, revenue };
    }
  }
  
  return peakDay.revenue > 0 ? peakDay : null;
};

const getPeakActivityDay = (dailyActivity: Map<string, any>) => {
  let peakDay = { date: '', orders: 0 };
  
  for (const [date, data] of dailyActivity.entries()) {
    if (data.newOrders > peakDay.orders) {
      peakDay = { date, orders: data.newOrders };
    }
  }
  
  return peakDay.orders > 0 ? peakDay : null;
};