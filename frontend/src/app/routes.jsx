import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Login from "../modules/auth/Login";
import Dashboard from "../modules/dashboard/Dashboard";
import Officers from "../modules/officers/Officers";
import Firs from "../modules/firs/Firs";
import FirDetails from "../modules/firs/FirDetails";
import CaseTimeline from "../modules/caseTimeline/CaseTimeline";
import Complaints from "../modules/complaints/Complaints";
import ComplaintDetails from "../modules/complaints/ComplaintDetails";
import Heatmap from "../modules/heatmap/Heatmap";
import Analytics from "../modules/analytics/Analytics";
import CivilianAnalytics from "../modules/civilian/CivilianAnalytics";
import CivilianDashboard from "../modules/civilian/CivilianDashboard";
import CivilianLogin from "../modules/civilian/CivilianLogin";
import CivilianSignup from "../modules/civilian/CivilianSignup";

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
};

const ProtectedRoute = ({ children, roles }) => {
  const token = localStorage.getItem("token");
  const user = readUser();

  if (!token || user?.type === "CIVILIAN") return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;

  return <Layout>{children}</Layout>;
};

const CivilianProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = readUser();

  return token && user?.type === "CIVILIAN" ? <Layout>{children}</Layout> : <Navigate to="/civilian/login" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="/login" element={<Login />} />
    <Route path="/civilian/login" element={<CivilianLogin />} />
    <Route path="/civilian/signup" element={<CivilianSignup />} />
    <Route path="/civilian/dashboard" element={<CivilianProtectedRoute><CivilianDashboard /></CivilianProtectedRoute>} />
    <Route path="/civilian/analytics" element={<CivilianProtectedRoute><CivilianAnalytics /></CivilianProtectedRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/officers" element={<ProtectedRoute roles={["ADMIN"]}><Officers /></ProtectedRoute>} />
    <Route path="/firs" element={<ProtectedRoute roles={["ADMIN", "SP", "INSPECTOR", "CONSTABLE"]}><Firs /></ProtectedRoute>} />
    <Route path="/firs/:id" element={<ProtectedRoute><FirDetails /></ProtectedRoute>} />
    <Route path="/case-timeline/:firId" element={<ProtectedRoute><CaseTimeline /></ProtectedRoute>} />
    <Route path="/complaints" element={<ProtectedRoute roles={["ADMIN", "SP", "INSPECTOR"]}><Complaints /></ProtectedRoute>} />
    <Route path="/complaints/:id" element={<ProtectedRoute roles={["ADMIN", "SP", "INSPECTOR"]}><ComplaintDetails /></ProtectedRoute>} />
    <Route path="/heatmap" element={<ProtectedRoute roles={["ADMIN", "SP"]}><Heatmap /></ProtectedRoute>} />
    <Route path="/analytics" element={<ProtectedRoute roles={["ADMIN", "SP"]}><Analytics /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;
