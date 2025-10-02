import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getPrimaryRole } from '@/components/roleUtils';
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { title, subtitle } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { useAuth } from "@/contexts/AuthContext";
import { orderAPI, staffMenuAPI, tokenManager, authAPI, type MenuItem, type CartItem, type Order, type User } from "@/services/api";

// Simple components to replace HeroUI components
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white border border-gray-300 rounded-xl shadow-lg ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 pb-2 ${className}`}>
    {children}
  </div>
);

const CardBody = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-4 pt-2 ${className}`}>
    {children}
  </div>
);

const Chip = ({ 
  children, 
  color = "default", 
  size = "md",
  className = "" 
}: { 
  children: React.ReactNode; 
  color?: string; 
  size?: string;
  className?: string;
}) => {
  const colorClasses = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-blue-100 text-blue-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
  };
  
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
  };
  
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${colorClasses[color as keyof typeof colorClasses] || colorClasses.default} ${sizeClasses[size as keyof typeof sizeClasses] || sizeClasses.md} ${className}`}>
      {children}
    </span>
  );
};

const Modal = ({ 
  isOpen, 
  onClose, 
  children 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {children}
      </div>
    </div>
  );
};

const ModalContent = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);

const ModalHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 pb-2">
    <h3 className="text-lg font-semibold text-black">{children}</h3>
  </div>
);

const ModalBody = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 py-2 text-black">{children}</div>
);

const ModalFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 pt-2 flex justify-end gap-2">{children}</div>
);

type OrderStep = 'menu' | 'cart' | 'orders' | 'account';

// Group menu items by category
const groupByCategory = (items: MenuItem[]) => {
  return items.reduce((groups: Record<string, MenuItem[]>, item) => {
    const category = item.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(item);
    return groups;
  }, {});
};

// Calculate totals
const calculateTotals = (cart: CartItem[], menuItems: MenuItem[]) => {
  const subtotal = cart.reduce((sum, item) => {
    const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
    if (!menuItem) return sum;
    
    // Use price from API response
    let price = menuItem.price ?? 0;
    
    return sum + (price * item.quantity);
  }, 0);

  const taxRate = 0.0875; // 8.75% tax
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount;

  return { subtotal, taxAmount, total };
};

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState<OrderStep>('menu');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentOrders, setCurrentOrders] = useState<Order[]>([]);
  const [selectedTable, setSelectedTable] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  // Redirect non-customers away (staff -> /staff, manager/admin -> /manager)
  useEffect(() => {
    const primary = getPrimaryRole(user?.roles);
    if (primary && primary !== 'customer') {
      if (primary === 'staff') navigate('/staff', { replace: true });
      else navigate('/manager', { replace: true });
    }
  }, [user, navigate]);

  // Handle URL parameters for tab navigation
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['menu', 'cart', 'orders', 'account'].includes(tab)) {
      setCurrentStep(tab as OrderStep);
    }
  }, [searchParams]);

  // Update URL when step changes
  const handleStepChange = (step: OrderStep) => {
    setCurrentStep(step);
    setSearchParams({ tab: step });
  };

  // Load menu items on component mount
  useEffect(() => {
    loadMenuItems();
  }, []);

  // Load customer orders and set up polling
  useEffect(() => {
    if (user?.id) {
      loadCustomerOrders();
      const interval = setInterval(loadCustomerOrders, 10000); // Poll every 10 seconds
      return () => clearInterval(interval);
    }
  }, [user?.id]);

  const loadMenuItems = async () => {
    try {
      setIsLoading(true);
      const response = await staffMenuAPI.getPublicMenuItems();
      setMenuItems(response.menuItems);
    } catch (error) {
      console.error("Failed to load menu items:", error);
      addToast({
        title: "Error",
        description: "Failed to load menu items",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomerOrders = async () => {
    if (!user?.id) {
      console.log('🔍 DEBUG: loadCustomerOrders - No user ID found');
      return;
    }
    
    console.log('🔍 DEBUG: loadCustomerOrders - Starting to load orders for user:', user.id);
    
    try {
      setIsOrdersLoading(true);
      const orders = await orderAPI.getCustomerOrders(user.id);
      console.log('🔍 DEBUG: Customer orders response:', orders);
      
      // Ensure orders is an array before filtering
      const ordersArray = Array.isArray(orders) ? orders : [];
      
      // Only show active orders (not CLOSED or CANCELLED)
      const activeOrders = ordersArray.filter(order => 
        !['CLOSED', 'CANCELLED'].includes(order.status)
      );
      console.log('🔍 DEBUG: Active orders after filtering:', activeOrders);
      console.log('🔍 DEBUG: Order statuses found:', ordersArray.map(o => o.status));
      setCurrentOrders(activeOrders);
    } catch (error: any) {
      console.error("🔍 DEBUG: Failed to load customer orders:", error);
      console.error("🔍 DEBUG: Error details:", error.response?.data);
      console.error("🔍 DEBUG: Error status:", error.response?.status);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  const addToCart = (menuItemId: number, quantity: number = 1, customizations: string = '') => {
    const existingItem = cart.find(item => item.menuItemId === menuItemId && item.customizations === customizations);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.menuItemId === menuItemId && item.customizations === customizations
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { menuItemId, quantity, customizations }]);
    }

    addToast({
      title: "Added to Cart",
      description: "Item added successfully",
      color: "success",
    });
  };

  const updateCartQuantity = (menuItemId: number, customizations: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(menuItemId, customizations);
      return;
    }

    setCart(cart.map(item => 
      item.menuItemId === menuItemId && item.customizations === customizations
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (menuItemId: number, customizations: string) => {
    setCart(cart.filter(item => 
      !(item.menuItemId === menuItemId && item.customizations === customizations)
    ));
  };

  const clearCart = () => {
    setCart([]);
  };

  const proceedToCart = () => {
    if (cart.length === 0) {
      addToast({
        title: "Empty Cart",
        description: "Add items to your cart first",
        color: "warning",
      });
      return;
    }
    handleStepChange('cart');
  };

  const confirmOrder = async () => {
    console.log('🔍 Confirming order...');
    
    // Check if user is authenticated by checking for token instead of user object
    const token = tokenManager.getToken();
    if (!token) {
      console.log('❌ No authentication token found');
      addToast({
        title: "Authentication Required",
        description: "Please log in to place an order",
        color: "danger",
      });
      return;
    }
    
    console.log('✅ Token found, proceeding with order...');

    try {
      setIsLoading(true);
      
      // Validate cart is not empty
      if (!cart || cart.length === 0) {
        throw new Error('Cannot place order with empty cart');
      }
      
      // Validate cart items have valid menu data
      const validatedItems = cart.map(item => {
        const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
        if (!menuItem) {
          throw new Error(`Menu item with ID ${item.menuItemId} not found`);
        }
        if (!menuItem.isActive) {
          throw new Error(`Menu item "${menuItem.name}" is no longer available`);
        }
        
        // Validate quantity
        if (!item.quantity || item.quantity <= 0) {
          throw new Error(`Invalid quantity for item "${menuItem.name}"`);
        }
        
        console.log('✅ Validated menu item:', menuItem.name, 'quantity:', item.quantity);
        
        return {
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          ...(item.customizations && item.customizations.trim() !== '' 
            ? { customizations: item.customizations } 
            : {})
        };
      });

      // Validate table number
      if (!selectedTable || selectedTable <= 0) {
        throw new Error('Please select a valid table number');
      }

      // Create order data
      const orderData = {
        items: validatedItems,
        tableNumber: selectedTable,
      };
      
      console.log('📋 Order data being sent:', orderData);
      
      // Call the backend API to create the order
      const createdOrder = await orderAPI.createOrder(orderData);
      
      console.log('✅ Order created successfully:', createdOrder);
      
      // Validate the created order has required fields
      if (!createdOrder || !createdOrder.id || typeof createdOrder.totalAmount !== 'number') {
        throw new Error('Invalid order response from server');
      }
      
      // Set the confirmed order and show success modal
      setConfirmedOrder(createdOrder);
      setShowConfirmModal(true);
      
      // Show success toast
      addToast({
        title: "Order Placed Successfully!",
        description: `Order #${createdOrder.id} has been placed for table ${selectedTable}`,
        color: "success",
      });
      
      // Clear cart and navigate to orders view
      setCart([]);
      handleStepChange('orders');
      
      // Refresh customer orders to show the new order
      await loadCustomerOrders();

    } catch (error: any) {
      console.error('❌ Order creation failed:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      // Handle different types of errors
      let errorTitle = "Order Failed";
      let errorDescription = "Failed to place order. Please try again.";
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 400:
            // Bad request - validation errors
            errorTitle = "Invalid Order";
            if (data.details && Array.isArray(data.details)) {
              errorDescription = data.details.join(', ');
            } else {
              errorDescription = data.message || data.error || "Please check your order details";
            }
            break;
            
          case 401:
            // Unauthorized - token issues
            tokenManager.removeToken();
            errorTitle = "Authentication Required";
            errorDescription = "Please log in again to place your order";
            setTimeout(() => {
              window.location.href = '/login';
            }, 2000);
            break;
            
          case 404:
            // Not found - menu items or endpoint
            errorTitle = "Items Not Found";
            errorDescription = "Some menu items in your cart are no longer available";
            break;
            
          case 409:
            // Conflict - insufficient stock
            errorTitle = "Insufficient Stock";
            errorDescription = data.message || "Some items in your cart are out of stock";
            break;
            
          case 500:
            // Server error - check for JWT errors
            if (data?.includes?.('JsonWebTokenError') || 
                data?.includes?.('invalid signature')) {
              tokenManager.removeToken();
              errorTitle = "Session Expired";
              errorDescription = "Please log in again to place your order";
              setTimeout(() => {
                window.location.href = '/login';
              }, 2000);
            } else {
              errorTitle = "Server Error";
              errorDescription = "Server error occurred. Please try again later.";
            }
            break;
            
          default:
            errorDescription = data.message || data.error || `Server error (${status})`;
        }
      } else if (error.request) {
        // Network error
        errorTitle = "Network Error";
        errorDescription = "Unable to connect to server. Please check your connection.";
      } else {
        // Client-side error
        errorDescription = error.message || "An unexpected error occurred";
      }
      
      addToast({
        title: errorTitle,
        description: errorDescription,
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelOrder = async (orderId: number) => {
    try {
      await orderAPI.updateOrderStatus(orderId, 'CANCELLED');
      addToast({
        title: "Order Cancelled",
        description: "Your order has been cancelled",
        color: "success",
      });
      loadCustomerOrders();
    } catch (error) {
      addToast({
        title: "Error",
        description: "Failed to cancel order",
        color: "danger",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'default';
      case 'PLACED': return 'warning';
      case 'PENDING': return 'warning';
      case 'IN_KITCHEN': return 'primary';
      case 'READY': return 'success';
      case 'SERVED': return 'secondary';
      default: return 'default';
    }
  };

  const formatPrice = (price: number | undefined | null) => {
    if (price === undefined || price === null || isNaN(price)) {
      return '$0.00';
    }
    return `$${price.toFixed(2)}`;
  };

  const getEffectivePrice = (menuItem: MenuItem) => {
    // Use price from API response
    return menuItem.price;
  };

  const { subtotal, taxAmount, total } = calculateTotals(cart, menuItems);
  const groupedMenuItems = groupByCategory(menuItems);

  return (
    <DefaultLayout>
      <section className="flex flex-col gap-6 py-8 md:py-10 max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center">
          <h1 className={title()}>
            <span className="bg-gradient-to-r from-gray-400 to-white bg-clip-text text-transparent font-bold">
              Customer Dashboard
            </span>
          </h1>
          <div className={subtitle({ class: "mt-4 text-white" })}>
            Welcome back, {user?.firstName}! Place your order below.
          </div>
        </div>

        {/* Table Selection */}
        <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Table
              </label>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(parseInt(e.target.value))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((tableNum) => (
                  <option key={tableNum} value={tableNum}>
                    Table {tableNum}
                  </option>
                ))}
              </select>
            </div>

            {cart.length > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <Chip color="primary">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)} items
                </Chip>
                <Chip color="success">
                  {formatPrice(total)}
                </Chip>
                <Button color="primary" onPress={proceedToCart}>
                  View Cart
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Step Navigation */}
        <div className="flex justify-center">
          <div className="bg-white border border-gray-300 rounded-xl p-4 shadow-lg">
            <div className="flex gap-4">
              <Button
                color={currentStep === 'menu' ? 'primary' : 'default'}
                variant={currentStep === 'menu' ? 'solid' : 'flat'}
                onPress={() => handleStepChange('menu')}
              >
                Menu
              </Button>
              <Button
                color={currentStep === 'cart' ? 'primary' : 'default'}
                variant={currentStep === 'cart' ? 'solid' : 'flat'}
                onPress={() => cart.length > 0 && handleStepChange('cart')}
                isDisabled={cart.length === 0}
              >
                Cart ({cart.reduce((sum, item) => sum + item.quantity, 0)})
              </Button>
              <Button
                color={currentStep === 'orders' ? 'primary' : 'default'}
                variant={currentStep === 'orders' ? 'solid' : 'flat'}
                onPress={() => handleStepChange('orders')}
              >
                Current Orders ({currentOrders.length})
              </Button>
              <Button
                color={currentStep === 'account' ? 'primary' : 'default'}
                variant={currentStep === 'account' ? 'solid' : 'flat'}
                onPress={() => handleStepChange('account')}
              >
                Account Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Content based on current step */}
        {currentStep === 'menu' && (
          <MenuStep
            groupedMenuItems={groupedMenuItems}
            isLoading={isLoading}
            onAddToCart={addToCart}
            formatPrice={formatPrice}
            getEffectivePrice={getEffectivePrice}
            cart={cart}
            onUpdateQuantity={updateCartQuantity}
            onRemoveItem={removeFromCart}
          />
        )}

        {currentStep === 'cart' && (
          <CartStep
            cart={cart}
            menuItems={menuItems}
            selectedTable={selectedTable}
            subtotal={subtotal}
            taxAmount={taxAmount}
            total={total}
            formatPrice={formatPrice}
            getEffectivePrice={getEffectivePrice}
            onUpdateQuantity={updateCartQuantity}
            onRemoveItem={removeFromCart}
            onClearCart={clearCart}
            onBackToMenu={() => handleStepChange('menu')}
            onConfirmOrder={confirmOrder}
            isLoading={isLoading}
          />
        )}

        {currentStep === 'orders' && (
          <CurrentOrdersSection
            orders={currentOrders}
            isLoading={isOrdersLoading}
            formatPrice={formatPrice}
            getStatusColor={getStatusColor}
            onCancelOrder={cancelOrder}
            menuItems={menuItems}
          />
        )}

        {currentStep === 'account' && (
          <AccountSettingsSection user={user} />
        )}

        {/* Order Confirmation Success Modal */}
        <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
          <ModalContent>
            <ModalHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">✓</span>
                </div>
                <span className="text-green-600">Order Placed Successfully!</span>
              </div>
            </ModalHeader>
            <ModalBody>
              {confirmedOrder && (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Order Number</p>
                        <p className="font-bold text-lg text-green-700">#{confirmedOrder.id}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Table</p>
                        <p className="font-bold text-lg">#{confirmedOrder.tableNumber}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total Amount</p>
                        <p className="font-bold text-lg text-green-600">
                          {formatPrice(confirmedOrder.totalAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Status</p>
                        <p className="font-semibold">
                          <Chip color="warning" size="sm">{confirmedOrder.status}</Chip>
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-2">
                    <p className="text-gray-700 font-medium">
                      🍳 Your order has been sent to the kitchen!
                    </p>
                    <p className="text-sm text-gray-600">
                      You can track the progress of your order in the <strong>"Current Orders"</strong> section below.
                    </p>
                    <p className="text-xs text-gray-500">
                      Estimated preparation time will be displayed once the kitchen starts preparing your order.
                    </p>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button 
                color="primary" 
                onPress={() => setShowConfirmModal(false)}
                className="w-full"
              >
                Continue Ordering
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </section>
    </DefaultLayout>
  );
}

// Menu Step Component
function MenuStep({ groupedMenuItems, isLoading, onAddToCart, formatPrice, getEffectivePrice, cart, onUpdateQuantity, onRemoveItem }: any) {
  const [customizations, setCustomizations] = useState<Record<number, string>>({});

  // Get current quantity for an item in cart
  const getItemQuantityInCart = (menuItemId: number, customization: string = '') => {
    const cartItem = cart.find((item: CartItem) => item.menuItemId === menuItemId && item.customizations === customization);
    return cartItem ? cartItem.quantity : 0;
  };

  // Handle increasing quantity
  const handleIncreaseQuantity = (menuItem: MenuItem) => {
    const customization = customizations[menuItem.id] || '';
    const currentQuantity = getItemQuantityInCart(menuItem.id, customization);
    
    if (currentQuantity === 0) {
      // Add new item to cart with quantity 1
      onAddToCart(menuItem.id, 1, customization);
    } else {
      // Increase existing item quantity
      onUpdateQuantity(menuItem.id, customization, currentQuantity + 1);
    }
  };

  // Handle decreasing quantity
  const handleDecreaseQuantity = (menuItem: MenuItem) => {
    const customization = customizations[menuItem.id] || '';
    const currentQuantity = getItemQuantityInCart(menuItem.id, customization);
    
    if (currentQuantity <= 1) {
      // Remove item from cart
      onRemoveItem(menuItem.id, customization);
    } else {
      // Decrease quantity
      onUpdateQuantity(menuItem.id, customization, currentQuantity - 1);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-lg">
        <p className="text-center text-black">Loading menu...</p>
      </div>
    );
  }

  if (Object.keys(groupedMenuItems).length === 0) {
    return (
      <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-lg">
        <p className="text-center text-black">No menu items available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedMenuItems).map(([category, items]) => (
        <div key={category} className="bg-white border border-gray-300 rounded-xl p-6 shadow-lg">
          <h2 className="text-2xl font-bold text-black mb-4 capitalize">{category}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(items as MenuItem[]).map((item) => {
              const effectivePrice = getEffectivePrice(item);
              const isOnSale = effectivePrice < item.price;
              const isOutOfStock = !item.isActive;
              
              return (
                <Card key={item.id} className={`${isOutOfStock ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-2">
                    <div className="w-32 h-32 bg-gray-200 rounded-lg mb-2 flex items-center justify-center overflow-hidden mx-auto">
                      {item.photoUrl ? (
                        <img 
                          src={item.photoUrl} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-400">No Image</span>
                      )}
                    </div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-black">{item.name}</h3>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          {isOnSale && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(item.price)}
                            </span>
                          )}
                          <span className={`font-bold ${isOnSale ? 'text-red-600' : 'text-black'}`}>
                            {formatPrice(effectivePrice)}
                          </span>
                        </div>
                        {isOnSale && (
                          <Chip size="sm" color="danger">
                            {item.promoPercent}% OFF
                          </Chip>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="pt-0">
                    {item.description && (
                      <p className="text-gray-600 text-sm mb-3">{item.description}</p>
                    )}

                    {isOutOfStock ? (
                      <Chip color="danger" className="w-full">
                        Out of Stock
                      </Chip>
                    ) : (
                      <div className="space-y-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Special Instructions (optional)
                          </label>
                          <textarea
                            rows={2}
                            value={customizations[item.id] || ''}
                            onChange={(e) => setCustomizations(prev => ({ 
                              ...prev, 
                              [item.id]: e.target.value 
                            }))}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                          />
                        </div>
                        <div className="flex items-center justify-center space-x-3">
                          <Button
                            color="danger"
                            variant="bordered"
                            size="sm"
                            onPress={() => handleDecreaseQuantity(item)}
                            isDisabled={getItemQuantityInCart(item.id, customizations[item.id] || '') === 0}
                            className="min-w-unit-10 px-2 text-xl"
                          >
                            -
                          </Button>
                          <span className="text-lg font-semibold min-w-unit-8 text-center">
                            {getItemQuantityInCart(item.id, customizations[item.id] || '')}
                          </span>
                          <Button
                            color="primary"
                            variant="bordered"
                            size="sm"
                            onPress={() => handleIncreaseQuantity(item)}
                            className="min-w-unit-10 px-2 text-xl"
                          >
                            +
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Cart Step Component
function CartStep({ 
  cart, menuItems, selectedTable, subtotal, taxAmount, total, formatPrice, getEffectivePrice,
  onUpdateQuantity, onRemoveItem, onClearCart, onBackToMenu, onConfirmOrder, isLoading 
}: any) {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  
  const handleConfirmClick = () => {
    setShowConfirmModal(true);
  };
  
  const handleFinalConfirm = () => {
    setShowConfirmModal(false);
    onConfirmOrder();
  };

  if (cart.length === 0) {
    return (
      <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-lg text-center">
        <p className="text-black mb-4">Your cart is empty</p>
        <Button color="primary" onPress={onBackToMenu}>
          Browse Menu
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Your Cart</h2>
        <Button color="danger" variant="light" onPress={onClearCart}>
          Clear Cart
        </Button>
      </div>

      <div className="space-y-4 mb-6">
        {cart.map((item: CartItem, index: number) => {
          const menuItem = menuItems.find((mi: MenuItem) => mi.id === item.menuItemId);
          if (!menuItem) return null;

          const effectivePrice = getEffectivePrice(menuItem);
          const itemTotal = effectivePrice * item.quantity;

          return (
            <div key={`${item.menuItemId}-${item.customizations}-${index}`} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                {menuItem.photoUrl ? (
                  <img 
                    src={menuItem.photoUrl} 
                    alt={menuItem.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">No Image</span>
                )}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-black">{menuItem.name}</h3>
                <p className="text-gray-600 text-sm">{formatPrice(effectivePrice)} each</p>
                {item.customizations && (
                  <p className="text-gray-500 text-xs mt-1">Note: {item.customizations}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="flat"
                  onPress={() => onUpdateQuantity(item.menuItemId, item.customizations || '', item.quantity - 1)}
                >
                  -
                </Button>
                <span className="mx-2 min-w-8 text-center text-black">{item.quantity}</span>
                <Button
                  size="sm"
                  variant="flat"
                  onPress={() => onUpdateQuantity(item.menuItemId, item.customizations || '', item.quantity + 1)}
                >
                  +
                </Button>
              </div>

              <div className="text-right">
                <p className="font-semibold text-black">{formatPrice(itemTotal)}</p>
                <Button
                  size="sm"
                  color="danger"
                  variant="light"
                  onPress={() => onRemoveItem(item.menuItemId, item.customizations || '')}
                >
                  Remove
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Summary */}
      <div className="border-t border-gray-200 pt-4 space-y-2">
        <div className="flex justify-between text-black">
          <span>Subtotal:</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-black">
          <span>Tax (8.75%):</span>
          <span>{formatPrice(taxAmount)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg text-black border-t border-gray-200 pt-2">
          <span>Total:</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <Button variant="flat" onPress={onBackToMenu} className="flex-1" disabled={isLoading}>
          Back to Menu
        </Button>
        <Button color="primary" onPress={handleConfirmClick} className="flex-1" disabled={isLoading}>
          Place Order
        </Button>
      </div>
      
      {/* Confirmation Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
        <ModalContent>
          <ModalHeader>
            Confirm Order Placement
          </ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-gray-700">
                Are you sure you want to place this order for <strong>Table #{selectedTable}</strong>?
              </p>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Items:</span>
                  <span className="font-medium">{cart.reduce((sum: number, item: any) => sum + item.quantity, 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-bold text-green-600">{formatPrice(total)}</span>
                </div>
              </div>
              <p className="text-sm text-amber-600">
                ⚠️ Once confirmed, your order will be sent to the kitchen immediately.
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button 
              variant="flat" 
              onPress={() => setShowConfirmModal(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              color="primary" 
              onPress={handleFinalConfirm}
              isLoading={isLoading}
            >
              {isLoading ? 'Placing Order...' : 'Confirm & Place Order'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

// Current Orders Section Component
function CurrentOrdersSection({ orders, isLoading, formatPrice, getStatusColor, onCancelOrder, menuItems }: any) {
  // Helper function to find menu item by ID
  const findMenuItemById = (menuItemId: number) => {
    return menuItems.find((item: MenuItem) => item.id === menuItemId);
  };

  // Helper function to get item display name
  const getItemDisplayName = (item: any) => {
    const menuItem = findMenuItemById(item.menuItemId);
    const itemName = menuItem?.name || `Item #${item.menuItemId}`;
    return `${itemName} x${item.quantity}`;
  };

  // Split orders into active and completed
  const activeOrders = orders.filter((order: Order) => 
    ['PLACED', 'READY', 'PENDING', 'IN_KITCHEN'].includes(order.status.toUpperCase())
  ).sort((a: Order, b: Order) => new Date(b.placedAt || 0).getTime() - new Date(a.placedAt || 0).getTime());

  const completedOrders = orders.filter((order: Order) => 
    ['SERVED', 'CANCELLED', 'COMPLETED'].includes(order.status.toUpperCase())
  ).sort((a: Order, b: Order) => new Date(b.placedAt || 0).getTime() - new Date(a.placedAt || 0).getTime());

  const renderOrderCard = (order: Order, isCompleted: boolean = false) => (
    <Card key={order.id} className={isCompleted ? "opacity-75 bg-gray-50" : ""}>
      <CardBody>
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-black">Order #{order.id}</h3>
            <p className="text-gray-600 text-sm">Table {order.tableNumber}</p>
          </div>
          <div className="text-right">
            <Chip color={getStatusColor(order.status)}>
              {order.status.toLowerCase()}
            </Chip>
            <p className="text-black font-semibold mt-1">
              {formatPrice(order.totalAmount)}
            </p>
          </div>
        </div>
        
        <div className="space-y-1 mb-3">
          {order.items?.map((item: any, index: number) => (
            <div key={index} className="text-sm">
              <span className="text-gray-700">
                {getItemDisplayName(item)}
              </span>
            </div>
          ))}
        </div>

        {order.status === 'DRAFT' && (
          <Button
            size="sm"
            color="danger"
            variant="light"
            onPress={() => onCancelOrder(order.id)}
          >
            Cancel Order
          </Button>
        )}
      </CardBody>
    </Card>
  );

  return (
    <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-black mb-6">Current Orders</h2>
      
      {isLoading ? (
        <p className="text-black">Loading orders...</p>
      ) : (
        <div className="space-y-6">
          {/* Active Orders Section */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-3 flex items-center">
              <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Active Orders
            </h3>
            {activeOrders.length === 0 ? (
              <p className="text-gray-600 text-sm">No active orders</p>
            ) : (
              <div className="space-y-3">
                {activeOrders.map((order: Order) => renderOrderCard(order, false))}
              </div>
            )}
          </div>

          {/* Completed Orders Section */}
          <div>
            <h3 className="text-lg font-semibold text-black mb-3 flex items-center">
              <span className="w-3 h-3 bg-gray-400 rounded-full mr-2"></span>
              Completed Orders
            </h3>
            {completedOrders.length === 0 ? (
              <p className="text-gray-600 text-sm">No completed orders</p>
            ) : (
              <div className="space-y-3">
                {completedOrders.map((order: Order) => renderOrderCard(order, true))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Account Settings Section Component
function AccountSettingsSection({ user }: { user: User | null }) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { updateUser } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Prepare update data (only include changed fields)
      const updateData: any = {};
      if (formData.firstName !== user?.firstName) updateData.firstName = formData.firstName;
      if (formData.lastName !== user?.lastName) updateData.lastName = formData.lastName;
      if (formData.email !== user?.email) updateData.email = formData.email;
      if (formData.phone !== user?.phone) updateData.phone = formData.phone;
      if (formData.password.trim()) updateData.password = formData.password;

      if (Object.keys(updateData).length === 0) {
        addToast({
          title: "No Changes",
          description: "No changes to save",
          color: "warning",
        });
        return;
      }

      const response = await authAPI.updateProfile(updateData);
      
      // Update user context
      updateUser(response.user);
      
      // Clear password field
      setFormData(prev => ({ ...prev, password: '' }));
      
      addToast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully",
        color: "success",
      });
      
    } catch (error: any) {
      console.error('Profile update error:', error);
      addToast({
        title: "Update Failed",
        description: error.response?.data?.error || "Failed to update profile",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      password: ''
    });
  };

  return (
    <div className="bg-white border border-gray-300 rounded-xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-black mb-6">Account Settings</h2>
      
      <div className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-black mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone (optional)
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div>
          <h3 className="text-lg font-semibold text-black mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username (read-only)
              </label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password (optional)
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Leave blank to keep current password"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <Button
            color="primary"
            onPress={handleSave}
            isLoading={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            variant="flat"
            onPress={handleCancel}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}