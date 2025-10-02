import { Router } from "express";
import { authentication } from "../middleware/authmiddleware";
import { requireManagerOrAdmin } from "../middleware/roleMiddleware";
import { 
  getMenuPerformance,
  getStaffUtilization,
  getRevenueAnalytics,
  getSystemUsage
} from "../controllers/analytics";

const analyticsRouter = Router();

// Analytics endpoints - Manager/Admin only
analyticsRouter.get("/menu-performance", authentication, requireManagerOrAdmin, getMenuPerformance);
analyticsRouter.get("/staff-utilization", authentication, requireManagerOrAdmin, getStaffUtilization);
analyticsRouter.get("/revenue", authentication, requireManagerOrAdmin, getRevenueAnalytics);
analyticsRouter.get("/system-usage", authentication, requireManagerOrAdmin, getSystemUsage);

export default analyticsRouter;