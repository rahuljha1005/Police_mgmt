import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Login from "../modules/auth/Login";
import PolicePasswordReset from "../modules/auth/PolicePasswordReset";
import PortalLanding from "../modules/auth/PortalLanding";
import Dashboard from "../modules/dashboard/Dashboard";
import Officers from "../modules/officers/Officers";
import Firs from "../modules/firs/Firs";
import FirDetails from "../modules/firs/FirDetails";
import CaseTimeline from "../modules/caseTimeline/CaseTimeline";
import Complaints from "../modules/complaints/Complaints";
import ComplaintDetails from "../modules/complaints/ComplaintDetails";
import Analytics from "../modules/analytics/Analytics";
import CivilianAnalytics from "../modules/civilian/CivilianAnalytics";
import CivilianDashboard from "../modules/civilian/CivilianDashboard";
import CivilianEmergency from "../modules/civilian/CivilianEmergency";
import CivilianLogin from "../modules/civilian/CivilianLogin";
import CivilianSignup from "../modules/civilian/CivilianSignup";
import PoliceEmergencies from "../modules/emergencies/PoliceEmergencies";
import PublicSafetyDashboard from "../modules/publicSafety/PublicSafetyDashboard";
import TransferDashboard from "../modules/transfers/TransferDashboard";

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

  if (!token || user?.type === "CIVILIAN") return <Navigate to="/police/login" replace />;
  if (user?.isFirstLogin && window.location.pathname !== "/police/reset-password") {
    return <Navigate to="/police/reset-password" replace />;
  }
  if (roles && !roles.includes(user?.role)) return <Navigate to="/dashboard" replace />;

  return <Layout>{children}</Layout>;
};

const CivilianProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = readUser();

  return token && user?.type === "CIVILIAN" ? <Layout>{children}</Layout> : <Navigate to="/civilian/login" replace />;
};

const PoliceResetRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user = readUser();

  if (!token || user?.type !== "POLICE") return <Navigate to="/police/login" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<PortalLanding />} />
    <Route path="/login" element={<Navigate to="/police/login" replace />} />
    <Route path="/police/login" element={<Login />} />
    <Route path="/police/reset-password" element={<PoliceResetRoute><PolicePasswordReset /></PoliceResetRoute>} />
    <Route path="/civilian/login" element={<CivilianLogin />} />
    <Route path="/civilian/signup" element={<CivilianSignup />} />
    <Route path="/public-safety" element={<PublicSafetyDashboard />} />
    <Route path="/civilian/dashboard" element={<CivilianProtectedRoute><CivilianDashboard /></CivilianProtectedRoute>} />
    <Route path="/civilian/emergency" element={<CivilianProtectedRoute><CivilianEmergency /></CivilianProtectedRoute>} />
    <Route path="/civilian/safety" element={<Navigate to="/civilian/analytics" replace />} />
    <Route path="/civilian/analytics" element={<CivilianProtectedRoute><CivilianAnalytics /></CivilianProtectedRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/officers" element={<ProtectedRoute roles={["ADMIN", "DGP", "SP"]}><Officers /></ProtectedRoute>} />
    <Route path="/firs" element={<ProtectedRoute roles={["ADMIN", "DGP", "SP", "INSPECTOR", "CONSTABLE"]}><Firs /></ProtectedRoute>} />
    <Route path="/firs/:id" element={<ProtectedRoute><FirDetails /></ProtectedRoute>} />
    <Route path="/case-timeline/:firId" element={<ProtectedRoute><CaseTimeline /></ProtectedRoute>} />
    <Route path="/complaints" element={<ProtectedRoute roles={["ADMIN", "DGP", "SP", "INSPECTOR"]}><Complaints /></ProtectedRoute>} />
    <Route path="/complaints/:id" element={<ProtectedRoute roles={["ADMIN", "DGP", "SP", "INSPECTOR"]}><ComplaintDetails /></ProtectedRoute>} />
    <Route path="/emergencies" element={<ProtectedRoute roles={["ADMIN", "DGP", "SP", "INSPECTOR", "CONSTABLE"]}><PoliceEmergencies /></ProtectedRoute>} />
    <Route path="/transfers" element={<ProtectedRoute roles={["ADMIN", "DGP", "SP", "INSPECTOR"]}><TransferDashboard /></ProtectedRoute>} />
    <Route path="/heatmap" element={<Navigate to="/analytics" replace />} />
    <Route path="/analytics" element={<ProtectedRoute roles={["ADMIN", "DGP", "SP", "INSPECTOR"]}><Analytics /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;
