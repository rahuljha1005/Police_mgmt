import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "./useAuth";
import {
  SESSION_TYPES,
  clearStoredSession,
  decodeJwt,
  getDefaultRoute,
  getLoginPath,
  getStoredSession,
  isTokenExpired,
  persistSession,
} from "./auth.utils";

const emptySession = {
  token: null,
  user: null,
  sessionType: null,
  permissions: [],
};

const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState(emptySession);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(
    ({ redirect = true, sessionType, reason = "logout" } = {}) => {
      const resolvedType =
        sessionType ||
        session.user?.type ||
        (location.pathname.startsWith("/civilian") ? SESSION_TYPES.CIVILIAN : SESSION_TYPES.POLICE);

      clearStoredSession();
      setSession(emptySession);

      if (redirect) {
        navigate(getLoginPath(resolvedType), {
          replace: true,
          state: reason === "expired" ? { message: "Your session expired. Please login again." } : undefined,
        });
      }
    },
    [location.pathname, navigate, session.user?.type]
  );

  const applySession = useCallback((nextSession) => {
    const storedSession = persistSession(nextSession);
    console.log("[auth] persisted session", {
      type: storedSession.sessionType,
      role: storedSession.user?.role,
      email: storedSession.user?.email,
      hasToken: Boolean(storedSession.token),
    });
    setSession(storedSession);
    return storedSession;
  }, []);

  const loginPolice = useCallback(
    ({ token, user }) => applySession({ token, user, sessionType: SESSION_TYPES.POLICE }),
    [applySession]
  );

  const loginCivilian = useCallback(
    ({ token, user }) => applySession({ token, user, sessionType: SESSION_TYPES.CIVILIAN }),
    [applySession]
  );

  const updateUser = useCallback((user) => {
    setSession((current) => {
      if (!current.token) return current;
      return persistSession({ token: current.token, user, sessionType: user?.type || current.sessionType });
    });
  }, []);

  useEffect(() => {
    const storedSession = getStoredSession();
    console.log("[auth] restored session", {
      hasSession: Boolean(storedSession),
      type: storedSession?.sessionType,
      role: storedSession?.user?.role,
    });
    setSession(storedSession || emptySession);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!session.token) return undefined;

    if (isTokenExpired(session.token)) {
      logout({ reason: "expired", sessionType: session.sessionType });
      return undefined;
    }

    const payload = decodeJwt(session.token);
    if (!payload?.exp) {
      logout({ reason: "expired", sessionType: session.sessionType });
      return undefined;
    }

    const delay = Math.max(payload.exp * 1000 - Date.now(), 0);
    const timeoutId = window.setTimeout(() => {
      logout({ reason: "expired", sessionType: session.sessionType });
    }, delay);

    return () => window.clearTimeout(timeoutId);
  }, [logout, session.sessionType, session.token]);

  useEffect(() => {
    const handleLogout = (event) => {
      logout({
        reason: event.detail?.reason || "invalid-session",
        sessionType: session.sessionType,
      });
    };

    const handleStorage = (event) => {
      if (!["token", "user", "sessionType"].includes(event.key)) return;
      setSession(getStoredSession() || emptySession);
    };

    window.addEventListener("auth:logout", handleLogout);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("auth:logout", handleLogout);
      window.removeEventListener("storage", handleStorage);
    };
  }, [logout, session.sessionType]);

  const value = useMemo(
    () => ({
      ...session,
      isAuthenticated: Boolean(session.token && session.user),
      isCivilian: session.user?.type === SESSION_TYPES.CIVILIAN,
      isPolice: session.user?.type === SESSION_TYPES.POLICE,
      loading,
      loginCivilian,
      loginPolice,
      logout,
      updateUser,
      getDefaultRoute,
    }),
    [loading, loginCivilian, loginPolice, logout, session, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
