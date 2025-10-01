/**
 * Shift-related Seeds
 * Creates shift templates, shifts, requirements, applications, assignments, and time-off requests
 */

import { AppDataSource } from '../data-source';
import { ShiftTemplate } from '../models/ShiftTemplate';
import { Shift } from '../models/Shift';
import { ShiftRequirement } from '../models/ShiftRequirement';
import { ShiftApplication } from '../models/ShiftApplication';
import { ShiftAssignment } from '../models/ShiftAssignment';
import { TimeOffRequest } from '../models/TimeOffRequest';
import { ShiftTiming, ShiftApplicationStatus, TimeOffStatus } from '../models/enums';

// Helper function to get date strings for the next 14 days
function getNext14Days(): string[] {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date.toISOString().split('T')[0]); // YYYY-MM-DD format
  }
  return dates;
}

// Helper function to check if a staff member has a conflicting shift on the same date
function hasConflictOnDate(assignments: any[], staffId: number, targetDate: string): boolean {
  return assignments.some(assignment => {
    // Get the shift date for this assignment
    const shiftIndex = Math.floor((assignment.shiftId - 1) / 3); // 3 shifts per day
    const dates = getNext14Days();
    const assignmentDate = dates[shiftIndex];
    return assignment.staffId === staffId && assignmentDate === targetDate;
  });
}

export async function seedShiftTemplates() {
  const shiftTemplateRepository = AppDataSource.getRepository(ShiftTemplate);
  
  // Split 10pm-10am into 3 shifts: Evening (10pm-2am), Night (2am-6am), Early Morning (6am-10am)
  const templates = [
    {
      name: ShiftTiming.EVENING,
      startTime: '22:00:00', // 10 PM
      endTime: '02:00:00'    // 2 AM next day
    },
    {
      name: ShiftTiming.MIDNIGHT,
      startTime: '02:00:00', // 2 AM
      endTime: '06:00:00'    // 6 AM
    },
    {
      name: ShiftTiming.EARLY_MORNING,
      startTime: '06:00:00', // 6 AM
      endTime: '10:00:00'    // 10 AM
    }
  ];
  
  await shiftTemplateRepository.save(templates);
  console.log(`Created ${templates.length} shift templates`);
}

export async function seedShifts() {
  const shiftRepository = AppDataSource.getRepository(Shift);
  const dates = getNext14Days();
  
  const shifts: any[] = [];
  
  // Create shifts for all 3 templates for each date
  dates.forEach(date => {
    // Evening shift (10pm-2am)
    shifts.push({
      shiftDate: date,
      templateId: 1, // Evening template
      notes: `Evening shift for ${date}`
    });
    
    // Night shift (2am-6am)
    shifts.push({
      shiftDate: date,
      templateId: 2, // Night template
      notes: `Night shift for ${date}`
    });
    
    // Early morning shift (6am-10am)
    shifts.push({
      shiftDate: date,
      templateId: 3, // Early morning template
      notes: `Early morning shift for ${date}`
    });
  });
  
  await shiftRepository.save(shifts);
  console.log(`Created ${shifts.length} shifts`);
}

export async function seedShiftRequirements() {
  const shiftRequirementRepository = AppDataSource.getRepository(ShiftRequirement);
  const dates = getNext14Days();
  
  const requirements: any[] = [];
  
  // Create requirements for each shift (3 shifts per day)
  dates.forEach((date, dateIndex) => {
    const dayOfWeek = new Date(date).getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6; // Friday or Saturday
    
    // For each date, we have 3 shifts (Evening, Night, Early Morning)
    for (let shiftIndex = 0; shiftIndex < 3; shiftIndex++) {
      const shiftId = (dateIndex * 3) + shiftIndex + 1;
      const shiftType = shiftIndex === 0 ? 'evening' : shiftIndex === 1 ? 'night' : 'early_morning';
      
      if (shiftType === 'evening') {
        // Evening shift (10pm-2am) - busiest, needs more staff
        if (isWeekend) {
          requirements.push(
            { shiftId, roleName: 'server', requiredCount: 3 },
            { shiftId, roleName: 'cook', requiredCount: 2 },
            { shiftId, roleName: 'cleaner', requiredCount: 1 }
          );
        } else {
          requirements.push(
            { shiftId, roleName: 'server', requiredCount: 2 },
            { shiftId, roleName: 'cook', requiredCount: 1 },
            { shiftId, roleName: 'cleaner', requiredCount: 1 }
          );
        }
      } else if (shiftType === 'night') {
        // Night shift (2am-6am) - quieter, minimal staff
        requirements.push(
          { shiftId, roleName: 'server', requiredCount: 1 },
          { shiftId, roleName: 'cook', requiredCount: 1 }
        );
      } else {
        // Early morning shift (6am-10am) - moderate, prep for lunch
        requirements.push(
          { shiftId, roleName: 'server', requiredCount: 2 },
          { shiftId, roleName: 'cook', requiredCount: 1 },
          { shiftId, roleName: 'cleaner', requiredCount: 1 }
        );
      }
    }
  });
  
  await shiftRequirementRepository.save(requirements);
  console.log(`Created ${requirements.length} shift requirements`);
}

