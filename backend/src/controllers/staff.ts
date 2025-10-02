import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Shift, ShiftTemplate, ShiftRequirement, ShiftApplication, ShiftAssignment, User, TimeOffRequest } from '../models';
import { AppDataSource } from '../data-source';
import { ShiftApplicationStatus, ShiftTiming, TimeOffStatus } from '../models/enums';
import { MoreThan, LessThan, Between, Raw } from 'typeorm';

const shiftRepository = AppDataSource.getRepository(Shift);
const shiftTemplateRepository = AppDataSource.getRepository(ShiftTemplate);
const shiftRequirementRepository = AppDataSource.getRepository(ShiftRequirement);
const shiftApplicationRepository = AppDataSource.getRepository(ShiftApplication);
const shiftAssignmentRepository = AppDataSource.getRepository(ShiftAssignment);
const userRepository = AppDataSource.getRepository(User);
const timeOffRepository = AppDataSource.getRepository(TimeOffRequest);

interface AuthenticatedRequest extends Request {
  currentUser?: string | JwtPayload;
}

interface CreateShiftRequest extends AuthenticatedRequest {
  body: {
    shiftDate: string;
    templateId: number;
    requirements: Array<{
      roleName: string;
      requiredCount: number;
    }>;
    notes?: string;
  };
}

interface ApplyToShiftRequest extends AuthenticatedRequest {
  body: {
    desiredRequirementId?: number;
  };
}

interface AssignStaffRequest extends AuthenticatedRequest {
  body: {
    staffId: number;
    requirementId: number;
  };
}

interface JwtPayloadWithId extends JwtPayload {
  id: number;
  roles: string[];
}

// Helper function to get user ID from JWT
const getUserIdFromToken = (currentUser: string | JwtPayload): number => {
  if (typeof currentUser === 'object' && 'id' in currentUser) {
    return (currentUser as JwtPayloadWithId).id;
  }
  throw new Error('Invalid token format');
};

// Helper function to check if user has staff role
const isStaffUser = (currentUser: string | JwtPayload): boolean => {
  if (typeof currentUser === 'object' && 'roles' in currentUser) {
    const payload = currentUser as JwtPayloadWithId;
    return payload.roles.some(role => ['staff', 'manager', 'admin'].includes(role));
  }
  return false;
};

// Helper function to check if user has manager role
const isManagerUser = (currentUser: string | JwtPayload): boolean => {
  if (typeof currentUser === 'object' && 'roles' in currentUser) {
    const payload = currentUser as JwtPayloadWithId;
    return payload.roles.some(role => ['manager', 'admin'].includes(role));
  }
  return false;
};

// Helper function to check for time overlapping shifts
const checkOverlappingShifts = async (staffId: number, shiftDate: string, templateId: number): Promise<boolean> => {
  // Get the template for the shift we're trying to apply to
  const newTemplate = await shiftTemplateRepository.findOne({
    where: { id: templateId }
  });

  if (!newTemplate) {
    return false; // If template doesn't exist, let other validation handle it
  }

  // Get all existing assignments and applications for this staff member on the same date
  const existingAssignments = await shiftAssignmentRepository.find({
    where: { staffId },
    relations: ['shift', 'shift.template']
  });

  const existingApplications = await shiftApplicationRepository.find({
    where: { 
      staffId,
      status: ShiftApplicationStatus.APPROVED // Only check approved applications
    },
    relations: ['shift', 'shift.template']
  });

  // Check assignments for time conflicts on the same date
  const assignmentConflicts = existingAssignments.filter(assignment => {
    if (!assignment.shift || !assignment.shift.template) return false;
    if (assignment.shift.shiftDate !== shiftDate) return false;
    
    return hasTimeOverlap(
      newTemplate.startTime, newTemplate.endTime,
      assignment.shift.template.startTime, assignment.shift.template.endTime
    );
  });

  // Check applications for time conflicts on the same date
  const applicationConflicts = existingApplications.filter(application => {
    if (!application.shift || !application.shift.template) return false;
    if (application.shift.shiftDate !== shiftDate) return false;
    
    return hasTimeOverlap(
      newTemplate.startTime, newTemplate.endTime,
      application.shift.template.startTime, application.shift.template.endTime
    );
  });

  return assignmentConflicts.length > 0 || applicationConflicts.length > 0;
};

