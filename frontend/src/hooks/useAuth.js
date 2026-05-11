import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const readUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user")) || null;
  } catch {
    return null;
  }
};

export const useAuth = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = useMemo(() => readUser(), []);

  const logout = () => {
    const isCivilian = user?.type === "CIVILIAN" || window.location.pathname.startsWith("/civilian");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate(isCivilian ? "/civilian/login" : "/police/login");
  };

  return {
    isAuthenticated: Boolean(token),
    logout,
    token,
    user,
  };
};