export async function seedShiftApplications() {
  const shiftApplicationRepository = AppDataSource.getRepository(ShiftApplication);
  const dates = getNext14Days();
  
  const applications: any[] = [];
  
  // Create applications that don't conflict with existing assignments
  // Focus on days 10-14 (shifts 31-42) where no assignments exist yet
  dates.forEach((date, dayIndex) => {
    if (dayIndex >= 10) { // Days 10-14 for available applications
      const baseShiftId = (dayIndex * 3) + 1;
      const eveningShiftId = baseShiftId;
      const nightShiftId = baseShiftId + 1;
      const morningShiftId = baseShiftId + 2;
      
      // Create various application scenarios for these unassigned days
      if (dayIndex === 10) {
        // Day 10: Multiple applications for evening shift
        applications.push(
          {
            shiftId: eveningShiftId,
            staffId: 3, // server1 applying
            status: ShiftApplicationStatus.APPLIED,
            appliedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
            desiredRequirementId: ((eveningShiftId - 1) * 3) + 1 // server requirement
          },
          {
            shiftId: eveningShiftId,
            staffId: 4, // server2 also applying
            status: ShiftApplicationStatus.APPLIED,
            appliedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
            desiredRequirementId: ((eveningShiftId - 1) * 3) + 1 // server requirement
          },
          {
            shiftId: nightShiftId,
            staffId: 6, // cook1 applying for night
            status: ShiftApplicationStatus.APPLIED,
            appliedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
            desiredRequirementId: ((nightShiftId - 1) * 2) + 2 // cook requirement for night shift
          }
        );
      } else if (dayIndex === 11) {
        // Day 11: Approved and pending mix
        applications.push(
          {
            shiftId: eveningShiftId,
            staffId: 5, // server3 approved
            status: ShiftApplicationStatus.APPROVED,
            appliedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
            desiredRequirementId: ((eveningShiftId - 1) * 3) + 1
          },
          {
            shiftId: morningShiftId,
            staffId: 7, // cook2 pending
            status: ShiftApplicationStatus.APPLIED,
            appliedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            desiredRequirementId: ((morningShiftId - 1) * 3) + 2 // cook requirement
          }
        );
      } else if (dayIndex === 12) {
        // Day 12: Some rejections (for conflict testing)
        applications.push(
          {
            shiftId: eveningShiftId,
            staffId: 3, // server1 rejected (maybe had conflict)
            status: ShiftApplicationStatus.REJECTED,
            appliedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
            desiredRequirementId: ((eveningShiftId - 1) * 3) + 1
          },
          {
            shiftId: nightShiftId,
            staffId: 4, // server2 pending
            status: ShiftApplicationStatus.APPLIED,
            appliedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
            desiredRequirementId: ((nightShiftId - 1) * 2) + 1 // server requirement for night
          }
        );
      }
      // Days 13-14 left with no applications for testing new applications
    }
  });
  
  await shiftApplicationRepository.save(applications);
  console.log(`Created ${applications.length} shift applications`);
}