// Helper function to check if two time ranges overlap
const hasTimeOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
  // Convert times to minutes for easier comparison
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const start1Min = timeToMinutes(start1);
  let end1Min = timeToMinutes(end1);
  const start2Min = timeToMinutes(start2);
  let end2Min = timeToMinutes(end2);

  // Handle overnight shifts (end time < start time)
  if (end1Min < start1Min) {
    end1Min += 24 * 60; // Add 24 hours
  }
  if (end2Min < start2Min) {
    end2Min += 24 * 60; // Add 24 hours
  }

  // For overnight shifts, we need to check both the same day and next day scenarios
  if (end1Min >= 24 * 60 || end2Min >= 24 * 60) {
    // Complex overnight logic: check if ranges overlap
    // Shift 1: start1 to end1 (potentially spanning midnight)
    // Shift 2: start2 to end2 (potentially spanning midnight)
    
    // Simple overlap check: two time ranges overlap if
    // start1 < end2 AND start2 < end1
    return start1Min < end2Min && start2Min < end1Min;
  }

  // Regular same-day shifts
  return start1Min < end2Min && start2Min < end1Min;
};

// Helper function to check if staff has approved time-off on a given date
const checkTimeOffConflict = async (staffId: number, shiftDate: string): Promise<boolean> => {
  const approvedTimeOff = await timeOffRepository.find({
    where: {
      staffId,
      status: TimeOffStatus.APPROVED
    }
  });

  // Check if shift date falls within any approved time-off period
  return approvedTimeOff.some(timeOff => {
    return shiftDate >= timeOff.startDate && shiftDate <= timeOff.endDate;
  });
};

