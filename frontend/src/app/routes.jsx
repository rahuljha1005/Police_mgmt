import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
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

const AuthLoader = () => (
  <main className="flex min-h-screen items-center justify-center bg-police-bg px-4 text-white">
    <div className="rounded-lg border border-white/10 bg-police-panel px-5 py-4 text-sm text-zinc-300">
      Verifying secure session...
    </div>
  </main>
);

const Unauthorized = () => (
  <main className="flex min-h-screen items-center justify-center bg-police-bg px-4 text-white">
    <section className="w-full max-w-md rounded-lg border border-red-500/30 bg-red-500/10 p-6 text-center">
      <p className="text-sm font-semibold uppercase text-red-200">Access denied</p>
      <h1 className="mt-2 text-2xl font-semibold">You do not have permission for this page.</h1>
    </section>
  </main>
);

const PublicOnlyRoute = ({ children, sessionType }) => {
  const { getDefaultRoute: defaultRouteFor, isAuthenticated, loading, user } = useAuth();

  if (loading) return <AuthLoader />;
  if (isAuthenticated) {
    return <Navigate to={defaultRouteFor(user)} replace />;
  }

  return children;
};

const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <AuthLoader />;
  if (!isAuthenticated || user?.type === "CIVILIAN") return <Navigate to="/police/login" replace />;
  if (user?.isFirstLogin && window.location.pathname !== "/police/reset-password") {
    return <Navigate to="/police/reset-password" replace />;
  }
  if (roles && !roles.includes(user?.role)) return <Unauthorized />;

  return <Layout>{children}</Layout>;
};

const RoleProtectedRoute = ({ children, roles }) => <ProtectedRoute roles={roles}>{children}</ProtectedRoute>;

const CivilianProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <AuthLoader />;
  return isAuthenticated && user?.type === "CIVILIAN" ? <Layout>{children}</Layout> : <Navigate to="/civilian/login" replace />;
};

const PoliceResetRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <AuthLoader />;
  if (!isAuthenticated || user?.type !== "POLICE") return <Navigate to="/police/login" replace />;
  if (!user?.isFirstLogin) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<PortalLanding />} />
    <Route path="/login" element={<Navigate to="/police/login" replace />} />
    <Route path="/police/login" element={<PublicOnlyRoute sessionType="POLICE"><Login /></PublicOnlyRoute>} />
    <Route path="/police/reset-password" element={<PoliceResetRoute><PolicePasswordReset /></PoliceResetRoute>} />
    <Route path="/civilian/login" element={<PublicOnlyRoute sessionType="CIVILIAN"><CivilianLogin /></PublicOnlyRoute>} />
    <Route path="/civilian/signup" element={<PublicOnlyRoute sessionType="CIVILIAN"><CivilianSignup /></PublicOnlyRoute>} />
    <Route path="/public-safety" element={<PublicSafetyDashboard />} />
    <Route path="/civilian/dashboard" element={<CivilianProtectedRoute><CivilianDashboard /></CivilianProtectedRoute>} />
    <Route path="/civilian/emergency" element={<CivilianProtectedRoute><CivilianEmergency /></CivilianProtectedRoute>} />
    <Route path="/sos" element={<Navigate to="/civilian/emergency" replace />} />
    <Route path="/civilian/safety" element={<Navigate to="/civilian/analytics" replace />} />
    <Route path="/civilian/analytics" element={<CivilianProtectedRoute><CivilianAnalytics /></CivilianProtectedRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/officers" element={<RoleProtectedRoute roles={["ADMIN", "DGP", "SP"]}><Officers /></RoleProtectedRoute>} />
    <Route path="/firs" element={<RoleProtectedRoute roles={["ADMIN", "DGP", "SP", "INSPECTOR", "CONSTABLE"]}><Firs /></RoleProtectedRoute>} />
    <Route path="/firs/:id" element={<ProtectedRoute><FirDetails /></ProtectedRoute>} />
    <Route path="/case-timeline/:firId" element={<ProtectedRoute><CaseTimeline /></ProtectedRoute>} />
    <Route path="/complaints" element={<RoleProtectedRoute roles={["ADMIN", "DGP", "SP", "INSPECTOR"]}><Complaints /></RoleProtectedRoute>} />
    <Route path="/complaints/:id" element={<RoleProtectedRoute roles={["ADMIN", "DGP", "SP", "INSPECTOR"]}><ComplaintDetails /></RoleProtectedRoute>} />
    <Route path="/emergencies" element={<RoleProtectedRoute roles={["ADMIN", "DGP", "SP", "INSPECTOR", "CONSTABLE"]}><PoliceEmergencies /></RoleProtectedRoute>} />
    <Route path="/transfers" element={<RoleProtectedRoute roles={["ADMIN", "DGP", "SP", "INSPECTOR"]}><TransferDashboard /></RoleProtectedRoute>} />
    <Route path="/heatmap" element={<Navigate to="/analytics" replace />} />
    <Route path="/analytics" element={<RoleProtectedRoute roles={["ADMIN", "DGP", "SP", "INSPECTOR"]}><Analytics /></RoleProtectedRoute>} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

export default AppRoutes;
