import { Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { TimeOffRequest, User } from '../models';
import { AppDataSource } from '../data-source';
import { TimeOffStatus, StaffStatus } from '../models/enums';

const timeOffRepository = AppDataSource.getRepository(TimeOffRequest);
const userRepository = AppDataSource.getRepository(User);

interface AuthenticatedRequest extends Request {
  currentUser?: string | JwtPayload;
}

interface CreateTimeOffRequest extends AuthenticatedRequest {
  body: {
    startDate: string;
    endDate: string;
    reason?: string;
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

// Helper function to update staff status when time-off is approved
const updateStaffStatusForTimeOff = async (staffId: number, startDate: string, endDate: string): Promise<void> => {
  // Note: This is a simplified implementation
  // In a full system, you might want a more sophisticated approach
  // to handle overlapping time-off periods and automatic status updates
  
  const user = await userRepository.findOne({ where: { id: staffId } });
  if (user) {
    // For now, we'll set the status to UNAVAILABLE
    // In a production system, you might want to store time-off periods
    // and check them dynamically when assigning shifts
    user.staffStatus = StaffStatus.UNAVAILABLE;
    await userRepository.save(user);
  }
};

export const createTimeOffRequest = async (req: CreateTimeOffRequest, res: Response) => {
  try {
    if (!isStaffUser(req.currentUser!)) {
      return res.status(403).json({
        error: 'Access denied: Staff role required'
      });
    }

    const userId = getUserIdFromToken(req.currentUser!);
    const { startDate, endDate, reason } = req.body;

    // Validate required fields
    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Start date and end date are required'
      });
    }

    // Validate date format and logic
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        error: 'Invalid date format. Use YYYY-MM-DD'
      });
    }

    if (start >= end) {
      return res.status(400).json({
        error: 'End date must be after start date'
      });
    }

    // Create time-off request
    const timeOffRequest = new TimeOffRequest();
    timeOffRequest.staffId = userId;
    timeOffRequest.startDate = startDate;
    timeOffRequest.endDate = endDate;
    timeOffRequest.reason = reason || null;
    timeOffRequest.status = TimeOffStatus.PENDING;

    const savedRequest = await timeOffRepository.save(timeOffRequest);

    // Fetch the staff information separately
    const staff = await userRepository.findOne({
      where: { id: userId }
    });

    if (!staff) {
      return res.status(404).json({
        error: 'Staff member not found'
      });
    }

    return res.status(201).json({
      message: 'Time-off request submitted successfully',
      request: {
        id: savedRequest.id,
        staffId: savedRequest.staffId,
        staffName: `${staff.firstName} ${staff.lastName}`,
        startDate: savedRequest.startDate,
        endDate: savedRequest.endDate,
        reason: savedRequest.reason,
        status: savedRequest.status,
        requestedAt: savedRequest.requestedAt
      }
    });

  } catch (err) {
    const error = err as Error;
    console.error('Create time-off request error:', error);
    return res.status(500).json({
      error: 'Failed to create time-off request',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const getTimeOffRequests = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!isStaffUser(req.currentUser!)) {
      return res.status(403).json({
        error: 'Access denied: Staff role required'
      });
    }

    const { status, startDate, endDate } = req.query;

    let queryBuilder = timeOffRepository.createQueryBuilder('timeoff');

    // Filter by status if provided
    if (status && typeof status === 'string') {
      queryBuilder = queryBuilder.andWhere('timeoff.status = :status', { status });
    }

    // Filter by date range if provided
    if (startDate && endDate) {
      queryBuilder = queryBuilder.andWhere(
        '(timeoff.startDate <= :endDate AND timeoff.endDate >= :startDate)',
        { startDate, endDate }
      );
    }

    const requests = await queryBuilder
      .orderBy('timeoff.requestedAt', 'DESC')
      .getMany();

    // Get staff information for each request
    const staffIds = [...new Set(requests.map(r => r.staffId))];
    const staffMembers = await userRepository.findByIds(staffIds);
    const staffMap = new Map(staffMembers.map(staff => [staff.id, staff]));

    const formattedRequests = requests.map(request => {
      const staff = staffMap.get(request.staffId);
      return {
        id: request.id,
        staffId: request.staffId,
        staffName: staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown Staff',
        startDate: request.startDate,
        endDate: request.endDate,
        reason: request.reason,
        status: request.status,
        requestedAt: request.requestedAt,
        decidedAt: request.decidedAt
      };
    });

    return res.status(200).json({
      message: 'Time-off requests retrieved successfully',
      requests: formattedRequests
    });

  } catch (err) {
    const error = err as Error;
    console.error('Get time-off requests error:', error);
    return res.status(500).json({
      error: 'Failed to retrieve time-off requests',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const withdrawTimeOffRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!isStaffUser(req.currentUser!)) {
      return res.status(403).json({
        error: 'Access denied: Staff role required'
      });
    }

    const userId = getUserIdFromToken(req.currentUser!);
    const requestId = parseInt(req.params.requestId);

    if (isNaN(requestId)) {
      return res.status(400).json({
        error: 'Invalid request ID'
      });
    }

    // Find the request
    const timeOffRequest = await timeOffRepository.findOne({
      where: { id: requestId }
    });

    if (!timeOffRequest) {
      return res.status(404).json({
        error: 'Time-off request not found'
      });
    }

    // Check if user owns this request (managers can withdraw any request)
    const isManager = isManagerUser(req.currentUser!);
    if (!isManager && timeOffRequest.staffId !== userId) {
      return res.status(403).json({
        error: 'You can only withdraw your own requests'
      });
    }

    // Check if request can be withdrawn
    if (timeOffRequest.status !== TimeOffStatus.PENDING) {
      return res.status(400).json({
        error: 'Only pending requests can be withdrawn'
      });
    }

    // Delete the request (withdrawal)
    await timeOffRepository.remove(timeOffRequest);

    return res.status(200).json({
      message: 'Time-off request withdrawn successfully'
    });

  } catch (err) {
    const error = err as Error;
    console.error('Withdraw time-off request error:', error);
    return res.status(500).json({
      error: 'Failed to withdraw time-off request',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const approveTimeOffRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!isManagerUser(req.currentUser!)) {
      return res.status(403).json({
        error: 'Access denied: Manager or Admin role required'
      });
    }

    const managerId = getUserIdFromToken(req.currentUser!);
    const requestId = parseInt(req.params.requestId);

    if (isNaN(requestId)) {
      return res.status(400).json({
        error: 'Invalid request ID'
      });
    }

    // Find the request
    const timeOffRequest = await timeOffRepository.findOne({
      where: { id: requestId },
      relations: ['staff']
    });

    if (!timeOffRequest) {
      return res.status(404).json({
        error: 'Time-off request not found'
      });
    }

    // Check if request can be approved
    if (timeOffRequest.status !== TimeOffStatus.PENDING) {
      return res.status(400).json({
        error: 'Only pending requests can be approved'
      });
    }

    // Update request status
    timeOffRequest.status = TimeOffStatus.APPROVED;
    timeOffRequest.managerId = managerId;
    timeOffRequest.decidedAt = new Date();

    await timeOffRepository.save(timeOffRequest);

    // Update staff status to UNAVAILABLE
    await updateStaffStatusForTimeOff(
      timeOffRequest.staffId,
      timeOffRequest.startDate,
      timeOffRequest.endDate
    );

    // Get staff info for response
    const staff = await userRepository.findOne({ where: { id: timeOffRequest.staffId } });

    return res.status(200).json({
      message: 'Time-off request approved successfully',
      request: {
        id: timeOffRequest.id,
        staffId: timeOffRequest.staffId,
        staffName: staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown Staff',
        startDate: timeOffRequest.startDate,
        endDate: timeOffRequest.endDate,
        reason: timeOffRequest.reason,
        status: timeOffRequest.status,
        requestedAt: timeOffRequest.requestedAt,
        decidedAt: timeOffRequest.decidedAt
      }
    });

  } catch (err) {
    const error = err as Error;
    console.error('Approve time-off request error:', error);
    return res.status(500).json({
      error: 'Failed to approve time-off request',
      message: error.message || 'An unknown error occurred'
    });
  }
};

export const denyTimeOffRequest = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!isManagerUser(req.currentUser!)) {
      return res.status(403).json({
        error: 'Access denied: Manager or Admin role required'
      });
    }

    const managerId = getUserIdFromToken(req.currentUser!);
    const requestId = parseInt(req.params.requestId);

    if (isNaN(requestId)) {
      return res.status(400).json({
        error: 'Invalid request ID'
      });
    }

    // Find the request
    const timeOffRequest = await timeOffRepository.findOne({
      where: { id: requestId },
      relations: ['staff']
    });

    if (!timeOffRequest) {
      return res.status(404).json({
        error: 'Time-off request not found'
      });
    }

    // Check if request can be denied
    if (timeOffRequest.status !== TimeOffStatus.PENDING) {
      return res.status(400).json({
        error: 'Only pending requests can be denied'
      });
    }

    // Update request status
    timeOffRequest.status = TimeOffStatus.DENIED;
    timeOffRequest.managerId = managerId;
    timeOffRequest.decidedAt = new Date();

    await timeOffRepository.save(timeOffRequest);

    // Get staff info for response
    const staff = await userRepository.findOne({ where: { id: timeOffRequest.staffId } });

    return res.status(200).json({
      message: 'Time-off request denied',
      request: {
        id: timeOffRequest.id,
        staffId: timeOffRequest.staffId,
        staffName: staff ? `${staff.firstName} ${staff.lastName}` : 'Unknown Staff',
        startDate: timeOffRequest.startDate,
        endDate: timeOffRequest.endDate,
        reason: timeOffRequest.reason,
        status: timeOffRequest.status,
        requestedAt: timeOffRequest.requestedAt,
        decidedAt: timeOffRequest.decidedAt
      }
    });

  } catch (err) {
    const error = err as Error;
    console.error('Deny time-off request error:', error);
    return res.status(500).json({
      error: 'Failed to deny time-off request',
      message: error.message || 'An unknown error occurred'
    });
  }
};