import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { login as apiLogin, logout as apiLogout } from '@/api/auth';
import axios from 'axios';
import {
  setTokens,
  clearTokens,
  getRefreshToken,
  getAccessToken,
  setAccessToken,
  setRestoringSession,
} from '@/api/client';
import type { UserRole } from '@/types';

interface AuthUser {
  email: string;
  role: UserRole;
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  canWrite: () => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeTokenPayload(token: string): { email?: string; role?: UserRole } | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      // Signal that we're restoring — prevents interceptor from redirecting
      setRestoringSession(true);

      // First check if access token is still in memory
      const token = getAccessToken();
      if (token) {
        const payload = decodeTokenPayload(token);
        if (payload?.email && payload?.role) {
          setUser({ email: payload.email, role: payload.role });
          setRestoringSession(false);
          setIsLoading(false);
          return;
        }
      }

      // Access token lost (HMR or page refresh) — try silent refresh
      const refresh = getRefreshToken();
      if (refresh) {
        try {
          // Use raw axios (not apiClient) to avoid interceptor loops
          const response = await axios.post<{ access: string }>(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/auth/token/refresh/`,
            { refresh }
          );
          const newAccess = response.data.access;
          setAccessToken(newAccess);

          const payload = decodeTokenPayload(newAccess);
          if (payload?.email && payload?.role) {
            setUser({ email: payload.email, role: payload.role });
          }
        } catch {
          // Refresh token is invalid/expired — clear everything
          clearTokens();
        }
      }

      setRestoringSession(false);
      setIsLoading(false);
    }

    restoreSession();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiLogin(email, password);
    setTokens(response.access, response.refresh);

    // Extract user info from token payload or response
    const payload = decodeTokenPayload(response.access);
    const role = response.role ?? payload?.role;
    const userEmail = payload?.email ?? email;

    if (role) {
      setUser({ email: userEmail, role });
    }
  }, []);

  const logout = useCallback(async () => {
    const refresh = getRefreshToken();
    try {
      if (refresh) {
        await apiLogout(refresh);
      }
    } finally {
      clearTokens();
      setUser(null);
    }
  }, []);

  const hasRole = useCallback(
    (role: UserRole) => user?.role === role,
    [user]
  );

  const canWrite = useCallback(
    () => user?.role === 'Admin' || user?.role === 'HR_Manager',
    [user]
  );

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout, hasRole, canWrite }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
