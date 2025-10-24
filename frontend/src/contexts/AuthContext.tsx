import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { apiService, User, LoginRequest, RegisterRequest, ApiResponse } from '../services/api';

// Tipos para el contexto
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  requestPasswordReset: (correo: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  clearError: () => void;
  refreshUser: () => Promise<void>;
}

// Acciones del reducer
type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_LOADING'; payload: boolean };

// Estado inicial
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Reducer para manejar el estado
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Props del provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider del contexto
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar autenticación al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      const token = apiService.getToken();
      if (token) {
        try {
          dispatch({ type: 'AUTH_START' });
          const response = await apiService.getProfile();
          
          if (response.success && response.data) {
            // El backend devuelve { data: { user: {...} } }, necesitamos extraer el user
            const userData = response.data.user;
            dispatch({ type: 'AUTH_SUCCESS', payload: userData });
          } else {
            apiService.setToken(null);
            dispatch({ type: 'AUTH_LOGOUT' });
          }
        } catch (error) {
          console.error('Error verificando autenticación:', error);
          apiService.setToken(null);
          dispatch({ type: 'AUTH_LOGOUT' });
        }
      }
    };

    checkAuth();
  }, []);

  // Función de login
  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await apiService.login(credentials);
      
      if (response.success && response.data) {
        const userData = response.data.user;
        dispatch({ type: 'AUTH_SUCCESS', payload: userData });
      } else {
        throw new Error(response.message || 'Error en el login');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error en el login';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  }, []);

  // Función de registro
  const register = useCallback(async (userData: RegisterRequest): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await apiService.register(userData);
      
      if (response.success) {
        dispatch({ type: 'SET_LOADING', payload: false });
        // No establecer como autenticado hasta que verifique el email
      } else {
        throw new Error(response.message || 'Error en el registro');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error en el registro';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  }, []);

  // Función de logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      // Intentar notificar al servidor PRIMERO (con el token aún válido)
      try {
        await apiService.logout();
      } catch (error) {
        console.error('Error notificando logout al servidor:', error);
        // Continuamos con el logout local aunque falle el servidor
      }
      
      // Después limpiamos el token y el estado local
      apiService.setToken(null);
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error) {
      console.error('Error en logout:', error);
      // Aseguramos limpiar incluso si hay error
      apiService.setToken(null);
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, []);

  // Función de verificación de email
  const verifyEmail = useCallback(async (token: string): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await apiService.verifyEmail(token);
      
      if (response.success) {
        dispatch({ type: 'SET_LOADING', payload: false });
      } else {
        throw new Error(response.message || 'Error verificando email');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error verificando email';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  }, []);

  // Función de solicitud de recuperación de contraseña
  const requestPasswordReset = useCallback(async (correo: string): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await apiService.requestPasswordReset(correo);
      
      if (response.success) {
        dispatch({ type: 'SET_LOADING', payload: false });
      } else {
        throw new Error(response.message || 'Error solicitando recuperación');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error solicitando recuperación';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  }, []);

  // Función de reset de contraseña
  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await apiService.resetPassword(token, newPassword);
      
      if (response.success) {
        dispatch({ type: 'SET_LOADING', payload: false });
      } else {
        throw new Error(response.message || 'Error reseteando contraseña');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error reseteando contraseña';
      dispatch({ type: 'AUTH_FAILURE', payload: errorMessage });
      throw error;
    }
  }, []);

  // Función para limpiar errores
  const clearError = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Función para refrescar datos del usuario
  const refreshUser = useCallback(async (): Promise<void> => {
    try {
      const response = await apiService.getProfile();
      if (response.success && response.data) {
        dispatch({ type: 'AUTH_SUCCESS', payload: response.data.user });
      }
    } catch (error) {
      console.error('Error refrescando usuario:', error);
    }
  }, []);

  // Valor del contexto
  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    verifyEmail,
    requestPasswordReset,
    resetPassword,
    clearError,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

