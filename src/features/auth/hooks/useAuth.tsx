import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type { AuthState, LoginCreateDto, RegisterCreateDto } from '../model/auth';
import {
  checkAuthentication,
  login as loginRequest,
  logout as logoutRequest,
  signup as signupRequest,
} from '../api/auth.client';

type AuthContextValue = AuthState & {
  login: (data: LoginCreateDto) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterCreateDto) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  refreshAuth: () => Promise<void>;
  isInitializing: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthState['user']>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const hydrateUser = useCallback(async () => {
    try {
      const authenticatedUser = await checkAuthentication();
      setUser(authenticatedUser);
      setIsAuthenticated(true);
    } catch (error: any) {
      if (error?.response?.status !== 401) {
        console.error('Falha ao validar autenticação', error);
      }
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      await hydrateUser();
      if (isMounted) {
        setIsInitializing(false);
      }
    };
    init().catch(() => {
      if (isMounted) {
        setIsInitializing(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [hydrateUser]);

  const login = useCallback(
    async (credentials: LoginCreateDto): Promise<{ success: boolean; error?: string }> => {
      try {
        const authenticatedUser = await loginRequest(credentials);
        await hydrateUser();
        return { success: true };
      } catch (error: any) {
        const message =
          error?.response?.data?.message ?? 'Não foi possível entrar. Tente novamente.';
        setUser(null);
        setIsAuthenticated(false);
        return { success: false, error: message };
      }
    },
    [],
  );

  const register = useCallback(
    async (data: RegisterCreateDto): Promise<{ success: boolean; error?: string }> => {
      try {
        await signupRequest(data);
        setUser(null);
        setIsAuthenticated(false);
        return { success: true };
      } catch (error: any) {
        const message =
          error?.response?.data?.message ?? 'Não foi possível cadastrar. Tente novamente.';
        setUser(null);
        setIsAuthenticated(false);
        return { success: false, error: message };
      }
    },
    [],
  );

  const logout = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await logoutRequest();      
      return { success: response };
    } catch (error: any) {
      const message =
        error?.response?.data?.message ?? 'Não foi possível sair. Tente novamente.';
      return { success: false, error: message };
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const refreshAuth = useCallback(async () => {
    await hydrateUser();
  }, [hydrateUser]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated,
      login,
      register,
      logout,
      refreshAuth,
      isInitializing,
    }),
    [user, isAuthenticated, login, register, logout, refreshAuth, isInitializing],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  }
  return ctx;
}
