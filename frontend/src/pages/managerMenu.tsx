import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { Select, SelectItem } from '@heroui/select';
import { Chip } from '@heroui/chip';
// import { Spinner } from '@heroui/system';
import { addToast } from '@heroui/toast';
import DefaultLayout from '@/layouts/default';
import { title } from '@/components/primitives';
import { useAuth } from '@/contexts/AuthContext';
import { getPrimaryRole } from '@/components/roleUtils';
import { 
  staffMenuAPI, 
  type MenuItem, 
  type CreateMenuItemRequest, 
  type UpdateMenuItemRequest,
  type MenuItemsResponse,
  type CategoriesResponse 
} from '@/services/api';

// Common allergens
const COMMON_ALLERGENS = [
  'Gluten',
  'Dairy',
  'Eggs',
  'Nuts',
  'Peanuts', 
  'Soy',
  'Fish',
  'Shellfish',
  'Sesame'
];

interface MenuItemFormData {
  name: string;
  category: string;
  price: string;
  description: string;
  preparationTimeMin: string;
  costOfGoods: string;
  allergens: string[];
  qtyOnHand: string;
  reorderThreshold: string;
  isActive: boolean;
  // Promotion fields
  promoPercent: string;
  promoStartsAt: string;
  promoEndsAt: string;
  // Image field
  image: File | null;
}

const initialFormData: MenuItemFormData = {
  name: '',
  category: '',
  price: '',
  description: '',
  preparationTimeMin: '',
  costOfGoods: '',
  allergens: [],
  qtyOnHand: '0',
  reorderThreshold: '10',
  isActive: true,
  // Promotion fields
  promoPercent: '',
  promoStartsAt: '',
  promoEndsAt: '',
  // Image field
  image: null,
};

