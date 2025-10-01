import React, { useState, useEffect } from 'react';
import { Select, SelectItem } from '@heroui/select';
import { Chip } from '@heroui/chip';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { Spinner } from '@heroui/spinner';
import DefaultLayout from '../layouts/default';
import { shiftAPI, type StaffMember } from '../services/api';

const ManagerStaff: React.FC = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('all');

  // Get unique worker roles from all staff
  const allWorkerRoles = Array.from(
    new Set(staff.flatMap(member => member.workerRoles))
  ).sort();

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
                <p className="text-gray-600">View and filter staff members</p>
              </div>
              <Chip size="lg" variant="flat" color="primary">
                {filteredStaff.length} {filteredStaff.length === 1 ? 'staff member' : 'staff members'}
              </Chip>
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
                  </tr>
                </thead>
                <tbody>
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default ManagerStaff;