export async function seedShiftAssignments() {
  const shiftAssignmentRepository = AppDataSource.getRepository(ShiftAssignment);
  
  // Create simple assignments without conflicts - each staff member can only be assigned once per shift
  // Staff roster: 
  // Servers: staffId 3 (server1), 4 (server2), 5 (server3)
  // Cooks: staffId 6 (cook1), 7 (cook2)
  // IMPORTANT: Due to unique constraint (shiftId, staffId), each staff can only appear once per shift
  
  // Create minimal assignments for first few shifts to demonstrate functionality
  // Leave most shifts unassigned so staff can apply to them
  const assignments = [
    // Day 1 assignments (shifts 1, 2, 3)
    { shiftId: 1, requirementId: 1, staffId: 3, assignedAt: new Date(Date.now() - 12 * 60 * 60 * 1000) }, // server1 -> shift 1 evening, first server req
    { shiftId: 2, requirementId: 4, staffId: 4, assignedAt: new Date(Date.now() - 11 * 60 * 60 * 1000) }, // server2 -> shift 2 night, first server req
    { shiftId: 3, requirementId: 6, staffId: 5, assignedAt: new Date(Date.now() - 10 * 60 * 60 * 1000) }, // server3 -> shift 3 morning, first server req
    
    // Day 2 assignments (shifts 4, 5, 6) - different staff pattern
    { shiftId: 4, requirementId: 10, staffId: 4, assignedAt: new Date(Date.now() - 9 * 60 * 60 * 1000) },  // server2 -> shift 4 evening
    { shiftId: 5, requirementId: 13, staffId: 6, assignedAt: new Date(Date.now() - 8 * 60 * 60 * 1000) },  // cook1 -> shift 5 night, server req
    { shiftId: 6, requirementId: 15, staffId: 3, assignedAt: new Date(Date.now() - 7 * 60 * 60 * 1000) },  // server1 -> shift 6 morning
    
    // Day 3 assignments (shifts 7, 8, 9) - third pattern
    { shiftId: 7, requirementId: 19, staffId: 5, assignedAt: new Date(Date.now() - 6 * 60 * 60 * 1000) },  // server3 -> shift 7 evening
    { shiftId: 8, requirementId: 22, staffId: 3, assignedAt: new Date(Date.now() - 5 * 60 * 60 * 1000) },  // server1 -> shift 8 night
    { shiftId: 9, requirementId: 24, staffId: 7, assignedAt: new Date(Date.now() - 4 * 60 * 60 * 1000) },  // cook2 -> shift 9 morning, server req
    
    // Day 4 sparse assignments (shifts 10, 11, 12) - some gaps for testing
    { shiftId: 10, requirementId: 28, staffId: 6, assignedAt: new Date(Date.now() - 3 * 60 * 60 * 1000) }, // cook1 -> shift 10 evening, server req
    // Leave shifts 11, 12 unassigned
    
    // Day 5 sparse assignments (shifts 13, 14, 15)
    { shiftId: 13, requirementId: 37, staffId: 4, assignedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) }, // server2 -> shift 13 evening
    // Leave shifts 14, 15 unassigned
    
    // Days 6-14 left mostly unassigned for testing staff applications
    // This creates realistic scenarios where shifts need more staff
  ];
  
  await shiftAssignmentRepository.save(assignments);
  console.log(`Created ${assignments.length} shift assignments without conflicts`);
}

export async function seedTimeOffRequests() {
  const timeOffRepository = AppDataSource.getRepository(TimeOffRequest);
  
  const timeOffRequests = [
    // Approved time off
    {
      staffId: 3, // Mike
      startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from now
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      reason: 'Family vacation',
      status: TimeOffStatus.APPROVED,
      managerId: 2,
      requestedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Requested week ago
      decidedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    
    // Pending time off
    {
      staffId: 4, // Lisa
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reason: 'Medical appointment',
      status: TimeOffStatus.PENDING,
      managerId: null,
      requestedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Requested 2 days ago
      decidedAt: null
    },
    
    // Denied time off
    {
      staffId: 6, // Carlos
      startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reason: 'Personal matter',
      status: TimeOffStatus.DENIED,
      managerId: 2,
      requestedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      decidedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    },
    
    // Another approved request
    {
      staffId: 5, // James
      startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reason: 'Wedding attendance',
      status: TimeOffStatus.APPROVED,
      managerId: 2,
      requestedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      decidedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)
    },
    
    // Pending request from cook
    {
      staffId: 7, // Maria
      startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      endDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reason: 'Birthday celebration',
      status: TimeOffStatus.PENDING,
      managerId: null,
      requestedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      decidedAt: null
    }
  ];
  
  await timeOffRepository.save(timeOffRequests);
  console.log(`Created ${timeOffRequests.length} time off requests`);
}