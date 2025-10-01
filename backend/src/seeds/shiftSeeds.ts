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
      name: ShiftTiming.NIGHT,
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
  
  // Create various application scenarios
  dates.forEach((date, index) => {
    const shiftId = index + 1;
    
    // Different application scenarios for different shifts
    if (index < 5) {
      // First 5 shifts: Fully applied and approved (good coverage)
      applications.push(
        {
          shiftId: shiftId,
          staffId: 3, // Mike (server)
          status: ShiftApplicationStatus.APPROVED,
          appliedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // Applied yesterday
        },
        {
          shiftId: shiftId,
          staffId: 4, // Lisa (server)
          status: ShiftApplicationStatus.APPROVED,
          appliedAt: new Date(Date.now() - 20 * 60 * 60 * 1000)
        },
        {
          shiftId: shiftId,
          staffId: 6, // Carlos (cook)
          status: ShiftApplicationStatus.APPROVED,
          appliedAt: new Date(Date.now() - 18 * 60 * 60 * 1000)
        }
      );
    } else if (index < 8) {
      // Next 3 shifts: Some pending applications
      applications.push(
        {
          shiftId: shiftId,
          staffId: 5, // James (server/bartender)
          status: ShiftApplicationStatus.APPLIED,
          appliedAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // Applied 6 hours ago
        },
        {
          shiftId: shiftId,
          staffId: 7, // Maria (cook)
          status: ShiftApplicationStatus.APPLIED,
          appliedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
        }
      );
    } else if (index < 10) {
      // Next 2 shifts: Some rejections (create scenarios)
      applications.push(
        {
          shiftId: shiftId,
          staffId: 3, // Mike applied but rejected (conflict)
          status: ShiftApplicationStatus.REJECTED,
          appliedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
        },
        {
          shiftId: shiftId,
          staffId: 4, // Lisa approved
          status: ShiftApplicationStatus.APPROVED,
          appliedAt: new Date(Date.now() - 10 * 60 * 60 * 1000)
        }
      );
    } else {
      // Remaining shifts: Understaffed scenarios (no applications yet)
      // This creates realistic scenarios where shifts need more staff
    }
  });
  
  await shiftApplicationRepository.save(applications);
  console.log(`Created ${applications.length} shift applications`);
}

export async function seedShiftAssignments() {
  const shiftAssignmentRepository = AppDataSource.getRepository(ShiftAssignment);
  
  // Create assignments only for approved applications
  // Note: We'll use dummy requirementId values (1, 2, 3) that should exist from our shift requirements
  const assignments = [
    // First 5 shifts - fully staffed
    // Shift 1
    { shiftId: 1, requirementId: 1, staffId: 3, assignedAt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
    { shiftId: 1, requirementId: 1, staffId: 4, assignedAt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
    { shiftId: 1, requirementId: 2, staffId: 6, assignedAt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
    
    // Shift 2
    { shiftId: 2, requirementId: 3, staffId: 3, assignedAt: new Date(Date.now() - 11 * 60 * 60 * 1000) },
    { shiftId: 2, requirementId: 3, staffId: 4, assignedAt: new Date(Date.now() - 11 * 60 * 60 * 1000) },
    { shiftId: 2, requirementId: 4, staffId: 6, assignedAt: new Date(Date.now() - 11 * 60 * 60 * 1000) },
    
    // Shift 3
    { shiftId: 3, requirementId: 5, staffId: 3, assignedAt: new Date(Date.now() - 10 * 60 * 60 * 1000) },
    { shiftId: 3, requirementId: 5, staffId: 4, assignedAt: new Date(Date.now() - 10 * 60 * 60 * 1000) },
    { shiftId: 3, requirementId: 6, staffId: 6, assignedAt: new Date(Date.now() - 10 * 60 * 60 * 1000) },
    
    // Shift 4
    { shiftId: 4, requirementId: 7, staffId: 3, assignedAt: new Date(Date.now() - 9 * 60 * 60 * 1000) },
    { shiftId: 4, requirementId: 7, staffId: 4, assignedAt: new Date(Date.now() - 9 * 60 * 60 * 1000) },
    { shiftId: 4, requirementId: 8, staffId: 6, assignedAt: new Date(Date.now() - 9 * 60 * 60 * 1000) },
    
    // Shift 5
    { shiftId: 5, requirementId: 9, staffId: 3, assignedAt: new Date(Date.now() - 8 * 60 * 60 * 1000) },
    { shiftId: 5, requirementId: 9, staffId: 4, assignedAt: new Date(Date.now() - 8 * 60 * 60 * 1000) },
    { shiftId: 5, requirementId: 10, staffId: 6, assignedAt: new Date(Date.now() - 8 * 60 * 60 * 1000) },
    
    // Shift 10 - Only Lisa assigned (understaffed scenario)
    { shiftId: 10, requirementId: 19, staffId: 4, assignedAt: new Date(Date.now() - 1 * 60 * 60 * 1000) }
  ];
  
  await shiftAssignmentRepository.save(assignments);
  console.log(`Created ${assignments.length} shift assignments`);
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