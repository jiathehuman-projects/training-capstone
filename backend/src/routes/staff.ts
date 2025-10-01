import { Router } from "express";
import { authentication } from "../middleware/authmiddleware";
import { requireManagerOrAdmin } from "../middleware/roleMiddleware";
import { 
  createShift,
  getShifts,
  applyToShift,
  getApplications,
  withdrawApplication,
  assignStaffToShift,
  getAssignments,
  getMyAssignments,
  removeAssignment,
  declineApplication,
  getWeeklySchedule,
  getAllStaff
} from "../controllers/staff";
import {
  createTimeOffRequest,
  getTimeOffRequests,
  withdrawTimeOffRequest,
  approveTimeOffRequest,
  denyTimeOffRequest
} from "../controllers/timeoff";

const staffRouter = Router();

/**
 * @swagger
 * tags:
 *   - name: Staff Management
 *     description: Staff scheduling and shift management endpoints
 */

// Staff endpoints - require staff role or higher
staffRouter.post("/shift/:shiftId/apply", authentication, applyToShift);
staffRouter.get("/application", authentication, getApplications);
staffRouter.delete("/application/:applicationId", authentication, withdrawApplication);
staffRouter.get("/my-assignments", authentication, getMyAssignments);
staffRouter.get("/schedule/weekly", authentication, getWeeklySchedule);
staffRouter.get("/shift", authentication, getShifts);

// Manager endpoints - staff can still access all assignments
staffRouter.get("/assignment", authentication, getAssignments);

// Manager endpoints - require manager role or higher
staffRouter.get("/all", authentication, requireManagerOrAdmin, getAllStaff);
staffRouter.post("/shift", authentication, requireManagerOrAdmin, createShift);
staffRouter.post("/shift/:shiftId/assign", authentication, requireManagerOrAdmin, assignStaffToShift);
staffRouter.delete("/assignment/:assignmentId", authentication, requireManagerOrAdmin, removeAssignment);
staffRouter.put("/application/:applicationId/decline", authentication, requireManagerOrAdmin, declineApplication);

// Time-off endpoints - staff can view/create/withdraw, managers can approve/deny
staffRouter.post("/timeoff", authentication, createTimeOffRequest);
staffRouter.get("/timeoff", authentication, getTimeOffRequests);
staffRouter.delete("/timeoff/:requestId", authentication, withdrawTimeOffRequest);
staffRouter.put("/timeoff/:requestId/approve", authentication, requireManagerOrAdmin, approveTimeOffRequest);
staffRouter.put("/timeoff/:requestId/deny", authentication, requireManagerOrAdmin, denyTimeOffRequest);

export default staffRouter;