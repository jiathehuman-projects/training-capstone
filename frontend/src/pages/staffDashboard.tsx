import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { useAuth } from "@/contexts/AuthContext";
import { orderAPI, type Order } from "@/services/api";

type OrderStatus = 'placed' | 'in_kitchen' | 'ready' | 'served';

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'placed':
      return '🍽️';
    case 'in_kitchen':
      return '👨‍🍳';
    case 'ready':
      return '✅';
    case 'served':
      return '🍴';
    default:
      return 'ℹ️';
  }
};

const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'placed':
      return 'bg-blue-100 text-blue-800';
    case 'in_kitchen':
      return 'bg-yellow-100 text-yellow-800';
    case 'ready':
      return 'bg-green-100 text-green-800';
    case 'served':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getNextStatus = (currentStatus: string): OrderStatus | null => {
  switch (currentStatus.toLowerCase()) {
    case 'placed':
      return 'in_kitchen';
    case 'in_kitchen':
      return 'ready';
    case 'ready':
      return 'served';
    default:
      return null;
  }
};

const getStatusDisplayName = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'placed':
      return 'Placed';
    case 'in_kitchen':
      return 'In Kitchen';
    case 'ready':
      return 'Ready';
    case 'served':
      return 'Served';
    default:
      return status;
  }
};

