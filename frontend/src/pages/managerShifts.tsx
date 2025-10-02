import { useState, useEffect } from 'react';
import { Button } from '@heroui/button';
import { Chip } from '@heroui/chip';
import { Card, CardBody, CardHeader } from '@heroui/card';
import { Divider } from '@heroui/divider';
import { Spinner } from '@heroui/spinner';
import { addToast } from '@heroui/toast';
import DefaultLayout from '../layouts/default';
import { shiftAPI, type ShiftApplication } from '../services/api';

const ManagerShifts: React.FC = () => {
  const [applications, setApplications] = useState<ShiftApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<number>>(new Set());

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
      </div>
    </DefaultLayout>
  );
};

export default ManagerShifts;