import { useState, useEffect, useRef } from 'react';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Button } from '@heroui/button';
import { Select, SelectItem } from '@heroui/select';
import { Divider } from '@heroui/divider';
import { addToast } from '@heroui/toast';
import DefaultLayout from '../layouts/default';
import { analyticsAPI, type MenuPerformanceResponse, type StaffUtilizationResponse, type RevenueAnalyticsResponse, type SystemUsageResponse } from '../services/api';
import { title } from '@/components/primitives';

// Time period options
const TIME_PERIODS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'Last 7 days' },
  { value: 'month', label: 'Last 30 days' },
  { value: 'this_month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
];

interface AnalyticsData {
  menuPerformance: MenuPerformanceResponse | null;
  staffUtilization: StaffUtilizationResponse | null;
  revenueAnalytics: RevenueAnalyticsResponse | null;
  systemUsage: SystemUsageResponse | null;
}

const ManagerAnalytics: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('overview');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('month'); // Default: Last 30 days
  const [data, setData] = useState<AnalyticsData>({
    menuPerformance: null,
    staffUtilization: null,
    revenueAnalytics: null,
    systemUsage: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch all analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [menuData, staffData, revenueData, systemData] = await Promise.all([
        analyticsAPI.getMenuPerformance({ period: selectedPeriod, aggregated: true }),
        analyticsAPI.getStaffUtilization({ period: selectedPeriod, aggregated: true }),
        analyticsAPI.getRevenueAnalytics({ period: selectedPeriod, aggregated: true, compareWithPrevious: true }),
        analyticsAPI.getSystemUsage({ period: selectedPeriod, aggregated: true }),
      ]);

      setData({
        menuPerformance: menuData,
        staffUtilization: staffData,
        revenueAnalytics: revenueData,
        systemUsage: systemData,
      });
    } catch (err: any) {
      console.error('Error fetching analytics data:', err);
      const errorMessage = err.response?.data?.message || 'Failed to load analytics data';
      setError(errorMessage);
      addToast({
        title: 'Error',
        description: errorMessage,
        color: 'danger'
      });
    } finally {
      setLoading(false);
    }
  };

  // Setup auto-refresh (every hour)
  useEffect(() => {
    fetchAnalyticsData();

    // Set up auto-refresh every hour (3600000 ms)
    intervalRef.current = setInterval(fetchAnalyticsData, 3600000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [selectedPeriod]);

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      <div className="h-4 bg-gray-700 rounded mb-2"></div>
      <div className="h-32 bg-gray-700 rounded mb-4"></div>
      <div className="h-4 bg-gray-700 rounded w-3/4"></div>
    </div>
  );

  // Metric card component
  const MetricCard = ({ title, value, subtitle, color = 'primary' }: {
    title: string;
    value: string | number;
    subtitle?: string;
    color?: 'primary' | 'success' | 'warning' | 'danger';
  }) => (
    <Card className="bg-gray-800 border-gray-700">
      <CardBody className="p-4">
        <div className="flex flex-col">
          <span className="text-gray-400 text-sm">{title}</span>
          <span className={`text-2xl font-bold ${
            color === 'success' ? 'text-green-400' :
            color === 'warning' ? 'text-yellow-400' :
            color === 'danger' ? 'text-red-400' :
            'text-blue-400'
          }`}>
            {value}
          </span>
          {subtitle && <span className="text-gray-500 text-xs mt-1">{subtitle}</span>}
        </div>
      </CardBody>
    </Card>
  );

  // Overview tab content
  const OverviewTab = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="bg-gray-800 border-gray-700">
              <CardBody className="p-4">
                <LoadingSkeleton />
              </CardBody>
            </Card>
          ))}
        </div>
      );
    }

    const { menuPerformance, staffUtilization, revenueAnalytics } = data;

    return (
      <div className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Revenue"
            value={`$${revenueAnalytics?.metadata.totalRevenue?.toFixed(2) || '0.00'}`}
            subtitle={`${revenueAnalytics?.metadata.totalOrders || 0} orders`}
            color="success"
          />
          <MetricCard
            title="Average Order Value"
            value={`$${revenueAnalytics?.metadata.averageOrderValue?.toFixed(2) || '0.00'}`}
            color="primary"
          />
          <MetricCard
            title="Menu Items Sold"
            value={menuPerformance?.metadata.totalItemsSold || 0}
            subtitle={`${menuPerformance?.metadata.totalMenuItems || 0} different items`}
            color="warning"
          />
          <MetricCard
            title="Staff Attendance"
            value={`${staffUtilization?.metadata.overallAttendanceRate?.toFixed(1) || '0.0'}%`}
            subtitle={`${staffUtilization?.metadata.totalStaff || 0} staff members`}
            color="primary"
          />
        </div>

        {/* Growth Comparison */}
        {revenueAnalytics?.comparison && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <h3 className="text-white text-lg font-semibold">Growth vs Previous Period</h3>
            </CardHeader>
            <Divider className="bg-gray-700" />
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                  title="Revenue Growth"
                  value={`${revenueAnalytics.comparison.growth.revenue >= 0 ? '+' : ''}${revenueAnalytics.comparison.growth.revenue.toFixed(1)}%`}
                  color={revenueAnalytics.comparison.growth.revenue >= 0 ? 'success' : 'danger'}
                />
                <MetricCard
                  title="Order Growth"
                  value={`${revenueAnalytics.comparison.growth.orders >= 0 ? '+' : ''}${revenueAnalytics.comparison.growth.orders.toFixed(1)}%`}
                  color={revenueAnalytics.comparison.growth.orders >= 0 ? 'success' : 'danger'}
                />
                <MetricCard
                  title="AOV Growth"
                  value={`${revenueAnalytics.comparison.growth.averageOrderValue >= 0 ? '+' : ''}${revenueAnalytics.comparison.growth.averageOrderValue.toFixed(1)}%`}
                  color={revenueAnalytics.comparison.growth.averageOrderValue >= 0 ? 'success' : 'danger'}
                />
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    );
  };

  // Revenue tab content
  const RevenueTab = () => {
    if (loading) {
      return <div className="space-y-4">{[...Array(2)].map((_, i) => (
        <Card key={i} className="bg-gray-800 border-gray-700">
          <CardBody className="p-6">
            <LoadingSkeleton />
          </CardBody>
        </Card>
      ))}</div>;
    }

    const { revenueAnalytics } = data;
    
    if (!revenueAnalytics || !Array.isArray(revenueAnalytics.data.dailyBreakdown)) {
      return <div className="text-gray-400">No revenue data available</div>;
    }

    // Revenue data prepared for display

    return (
      <div className="space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <h3 className="text-white text-lg font-semibold">Revenue Trend</h3>
          </CardHeader>
          <Divider className="bg-gray-700" />
          <CardBody>
            <div className="space-y-2">
              {revenueAnalytics.data.dailyBreakdown.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                  <span className="text-gray-300">
                    {new Date(item.date).toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                  <span className="text-green-400 font-semibold">
                    ${item.revenue.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  // Menu tab content
  const MenuTab = () => {
    if (loading) {
      return <LoadingSkeleton />;
    }

    const { menuPerformance } = data;
    
    if (!menuPerformance || !menuPerformance.data || typeof menuPerformance.data !== 'object' || !('topSellingItems' in menuPerformance.data)) {
      return <div className="text-gray-400">No menu performance data available</div>;
    }

    const topItems = (menuPerformance.data as any).topSellingItems || [];

    return (
      <div className="space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <h3 className="text-white text-lg font-semibold">Top Selling Items</h3>
          </CardHeader>
          <Divider className="bg-gray-700" />
          <CardBody>
            <div className="space-y-2">
              {topItems.slice(0, 10).map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                  <div>
                    <span className="text-white font-medium">{item.name}</span>
                    <span className="text-gray-400 text-sm ml-2">({item.category})</span>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-semibold">{item.quantitySold} sold</div>
                    <div className="text-gray-400 text-sm">${item.revenue.toFixed(2)} revenue</div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  // Staff tab content
  const StaffTab = () => {
    if (loading) {
      return <LoadingSkeleton />;
    }

    const { staffUtilization } = data;
    
    if (!staffUtilization || !Array.isArray(staffUtilization.data)) {
      return <div className="text-gray-400">No staff utilization data available</div>;
    }

    const staffData = staffUtilization.data as any[];

    return (
      <div className="space-y-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <h3 className="text-white text-lg font-semibold">Staff Performance</h3>
          </CardHeader>
          <Divider className="bg-gray-700" />
          <CardBody>
            <div className="space-y-2">
              {staffData.map((staff: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-700 rounded">
                  <div>
                    <span className="text-white font-medium">{staff.name}</span>
                    <span className="text-gray-400 text-sm ml-2">
                      ({staff.roles.join(', ')})
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-400 font-semibold">
                      {staff.totalHours}h worked
                    </div>
                    <div className="text-green-400 text-sm">
                      {staff.attendanceRate.toFixed(1)}% attendance
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 className={title({ size: 'lg', class: 'text-white mb-2' })}>Analytics Dashboard</h1>
            <p className="text-gray-300">Monitor your restaurant's performance and insights</p>
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Select
              label="Time Period"
              placeholder="Select period"
              selectedKeys={new Set([selectedPeriod])}
              onSelectionChange={(keys) => setSelectedPeriod(Array.from(keys)[0] as string)}
              className="w-48"
              classNames={{
                trigger: "bg-gray-800 border-gray-700 text-white",
                listbox: "bg-gray-800",
                popoverContent: "bg-gray-800 border-gray-700",
              }}
            >
              {TIME_PERIODS.map((period) => (
                <SelectItem key={period.value}>
                  {period.label}
                </SelectItem>
              ))}
            </Select>
            
            <Button
              color="primary"
              onPress={fetchAnalyticsData}
              isLoading={loading}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card className="bg-red-900/20 border-red-500/50 mb-6">
            <CardBody>
              <p className="text-red-400">{error}</p>
            </CardBody>
          </Card>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-gray-800 p-1 rounded-lg">
          {[
            { key: 'overview', label: 'Overview' },
            { key: 'revenue', label: 'Revenue' },
            { key: 'menu', label: 'Menu' },
            { key: 'staff', label: 'Staff' }
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={selectedTab === tab.key ? 'solid' : 'ghost'}
              color={selectedTab === tab.key ? 'primary' : 'default'}
              onPress={() => setSelectedTab(tab.key)}
              className="flex-1"
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {selectedTab === 'overview' && <OverviewTab />}
          {selectedTab === 'revenue' && <RevenueTab />}
          {selectedTab === 'menu' && <MenuTab />}
          {selectedTab === 'staff' && <StaffTab />}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default ManagerAnalytics;