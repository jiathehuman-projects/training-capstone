import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { useAuth } from "@/contexts/AuthContext";
import { shiftAPI, type Shift, type ShiftApplication, type ShiftAssignment, type TimeOffRequest } from "@/services/api";

type WeekView = 'current' | 'next';
type ViewMode = 'week' | 'custom';

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
  const [myAssignments, setMyAssignments] = useState<ShiftAssignment[]>([]);
  const [timeOffRequests, setTimeOffRequests] = useState<TimeOffRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weekView, setWeekView] = useState<WeekView>('current');
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [customDateRange, setCustomDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [isSearching, setIsSearching] = useState(false);
  const [applyingToShift, setApplyingToShift] = useState<number | null>(null);

  // Load data on component mount and set up polling
  useEffect(() => {
    if (user) {
      loadShiftData();
      const interval = setInterval(loadShiftData, 30000); // Poll every 30 seconds
      return () => clearInterval(interval);
    }
  }, [user, weekView, viewMode]);

  const loadShiftData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Calculate date range based on view mode
      let startDate: string;
      let endDate: string;
      
      if (viewMode === 'custom') {
        startDate = customDateRange.startDate;
        endDate = customDateRange.endDate;
      } else {
        // Calculate date range for current or next week
        const today = new Date();
        startDate = weekView === 'current' 
          ? today.toISOString().split('T')[0]
          : new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        endDate = new Date(new Date(startDate).getTime() + 13 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      }

      // Load all data in parallel
      const [shiftsData, applicationsData, myAssignmentsData, timeOffData] = await Promise.all([
        shiftAPI.getShifts(startDate, endDate),
        shiftAPI.getApplications(),
        shiftAPI.getMyAssignments(),
        shiftAPI.getTimeOffRequests('approved', startDate, endDate) // Get approved time-off for the period
      ]);

      setShifts(shiftsData);
      setApplications(applicationsData);
      setMyAssignments(myAssignmentsData);
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

  const handleCustomSearch = async () => {
    // Validate date range
    if (!customDateRange.startDate || !customDateRange.endDate) {
      addToast({
        title: "Error",
        description: "Please select both start and end dates",
        color: "danger",
      });
      return;
    }
    
    if (customDateRange.startDate > customDateRange.endDate) {
      addToast({
        title: "Error",
        description: "End date must be after start date",
        color: "danger",
      });
      return;
    }
    
    setIsSearching(true);
    try {
      await loadShiftData();
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleResetToThisWeek = () => {
    setViewMode('week');
    setWeekView('current');
    setCustomDateRange({ startDate: '', endDate: '' });
  };

  const handleApplyToShift = async (shiftId: number, requirementId: number) => {
    const optimisticKey = getOptimisticKey(shiftId, requirementId);
    
    try {
      // Optimistically update UI immediately
      setOptimisticApplications(prev => new Set([...prev, optimisticKey]));
      setApplyingToShift(shiftId);
      
      // Make API call
      await shiftAPI.applyToShift(shiftId, { desiredRequirementId: requirementId });
      
      addToast({
        title: "Success",
        description: "Successfully applied to shift",
        color: "success",
      });
      
      // Refresh data to get the actual application from backend
      await loadShiftData();
      
    } catch (error: any) {
      console.error("Failed to apply to shift:", error);
      console.error("Error details:", {
        shiftId,
        requirementId,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message
      });
      
      // Revert optimistic update on error
      setOptimisticApplications(prev => {
        const newSet = new Set(prev);
        newSet.delete(optimisticKey);
        return newSet;
      });
      
      addToast({
        title: "Error",
        description: error.response?.data?.error || `Failed to apply to shift: ${error.message}`,
        color: "danger",
      });
    } finally {
      setApplyingToShift(null);
    }
  };



  // Helper functions

  const isUserAvailable = (date: string) => {
    return !timeOffRequests.some(timeOff => 
      timeOff.staffId === user?.id && 
      date >= timeOff.startDate && 
      date <= timeOff.endDate
    );
  };

  // Track optimistic application state (for immediate UI feedback)
  const [optimisticApplications, setOptimisticApplications] = useState<Set<string>>(new Set());
  
  // Helper to create optimistic application key
  const getOptimisticKey = (shiftId: number, requirementId: number) => `${shiftId}-${requirementId}`;
  
  // Helper to calculate the actual assigned count (assignments + approved applications)
  const getActualAssignedCount = (shift: Shift, requirementId: number): number => {
    // Count actual assignments for this requirement
    const assignmentCount = shift.assignments.filter(assignment => 
      assignment.shift?.id === shift.id
    ).length;
    
    // Count approved applications for this requirement  
    const approvedApplicationCount = shift.applications.filter(app => 
      app.desiredRequirementId === requirementId && 
      (app.status === 'approved' || optimisticApplications.has(getOptimisticKey(shift.id, requirementId)))
    ).length;
    
    return assignmentCount + approvedApplicationCount;
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
            <h1 className={`${title()} text-white`}>Shift Schedule</h1>
            <p className="text-lg text-gray-300 mt-2">
              Apply for shifts and manage your schedule
            </p>
          </div>
          <Button
            variant="bordered"
            className="text-white p-4"
            onClick={() => window.location.href = '/dashboard'}
          >
            ← Dashboard
          </Button>
        </div>

        {/* Controls */}
        <div className="bg-white border border-gray-300 rounded-xl shadow-lg p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => { setViewMode('week'); setWeekView('current'); }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'week' && weekView === 'current'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => { setViewMode('week'); setWeekView('next'); }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'week' && weekView === 'next'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Next Week
                </button>
                <button
                  onClick={() => setViewMode('custom')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'custom'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Custom Range
                </button>
              </div>
              
              {/* Custom Date Range Inputs */}
              {viewMode === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={customDateRange.startDate}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="Start Date"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={customDateRange.endDate}
                    onChange={(e) => setCustomDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="End Date"
                  />
                  <Button
                    size="sm"
                    onClick={handleCustomSearch}
                    disabled={isSearching}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {viewMode === 'custom' && (
                <Button 
                  variant="bordered"
                  size="sm"
                  onClick={handleResetToThisWeek}
                >
                  Reset to This Week
                </Button>
              )}
              <Button 
                variant="bordered"
                onClick={loadShiftData}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
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

        {/* Two-Section Layout: Stacked vertically on all screen sizes */}
        <div className="grid grid-cols-1 gap-8">
          
          {/* My Current Assignments Section */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">My Current Assignments</h2>
            
            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : myAssignments.length === 0 ? (
              <div className="bg-white border border-gray-300 rounded-xl shadow-lg p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No upcoming assignments</h3>
                <p className="text-gray-600">
                  You don't have any upcoming shift assignments.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myAssignments.map(assignment => (
                  <div key={assignment.id} className="bg-white border border-gray-300 rounded-xl shadow-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-black text-lg">
                          {assignment.shift?.template.toUpperCase() || 'Unknown Shift'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {formatDate(assignment.shift?.shiftDate || '')}
                        </p>
                      </div>
                      <div className={`px-3 py-1 text-sm rounded-full ${getRoleColor(assignment.roleName)}`}>
                        {assignment.roleName}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-700">
                      <div>
                        <strong>Time:</strong> {formatTime(assignment.shift?.startTime || '00:00')} - {formatTime(assignment.shift?.endTime || '23:59')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Available Shifts Section */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-6">
              Available Shifts - {viewMode === 'custom' ? 'Custom Range' : (weekView === 'current' ? 'This Week' : 'Next Week')}
            </h2>
          
          {isLoading && shifts.length === 0 ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : sortedDates.length === 0 ? (
            <div className="bg-white border border-gray-300 rounded-xl shadow-lg p-8 text-center">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No shifts found</h3>
              <p className="text-gray-600">
                {viewMode === 'custom' 
                  ? 'No shifts found for the selected date range.'
                  : 'No shifts found for the selected time period.'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedDates.map(date => {
                const dayShifts = groupedShifts[date].sort((a, b) => {
                  const aStartTime = a.template?.startTime || '00:00';
                  const bStartTime = b.template?.startTime || '00:00';
                  return aStartTime.localeCompare(bStartTime);
                });
                const isAvailable = isUserAvailable(date);
                
                return (
                  <div key={date} className="bg-white border border-gray-300 rounded-xl shadow-lg overflow-hidden">
                    <div className={`p-4 border-b ${!isAvailable ? 'bg-gray-100' : 'bg-gray-50'}`}>
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-black">
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
                          const userApplication = applications.find(app => 
                            app.shift?.id === shift.id && app.staffId === user?.id
                          );
                          const userAssignment = shift.assignments.find(assignment => 
                            assignment.staffId === user?.id
                          );
                          
                          return (
                            <div 
                              key={shift.id} 
                              className={`border rounded-lg p-4 ${getShiftTypeColor(shift.template?.name || 'Unknown')} ${
                                !isAvailable ? 'opacity-50' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-semibold capitalize">
                                    {(shift.template?.name || 'Unknown').replace('_', ' ')}
                                  </h4>
                                  <p className="text-sm">
                                    {formatTime(shift.template?.startTime || '00:00')} - {formatTime(shift.template?.endTime || '23:59')}
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
                                  const actualAssignedCount = getActualAssignedCount(shift, requirement.id);
                                  const isFullyStaffed = actualAssignedCount >= requirement.requiredCount;
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
                                          ({actualAssignedCount}/{requirement.requiredCount})
                                        </span>
                                      </div>
                                      
                                      {!isAvailable ? (
                                        <span className="text-xs text-gray-500">Time Off</span>
                                      ) : userAssignment ? (
                                        <span className="text-xs text-blue-600">Assigned</span>
                                      ) : hasApplied || optimisticApplications.has(getOptimisticKey(shift.id, requirement.id)) ? (
                                        <span className="text-xs text-green-600">Applied</span>
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
      </div>
    </DefaultLayout>
  );
}