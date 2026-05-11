const TOKEN_KEY = "token";
const USER_KEY = "user";
const SESSION_TYPE_KEY = "sessionType";

export const SESSION_TYPES = {
  CIVILIAN: "CIVILIAN",
  POLICE: "POLICE",
};

const parseJson = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const decodeBase64Url = (value) => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return atob(padded);
};

export const decodeJwt = (token) => {
  if (!token || token.split(".").length < 2) return null;

  try {
    return JSON.parse(decodeBase64Url(token.split(".")[1]));
  } catch {
    return null;
  }
};

export const isTokenExpired = (token) => {
  const payload = decodeJwt(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 <= Date.now();
};

export const normalizeUser = (user, fallbackType) => {
  if (!user) return null;
  const type = user.type || fallbackType || SESSION_TYPES.POLICE;

  return {
    ...user,
    role: type === SESSION_TYPES.CIVILIAN ? SESSION_TYPES.CIVILIAN : user.role || "CONSTABLE",
    type,
  };
};

export const getLoginPath = (sessionType) =>
  sessionType === SESSION_TYPES.CIVILIAN ? "/civilian/login" : "/police/login";

export const getDefaultRoute = (user) => {
  if (user?.type === SESSION_TYPES.CIVILIAN) return "/civilian/dashboard";
  if (user?.isFirstLogin) return "/police/reset-password";
  return "/dashboard";
};

export const getStoredSession = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  const storedUser = parseJson(localStorage.getItem(USER_KEY));
  const tokenPayload = decodeJwt(token);
  const sessionType = storedUser?.type || tokenPayload?.type || localStorage.getItem(SESSION_TYPE_KEY);
  const user = normalizeUser(storedUser, sessionType);

  if (!token || !user || isTokenExpired(token)) {
    clearStoredSession();
    return null;
  }

  return {
    token,
    user,
    sessionType: user.type,
    permissions: user.type === SESSION_TYPES.CIVILIAN ? [SESSION_TYPES.CIVILIAN] : [user.role],
  };
};

export const persistSession = ({ token, user, sessionType }) => {
  const normalizedUser = normalizeUser(user, sessionType);

  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
  localStorage.setItem(SESSION_TYPE_KEY, normalizedUser.type);

  return {
    token,
    user: normalizedUser,
    sessionType: normalizedUser.type,
    permissions: normalizedUser.type === SESSION_TYPES.CIVILIAN ? [SESSION_TYPES.CIVILIAN] : [normalizedUser.role],
  };
};

export const clearStoredSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(SESSION_TYPE_KEY);
};

export const emitAuthLogout = (reason = "invalid-session") => {
  window.dispatchEvent(new CustomEvent("auth:logout", { detail: { reason } }));
};
