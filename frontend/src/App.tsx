import { Route, Routes } from "react-router-dom";

import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import BlogPage from "@/pages/blog";
import AboutPage from "@/pages/about";
import LoginPage from "./pages/login";
import RegisterPage from "./pages/register";
import DashboardPage from "./pages/dashboard";
import StaffDashboard from "./pages/staffDashboard";
import StaffShifts from "./pages/staffShifts";
import StaffLoginPage from './pages/staffLogin';
import ManagerDashboard from './pages/managerDashboard';
import ManagerMenu from './pages/managerMenu';
import ManagerStaff from './pages/managerStaff';
import ManagerShifts from './pages/managerShifts';
import ManagerAnalytics from './pages/managerAnalytics';
import ProtectedRoute from './components/ProtectedRoute';
import NotFound from './pages/notFound';

function App() {
  return (
    <Routes>
      <Route element={<IndexPage />} path="/" />
      <Route element={<LoginPage/>} path="/login"/>
      <Route element={<StaffLoginPage/>} path="/portal"/>
      <Route element={<RegisterPage/>} path="/register"/>
      <Route 
        element={<ProtectedRoute allowedRoles={['customer']} element={<DashboardPage/>} />} 
        path="/dashboard" 
      />
      <Route 
        element={<ProtectedRoute allowedRoles={['staff','manager','admin']} element={<StaffDashboard/>} />} 
        path="/staff" 
      />
      <Route 
        element={<ProtectedRoute allowedRoles={['staff']} element={<StaffShifts/>} />} 
        path="/staff/shifts" 
      />
      <Route 
        element={<ProtectedRoute allowedRoles={['manager','admin']} element={<ManagerDashboard/>} />} 
        path="/manager" 
      />
      <Route 
        element={<ProtectedRoute allowedRoles={['manager','admin']} element={<ManagerMenu/>} />} 
        path="/manager/menu" 
      />
      <Route 
        element={<ProtectedRoute allowedRoles={['manager','admin']} element={<ManagerStaff/>} />} 
        path="/manager/staff" 
      />
      <Route 
        element={<ProtectedRoute allowedRoles={['manager','admin']} element={<ManagerShifts/>} />} 
        path="/manager/shifts" 
      />
      <Route 
        element={<ProtectedRoute allowedRoles={['manager','admin']} element={<ManagerAnalytics/>} />} 
        path="/manager/analytics" 
      />
      <Route element={<DocsPage />} path="/docs" />
      <Route element={<PricingPage />} path="/pricing" />
      <Route element={<BlogPage />} path="/blog" />
      <Route element={<AboutPage />} path="/about" />
      <Route element={<NotFound />} path="*" />
    </Routes>
  );
}

export default App;
