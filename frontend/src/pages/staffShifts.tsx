import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { useAuth } from "@/contexts/AuthContext";
import { shiftAPI, type Shift, type ShiftApplication, type ShiftAssignment, type TimeOffRequest } from "@/services/api";

type ViewMode = 'personal' | 'team';
type WeekView = 'current' | 'next';

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

const getShiftTypeColor = (shiftType: string): string => {
  switch (shiftType.toLowerCase()) {
    case 'evening':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'night':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'early_morning':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getApplicationStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'applied':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    case 'assigned':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getRoleColor = (role: string): string => {
  switch (role.toLowerCase()) {
    case 'server':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'cook':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'cleaner':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export default function StaffShifts() {
  const { user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [applications, setApplications] = useState<ShiftApplication[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('personal');
  const [weekView, setWeekView] = useState<WeekView>('current');
  const [applyingToShift, setApplyingToShift] = useState<number | null>(null);

  // Load data on component mount and set up polling
  useEffect(() => {
    if (user) {
      loadShiftData();
      const interval = setInterval(loadShiftData, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user, weekView]);

  const loadShiftData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Calculate date range for current or next week
      const today = new Date();
      const startDate = weekView === 'current' 
        ? today.toISOString().split('T')[0]
        : new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const endDate = new Date(new Date(startDate).getTime() + 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Load all data in parallel
      const [shiftsData, applicationsData, assignmentsData, timeOffData] = await Promise.all([
        shiftAPI.getShifts(startDate, endDate),
        shiftAPI.getApplications(),
        shiftAPI.getAssignments(),
        shiftAPI.getTimeOffRequests('approved', startDate, endDate) // Get approved time-off for the period
      ]);

      setShifts(shiftsData);
      setApplications(applicationsData);
      setAssignments(assignmentsData);
      setTimeOffRequests(timeOffData);
    } catch (error: any) {
      console.error("Failed to load shift data:", error);
      setError(error.response?.data?.error || "Failed to load shift data");
      
      addToast({
        title: "Error",
        description: "Failed to load shift data",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToShift = async (shiftId: number, requirementId: number) => {
    try {
      setApplyingToShift(shiftId);
      await shiftAPI.applyToShift(shiftId, { desiredRequirementId: requirementId });
      
      addToast({
        title: "Success",
        description: "Successfully applied to shift",
        color: "success",
      });
      
      // Refresh data
      await loadShiftData();
    } catch (error: any) {
      console.error("Failed to apply to shift:", error);
      addToast({
        title: "Error",
        description: error.response?.data?.error || "Failed to apply to shift",
        color: "danger",
      });
    } finally {
      setApplyingToShift(null);
    }
  };

  const handleWithdrawApplication = async (applicationId: number) => {
    try {
      await shiftAPI.withdrawApplication(applicationId);
      
      addToast({
        title: "Success",
        description: "Application withdrawn successfully",
        color: "success",
      });
      
      // Refresh data
      await loadShiftData();
    } catch (error: any) {
      console.error("Failed to withdraw application:", error);
      addToast({
        title: "Error",
        description: error.response?.data?.error || "Failed to withdraw application",
        color: "danger",
      });
    }
  };

  // Helper functions
  const getUserApplication = (shiftId: number) => {
    return applications.find(app => app.staffId === user?.id);
  };

  const getUserAssignment = (shiftId: number) => {
    const shift = shifts.find(s => s.id === shiftId);
    return shift?.assignments.find(assignment => assignment.staffId === user?.id);
  };

  const isUserAvailable = (date: string) => {
    return !timeOffRequests.some(timeOff => 
      timeOff.staffId === user?.id && 
      date >= timeOff.startDate && 
      date <= timeOff.endDate
    );
  };

  const canApplyToRole = (roleName: string) => {
    return user?.workerRoles?.includes(roleName.toLowerCase()) || false;
  };

  const groupShiftsByDate = (shifts: Shift[]) => {
    const grouped: Record<string, Shift[]> = {};
    shifts.forEach(shift => {
      if (!grouped[shift.shiftDate]) {
        grouped[shift.shiftDate] = [];
      }
      grouped[shift.shiftDate].push(shift);
    });
    return grouped;
  };

  // Filter assignments for current user and time period
  const currentUserAssignments = assignments.filter(assignment => 
    assignment.staffId === user?.id
  );

  // Get current user's assignments from shifts data
  const getCurrentUserShiftAssignments = () => {
    const userShiftAssignments: any[] = [];
    shifts.forEach(shift => {
      shift.assignments.forEach(assignment => {
        if (assignment.staffId === user?.id) {
          userShiftAssignments.push({
            ...assignment,
            shiftDate: shift.shiftDate,
            startTime: shift.template.startTime,
            endTime: shift.template.endTime,
            shiftType: shift.template.name
          });
        }
      });
    });
    return userShiftAssignments;
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
            <p className="text-red-700">Access denied. This page is only available to staff members.</p>
            <p className="text-red-600 text-sm mt-2">User roles: {JSON.stringify(user?.roles)} | Authentication: {user ? 'Logged in' : 'Not logged in'}</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  const groupedShifts = groupShiftsByDate(shifts);
  const sortedDates = Object.keys(groupedShifts).sort();

  return (
    <DefaultLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className={title()}>Shift Schedule</h1>
            <p className="text-lg text-gray-600 mt-2">
              Apply for shifts and manage your schedule
            </p>
          </div>
          <Button
            variant="bordered"
            onClick={() => window.history.back()}
          >
            ← Back to Dashboard
          </Button>
        </div>

        {/* Controls */}
        <div className="bg-white border border-gray-300 rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              {/* Week Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setWeekView('current')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    weekView === 'current'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setWeekView('next')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    weekView === 'next'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Next Week
                </button>
              </div>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('personal')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'personal'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  My View
                </button>
                <button
                  onClick={() => setViewMode('team')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'team'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Team View
                </button>
              </div>
            </div>

            <Button 
              variant="bordered"
              onClick={loadShiftData}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Refresh'}
            </Button>
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

        {/* My Current Assignments */}
        {getCurrentUserShiftAssignments().length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Current Assignments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {getCurrentUserShiftAssignments().map(assignment => (
                <div key={assignment.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-green-900">
                      {formatDate(assignment.shiftDate)}
                    </h3>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Assigned
                    </span>
                  </div>
                  <p className="text-sm text-green-700">
                    <strong>Role:</strong> {assignment.roleName}
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Shift:</strong> {assignment.shiftType.replace('_', ' ')}
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Time:</strong> {formatTime(assignment.startTime)} - {formatTime(assignment.endTime)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Available Shifts Calendar */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Available Shifts - {weekView === 'current' ? 'This Week' : 'Next Week'}
          </h2>
          
          {isLoading && shifts.length === 0 ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : sortedDates.length === 0 ? (
            <div className="bg-white border border-gray-300 rounded-xl shadow-lg p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No shifts available</h3>
              <p className="text-gray-600">
                No shifts found for the selected time period.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map(date => {
                const dayShifts = groupedShifts[date].sort((a, b) => 
                  a.template.startTime.localeCompare(b.template.startTime)
                );
                const isAvailable = isUserAvailable(date);
                
                return (
                  <div key={date} className="bg-white border border-gray-300 rounded-xl shadow-lg overflow-hidden">
                    <div className={`p-4 border-b ${!isAvailable ? 'bg-gray-100' : 'bg-gray-50'}`}>
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {formatDate(date)}
                        </h3>
                        {!isAvailable && (
                          <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
                            Time Off
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dayShifts.map(shift => {
                          const userApplication = getUserApplication(shift.id);
                          const userAssignment = getUserAssignment(shift.id);
                          
                          return (
                            <div 
                              key={shift.id} 
                              className={`border rounded-lg p-4 ${getShiftTypeColor(shift.template.name)} ${
                                !isAvailable ? 'opacity-50' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-semibold capitalize">
                                    {shift.template.name.replace('_', ' ')}
                                  </h4>
                                  <p className="text-sm">
                                    {formatTime(shift.template.startTime)} - {formatTime(shift.template.endTime)}
                                  </p>
                                </div>
                                {userApplication && (
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getApplicationStatusColor(userApplication.status)}`}>
                                    {userApplication.status}
                                  </span>
                                )}
                                {userAssignment && (
                                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                    Assigned
                                  </span>
                                )}
                              </div>
                              
                              {shift.notes && (
                                <p className="text-sm mb-3 opacity-75">{shift.notes}</p>
                              )}
                              
                              <div className="space-y-2">
                                <h5 className="text-sm font-medium">Positions:</h5>
                                {shift.requirements.map(requirement => {
                                  const canApply = canApplyToRole(requirement.roleName);
                                  const isFullyStaffed = requirement.assignedCount >= requirement.requiredCount;
                                  const hasApplied = userApplication?.desiredRequirementId === requirement.id;
                                  
                                  return (
                                    <div 
                                      key={requirement.id} 
                                      className={`flex justify-between items-center p-2 rounded border ${getRoleColor(requirement.roleName)} ${
                                        !canApply ? 'opacity-50' : ''
                                      }`}
                                    >
                                      <div className="flex-1">
                                        <span className="text-sm font-medium capitalize">
                                          {requirement.roleName}
                                        </span>
                                        <span className="text-xs ml-2">
                                          ({requirement.assignedCount}/{requirement.requiredCount})
                                        </span>
                                      </div>
                                      
                                      {!isAvailable ? (
                                        <span className="text-xs text-gray-500">Time Off</span>
                                      ) : userAssignment ? (
                                        <span className="text-xs text-blue-600">Assigned</span>
                                      ) : hasApplied ? (
                                        <Button
                                          size="sm"
                                          variant="bordered"
                                          onClick={() => userApplication && handleWithdrawApplication(userApplication.id)}
                                          className="text-xs"
                                        >
                                          Withdraw
                                        </Button>
                                      ) : !canApply ? (
                                        <span className="text-xs text-gray-500">Not Qualified</span>
                                      ) : isFullyStaffed ? (
                                        <span className="text-xs text-gray-500">Full</span>
                                      ) : (
                                        <Button
                                          size="sm"
                                          variant="solid"
                                          disabled={applyingToShift === shift.id}
                                          onClick={() => handleApplyToShift(shift.id, requirement.id)}
                                          className="bg-blue-600 text-white hover:bg-blue-700 text-xs"
                                        >
                                          {applyingToShift === shift.id ? 'Applying...' : 'Apply'}
                                        </Button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                              
                              {/* Show applications and assignments in team view */}
                              {viewMode === 'team' && (
                                <div className="mt-3 pt-3 border-t">
                                  {shift.applications.length > 0 && (
                                    <div className="mb-2">
                                      <h6 className="text-xs font-medium text-gray-600 mb-1">Applications:</h6>
                                      <div className="space-y-1">
                                        {shift.applications.map(app => (
                                          <div key={app.id} className="text-xs text-gray-600">
                                            {app.staffName} ({app.status})
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  
                                  {shift.assignments.length > 0 && (
                                    <div>
                                      <h6 className="text-xs font-medium text-gray-600 mb-1">Assigned:</h6>
                                      <div className="space-y-1">
                                        {shift.assignments.map(assignment => (
                                          <div key={assignment.id} className="text-xs text-gray-600">
                                            {assignment.staffName} ({assignment.roleName})
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}