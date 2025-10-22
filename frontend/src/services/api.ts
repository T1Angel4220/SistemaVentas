import { sessionAlertManager } from '../utils/sessionAlert';

// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Tipos de datos
export interface User {
  id: number;
  cedula: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  tipo_usuario: 'comprador' | 'vendedor' | 'moderador' | 'administrador';
  estado: 'activo' | 'inactivo' | 'suspendido' | 'pendiente_verificacion';
  email_verificado: boolean;
  fecha_registro: string;
  fecha_ultimo_acceso?: string;
}

export interface LoginRequest {
  correo: string;
  password: string;
}

export interface RegisterRequest {
  cedula: string;
  nombre: string;
  apellido: string;
  correo: string;
  telefono?: string;
  direccion?: string;
  genero?: 'masculino' | 'femenino' | 'otro';
  password: string;
  tipo_usuario?: 'comprador' | 'vendedor';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    tokens: {
      accessToken: string;
      refreshToken: string;
      expiresIn: string;
    };
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
  }>;
}

// Clase para manejar la API
class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('accessToken');
  }

  // Método para establecer el token
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('accessToken', token);
    } else {
      localStorage.removeItem('accessToken');
    }
  }

  // Método para obtener el token
  getToken(): string | null {
    return this.token || localStorage.getItem('accessToken');
  }

  // Método para hacer requests HTTP
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // ✅ NUEVO: Detectar cuando la sesión ha sido cerrada por admin/moderador
        if (data.code === 'SESSION_CLOSED' && response.status === 401) {
          console.warn('⚠️ Sesión cerrada por administrador/moderador');
          // Limpiar datos de autenticación
          this.setToken(null);
          localStorage.removeItem('user');
          localStorage.removeItem('refreshToken');
          
          // Mostrar alerta profesional al usuario
          sessionAlertManager.show();
          
          // La alerta misma manejará la redirección al login
          throw new Error('Sesión cerrada por administrador');
        }
        
        throw new Error(data.message || 'Error en la petición');
      }

      return data;
    } catch (error) {
      console.error('Error en API request:', error);
      throw error;
    }
  }

  // Métodos de autenticación
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse['data']>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    if (response.data?.tokens?.accessToken) {
      this.setToken(response.data.tokens.accessToken);
    }

    return response as AuthResponse;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyEmail(code: string): Promise<ApiResponse> {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async requestPasswordReset(correo: string): Promise<ApiResponse> {
    return this.request('/auth/request-password-reset', {
      method: 'POST',
      body: JSON.stringify({ correo }),
    });
  }

  async resetPassword(code: string, newPassword: string): Promise<ApiResponse> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ code, newPassword }),
    });
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/profile');
  }

  async getUsers(params?: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<ApiResponse<{
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }>> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.status) queryParams.append('status', params.status);
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/auth/users?${queryString}` : '/auth/users';
    
    return this.request(endpoint);
  }

  async logout(): Promise<ApiResponse> {
    // Notificamos al servidor (el token aún está disponible aquí)
    const response = await this.request('/auth/logout', {
      method: 'POST',
    });
    
    // No limpiamos el token aquí, se hace en el contexto después
    return response;
  }

  async testAuth(): Promise<ApiResponse> {
    return this.request('/auth/test');
  }

  // Métodos de gestión de sesiones
  async getSessions(): Promise<ApiResponse<Array<{
    id: number;
    fecha_inicio: string;
    fecha_expiracion: string;
    ip_address: string;
    user_agent: string;
    activa: boolean;
  }>>> {
    return this.request('/auth/sessions');
  }

  async closeSession(sessionId: number): Promise<ApiResponse> {
    return this.request(`/auth/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Métodos administrativos de gestión de sesiones (solo moderadores/admin)
  async getUserSessions(userId: number): Promise<ApiResponse<{
    user: {
      id: number;
      nombre: string;
      apellido: string;
      correo: string;
    };
    sessions: Array<{
      id: number;
      fecha_inicio: string;
      fecha_expiracion: string;
      ip_address: string;
      user_agent: string;
      activa: boolean;
    }>;
  }>> {
    return this.request(`/auth/admin/sessions/${userId}`);
  }

  async closeUserSession(sessionId: number, motivo?: string): Promise<ApiResponse> {
    return this.request(`/auth/admin/sessions/${sessionId}`, {
      method: 'DELETE',
      body: JSON.stringify({ motivo }),
    });
  }

  async closeAllUserSessions(userId: number, motivo?: string): Promise<ApiResponse> {
    return this.request(`/auth/admin/sessions/user/${userId}`, {
      method: 'DELETE',
      body: JSON.stringify({ motivo }),
    });
  }

  // Métodos de administración (solo para moderadores/administradores)
  async registerModerator(userData: RegisterRequest): Promise<ApiResponse<User>> {
    return this.request<User>('/auth/register-moderator', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async activateUser(userId: number, motivo?: string): Promise<ApiResponse> {
    return this.request(`/auth/activate-user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ motivo }),
    });
  }

  async deactivateUser(userId: number, motivo?: string): Promise<ApiResponse> {
    return this.request(`/auth/deactivate-user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ motivo }),
    });
  }

  async suspendUser(userId: number, motivo?: string): Promise<ApiResponse> {
    return this.request(`/auth/suspend-user/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ motivo }),
    });
  }
}

// Instancia singleton del servicio API
export const apiService = new ApiService(API_BASE_URL);

// Función helper para verificar si el usuario está autenticado
export const isAuthenticated = (): boolean => {
  return !!apiService.getToken();
};

// Función helper para obtener el token
export const getAuthToken = (): string | null => {
  return apiService.getToken();
};

