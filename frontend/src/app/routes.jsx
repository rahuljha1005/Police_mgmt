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

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? <Layout>{children}</Layout> : <Navigate to="/" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/officers" element={<ProtectedRoute><Officers /></ProtectedRoute>} />
    <Route path="/firs" element={<ProtectedRoute><Firs /></ProtectedRoute>} />
    <Route path="/firs/:id" element={<ProtectedRoute><FirDetails /></ProtectedRoute>} />
    <Route path="/case-timeline/:firId" element={<ProtectedRoute><CaseTimeline /></ProtectedRoute>} />
    <Route path="/complaints" element={<ProtectedRoute><Complaints /></ProtectedRoute>} />
    <Route path="/complaints/:id" element={<ProtectedRoute><ComplaintDetails /></ProtectedRoute>} />
    <Route path="/heatmap" element={<ProtectedRoute><Heatmap /></ProtectedRoute>} />
    <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;
