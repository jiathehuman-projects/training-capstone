import React, { useState, useEffect } from 'react';
import { Select, SelectItem } from '@heroui/select';
import { Chip } from '@heroui/chip';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { Spinner } from '@heroui/spinner';
import { Button } from '@heroui/button';
import { Input } from '@heroui/input';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/dropdown';
import { addToast } from '@heroui/toast';
import DefaultLayout from '../layouts/default';
import { shiftAPI, type StaffMember, type CreateStaffMemberRequest, type UpdateStaffMemberRequest } from '../services/api';

const ManagerStaff: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('all');
  
  // Modal states
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onOpenChange: onCreateOpenChange } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onOpenChange: onEditOpenChange } = useDisclosure();
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  
  // Form states
  const [formData, setFormData] = useState<CreateStaffMemberRequest>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    username: '',
    roles: ['staff'],
    workerRoles: [],
    staffStatus: 'active'
  });

  // Available options
  const availableRoles = ['staff', 'manager', 'admin'];
  const availableWorkerRoles = ['server', 'cook', 'host', 'dishwasher', 'cleaner'];
  const availableStatuses = ['active', 'unavailable', 'inactive'];

  // Get unique worker roles from all staff
  const allWorkerRoles = Array.from(
    new Set(staff.flatMap(member => member.workerRoles))
  ).sort();

  // Handler functions
  const handleCreateStaff = async () => {
    try {
      setProcessingIds(prev => new Set(prev).add('create'));
      const newStaff = await shiftAPI.createStaffMember(formData);
      await fetchStaff();
      onCreateOpenChange();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        username: '',
        roles: ['staff'],
        workerRoles: [],
        staffStatus: 'active'
      });
      addToast({
        title: 'Success',
        description: 'Staff member created successfully',
        color: 'success'
      });
    } catch (err: any) {
      console.error('Error creating staff:', err);
      addToast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to create staff member',
        color: 'danger'
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete('create');
        return newSet;
      });
    }
  };

  const handleEditStaff = (staff: StaffMember) => {
    setEditingStaff(staff);
    setFormData({
      firstName: staff.firstName,
      lastName: staff.lastName,
      email: staff.email,
      phone: staff.phone || '',
      username: '', // Username is not editable
      roles: staff.roles,
      workerRoles: staff.workerRoles,
      staffStatus: staff.staffStatus
    });
    onEditOpen();
  };

  const handleUpdateStaff = async () => {
    if (!editingStaff) return;
    
    try {
      setProcessingIds(prev => new Set(prev).add(editingStaff.id));
      const updatedData: UpdateStaffMemberRequest = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        roles: formData.roles,
        workerRoles: formData.workerRoles,
        staffStatus: formData.staffStatus
      };
      await shiftAPI.updateStaffMember(editingStaff.id, updatedData);
      await fetchStaff();
      onEditOpenChange();
      setEditingStaff(null);
      addToast({
        title: 'Success',
        description: 'Staff member updated successfully',
        color: 'success'
      });
    } catch (err: any) {
      console.error('Error updating staff:', err);
      addToast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to update staff member',
        color: 'danger'
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        if (editingStaff) newSet.delete(editingStaff.id);
        return newSet;
      });
    }
  };

  const handleDeleteStaff = async (staffMember: StaffMember) => {
    if (!confirm(`Are you sure you want to delete ${staffMember.name}? This will permanently remove them and all their future assignments.`)) {
      return;
    }

    try {
      setProcessingIds(prev => new Set(prev).add(staffMember.id));
      const result = await shiftAPI.deleteStaffMember(staffMember.id);
      await fetchStaff();
      
      let message = 'Staff member deleted successfully';
      if (result.removedAssignments > 0 || result.removedApplications > 0) {
        message += `. Removed ${result.removedAssignments} future assignments and ${result.removedApplications} pending applications.`;
      }
      
      addToast({
        title: 'Success',
        description: message,
        color: 'success'
      });
    } catch (err: any) {
      console.error('Error deleting staff:', err);
      addToast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to delete staff member',
        color: 'danger'
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(staffMember.id);
        return newSet;
      });
    }
  };

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await shiftAPI.getAllStaff();
      setStaff(response.staff);
      setFilteredStaff(response.staff);
    } catch (err: any) {
      console.error('Error fetching staff:', err);
      setError(err.response?.data?.message || 'Failed to load staff list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // Filter staff by selected role
  useEffect(() => {
    if (selectedRole === 'all') {
      setFilteredStaff(staff);
    } else {
      setFilteredStaff(staff.filter(member => 
        member.workerRoles.includes(selectedRole) || 
        member.roles.includes(selectedRole)
      ));
    }
  }, [selectedRole, staff]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'unavailable':
        return 'warning';
      case 'inactive':
        return 'danger';
      default:
        return 'default';
    }
  };

  const formatRoles = (roles: string[]) => {
    return roles.map(role => (
      <Chip 
        key={role} 
        size="sm" 
        variant="flat" 
        color="primary"
        className="mr-1 mb-1"
      >
        {role}
      </Chip>
    ));
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </DefaultLayout>
    );
  }

  if (error) {
    return (
      <DefaultLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <Card className="max-w-md">
            <CardBody className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={fetchStaff}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </CardBody>
          </Card>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="max-w-7xl mx-auto p-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center w-full">
              <div>
                <h1 className="text-2xl font-bold">Staff Management</h1>
                <p className="text-gray-600">Create, edit, and manage staff members</p>
              </div>
              <div className="flex items-center gap-3">
                <Chip size="lg" variant="flat" color="primary">
                  {filteredStaff.length} {filteredStaff.length === 1 ? 'staff member' : 'staff members'}
                </Chip>
                <Button 
                  color="primary" 
                  onPress={onCreateOpen}
                  isLoading={processingIds.has('create')}
                >
                  Add Staff
                </Button>
              </div>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            {/* Filter Section */}
            <div className="mb-6">
              <div className="flex gap-4 items-end">
                <div className="w-64">
                  <Select
                    label="Filter by Role"
                    placeholder="All roles"
                    selectedKeys={selectedRole ? [selectedRole] : []}
                    onSelectionChange={(keys: any) => {
                      const selected = Array.from(keys)[0] as string;
                      setSelectedRole(selected || 'all');
                    }}
                  >
                    <SelectItem key="all">All Roles</SelectItem>
                    <SelectItem key="staff">Staff</SelectItem>
                    <SelectItem key="manager">Manager</SelectItem>
                    <SelectItem key="admin">Admin</SelectItem>
                    <>
                      {allWorkerRoles.map(role => (
                        <SelectItem key={role}>
                          {role} (Worker Role)
                        </SelectItem>
                      ))}
                    </>
                  </Select>
                </div>
              </div>
            </div>

            {/* Staff Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">NAME</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">CONTACT</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">STATUS</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">SYSTEM ROLES</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">WORKER ROLES</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-500">
                        {selectedRole === 'all' 
                          ? "No staff members found." 
                          : `No staff members with role "${selectedRole}" found.`
                        }
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((member) => (
                      <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold">{member.name}</p>
                            <p className="text-sm text-gray-500">ID: {member.id}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm">{member.email}</p>
                            {member.phone && (
                              <p className="text-sm text-gray-500">{member.phone}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Chip 
                            size="sm" 
                            variant="flat" 
                            color={getStatusColor(member.staffStatus)}
                          >
                            {member.staffStatus}
                          </Chip>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap">
                            {formatRoles(member.roles)}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap">
                            {member.workerRoles.length > 0 ? (
                              formatRoles(member.workerRoles)
                            ) : (
                              <span className="text-gray-400 text-sm">None</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2 justify-end">
                            <Dropdown>
                              <DropdownTrigger>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  isLoading={processingIds.has(member.id)}
                                  isDisabled={processingIds.has(member.id)}
                                >
                                  Actions
                                </Button>
                              </DropdownTrigger>
                              <DropdownMenu aria-label="Staff actions">
                                <DropdownItem 
                                  key="edit"
                                  onPress={() => handleEditStaff(member)}
                                >
                                  Edit
                                </DropdownItem>
                                <DropdownItem 
                                  key="delete"
                                  className="text-danger" 
                                  color="danger"
                                  onPress={() => handleDeleteStaff(member)}
                                >
                                  Delete
                                </DropdownItem>
                              </DropdownMenu>
                            </Dropdown>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Create Staff Modal */}
      <Modal isOpen={isCreateOpen} onOpenChange={onCreateOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">Create New Staff Member</ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    isRequired
                  />
                  <Input
                    label="Last Name"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    isRequired
                  />
                  <Input
                    label="Email"
                    placeholder="Enter email address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    isRequired
                  />
                  <Input
                    label="Phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                  <Input
                    label="Username"
                    placeholder="Enter username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    isRequired
                  />
                  <Select
                    label="Staff Status"
                    placeholder="Select status"
                    selectedKeys={[formData.staffStatus]}
                    onSelectionChange={(keys) => {
                      const status = Array.from(keys)[0] as any;
                      setFormData(prev => ({ ...prev, staffStatus: status }));
                    }}
                    isRequired
                  >
                    {availableStatuses.map((status) => (
                      <SelectItem key={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Select
                    label="System Roles"
                    placeholder="Select system roles"
                    selectionMode="multiple"
                    selectedKeys={formData.roles}
                    onSelectionChange={(keys) => {
                      setFormData(prev => ({ ...prev, roles: Array.from(keys) as string[] }));
                    }}
                    isRequired
                  >
                    {availableRoles.map((role) => (
                      <SelectItem key={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </Select>
                  <Select
                    label="Worker Roles"
                    placeholder="Select worker roles"
                    selectionMode="multiple"
                    selectedKeys={formData.workerRoles}
                    onSelectionChange={(keys) => {
                      setFormData(prev => ({ ...prev, workerRoles: Array.from(keys) as string[] }));
                    }}
                  >
                    {availableWorkerRoles.map((role) => (
                      <SelectItem key={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="mt-4 p-3 bg-gray-100 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>Note:</strong> The default password for new staff members is "password123". 
                    They should change it upon first login.
                  </p>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleCreateStaff}
                  isLoading={processingIds.has('create')}
                  isDisabled={!formData.firstName || !formData.lastName || !formData.email || !formData.username}
                >
                  Create Staff
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Staff Modal */}
      <Modal isOpen={isEditOpen} onOpenChange={onEditOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Edit Staff Member: {editingStaff?.name}
              </ModalHeader>
              <ModalBody>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    isRequired
                  />
                  <Input
                    label="Last Name"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    isRequired
                  />
                  <Input
                    label="Email"
                    placeholder="Enter email address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    isRequired
                  />
                  <Input
                    label="Phone"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                  <Select
                    label="Staff Status"
                    placeholder="Select status"
                    selectedKeys={[formData.staffStatus]}
                    onSelectionChange={(keys) => {
                      const status = Array.from(keys)[0] as any;
                      setFormData(prev => ({ ...prev, staffStatus: status }));
                    }}
                    isRequired
                  >
                    {availableStatuses.map((status) => (
                      <SelectItem key={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <Select
                    label="System Roles"
                    placeholder="Select system roles"
                    selectionMode="multiple"
                    selectedKeys={formData.roles}
                    onSelectionChange={(keys) => {
                      setFormData(prev => ({ ...prev, roles: Array.from(keys) as string[] }));
                    }}
                    isRequired
                  >
                    {availableRoles.map((role) => (
                      <SelectItem key={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </Select>
                  <Select
                    label="Worker Roles"
                    placeholder="Select worker roles"
                    selectionMode="multiple"
                    selectedKeys={formData.workerRoles}
                    onSelectionChange={(keys) => {
                      setFormData(prev => ({ ...prev, workerRoles: Array.from(keys) as string[] }));
                    }}
                  >
                    {availableWorkerRoles.map((role) => (
                      <SelectItem key={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </Select>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleUpdateStaff}
                  isLoading={editingStaff ? processingIds.has(editingStaff.id) : false}
                  isDisabled={!formData.firstName || !formData.lastName || !formData.email}
                >
                  Update Staff
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </DefaultLayout>
  );
};

export default ManagerStaff;