export default function ManagerMenu() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState<boolean | ''>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuItemFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Check access permissions
  useEffect(() => {
    const primary = getPrimaryRole(user?.roles);
    if (primary !== 'manager' && primary !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // Load categories
  const loadCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response: CategoriesResponse = await staffMenuAPI.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Error loading categories:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load categories',
        color: 'danger',
      });
      // Fallback to predefined categories if API fails
      setCategories([
        'Dumplings (餃子)',
        'Buns (包子)',
        'Rice Rolls (腸粉)',
        'Congee (粥)',
        'Small Plates',
        'Desserts',
        'Chinese Tea',
        'Specialty Drinks',
        'Alcoholic Beverages'
      ]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Load menu items
  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const params = {
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(activeFilter !== '' && { isActive: activeFilter as boolean }),
        page: currentPage,
        limit: 10,
      };

      const response: MenuItemsResponse = await staffMenuAPI.getMenuItems(params);
      setMenuItems(response.menuItems);
      setTotalPages(response.pagination.pages);
    } catch (error) {
      console.error('Error loading menu items:', error);
      addToast({
        title: 'Error',
        description: 'Failed to load menu items',
        color: 'danger',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (!categoriesLoading) {
      loadMenuItems();
    }
  }, [searchTerm, categoryFilter, activeFilter, currentPage, categoriesLoading]);

  // Form handling
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.category.trim()) errors.category = 'Category is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    
    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price <= 0) {
      errors.price = 'Valid price is required';
    }

    const qty = parseInt(formData.qtyOnHand);
    if (isNaN(qty) || qty < 0) {
      errors.qtyOnHand = 'Valid quantity is required';
    }

    if (formData.preparationTimeMin) {
      const prepTime = parseInt(formData.preparationTimeMin);
      if (isNaN(prepTime) || prepTime <= 0) {
        errors.preparationTimeMin = 'Preparation time must be a positive number';
      }
    }

    if (formData.costOfGoods) {
      const cost = parseFloat(formData.costOfGoods);
      if (isNaN(cost) || cost < 0) {
        errors.costOfGoods = 'Cost must be a positive number';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      if (isEditing && editingItem) {
        // Handle update with image or without
        let updateData: UpdateMenuItemRequest | FormData;
        
        if (formData.image) {
          // Use FormData for file upload
          const formDataObj = new FormData();
          formDataObj.append('name', formData.name.trim());
          formDataObj.append('category', formData.category.trim());
          formDataObj.append('price', formData.price);
          formDataObj.append('description', formData.description.trim());
          formDataObj.append('qtyOnHand', formData.qtyOnHand);
          formDataObj.append('allergens', JSON.stringify(formData.allergens));
          formDataObj.append('image', formData.image);
          formDataObj.append('isActive', String(formData.isActive));
          
          if (formData.preparationTimeMin) formDataObj.append('preparationTimeMin', formData.preparationTimeMin);
          if (formData.costOfGoods) formDataObj.append('costOfGoods', formData.costOfGoods);
          if (formData.reorderThreshold) formDataObj.append('reorderThreshold', formData.reorderThreshold);
          if (formData.promoPercent) formDataObj.append('promoPercent', formData.promoPercent);
          if (formData.promoStartsAt) formDataObj.append('promoStartsAt', formData.promoStartsAt);
          if (formData.promoEndsAt) formDataObj.append('promoEndsAt', formData.promoEndsAt);
          
          updateData = formDataObj;
        } else {
          // Use JSON for regular data without image
          updateData = {
            name: formData.name.trim(),
            category: formData.category.trim(),
            price: parseFloat(formData.price),
            description: formData.description.trim(),
            qtyOnHand: parseInt(formData.qtyOnHand),
            allergens: formData.allergens,
            isActive: formData.isActive,
            ...(formData.preparationTimeMin && { 
              preparationTimeMin: parseInt(formData.preparationTimeMin) 
            }),
            ...(formData.costOfGoods && { 
              costOfGoods: parseFloat(formData.costOfGoods) 
            }),
            ...(formData.reorderThreshold && { 
              reorderThreshold: parseInt(formData.reorderThreshold) 
            }),
            // Promotion fields
            ...(formData.promoPercent && { 
              promoPercent: parseFloat(formData.promoPercent) 
            }),
            ...(formData.promoStartsAt && { 
              promoStartsAt: formData.promoStartsAt 
            }),
            ...(formData.promoEndsAt && { 
              promoEndsAt: formData.promoEndsAt 
            }),
          };
        }

        await staffMenuAPI.updateMenuItem(editingItem.id, updateData);
        addToast({
          title: 'Success',
          description: 'Menu item updated successfully',
          color: 'success',
        });
      } else {
        // Handle create with image or without
        let createData: CreateMenuItemRequest | FormData;
        
        if (formData.image) {
          // Use FormData for file upload
          const formDataObj = new FormData();
          formDataObj.append('name', formData.name.trim());
          formDataObj.append('category', formData.category.trim());
          formDataObj.append('price', formData.price);
          formDataObj.append('description', formData.description.trim());
          formDataObj.append('qtyOnHand', formData.qtyOnHand);
          formDataObj.append('allergens', JSON.stringify(formData.allergens));
          formDataObj.append('image', formData.image);
          
          if (formData.preparationTimeMin) formDataObj.append('preparationTimeMin', formData.preparationTimeMin);
          if (formData.costOfGoods) formDataObj.append('costOfGoods', formData.costOfGoods);
          if (formData.reorderThreshold) formDataObj.append('reorderThreshold', formData.reorderThreshold);
          if (formData.promoPercent) formDataObj.append('promoPercent', formData.promoPercent);
          if (formData.promoStartsAt) formDataObj.append('promoStartsAt', formData.promoStartsAt);
          if (formData.promoEndsAt) formDataObj.append('promoEndsAt', formData.promoEndsAt);
          
          createData = formDataObj;
        } else {
          // Use JSON for regular data without image
          createData = {
            name: formData.name.trim(),
            category: formData.category.trim(),
            price: parseFloat(formData.price),
            description: formData.description.trim(),
            qtyOnHand: parseInt(formData.qtyOnHand),
            allergens: formData.allergens,
            ...(formData.preparationTimeMin && { 
              preparationTimeMin: parseInt(formData.preparationTimeMin) 
            }),
            ...(formData.costOfGoods && { 
              costOfGoods: parseFloat(formData.costOfGoods) 
            }),
            ...(formData.reorderThreshold && { 
              reorderThreshold: parseInt(formData.reorderThreshold) 
            }),
            // Promotion fields
            ...(formData.promoPercent && { 
              promoPercent: parseFloat(formData.promoPercent) 
            }),
            ...(formData.promoStartsAt && { 
              promoStartsAt: formData.promoStartsAt 
            }),
            ...(formData.promoEndsAt && { 
              promoEndsAt: formData.promoEndsAt 
            }),
          };
        }

        await staffMenuAPI.createMenuItem(createData);
        addToast({
          title: 'Success', 
          description: 'Menu item created successfully',
          color: 'success',
        });
      }

      onOpenChange();
      resetForm();
      loadMenuItems();
    } catch (error) {
      console.error('Error saving menu item:', error);
      addToast({
        title: 'Error',
        description: 'Failed to save menu item',
        color: 'danger',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setIsEditing(true);
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price?.toString() || '0',
      description: item.description || '',
      preparationTimeMin: item.preparationTimeMin?.toString() || '',
      costOfGoods: item.costOfGoods?.toString() || '',
      allergens: item.allergens || [],
      qtyOnHand: item.qtyOnHand?.toString() || '0',
      reorderThreshold: item.reorderThreshold?.toString() || '0',
      isActive: item.isActive ?? true,
      // Promotion fields
      promoPercent: item.promoPercent?.toString() || '',
      promoStartsAt: item.promoStartsAt ? new Date(item.promoStartsAt).toISOString().slice(0, 16) : '',
      promoEndsAt: item.promoEndsAt ? new Date(item.promoEndsAt).toISOString().slice(0, 16) : '',
      // Image field (reset to null, user can upload new one)
      image: null,
    });
    onOpen();
  };

  const handleDelete = async (item: MenuItem) => {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    try {
      await staffMenuAPI.deleteMenuItem(item.id);
      addToast({
        title: 'Success',
        description: 'Menu item deleted successfully',
        color: 'success',
      });
      loadMenuItems();
    } catch (error) {
      console.error('Error deleting menu item:', error);
      addToast({
        title: 'Error',
        description: 'Failed to delete menu item',
        color: 'danger',
      });
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setIsEditing(false);
    setEditingItem(null);
  };

  const handleAddNew = () => {
    resetForm();
    onOpen();
  };

  const formatPrice = (price: number | undefined) => `$${(price ?? 0).toFixed(2)}`;

  // Helper function to check if item has active promotion
  const hasActivePromotion = (item: MenuItem) => {
    if (!item.promoPercent || !item.promoStartsAt || !item.promoEndsAt) return false;
    const now = new Date();
    const startDate = new Date(item.promoStartsAt);
    const endDate = new Date(item.promoEndsAt);
    return now >= startDate && now <= endDate && item.promoPercent > 0;
  };

  // Helper function to calculate discounted price
  const getDiscountedPrice = (item: MenuItem) => {
    if (!hasActivePromotion(item)) return item.price;
    const discount = item.promoPercent! / 100;
    return item.price * (1 - discount);
  };

  const getStockStatus = (item: MenuItem) => {
    const qty = item.qtyOnHand ?? 0;
    const threshold = item.reorderThreshold ?? 0;
    
    if (qty === 0) {
      return <Chip color="danger" size="sm">Out of Stock</Chip>;
    } else if (qty <= threshold) {
      return <Chip color="warning" size="sm">Low Stock</Chip>;
    }
    return <Chip color="success" size="sm">In Stock</Chip>;
  };

  return (
    <DefaultLayout>
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h1 className={title({ size: 'lg', class: 'text-white' })}>
              Menu Management
            </h1>
            <Button 
              color="primary" 
              onPress={handleAddNew}
              className="font-semibold"
            >
              Add New Item
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="max-w-xs"
              isClearable
            />
            <Select
              placeholder="Filter by category"
              value={categoryFilter}
              onSelectionChange={(keys) => setCategoryFilter(Array.from(keys as Set<string>)[0] || '')}
              className="max-w-xs"
            >
              <SelectItem key="">All Categories</SelectItem>
              <>
                {categories.map((category: string) => (
                  <SelectItem key={category}>
                    {category}
                  </SelectItem>
                ))}
              </>
            </Select>
            <Select
              placeholder="Filter by status"
              selectedKeys={activeFilter === '' ? [] : [activeFilter.toString()]}
              onSelectionChange={(keys) => {
                const value = Array.from(keys as Set<string>)[0];
                setActiveFilter(value === '' ? '' : value === 'true');
                setCurrentPage(1); // Reset to first page when filter changes
              }}
              className="max-w-xs"
            >
              <SelectItem key="">All Items</SelectItem>
              <SelectItem key="true">Active Only</SelectItem>
              <SelectItem key="false">Inactive Only</SelectItem>
            </Select>
          </div>

          {/* Table */}
          <div className="bg-gray-800 rounded-lg p-4">
            {loading ? (
              <div className="flex justify-center p-8">
                {/* <Spinner size="lg" /> */}
                Spinner
              </div>
            ) : (
              <div className="overflow-x-auto">
                {menuItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No menu items found
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left p-3 text-white font-semibold">NAME</th>
                        <th className="text-left p-3 text-white font-semibold">CATEGORY</th>
                        <th className="text-left p-3 text-white font-semibold">PRICE</th>
                        <th className="text-left p-3 text-white font-semibold">STOCK</th>
                        <th className="text-left p-3 text-white font-semibold">STATUS</th>
                        <th className="text-left p-3 text-white font-semibold">ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menuItems.map((item) => (
                        <tr key={item.id} className="border-b border-gray-700 hover:bg-gray-700">
                          <td className="p-3">
                            <div>
                              <div className="font-semibold text-white">{item.name}</div>
                              <div className="text-sm text-gray-400 truncate max-w-xs">
                                {item.description}
                              </div>
                            </div>
                          </td>
                          <td className="p-3">
                            <Chip size="sm" variant="flat">
                              {item.category}
                            </Chip>
                          </td>
                          <td className="p-3 text-white font-semibold">
                            <div className="flex flex-col gap-1">
                              {hasActivePromotion(item) ? (
                                <>
                                  <div className="flex items-center gap-2">
                                    <span className="text-green-400 font-bold">
                                      {formatPrice(getDiscountedPrice(item))}
                                    </span>
                                    <Chip size="sm" color="warning" variant="solid">
                                      -{item.promoPercent}%
                                    </Chip>
                                  </div>
                                  <span className="text-gray-400 text-sm line-through">
                                    {formatPrice(item.price)}
                                  </span>
                                </>
                              ) : (
                                formatPrice(item.price)
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="flex flex-col gap-1">
                              {getStockStatus(item)}
                              <span className="text-xs text-gray-400">
                                {item.qtyOnHand ?? 0} units
                              </span>
                            </div>
                          </td>
                          <td className="p-3">
                            <Chip 
                              color={item.isActive ? 'success' : 'default'} 
                              size="sm"
                            >
                              {item.isActive ? 'Active' : 'Inactive'}
                            </Chip>
                          </td>
                          <td className="p-3">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                color="primary"
                                variant="flat"
                                onPress={() => handleEdit(item)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                color="danger"
                                variant="flat"
                                onPress={() => handleDelete(item)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-4 gap-2">
                <Button
                  size="sm"
                  isDisabled={currentPage <= 1}
                  onPress={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                <span className="text-white self-center">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  size="sm"
                  isDisabled={currentPage >= totalPages}
                  onPress={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Modal */}
        <Modal 
          isOpen={isOpen} 
          onOpenChange={onOpenChange}
          size="2xl"
          scrollBehavior="inside"
        >
          <ModalContent>
            {(onClose: () => void) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}
                </ModalHeader>
                <ModalBody>
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Item Name"
                        placeholder="Enter item name"
                        value={formData.name}
                        onValueChange={(value: string) => setFormData({ ...formData, name: value })}
                        isInvalid={!!formErrors.name}
                        errorMessage={formErrors.name}
                        isRequired
                      />
                      <Select
                        label="Category"
                        placeholder="Select category"
                        selectedKeys={formData.category ? [formData.category] : []}
                        onSelectionChange={(keys) => 
                          setFormData({ ...formData, category: Array.from(keys as Set<string>)[0] || '' })
                        }
                        isInvalid={!!formErrors.category}
                        errorMessage={formErrors.category}
                        isRequired
                      >
                        {categories.map((category: string) => (
                          <SelectItem key={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>

                    <Input
                      label="Description"
                      placeholder="Enter item description"
                      value={formData.description}
                      onValueChange={(value: string) => setFormData({ ...formData, description: value })}
                      isInvalid={!!formErrors.description}
                      errorMessage={formErrors.description}
                      isRequired
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Input
                        label="Price ($)"
                        placeholder="0.00"
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onValueChange={(value: string) => setFormData({ ...formData, price: value })}
                        isInvalid={!!formErrors.price}
                        errorMessage={formErrors.price}
                        isRequired
                      />
                      <Input
                        label="Quantity on Hand"
                        placeholder="0"
                        type="number"
                        value={formData.qtyOnHand}
                        onValueChange={(value: string) => setFormData({ ...formData, qtyOnHand: value })}
                        isInvalid={!!formErrors.qtyOnHand}
                        errorMessage={formErrors.qtyOnHand}
                        isRequired
                      />
                      <Input
                        label="Reorder Threshold"
                        placeholder="10"
                        type="number"
                        value={formData.reorderThreshold}
                        onValueChange={(value: string) => setFormData({ ...formData, reorderThreshold: value })}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Preparation Time (minutes)"
                        placeholder="Optional"
                        type="number"
                        value={formData.preparationTimeMin}
                        onValueChange={(value: string) => setFormData({ ...formData, preparationTimeMin: value })}
                        isInvalid={!!formErrors.preparationTimeMin}
                        errorMessage={formErrors.preparationTimeMin}
                      />
                      <Input
                        label="Cost of Goods ($)"
                        placeholder="Optional"
                        type="number"
                        step="0.01"
                        value={formData.costOfGoods}
                        onValueChange={(value: string) => setFormData({ ...formData, costOfGoods: value })}
                        isInvalid={!!formErrors.costOfGoods}
                        errorMessage={formErrors.costOfGoods}
                      />
                    </div>

                    <Select
                      label="Allergens"
                      placeholder="Select allergens (if any)"
                      selectionMode="multiple"
                      selectedKeys={formData.allergens}
                      onSelectionChange={(keys) => 
                        setFormData({ ...formData, allergens: Array.from(keys as Set<string>) })
                      }
                    >
                      {COMMON_ALLERGENS.map((allergen) => (
                        <SelectItem key={allergen}>
                          {allergen}
                        </SelectItem>
                      ))}
                    </Select>

                    {/* Promotion Section */}
                    <div className="space-y-4 p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                      <h4 className="text-lg font-semibold text-orange-800">
                        🎯 Promotion Settings
                      </h4>
                      <p className="text-sm text-gray-600">
                        Set a temporary discount for this menu item
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input
                          label="Discount (%)"
                          placeholder="e.g., 20"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={formData.promoPercent}
                          onValueChange={(value: string) => setFormData({ ...formData, promoPercent: value })}
                          description="Percentage discount (0-100%)"
                        />
                        <Input
                          label="Start Date & Time"
                          type="datetime-local"
                          value={formData.promoStartsAt}
                          onValueChange={(value: string) => setFormData({ ...formData, promoStartsAt: value })}
                          description="When promotion begins"
                        />
                        <Input
                          label="End Date & Time"
                          type="datetime-local"
                          value={formData.promoEndsAt}
                          onValueChange={(value: string) => setFormData({ ...formData, promoEndsAt: value })}
                          description="When promotion ends"
                        />
                      </div>
                      
                      {formData.promoPercent && formData.price && (
                        <div className="p-3 bg-green-50 rounded-md border border-green-200">
                          <p className="text-sm text-green-800">
                            <strong>Discounted Price:</strong> ${(parseFloat(formData.price) * (1 - parseFloat(formData.promoPercent) / 100)).toFixed(2)}
                            {' '}(was ${parseFloat(formData.price).toFixed(2)})
                          </p>
                        </div>
                      )}
                      
                      {/* Image Upload Field */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Menu Item Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setFormData({ ...formData, image: file });
                          }}
                          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                        />
                        {formData.image && (
                          <p className="text-xs text-gray-600">
                            Selected: {formData.image.name}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">
                          Supported formats: JPG, PNG, GIF, WebP (Max 5MB)
                        </p>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="w-4 h-4"
                        />
                        <label htmlFor="isActive" className="text-sm">
                          Item is active and available for ordering
                        </label>
                      </div>
                    )}
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="light" onPress={onClose}>
                    Cancel
                  </Button>
                  <Button 
                    color="primary" 
                    onPress={handleSubmit}
                    isLoading={submitting}
                  >
                    {isEditing ? 'Update Item' : 'Create Item'}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </div>
    </DefaultLayout>
  );
}