export const createShift = async (req: CreateShiftRequest, res: Response) => {
  try {
    if (!isManagerUser(req.currentUser!)) {
      return res.status(403).json({
        error: 'Access denied: Manager role required'
      });
    }

    const { shiftDate, templateId, requirements, notes } = req.body;

    // Validate template exists
    const template = await shiftTemplateRepository.findOne({
      where: { id: templateId }
    });

    if (!template) {
      return res.status(400).json({
        error: 'Shift template not found'
      });
    }

    // Check if shift already exists for this date and template
    const existingShift = await shiftRepository.findOne({
      where: { shiftDate, templateId }
    });

    if (existingShift) {
      return res.status(400).json({
        error: 'Shift already exists for this date and template'
      });
    }

    // Create shift
    const shift = new Shift();
    shift.shiftDate = shiftDate;
    shift.templateId = templateId;
    shift.notes = notes || null;

    const savedShift = await shiftRepository.save(shift);

    // Create shift requirements
    const shiftRequirements = requirements.map(req => {
      const requirement = new ShiftRequirement();
      requirement.shiftId = savedShift.id;
      requirement.roleName = req.roleName;
      requirement.requiredCount = req.requiredCount;
      return requirement;
    });

    await shiftRequirementRepository.save(shiftRequirements);

    return res.status(201).json({
      message: 'Shift created successfully',
      shift: {
        id: savedShift.id,
        shiftDate: savedShift.shiftDate,
        template: template.name,
        startTime: template.startTime,
        endTime: template.endTime,
        notes: savedShift.notes,
        requirements: shiftRequirements.map(req => ({
          id: req.id,
          roleName: req.roleName,
          requiredCount: req.requiredCount
        }))
      }
    });

  } catch (err) {
    const error = err as Error;
    console.error('Create shift error:', error);
    return res.status(500).json({
      error: 'Failed to create shift',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const getShifts = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!isStaffUser(req.currentUser!)) {
      return res.status(403).json({
        error: 'Access denied: Staff role required'
      });
    }

    const { startDate, endDate, templateId } = req.query;

    let queryBuilder = shiftRepository.createQueryBuilder('shift')
      .leftJoinAndSelect('shift.template', 'template')
      .leftJoinAndSelect('shift.requirements', 'requirements')
      .leftJoinAndSelect('shift.applications', 'applications')
      .leftJoinAndSelect('applications.staff', 'applicantStaff')
      .leftJoinAndSelect('shift.assignments', 'assignments')
      .leftJoinAndSelect('assignments.staff', 'assignedStaff')
      .leftJoinAndSelect('assignments.requirement', 'assignmentRequirement');

    if (startDate && endDate) {
      queryBuilder = queryBuilder.andWhere('shift.shiftDate BETWEEN :startDate AND :endDate', {
        startDate,
        endDate
      });
    }

    if (templateId) {
      queryBuilder = queryBuilder.andWhere('shift.templateId = :templateId', { templateId });
    }

    const shifts = await queryBuilder
      .orderBy('shift.shiftDate', 'ASC')
      .addOrderBy('template.startTime', 'ASC')
      .getMany();

    const shiftsWithDetails = shifts.map(shift => ({
      id: shift.id,
      shiftDate: shift.shiftDate,
      template: shift.template ? {
        id: shift.template.id,
        name: shift.template.name,
        startTime: shift.template.startTime,
        endTime: shift.template.endTime
      } : null,
      notes: shift.notes,
      requirements: shift.requirements.map(req => ({
        id: req.id,
        roleName: req.roleName,
        requiredCount: req.requiredCount,
        assignedCount: shift.assignments.filter(a => a.requirementId === req.id).length
      })),
      applications: shift.applications.map(app => ({
        id: app.id,
        staffId: app.staffId,
        staffName: app.staff ? `${app.staff.firstName} ${app.staff.lastName}` : 'Unknown Staff',
        desiredRequirementId: app.desiredRequirementId,
        status: app.status,
        appliedAt: app.appliedAt
      })),
      assignments: shift.assignments.map(assignment => ({
        id: assignment.id,
        staffId: assignment.staffId,
        staffName: assignment.staff ? `${assignment.staff.firstName} ${assignment.staff.lastName}` : 'Unknown Staff',
        roleName: assignment.requirement ? assignment.requirement.roleName : 'Unknown Role',
        assignedAt: assignment.assignedAt
      }))
    }));

    return res.status(200).json({
      message: 'Shifts retrieved successfully',
      shifts: shiftsWithDetails
    });

  } catch (err) {
    const error = err as Error;
    console.error('Get shifts error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve shifts',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const applyToShift = async (req: ApplyToShiftRequest, res: Response) => {
  try {
    if (!isStaffUser(req.currentUser!)) {
      return res.status(403).json({
        error: 'Access denied: Staff role required'
      });
    }

    const staffId = getUserIdFromToken(req.currentUser!);
    const shiftId = parseInt(req.params.shiftId);
    const { desiredRequirementId } = req.body;

    if (isNaN(shiftId)) {
      return res.status(400).json({
        error: 'Invalid shift ID'
      });
    }

    // Check if shift exists
    const shift = await shiftRepository.findOne({
      where: { id: shiftId },
      relations: ['template']
    });

    if (!shift) {
      return res.status(404).json({
        error: 'Shift not found'
      });
    }

    // Check if staff is already assigned to this shift
    const existingAssignment = await shiftAssignmentRepository.findOne({
      where: { shiftId, staffId }
    });

    if (existingAssignment) {
      return res.status(400).json({
        error: 'You are already assigned to this shift'
      });
    }

    // Check for overlapping shifts
    const hasOverlap = await checkOverlappingShifts(staffId, shift.shiftDate, shift.templateId);
    if (hasOverlap) {
      return res.status(400).json({
        error: 'You have conflicting shifts on this date'
      });
    }

    // Check for approved time-off conflicts
    const hasTimeOffConflict = await checkTimeOffConflict(staffId, shift.shiftDate);
    if (hasTimeOffConflict) {
      return res.status(400).json({
        error: 'You have approved time-off on this date'
      });
    }

    // Check if already applied
    const existingApplication = await shiftApplicationRepository.findOne({
      where: { shiftId, staffId }
    });

    if (existingApplication) {
      return res.status(400).json({
        error: 'You have already applied to this shift'
      });
    }

    // Note: We now allow multiple applications per user per date,
    // but still prevent time overlaps and duplicate applications to the same shift

    // Validate desired requirement if provided
    if (desiredRequirementId) {
      const requirement = await shiftRequirementRepository.findOne({
        where: { id: desiredRequirementId, shiftId }
      });

      if (!requirement) {
        return res.status(400).json({
          error: 'Invalid requirement for this shift'
        });
      }
    }

    // Create application (auto-approved)
    const application = new ShiftApplication();
    application.shiftId = shiftId;
    application.staffId = staffId;
    application.desiredRequirementId = desiredRequirementId || null;
    application.status = ShiftApplicationStatus.APPROVED;

    const savedApplication = await shiftApplicationRepository.save(application);

    return res.status(201).json({
      message: 'Application submitted successfully',
      application: {
        id: savedApplication.id,
        shiftId: savedApplication.shiftId,
        staffId: savedApplication.staffId,
        desiredRequirementId: savedApplication.desiredRequirementId,
        status: savedApplication.status,
        appliedAt: savedApplication.appliedAt
      }
    });

  } catch (err) {
    const error = err as Error;
    console.error('Apply to shift error:', error);
    console.error('Error stack:', error.stack);
    console.error('Request details:', {
      shiftId: parseInt(req.params.shiftId),
      staffId: getUserIdFromToken(req.currentUser!),
      desiredRequirementId: req.body.desiredRequirementId,
      url: req.url,
      method: req.method
    });
    return res.status(500).json({
      error: 'Failed to apply to shift',
      message: error.message || 'An unknown error occurred',
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};

export const getApplications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!isStaffUser(req.currentUser!)) {
      return res.status(403).json({
        error: 'Access denied: Staff role required'
      });
    }

    const applications = await shiftApplicationRepository.find({
      relations: ['shift', 'shift.template', 'staff', 'desiredRequirement'],
      order: { appliedAt: 'DESC' }
    });

    const applicationsWithDetails = applications.map(app => ({
      id: app.id,
      staffId: app.staffId,
      staffName: app.staff ? `${app.staff.firstName} ${app.staff.lastName}` : 'Unknown Staff',
      shift: app.shift ? {
        id: app.shift.id,
        shiftDate: app.shift.shiftDate,
        template: app.shift.template ? app.shift.template.name : 'Unknown Template',
        startTime: app.shift.template ? app.shift.template.startTime : '00:00',
        endTime: app.shift.template ? app.shift.template.endTime : '00:00'
      } : null,
      desiredRole: app.desiredRequirement?.roleName || null,
      status: app.status,
      appliedAt: app.appliedAt
    }));

    return res.status(200).json({
      message: 'Applications retrieved successfully',
      applications: applicationsWithDetails
    });

  } catch (err) {
    const error = err as Error;
    console.error('Get applications error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve applications',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const withdrawApplication = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!isStaffUser(req.currentUser!)) {
      return res.status(403).json({
        error: 'Access denied: Staff role required'
      });
    }

    const staffId = getUserIdFromToken(req.currentUser!);
    const applicationId = parseInt(req.params.applicationId);

    if (isNaN(applicationId)) {
      return res.status(400).json({
        error: 'Invalid application ID'
      });
    }

    const application = await shiftApplicationRepository.findOne({
      where: { id: applicationId }
    });

    if (!application) {
      return res.status(404).json({
        error: 'Application not found'
      });
    }

    // Only allow staff to withdraw their own applications
    if (!isManagerUser(req.currentUser!) && application.staffId !== staffId) {
      return res.status(403).json({
        error: 'You can only withdraw your own applications'
      });
    }

    // Cannot withdraw if already assigned
    const existingAssignment = await shiftAssignmentRepository.findOne({
      where: { shiftId: application.shiftId, staffId: application.staffId }
    });

    if (existingAssignment) {
      return res.status(400).json({
        error: 'Cannot withdraw application - you are already assigned to this shift'
      });
    }

    application.status = ShiftApplicationStatus.WITHDRAWN;
    await shiftApplicationRepository.save(application);

    return res.status(200).json({
      message: 'Application withdrawn successfully'
    });

  } catch (err) {
    const error = err as Error;
    console.error('Withdraw application error:', error);
    return res.status(500).json({
      error: 'Failed to withdraw application',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const assignStaffToShift = async (req: AssignStaffRequest, res: Response) => {
  try {
    if (!isManagerUser(req.currentUser!)) {
      return res.status(403).json({
        error: 'Access denied: Manager role required'
      });
    }

    const shiftId = parseInt(req.params.shiftId);
    const { staffId, requirementId } = req.body;

    if (isNaN(shiftId)) {
      return res.status(400).json({
        error: 'Invalid shift ID'
      });
    }

    // Validate shift exists
    const shift = await shiftRepository.findOne({
      where: { id: shiftId },
      relations: ['template']
    });

    if (!shift) {
      return res.status(404).json({
        error: 'Shift not found'
      });
    }

    // Validate staff exists and has staff role
    const staff = await userRepository.findOne({
      where: { id: staffId }
    });

    if (!staff || !staff.roles.some(role => ['staff', 'manager', 'admin'].includes(role))) {
      return res.status(400).json({
        error: 'Invalid staff member'
      });
    }

    // Validate requirement exists for this shift
    const requirement = await shiftRequirementRepository.findOne({
      where: { id: requirementId, shiftId }
    });

    if (!requirement) {
      return res.status(400).json({
        error: 'Invalid requirement for this shift'
      });
    }

    // Check if staff is already assigned to this shift
    const existingAssignment = await shiftAssignmentRepository.findOne({
      where: { shiftId, staffId }
    });

    if (existingAssignment) {
      return res.status(400).json({
        error: 'Staff member is already assigned to this shift'
      });
    }

    // Check for overlapping shifts
    const hasOverlap = await checkOverlappingShifts(staffId, shift.shiftDate, shift.templateId);
    if (hasOverlap) {
      return res.status(400).json({
        error: 'Staff member has conflicting shifts on this date'
      });
    }

    // Check for approved time-off conflicts
    const hasTimeOffConflict = await checkTimeOffConflict(staffId, shift.shiftDate);
    if (hasTimeOffConflict) {
      return res.status(400).json({
        error: 'Staff member has approved time-off on this date'
      });
    }

    // Check if role is already fully staffed
    const currentAssignments = await shiftAssignmentRepository.count({
      where: { requirementId }
    });

    if (currentAssignments >= requirement.requiredCount) {
      return res.status(400).json({
        error: 'This role is already fully staffed'
      });
    }

    // Create assignment
    const assignment = new ShiftAssignment();
    assignment.shiftId = shiftId;
    assignment.requirementId = requirementId;
    assignment.staffId = staffId;

    const savedAssignment = await shiftAssignmentRepository.save(assignment);

    return res.status(201).json({
      message: 'Staff assigned successfully',
      assignment: {
        id: savedAssignment.id,
        shiftId: savedAssignment.shiftId,
        staffId: savedAssignment.staffId,
        staffName: `${staff.firstName} ${staff.lastName}`,
        roleName: requirement.roleName,
        assignedAt: savedAssignment.assignedAt
      }
    });

  } catch (err) {
    const error = err as Error;
    console.error('Assign staff error:', error);
    return res.status(500).json({
      error: 'Failed to assign staff',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const getAssignments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!isManagerUser(req.currentUser!)) {
      return res.status(403).json({
        error: 'Access denied: Manager role required'
      });
    }

    const assignments = await shiftAssignmentRepository.find({
      relations: ['shift', 'shift.template', 'staff', 'requirement'],
      order: { assignedAt: 'DESC' }
    });

    const assignmentsWithDetails = assignments.map(assignment => ({
      id: assignment.id,
      staffId: assignment.staffId,
      staffName: assignment.staff ? `${assignment.staff.firstName} ${assignment.staff.lastName}` : 'Unknown Staff',
      shift: assignment.shift ? {
        id: assignment.shift.id,
        shiftDate: assignment.shift.shiftDate,
        template: assignment.shift.template ? assignment.shift.template.name : 'Unknown Template',
        startTime: assignment.shift.template ? assignment.shift.template.startTime : '00:00',
        endTime: assignment.shift.template ? assignment.shift.template.endTime : '00:00'
      } : null,
      roleName: assignment.requirement ? assignment.requirement.roleName : 'Unknown Role',
      assignedAt: assignment.assignedAt
    }));

    return res.status(200).json({
      message: 'Assignments retrieved successfully',
      assignments: assignmentsWithDetails
    });

  } catch (err) {
    const error = err as Error;
    console.error('Get assignments error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve assignments',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const getMyAssignments = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!isStaffUser(req.currentUser!)) {
      return res.status(403).json({
        error: 'Access denied: Staff role required'
      });
    }

    const userId = getUserIdFromToken(req.currentUser!);
    
    // Get current user to check their worker roles
    const currentUser = await userRepository.findOne({ 
      where: { id: userId } 
    });

    if (!currentUser) {
      return res.status(404).json({
        error: 'User not found'
      });
    }

    // Get user's assignments from today onwards
    const today = new Date().toISOString().split('T')[0];
    
    const assignments = await shiftAssignmentRepository.find({
      where: { 
        staffId: userId,
      },
      relations: ['shift', 'shift.template', 'staff', 'requirement'],
      order: { assignedAt: 'DESC' }
    });

    // Filter assignments to only show future ones and ones matching user's worker roles
    const filteredAssignments = assignments.filter(assignment => {
      // Only show assignments from today onwards
      if (assignment.shift && assignment.shift.shiftDate < today) {
        return false;
      }
      
      // Only show assignments that match user's worker roles (Option B)
      if (currentUser.workerRoles && assignment.requirement) {
        return currentUser.workerRoles.includes(assignment.requirement.roleName.toLowerCase());
      }
      
      return true; // If no worker roles defined, show all assignments
    });

    const assignmentsWithDetails = filteredAssignments.map(assignment => ({
      id: assignment.id,
      staffId: assignment.staffId,
      staffName: assignment.staff ? `${assignment.staff.firstName} ${assignment.staff.lastName}` : 'Unknown Staff',
      shift: assignment.shift ? {
        id: assignment.shift.id,
        shiftDate: assignment.shift.shiftDate,
        template: assignment.shift.template ? assignment.shift.template.name : 'Unknown Template',
        startTime: assignment.shift.template ? assignment.shift.template.startTime : '00:00',
        endTime: assignment.shift.template ? assignment.shift.template.endTime : '00:00'
      } : null,
      roleName: assignment.requirement ? assignment.requirement.roleName : 'Unknown Role',
      assignedAt: assignment.assignedAt
    }));

    return res.status(200).json({
      message: 'My assignments retrieved successfully',
      assignments: assignmentsWithDetails
    });

  } catch (err) {
    const error = err as Error;
    console.error('Get my assignments error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve my assignments',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const removeAssignment = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!isManagerUser(req.currentUser!)) {
      return res.status(403).json({
        error: 'Access denied: Manager role required'
      });
    }

    const assignmentId = parseInt(req.params.assignmentId);

    if (isNaN(assignmentId)) {
      return res.status(400).json({
        error: 'Invalid assignment ID'
      });
    }

    const assignment = await shiftAssignmentRepository.findOne({
      where: { id: assignmentId }
    });

    if (!assignment) {
      return res.status(404).json({
        error: 'Assignment not found'
      });
    }

    await shiftAssignmentRepository.remove(assignment);

    return res.status(200).json({
      message: 'Assignment removed successfully'
    });

  } catch (err) {
    const error = err as Error;
    console.error('Remove assignment error:', error);
    return res.status(500).json({
      error: 'Failed to remove assignment',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const declineApplication = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!isManagerUser(req.currentUser!)) {
      return res.status(403).json({
        error: 'Access denied: Manager role required'
      });
    }

    const applicationId = parseInt(req.params.applicationId);

    if (isNaN(applicationId)) {
      return res.status(400).json({
        error: 'Invalid application ID'
      });
    }

    const application = await shiftApplicationRepository.findOne({
      where: { id: applicationId }
    });

    if (!application) {
      return res.status(404).json({
        error: 'Application not found'
      });
    }

    // Cannot decline if already assigned
    const existingAssignment = await shiftAssignmentRepository.findOne({
      where: { shiftId: application.shiftId, staffId: application.staffId }
    });

    if (existingAssignment) {
      return res.status(400).json({
        error: 'Cannot decline application - staff is already assigned to this shift'
      });
    }

    application.status = ShiftApplicationStatus.REJECTED;
    await shiftApplicationRepository.save(application);

    return res.status(200).json({
      message: 'Application declined successfully'
    });

  } catch (err) {
    const error = err as Error;
    console.error('Decline application error:', error);
    return res.status(500).json({
      error: 'Failed to decline application',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const getWeeklySchedule = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!isStaffUser(req.currentUser!)) {
      return res.status(403).json({
        error: 'Access denied: Staff role required'
      });
    }

    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Start date and end date are required'
      });
    }

    const shifts = await shiftRepository.find({
      where: {
        shiftDate: Between(startDate as string, endDate as string)
      },
      relations: ['template', 'requirements', 'assignments', 'assignments.staff', 'assignments.requirement'],
      order: { shiftDate: 'ASC' }
    });

    // Group shifts by date
    const scheduleByDate: { [date: string]: any } = {};

    shifts.forEach(shift => {
      if (!scheduleByDate[shift.shiftDate]) {
        scheduleByDate[shift.shiftDate] = {
          date: shift.shiftDate,
          evening: null,
          night: null,
          early_morning: null
        };
      }

      const shiftData = {
        id: shift.id,
        startTime: shift.template.startTime,
        endTime: shift.template.endTime,
        notes: shift.notes,
        requirements: shift.requirements.map(req => ({
          id: req.id,
          roleName: req.roleName,
          requiredCount: req.requiredCount,
          assignedCount: shift.assignments.filter(a => a.requirementId === req.id).length
        })),
        assignments: shift.assignments.map(assignment => ({
          id: assignment.id,
          staffId: assignment.staffId,
          staffName: `${assignment.staff.firstName} ${assignment.staff.lastName}`,
          roleName: assignment.requirement.roleName
        }))
      };

      const templateName = shift.template.name.toLowerCase();
      if (templateName === ShiftTiming.EVENING) {
        scheduleByDate[shift.shiftDate].evening = shiftData;
      } else if (templateName === ShiftTiming.MIDNIGHT) {
        scheduleByDate[shift.shiftDate].night = shiftData;
      } else if (templateName === ShiftTiming.EARLY_MORNING) {
        scheduleByDate[shift.shiftDate].early_morning = shiftData;
      }
    });

    const schedule = Object.values(scheduleByDate);

    return res.status(200).json({
      message: 'Weekly schedule retrieved successfully',
      schedule: {
        startDate,
        endDate,
        days: schedule
      }
    });

  } catch (err) {
    const error = err as Error;
    console.error('Get weekly schedule error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve weekly schedule',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const getAllStaff = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Get all users who have staff-related roles (not just customers)
    const staff = await userRepository.find({
      where: {
        roles: Raw(alias => `${alias} && ARRAY['staff', 'manager', 'admin']::text[]`)
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        roles: true,
        staffStatus: true,
        workerRoles: true,
        weeklyAvailability: true,
        createdAt: true
      },
      order: {
        lastName: 'ASC',
        firstName: 'ASC'
      }
    });

    const formattedStaff = staff.map(member => ({
      id: member.id,
      name: `${member.firstName} ${member.lastName}`,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      roles: member.roles,
      staffStatus: member.staffStatus,
      workerRoles: member.workerRoles || [],
      weeklyAvailability: member.weeklyAvailability,
      createdAt: member.createdAt
    }));

    res.json({ 
      staff: formattedStaff,
      total: formattedStaff.length 
    });

  } catch (error) {
    console.error('Error fetching staff list:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAllApplicationsForManager = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!isManagerUser(req.currentUser!)) {
      return res.status(403).json({
        error: 'Access denied: Manager role required'
      });
    }

    const applications = await shiftApplicationRepository.find({
      relations: ['shift', 'shift.template', 'staff', 'desiredRequirement'],
      order: { appliedAt: 'DESC' }
    });

    const applicationsWithDetails = applications.map(app => ({
      id: app.id,
      staffId: app.staffId,
      staffName: app.staff ? `${app.staff.firstName} ${app.staff.lastName}` : 'Unknown Staff',
      staffWorkerRoles: app.staff?.workerRoles || [],
      shift: app.shift ? {
        id: app.shift.id,
        shiftDate: app.shift.shiftDate,
        template: app.shift.template ? {
          name: app.shift.template.name,
          startTime: app.shift.template.startTime,
          endTime: app.shift.template.endTime
        } : null
      } : null,
      desiredRole: app.desiredRequirement?.roleName || null,
      desiredRequirementId: app.desiredRequirementId,
      status: app.status,
      appliedAt: app.appliedAt,
      hasTimeConflict: false // Will be calculated if needed
    }));

    return res.status(200).json({
      message: 'Applications retrieved successfully',
      applications: applicationsWithDetails
    });

  } catch (err) {
    const error = err as Error;
    console.error('Get all applications error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve applications',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const approveAndAssignApplication = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!isManagerUser(req.currentUser!)) {
      return res.status(403).json({
        error: 'Access denied: Manager role required'
      });
    }

    const applicationId = parseInt(req.params.applicationId);

    if (isNaN(applicationId)) {
      return res.status(400).json({
        error: 'Invalid application ID'
      });
    }

    const application = await shiftApplicationRepository.findOne({
      where: { id: applicationId },
      relations: ['shift', 'shift.template', 'staff', 'desiredRequirement']
    });

    if (!application) {
      return res.status(404).json({
        error: 'Application not found'
      });
    }

    if (application.status !== ShiftApplicationStatus.APPLIED) {
      return res.status(400).json({
        error: 'Application has already been processed'
      });
    }

    // Check for time conflicts - block if conflicts exist
    const hasConflicts = application.shift.template ? 
      await checkOverlappingShifts(
        application.staffId,
        application.shift.shiftDate,
        application.shift.template.id
      ) : false;

    if (hasConflicts) {
      return res.status(400).json({
        error: 'Cannot approve application - staff member has time conflicts with existing assignments'
      });
    }

    // Check if staff is already assigned to this shift
    const existingAssignment = await shiftAssignmentRepository.findOne({
      where: { shiftId: application.shiftId, staffId: application.staffId }
    });

    if (existingAssignment) {
      return res.status(400).json({
        error: 'Staff member is already assigned to this shift'
      });
    }

    // Validate the desired requirement still exists and is available
    if (!application.desiredRequirementId) {
      return res.status(400).json({
        error: 'Application does not specify a desired role'
      });
    }

    const requirement = await shiftRequirementRepository.findOne({
      where: { id: application.desiredRequirementId, shiftId: application.shiftId }
    });

    if (!requirement) {
      return res.status(400).json({
        error: 'Desired requirement no longer exists for this shift'
      });
    }

    // Check if requirement is already filled
    const existingAssignments = await shiftAssignmentRepository.count({
      where: { requirementId: application.desiredRequirementId }
    });

    if (existingAssignments >= requirement.requiredCount) {
      return res.status(400).json({
        error: 'This role is already fully staffed for this shift'
      });
    }

    // Verify staff has the required worker role
    if (!application.staff?.workerRoles?.includes(requirement.roleName)) {
      return res.status(400).json({
        error: `Staff member does not have the required '${requirement.roleName}' role`
      });
    }

    // All validations passed - approve and assign
    application.status = ShiftApplicationStatus.APPROVED;
    await shiftApplicationRepository.save(application);

    // Create assignment
    const assignment = shiftAssignmentRepository.create({
      shiftId: application.shiftId,
      requirementId: application.desiredRequirementId,
      staffId: application.staffId,
      assignedAt: new Date()
    });

    await shiftAssignmentRepository.save(assignment);

    return res.status(200).json({
      message: 'Application approved and staff assigned successfully',
      applicationId: application.id,
      assignmentId: assignment.id
    });

  } catch (err) {
    const error = err as Error;
    console.error('Approve and assign application error:', error);
    return res.status(500).json({
      error: 'Failed to approve and assign application',
      message: error.message || 'An unknown error occurred'
    });
  }
};