import { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { Input } from '@heroui/input';
import { Spinner } from '@heroui/spinner';
import { addToast } from '@heroui/toast';
import DefaultLayout from '../layouts/default';
import { shiftAPI, type ShiftApplication, type CreateShiftRequest } from '../services/api';

const ManagerShifts: React.FC = () => {
  const [applications, setApplications] = useState<ShiftApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());
  
  // Shift creation state
  const [selectedTemplate, setSelectedTemplate] = useState<number>(1);
  const [shiftDate, setShiftDate] = useState<string>('');
  const [shiftNotes, setShiftNotes] = useState<string>('');
  const [creatingShift, setCreatingShift] = useState<boolean>(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await shiftAPI.getAllApplicationsForManager();
      setApplications(data);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setError(err.response?.data?.message || 'Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleApprove = async (applicationId: number) => {
    setProcessingIds(prev => new Set(prev).add(applicationId));
    try {
      await shiftAPI.approveAndAssignApplication(applicationId);
      addToast({
        title: 'Success',
        description: 'Application approved and staff assigned successfully',
        color: 'success'
      });
      // Refresh applications list
      await fetchApplications();
    } catch (err: any) {
      console.error('Error approving application:', err);
      addToast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to approve application',
        color: 'danger'
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicationId);
        return newSet;
      });
    }
  };

  const handleReject = async (applicationId: number) => {
    setProcessingIds(prev => new Set(prev).add(applicationId));
    try {
      await shiftAPI.declineApplication(applicationId);
      addToast({
        title: 'Success',
        description: 'Application rejected successfully',
        color: 'success'
      });
      // Refresh applications list
      await fetchApplications();
    } catch (err: any) {
      console.error('Error rejecting application:', err);
      addToast({
        title: 'Error',
        description: err.response?.data?.error || 'Failed to reject application',
        color: 'danger'
      });
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicationId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'applied':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'withdrawn':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour24 = parseInt(hours);
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    const ampm = hour24 >= 12 ? 'PM' : 'AM';
    return `${hour12}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatRoles = (roles: string[]) => {
    return roles.map(role => (
      <Chip 
        key={role} 
        size="sm" 
        variant="solid" 
        color="primary"
        className="mr-1 mb-1 text-white"
      >
        {role}
      </Chip>
    ));
  };

  // Filter to show pending applications first, then others
  const pendingApplications = applications.filter(app => app.status === 'applied');
  const processedApplications = applications.filter(app => app.status !== 'applied');

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
              <Button 
                onClick={fetchApplications}
                color="primary"
              >
                Retry
              </Button>
            </CardBody>
          </Card>
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="max-w-7xl mx-auto p-6">  
        <Card className="bg-gray-800">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center w-full">
              <div>
                <h1 className="text-2xl font-bold text-white">Shift Applications</h1>
                <p className="text-gray-300">Review and manage staff shift applications</p>
              </div>
              <div className="flex gap-2">
                <Chip size="lg" variant="solid" color="warning" className="text-white font-semibold">
                  {pendingApplications.length} Pending
                </Chip>
                <Chip size="lg" variant="solid" color="default" className="text-white font-semibold">
                  {applications.length} Total
                </Chip>
              </div>
            </div>
          </CardHeader>
          <Divider />
          <CardBody>
            {applications.length === 0 ? (
              <div className="text-center py-8 text-gray-300">
                No shift applications found.
              </div>
            ) : (
              <div className="space-y-6">
                {/* Pending Applications */}
                {pendingApplications.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-4">Pending Applications</h2>
                    <div className="space-y-4">
                      {pendingApplications.map((application) => (
                        <Card key={application.id} className="bg-gray-800 border border-gray-700">
                          <CardBody className="p-4">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                              {/* Staff Info */}
                              <div>
                                <h3 className="font-semibold text-white">{application.staffName}</h3>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {formatRoles(application.staffWorkerRoles)}
                                </div>
                              </div>

                              {/* Shift Info */}
                              <div>
                                <p className="text-sm text-gray-300">
                                  {application.shift ? formatDate(application.shift.shiftDate) : 'Unknown Date'}
                                </p>
                                <p className="text-sm text-gray-300">
                                  {application.shift?.template ? 
                                    `${formatTime(application.shift.template.startTime)} - ${formatTime(application.shift.template.endTime)}` :
                                    'Unknown Time'
                                  }
                                </p>
                                <p className="text-xs text-gray-300">
                                  {application.shift?.template?.name || 'Unknown Shift'}
                                </p>
                              </div>

                              {/* Desired Role */}
                              <div>
                                <p className="text-sm text-gray-300">Desired Role:</p>
                                <Chip 
                                  size="sm" 
                                  variant="solid" 
                                  color={application.staffWorkerRoles.includes(application.desiredRole || '') ? 'success' : 'danger'}
                                  className="text-white font-medium"
                                >
                                  {application.desiredRole || 'Any'}
                                </Chip>
                                {!application.staffWorkerRoles.includes(application.desiredRole || '') && (
                                  <p className="text-xs text-red-300 mt-1 font-medium">⚠️ Role mismatch</p>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2 justify-end">
                                <Button
                                  size="sm"
                                  color="success"
                                  variant="solid"
                                  isLoading={processingIds.has(application.id)}
                                  isDisabled={processingIds.has(application.id)}
                                  onPress={() => handleApprove(application.id)}
                                  className="text-white font-semibold"
                                >
                                  Approve & Assign
                                </Button>
                                <Button
                                  size="sm"
                                  color="danger"
                                  variant="solid"
                                  isLoading={processingIds.has(application.id)}
                                  isDisabled={processingIds.has(application.id)}
                                  onPress={() => handleReject(application.id)}
                                  className="text-white font-semibold"
                                >
                                  Reject
                                </Button>
                              </div>
                            </div>

                            {/* Applied Date */}
                            <div className="mt-2 text-xs text-gray-300">
                              Applied: {new Date(application.appliedAt).toLocaleString()}
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Processed Applications */}
                {processedApplications.length > 0 && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-4">Processed Applications</h2>
                    <div className="space-y-4">
                      {processedApplications.map((application) => (
                        <Card key={application.id} className="bg-gray-900 border border-gray-700 opacity-75">
                          <CardBody className="p-4">
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                              {/* Staff Info */}
                              <div>
                                <h3 className="font-semibold text-white">{application.staffName}</h3>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {formatRoles(application.staffWorkerRoles)}
                                </div>
                              </div>

                              {/* Shift Info */}
                              <div>
                                <p className="text-sm text-gray-300">
                                  {application.shift ? formatDate(application.shift.shiftDate) : 'Unknown Date'}
                                </p>
                                <p className="text-sm text-gray-300">
                                  {application.shift?.template ? 
                                    `${formatTime(application.shift.template.startTime)} - ${formatTime(application.shift.template.endTime)}` :
                                    'Unknown Time'
                                  }
                                </p>
                              </div>

                              {/* Desired Role */}
                              <div>
                                <Chip size="sm" variant="solid" color="default" className="text-white">
                                  {application.desiredRole || 'Any'}
                                </Chip>
                              </div>

                              {/* Status */}
                              <div className="flex justify-end">
                                <Chip 
                                  size="sm" 
                                  variant="solid" 
                                  color={getStatusColor(application.status)}
                                  className="text-white font-medium"
                                >
                                  {application.status.toUpperCase()}
                                </Chip>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Shift Creation Section */}
        <Card className="bg-gray-900 border-gray-700 mt-6">
          <CardHeader className="bg-gradient-to-r from-green-900 to-green-800 text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full">
                <span className="text-2xl">➕</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Create New Shift</h2>
                <p className="text-green-100 opacity-90">Schedule a new shift for your team</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Template Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Shift Template</label>
                <div className="space-y-2">
                  {[
                    { id: 1, name: 'Standard Evening Service', description: 'Full service team for dinner rush', roles: [{ name: 'Server', count: 4 }, { name: 'Kitchen Staff', count: 3 }, { name: 'Host', count: 1 }] },
                    { id: 2, name: 'Night Shift Minimal', description: 'Skeleton crew for late hours', roles: [{ name: 'Server', count: 2 }, { name: 'Kitchen Staff', count: 1 }] },
                    { id: 3, name: 'Morning Prep Team', description: 'Early shift for preparation', roles: [{ name: 'Kitchen Staff', count: 2 }, { name: 'Manager', count: 1 }] }
                  ].map((template) => (
                    <Card 
                      key={template.id}
                      isPressable
                      className={`transition-all border ${
                        selectedTemplate === template.id 
                          ? 'border-green-500 bg-green-900/20' 
                          : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                      }`}
                      onPress={() => {
                        console.log('Template selected:', template.id);
                        setSelectedTemplate(template.id);
                      }}
                    >
                      <CardBody className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-white">{template.name}</h4>
                            <p className="text-sm text-gray-400 mt-1">{template.description}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                              {template.roles.map((role, idx) => {
                                // Assign colors based on role type
                                const getRoleColor = (roleName: string) => {
                                  switch (roleName.toLowerCase()) {
                                    case 'server':
                                      return 'primary';
                                    case 'kitchen staff':
                                      return 'warning';
                                    case 'host':
                                      return 'secondary';
                                    case 'manager':
                                      return 'success';
                                    default:
                                      return 'default';
                                  }
                                };
                                
                                return (
                                  <Chip 
                                    key={idx} 
                                    size="sm" 
                                    variant="solid" 
                                    color={getRoleColor(role.name)}
                                    className="text-white font-medium"
                                  >
                                    {role.count}x {role.name}
                                  </Chip>
                                );
                              })}
                            </div>
                          </div>
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            selectedTemplate === template.id 
                              ? 'border-green-500 bg-green-500' 
                              : 'border-gray-400'
                          }`} />
                        </div>
                      </CardBody>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Date and Notes */}
              <div className="space-y-4">
                <Input
                  type="date"
                  label="Shift Date"
                  value={shiftDate}
                  onChange={(e) => setShiftDate(e.target.value)}
                  className="shift-input"
                  classNames={{
                    base: "w-full shift-input",
                    label: "text-gray-300",
                    input: "!bg-gray-800 !text-white !placeholder:text-gray-400",
                    inputWrapper: "!bg-gray-800 !border-gray-600 data-[hover=true]:!border-gray-500",
                    innerWrapper: "!bg-gray-800"
                  }}
                  required
                />
                
                <Input
                  label="Notes (Optional)"
                  placeholder="Any special instructions or notes for this shift..."
                  value={shiftNotes}
                  onChange={(e) => setShiftNotes(e.target.value)}
                  className="shift-input"
                  classNames={{
                    base: "w-full shift-input",
                    label: "text-gray-300",
                    input: "!bg-gray-800 !text-white !placeholder:text-gray-400",
                    inputWrapper: "!bg-gray-800 !border-gray-600 data-[hover=true]:!border-gray-500",
                    innerWrapper: "!bg-gray-800"
                  }}
                />
              </div>
            </div>

            <Divider className="bg-gray-700" />
            
            <div className="flex justify-end">
              <Button
                color="success"
                size="lg"
                className="px-8 font-semibold"
                isLoading={creatingShift}
                onPress={handleCreateShift}
                isDisabled={!shiftDate || creatingShift}
              >
                {creatingShift ? 'Creating...' : 'Create Shift'}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </DefaultLayout>
  );

  // Handle shift creation
  async function handleCreateShift() {
    if (!shiftDate) {
      addToast({
        title: 'Validation Error',
        description: 'Please select a shift date',
        color: 'danger',
      });
      return;
    }

    setCreatingShift(true);
    
    try {
      // Hardcoded template requirements based on selected template
      const templateRequirements = {
        1: [ // Standard Evening Service
          { roleName: 'Server', requiredCount: 4 },
          { roleName: 'Kitchen Staff', requiredCount: 3 },
          { roleName: 'Host', requiredCount: 1 }
        ],
        2: [ // Night Shift Minimal
          { roleName: 'Server', requiredCount: 2 },
          { roleName: 'Kitchen Staff', requiredCount: 1 }
        ],
        3: [ // Morning Prep Team
          { roleName: 'Kitchen Staff', requiredCount: 2 },
          { roleName: 'Manager', requiredCount: 1 }
        ]
      };

      const createRequest: CreateShiftRequest = {
        templateId: selectedTemplate,
        shiftDate: shiftDate, // Already in ISO format from date input
        requirements: templateRequirements[selectedTemplate as keyof typeof templateRequirements],
        notes: shiftNotes || undefined
      };

      await shiftAPI.createShift(createRequest);
      
      addToast({
        title: 'Success',
        description: 'Shift created successfully!',
        color: 'success',
      });
      
      // Reset form
      setShiftDate('');
      setShiftNotes('');
      setSelectedTemplate(1);
      
    } catch (err: any) {
      console.error('Error creating shift:', err);
      addToast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to create shift',
        color: 'danger',
      });
    } finally {
      setCreatingShift(false);
    }
  }
};

export default ManagerShifts;