import { sessionAlertManager } from '../utils/sessionAlert';
import { suspendedAccountAlertManager } from '../utils/suspendedAccountAlert';
// Configuración de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
// Clase para manejar la API
class ApiService {
    baseURL;
    token = null;
    constructor(baseURL) {
        this.baseURL = baseURL;
        this.token = localStorage.getItem('accessToken');
    }
    // Método para establecer el token
    setToken(token) {
        this.token = token;
        if (token) {
            localStorage.setItem('accessToken', token);
        }
        else {
            localStorage.removeItem('accessToken');
        }
    }
    // Método para obtener el token
    getToken() {
        return this.token || localStorage.getItem('accessToken');
    }
    // Método para hacer requests HTTP
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const token = this.getToken();
        const config = {
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
                // ✅ Detectar cuando la sesión ha sido cerrada por admin/moderador
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
                // ✅ Detectar cuando la cuenta ha sido suspendida
                if (data.code === 'ACCOUNT_SUSPENDED' && response.status === 401) {
                    console.warn('⚠️ Cuenta suspendida por administrador/moderador');
                    // Limpiar datos de autenticación
                    this.setToken(null);
                    localStorage.removeItem('user');
                    localStorage.removeItem('refreshToken');
                    // Mostrar alerta profesional al usuario
                    suspendedAccountAlertManager.show();
                    // La alerta misma manejará la redirección al login
                    throw new Error('Cuenta suspendida');
                }
                throw new Error(data.message || 'Error en la petición');
            }
            return data;
        }
        catch (error) {
            console.error('Error en API request:', error);
            throw error;
        }
    }
    // Métodos de autenticación
    async login(credentials) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        if (response.data?.tokens?.accessToken) {
            this.setToken(response.data.tokens.accessToken);
        }
        return response;
    }
    async register(userData) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }
    async verifyEmail(code) {
        return this.request('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ code }),
        });
    }
    async requestPasswordReset(correo) {
        return this.request('/auth/request-password-reset', {
            method: 'POST',
            body: JSON.stringify({ correo }),
        });
    }
    async resetPassword(code, newPassword) {
        return this.request('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({ code, newPassword }),
        });
    }
    async getProfile() {
        return this.request('/auth/profile');
    }
    async getUsers(params) {
        const queryParams = new URLSearchParams();
        if (params?.page)
            queryParams.append('page', params.page.toString());
        if (params?.limit)
            queryParams.append('limit', params.limit.toString());
        if (params?.search)
            queryParams.append('search', params.search);
        if (params?.role)
            queryParams.append('role', params.role);
        if (params?.status)
            queryParams.append('status', params.status);
        const queryString = queryParams.toString();
        const endpoint = queryString ? `/auth/users?${queryString}` : '/auth/users';
        return this.request(endpoint);
    }
    async logout() {
        // Notificamos al servidor (el token aún está disponible aquí)
        const response = await this.request('/auth/logout', {
            method: 'POST',
        });
        // No limpiamos el token aquí, se hace en el contexto después
        return response;
    }
    async testAuth() {
        return this.request('/auth/test');
    }
    // Métodos de gestión de sesiones
    async getSessions() {
        return this.request('/auth/sessions');
    }
    async closeSession(sessionId) {
        return this.request(`/auth/sessions/${sessionId}`, {
            method: 'DELETE',
        });
    }
    // Métodos administrativos de gestión de sesiones (solo moderadores/admin)
    async getUserSessions(userId) {
        return this.request(`/auth/admin/sessions/${userId}`);
    }
    async closeUserSession(sessionId, motivo) {
        return this.request(`/auth/admin/sessions/${sessionId}`, {
            method: 'DELETE',
            body: JSON.stringify({ motivo }),
        });
    }
    async closeAllUserSessions(userId, motivo) {
        return this.request(`/auth/admin/sessions/user/${userId}`, {
            method: 'DELETE',
            body: JSON.stringify({ motivo }),
        });
    }
    // Métodos de administración (solo para moderadores/administradores)
    async registerModerator(userData) {
        return this.request('/auth/register-moderator', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }
    async activateUser(userId, motivo) {
        return this.request(`/auth/activate-user/${userId}`, {
            method: 'PUT',
            body: JSON.stringify({ motivo }),
        });
    }
    async deactivateUser(userId, motivo) {
        return this.request(`/auth/deactivate-user/${userId}`, {
            method: 'PUT',
            body: JSON.stringify({ motivo }),
        });
    }
    async suspendUser(userId, motivo) {
        return this.request(`/auth/suspend-user/${userId}`, {
            method: 'PUT',
            body: JSON.stringify({ motivo }),
        });
    }
}
// Instancia singleton del servicio API
export const apiService = new ApiService(API_BASE_URL);
// Función helper para verificar si el usuario está autenticado
export const isAuthenticated = () => {
    return !!apiService.getToken();
};
// Función helper para obtener el token
export const getAuthToken = () => {
    return apiService.getToken();
};