export default function StaffDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

  // Load staff orders on component mount and set up polling
  useEffect(() => {
    if (user) {
      loadStaffOrders();
      const interval = setInterval(loadStaffOrders, 10000); // Poll every 10 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  // Filter orders when status filter changes
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(order => order.status.toLowerCase() === statusFilter));
    }
  }, [orders, statusFilter]);

  const loadStaffOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const staffOrders = await orderAPI.getStaffOrders();
      setOrders(staffOrders);
    } catch (error: any) {
      console.error("Failed to load staff orders:", error);
      setError(error.response?.data?.error || "Failed to load orders");
      
      addToast({
        title: "Error",
        description: "Failed to load orders",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId: number, newStatus: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await orderAPI.updateOrderStatus(orderId, newStatus);
      
      addToast({
        title: "Success",
        description: `Order status updated to ${getStatusDisplayName(newStatus)}`,
        color: "success",
      });
      
      // Refresh orders after successful update
      await loadStaffOrders();
    } catch (error: any) {
      console.error("Failed to update order status:", error);
      setError(error.response?.data?.error || "Failed to update order status");
      
      addToast({
        title: "Error",
        description: "Failed to update order status",
        color: "danger",
      });
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedOrder(null);
  };

  const formatDateTime = (date: string | Date | null): string => {
    if (!date) return 'Not set';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleString();
  };

  // Check if user is staff (has roles but not manager or admin)
  const isStaffUser = user?.roles && 
    user.roles.length > 0 && 
    !user.roles.includes('manager') && 
    !user.roles.includes('admin');

  if (!isStaffUser) {
    return (
      <DefaultLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">Access denied. This dashboard is only available to staff members.</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={title()}>Staff Dashboard</h1>
            <p className="text-lg text-gray-600 mt-2">
              Manage restaurant orders and update their status
            </p>
          </div>
          <Button
            variant="solid"
            onClick={() => window.location.href = '/staff/shifts'}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            View Shifts
          </Button>
        </div>

        {/* Filter Controls */}
        <div className="bg-white border border-gray-300 rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="min-w-48">
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Orders</option>
                <option value="placed">Placed</option>
                <option value="in_kitchen">In Kitchen</option>
                <option value="ready">Ready</option>
                <option value="served">Served</option>
              </select>
            </div>
            <Button 
              variant="bordered"
              onClick={loadStaffOrders}
              disabled={isLoading}
              className="mt-6"
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
            <p className="text-gray-600 mt-6">
              {filteredOrders.length} orders found
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex justify-between items-center">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => setError(null)}
              className="text-red-700 hover:text-red-900"
            >
              ✕
            </button>
          </div>
        )}

        {/* Orders Grid */}
        {isLoading && orders.length === 0 ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border border-gray-300 rounded-xl shadow-lg p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No orders found</h3>
            <p className="text-gray-600">
              {statusFilter === 'all' 
                ? 'There are currently no active orders.' 
                : `There are no orders with status "${getStatusDisplayName(statusFilter)}".`
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredOrders.map((order) => {
              const nextStatus = getNextStatus(order.status);
              const isUpdating = updatingOrderId === order.id;

              return (
                <div key={order.id} className="bg-white border border-gray-300 rounded-xl shadow-lg h-full flex flex-col">
                  <div className="p-4 flex-grow">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Order #{order.id}
                      </h3>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)} {getStatusDisplayName(order.status)}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Table:</strong> {order.tableNumber}</p>
                      <p><strong>Total:</strong> {formatPrice(order.totalAmount)}</p>
                      <p><strong>Items:</strong> {order.items?.length || 0}</p>
                      <p><strong>Placed:</strong> {formatDateTime(order.placedAt)}</p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 flex gap-2">
                    <Button
                      size="sm"
                      variant="bordered"
                      onClick={() => handleViewDetails(order)}
                    >
                      View Details
                    </Button>
                    
                    {nextStatus && (
                      <Button
                        size="sm"
                        variant="solid"
                        disabled={isUpdating}
                        onClick={() => handleStatusUpdate(order.id, nextStatus)}
                        className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                      >
                        {isUpdating ? 'Updating...' : `${getStatusIcon(nextStatus)} Mark ${getStatusDisplayName(nextStatus)}`}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Order Details Modal */}
        {detailsOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={handleCloseDetails}></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-6 pb-2 border-b">
                <h3 className="text-lg font-semibold text-black">Order #{selectedOrder.id} Details</h3>
              </div>
              
              <div className="p-6 text-black">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)} {getStatusDisplayName(selectedOrder.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Table Number</p>
                    <p className="font-medium">{selectedOrder.tableNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Placed At</p>
                    <p className="font-medium">{formatDateTime(selectedOrder.placedAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                    <p className="text-xl font-semibold">{formatPrice(selectedOrder.totalAmount)}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-lg font-semibold mb-4">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.nameSnapshot}</p>
                          <p className="text-sm text-gray-600">
                            Quantity: {item.quantity} × {formatPrice(item.unitPrice)}
                          </p>
                          {item.percentOff > 0 && (
                            <p className="text-sm text-green-600">
                              Discount: {item.percentOff}% off
                            </p>
                          )}
                        </div>
                        <p className="font-semibold">{formatPrice(item.lineTotal)}</p>
                      </div>
                    )) || (
                      <p className="text-gray-600">No items found</p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Subtotal</p>
                      <p className="font-medium">{formatPrice(selectedOrder.subtotalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Tax</p>
                      <p className="font-medium">{formatPrice(selectedOrder.taxAmount)}</p>
                    </div>
                    {selectedOrder.serviceChargeAmount > 0 && (
                      <div>
                        <p className="text-gray-600">Service Charge</p>
                        <p className="font-medium">{formatPrice(selectedOrder.serviceChargeAmount)}</p>
                      </div>
                    )}
                    {selectedOrder.tipAmount > 0 && (
                      <div>
                        <p className="text-gray-600">Tip</p>
                        <p className="font-medium">{formatPrice(selectedOrder.tipAmount)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-6 pt-2 border-t flex justify-end gap-2">
                <Button onClick={handleCloseDetails}>Close</Button>
                {selectedOrder && getNextStatus(selectedOrder.status) && (
                  <Button
                    variant="solid"
                    disabled={updatingOrderId === selectedOrder.id}
                    onClick={() => {
                      const nextStatus = getNextStatus(selectedOrder.status);
                      if (nextStatus) {
                        handleStatusUpdate(selectedOrder.id, nextStatus);
                        handleCloseDetails();
                      }
                    }}
                    className="bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                  >
                    {updatingOrderId === selectedOrder.id 
                      ? 'Updating...' 
                      : `${getStatusIcon(getNextStatus(selectedOrder.status) || '')} Mark ${getStatusDisplayName(getNextStatus(selectedOrder.status) || '')}`
                    }
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DefaultLayout>
  );
}